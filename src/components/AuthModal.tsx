import { useState, useEffect, type FormEvent } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Cloud,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
  Database,
} from 'lucide-react';
import { LearnerProfile } from '../lib/types';
import {
  loadAllProfiles,
  setActiveProfileId,
  createNewProfile,
  saveLearnerProfile,
  hydrateUserFromTurso,
} from '../lib/storage';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { registerTursoAccount, loginTursoAccount, isTursoConfigured } from '../lib/tursoClient';
import { AdeptLogo } from './AdeptLogo';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: LearnerProfile | null;
  onProfileChanged: (profile: LearnerProfile) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal = ({
  isOpen,
  onClose,
  activeProfile: _activeProfile,
  onProfileChanged,
  initialMode = 'signup',
}: AuthModalProps) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetBand, setTargetBand] = useState<number>(7.5);
  const [testType, setTestType] = useState<'academic' | 'general'>('academic');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const existingProfiles = loadAllProfiles();
  const supabase = getSupabaseClient();
  const hasCloud = isSupabaseConfigured();
  const hasTurso = isTursoConfigured();

  const handleSwitchToExisting = (p: LearnerProfile) => {
    setActiveProfileId(p.id);
    onProfileChanged(p);
    setSuccessMessage(`Welcome back, ${p.displayName}!`);
    setTimeout(() => {
      onClose();
      setSuccessMessage('');
    }, 600);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (authMode === 'signup') {
        if (!displayName.trim()) {
          throw new Error('Please enter your full candidate name.');
        }

        // 1. Primary: Turso LibSQL Cloud Edge Database (Zero-config 9GB storage)
        if (hasTurso && email && password) {
          const res = await registerTursoAccount(email, password, displayName.trim(), targetBand, testType);
          if (!res.success || !res.profile) {
            throw new Error(res.error || 'Failed to register account on Turso database.');
          }

          saveLearnerProfile(res.profile);
          setActiveProfileId(res.profile.id);
          onProfileChanged(res.profile);
          setSuccessMessage(`Welcome, ${res.profile.displayName}! Account stored in Turso Cloud Database.`);
          setTimeout(onClose, 900);
          return;
        }

        // 2. Fallback: Supabase Auth if configured
        if (hasCloud && supabase && email && password) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName.trim(),
                target_band: targetBand,
                test_type: testType,
              },
            },
          });

          if (error) throw error;

          const cloudProfile: LearnerProfile = {
            id: data.user?.id || `user-${Date.now()}`,
            displayName: displayName.trim(),
            avatar: displayName.trim().slice(0, 2).toUpperCase(),
            targetBand,
            currentEstimatedBand: 5.5,
            testType,
            examDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            availableDailyMinutes: 45,
            skillBands: { reading: 5.5, listening: 6.0, writing: 5.0, speaking: 5.5 },
            subskillMastery: {},
            streak: 0,
            lastActiveDate: new Date().toISOString().split('T')[0],
            totalStudyMinutes: 0,
            onboardingCompleted: true,
          };
          saveLearnerProfile(cloudProfile);
          setActiveProfileId(cloudProfile.id);
          onProfileChanged(cloudProfile);
          setSuccessMessage(`Welcome, ${cloudProfile.displayName}! Cloud profile activated.`);
          setTimeout(onClose, 900);
          return;
        }

        // 3. Fallback: Local profile creation
        const localProfile = createNewProfile(displayName.trim(), targetBand, testType);
        onProfileChanged(localProfile);
        setSuccessMessage(`Welcome, ${localProfile.displayName}! Candidate workspace ready.`);
        setTimeout(onClose, 900);
      } else {
        // Sign In Flow
        // 1. Primary: Turso LibSQL Cloud Edge Database
        if (hasTurso && email && password) {
          const res = await loginTursoAccount(email, password);
          if (!res.success || !res.profile) {
            throw new Error(res.error || 'Invalid credentials.');
          }

          saveLearnerProfile(res.profile);
          setActiveProfileId(res.profile.id);

          // Full hydration of user's past attempts, essays, speaking sessions, exam scores, and custom API keys!
          await hydrateUserFromTurso(res.profile.id);

          onProfileChanged(res.profile);
          setSuccessMessage(`Signed in as ${res.profile.displayName}! All activity history & exam scores restored.`);
          setTimeout(onClose, 900);
          return;
        }

        // 2. Fallback: Supabase Sign In
        if (hasCloud && supabase && email && password) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            const { data: profileRow } = await supabase
              .from('learner_profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profileRow) {
              const mappedProfile: LearnerProfile = {
                id: profileRow.id,
                displayName: profileRow.display_name,
                avatar: profileRow.display_name.slice(0, 2).toUpperCase(),
                targetBand: profileRow.target_band,
                currentEstimatedBand: profileRow.current_estimated_band,
                testType: profileRow.test_type,
                examDate: profileRow.exam_date,
                availableDailyMinutes: profileRow.available_daily_minutes,
                skillBands: profileRow.skill_bands,
                subskillMastery: profileRow.subskill_mastery || {},
                streak: profileRow.streak || 0,
                lastActiveDate: new Date().toISOString().split('T')[0],
                totalStudyMinutes: profileRow.total_study_minutes || 0,
                onboardingCompleted: true,
              };
              saveLearnerProfile(mappedProfile);
              setActiveProfileId(mappedProfile.id);
              onProfileChanged(mappedProfile);
            } else {
              const newProf = createNewProfile(email.split('@')[0], 7.5, 'academic');
              onProfileChanged(newProf);
            }
            setSuccessMessage('Signed in successfully! Real candidate data synchronized.');
            setTimeout(onClose, 900);
            return;
          }
        }

        // 3. Fallback: Local profiles list
        if (existingProfiles.length > 0) {
          const target = existingProfiles.find(p => p.displayName.toLowerCase().includes(email.toLowerCase())) || existingProfiles[0];
          setActiveProfileId(target.id);
          onProfileChanged(target);
          setSuccessMessage(`Signed in as ${target.displayName}.`);
          setTimeout(onClose, 700);
        } else {
          throw new Error('No account found. Please click "Create Free Account" to set up your profile.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(9, 9, 11, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div className="double-bezel" style={{ width: '100%', maxWidth: '480px', maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}>
        <div className="double-bezel-inner" style={{ padding: 'clamp(1.25rem, 5vw, 2rem)', position: 'relative', overflowY: 'auto' }}>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.85rem' }}>
              <AdeptLogo variant="full" height={32} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-brand" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                {hasTurso ? <Database size={12} /> : hasCloud ? <Cloud size={12} /> : <ShieldCheck size={12} />}
                {hasTurso ? 'Turso Cloud LibSQL Edge DB' : hasCloud ? 'Supabase Online Sync' : 'Local Candidate Storage'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 750, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {authMode === 'signup' ? 'Create Candidate Account' : 'Candidate Sign In'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {authMode === 'signup'
                ? 'Join to record your authentic IELTS practice attempts, timed mock scores, and AI diagnostic reports.'
                : 'Sign in to retrieve your real diagnostic records, vocabulary recall intervals, and band predictions.'}
            </p>
          </div>

          {/* Switcher Tab */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-default)',
          }}>
            <button
              onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: 'calc(var(--radius-md) - 2px)',
                border: 'none',
                background: authMode === 'signup' ? 'var(--bg-surface)' : 'transparent',
                color: authMode === 'signup' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: authMode === 'signup' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'background-color 140ms var(--ease-out), color 140ms var(--ease-out), box-shadow 140ms var(--ease-out)',
              }}
            >
              <UserPlus size={14} />
              <span>Create Account</span>
            </button>
            <button
              onClick={() => { setAuthMode('signin'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: 'calc(var(--radius-md) - 2px)',
                border: 'none',
                background: authMode === 'signin' ? 'var(--bg-surface)' : 'transparent',
                color: authMode === 'signin' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: authMode === 'signin' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'background-color 140ms var(--ease-out), color 140ms var(--ease-out), box-shadow 140ms var(--ease-out)',
              }}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="alert alert-warning" style={{ marginBottom: '1rem', fontSize: '0.82rem', padding: '0.65rem 0.85rem' }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.82rem', padding: '0.65rem 0.85rem' }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {authMode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                  Your Full Candidate Name:
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="e.g. Maya Chen"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                Email Address:
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="candidate@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  required={hasCloud || authMode === 'signin'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                Password:
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  required={hasCloud || authMode === 'signin'}
                />
              </div>
            </div>

            {authMode === 'signup' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                    Target IELTS Band:
                  </label>
                  <select
                    value={targetBand}
                    onChange={e => setTargetBand(Number(e.target.value))}
                    className="select"
                  >
                    {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(b => (
                      <option key={b} value={b}>Band {b.toFixed(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                    Test Module:
                  </label>
                  <select
                    value={testType}
                    onChange={e => setTestType(e.target.value as any)}
                    className="select"
                  >
                    <option value="academic">IELTS Academic</option>
                    <option value="general">IELTS General Training</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '0.4rem', width: '100%', padding: '0.7rem' }}
            >
              <span>{loading ? 'Processing...' : authMode === 'signup' ? 'Create Real Account' : 'Sign In to Workspace'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Quick switcher if multiple real accounts have been created on this device */}
          {authMode === 'signin' && existingProfiles.length > 0 && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                LOCAL SAVED CANDIDATES ON THIS BROWSER:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {existingProfiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSwitchToExisting(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.displayName}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Band {p.targetBand.toFixed(1)} • {p.testType}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
