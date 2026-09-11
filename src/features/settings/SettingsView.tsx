import { useState } from 'react';
import {
  Save,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  Zap,
  Clock,
  Calendar,
  Award,
  Sparkles,
  KeyRound,
  Check,
  RotateCcw,
} from 'lucide-react';
import { LearnerProfile, AISettings } from '../../lib/types';
import { saveLearnerProfile, saveAISettings, loadAISettings, resetAllData } from '../../lib/storage';

interface SettingsViewProps {
  profile: LearnerProfile;
  onProfileUpdated: (p: LearnerProfile) => void;
}

export const SettingsView = ({
  profile,
  onProfileUpdated,
}: SettingsViewProps) => {
  const [profileState, setProfileState] = useState<LearnerProfile>(profile);
  const [aiSettings, setAiSettings] = useState<AISettings>(loadAISettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Key Visibility toggle for user's personal AI key
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    saveLearnerProfile(profileState);
    saveAISettings(aiSettings);
    onProfileUpdated(profileState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleExportData = () => {
    const data = {
      profile: profileState,
      aiSettings: { ...aiSettings, apiKey: 'REDACTED' },
      exportedAt: new Date().toISOString(),
      schemaVersion: '1.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ielts_prep_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('Reset all practice history, flashcard intervals, and test attempts? Your profile settings will remain.')) {
      resetAllData();
      window.location.reload();
    }
  };

  const bandOptions = [
    { band: 6.0, cefr: 'B2 Competent' },
    { band: 6.5, cefr: 'B2+ Strong' },
    { band: 7.0, cefr: 'C1 Good' },
    { band: 7.5, cefr: 'C1+ Very Good' },
    { band: 8.0, cefr: 'C2 Very Good' },
    { band: 8.5, cefr: 'C2 Expert' },
    { band: 9.0, cefr: 'C2 Native-Mastery' },
  ];

  const aiProviders = [
    {
      id: 'groq',
      name: 'Groq Cloud',
      tier: '100% Free Tier',
      model: 'Llama 3.3 70B Versatile',
      speed: '~350 tok/sec',
      url: 'https://console.groq.com/keys',
      badge: 'Recommended',
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      tier: 'Free Tier',
      model: 'Gemini 1.5 Flash',
      speed: 'High Context',
      url: 'https://aistudio.google.com/app/apikey',
      badge: '1M Context',
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      tier: 'Multi-Model Free',
      model: 'Free Router Models',
      speed: 'Flexible',
      url: 'https://openrouter.ai/keys',
      badge: 'Aggregator',
    },
    {
      id: 'offline_deterministic',
      name: 'Offline Evaluator',
      tier: 'Zero Network Needed',
      model: 'Heuristic Rule Evaluator',
      speed: 'Instant (0ms)',
      url: '',
      badge: 'Private',
    },
  ];

  return (
    <div className="fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem',
      maxWidth: '920px',
      margin: '0 auto',
      paddingBottom: '5rem',
    }}>
      
      {/* View Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
          letterSpacing: '-0.03em',
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          Settings
        </h1>
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '680px',
          margin: 0,
        }}>
          Manage your target band descriptors, exam schedule, and AI evaluation preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="alert alert-success fade-in" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.12)',
        }}>
          <CheckCircle2 size={20} color="var(--brand-primary)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Settings Saved Successfully</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Your candidate target band, study schedule, and AI engine preferences have been saved.</div>
          </div>
        </div>
      )}

      {/* SECTION 1: CANDIDATE PROFILE & TARGET BAND */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="var(--brand-primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                  Study Profile & Target Goals
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: 0 }}>
                Drives adaptive difficulty calibration, feedback harshness, and CEFR level benchmarks.
              </p>
            </div>
            <span className="badge badge-zinc" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {profileState.testType === 'academic' ? 'IELTS Academic' : 'IELTS General Training'}
            </span>
          </div>

          {/* Target Band Interactive Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
              Target IELTS Band:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '0.65rem',
            }}>
              {bandOptions.map(opt => {
                const isSelected = profileState.targetBand === opt.band;
                return (
                  <button
                    key={opt.band}
                    type="button"
                    onClick={() => setProfileState({ ...profileState, targetBand: opt.band })}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                      backgroundColor: isSelected ? 'var(--brand-primary-subtle)' : '#ffffff',
                      color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                      Band {opt.band.toFixed(1)}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                      {opt.cefr.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exam Module & Timing Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            
            {/* Exam Module Segmented Switcher */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Examination Module:
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                padding: '4px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                gap: '4px',
              }}>
                {(['academic', 'general'] as const).map(mod => {
                  const isActive = profileState.testType === mod;
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => setProfileState({ ...profileState, testType: mod })}
                      style={{
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        borderRadius: 'calc(var(--radius-md) - 3px)',
                        border: 'none',
                        backgroundColor: isActive ? '#ffffff' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {mod === 'academic' ? 'IELTS Academic' : 'General Training'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Exam Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Planned Test Date:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={profileState.examDate || ''}
                  onChange={e => setProfileState({ ...profileState, examDate: e.target.value })}
                  className="input"
                  style={{
                    paddingLeft: '2.5rem',
                    fontSize: '0.9rem',
                    height: '42px',
                  }}
                />
                <Calendar
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Daily Target Study Time */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Daily Study Target:
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                height: '42px',
                padding: '0 1rem',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
              }}>
                <Clock size={16} color="var(--text-muted)" />
                <input
                  type="range"
                  min={15}
                  max={120}
                  step={15}
                  value={profileState.availableDailyMinutes}
                  onChange={e => setProfileState({ ...profileState, availableDailyMinutes: Number(e.target.value) })}
                  style={{ flex: 1, accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)', minWidth: '60px', textAlign: 'right' }}>
                  {profileState.availableDailyMinutes} mins
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* SECTION 2: AI ORCHESTRATION & FREE TIER ROUTING */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} color="var(--brand-primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                  AI Provider & Zero-Waste Routing
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: 0 }}>
                Connect 100% free high-speed LLM APIs for live writing evaluation and speech diagnostics.
              </p>
            </div>
            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={12} />
              <span>Keys Stored Locally</span>
            </span>
          </div>

          {/* Provider Card Selection Grid */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Active AI Provider Engine:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}>
              {aiProviders.map(prov => {
                const isActive = aiSettings.provider === prov.id;
                return (
                  <div
                    key={prov.id}
                    onClick={() => setAiSettings({ ...aiSettings, provider: prov.id as any })}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isActive ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                      backgroundColor: isActive ? 'var(--brand-primary-subtle)' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      position: 'relative',
                      transition: 'all var(--transition-fast)',
                      boxShadow: isActive ? '0 4px 14px rgba(13, 148, 136, 0.08)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isActive ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                        {prov.name}
                      </span>
                      {isActive ? (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} color="#ffffff" />
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>
                          {prov.badge}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {prov.model}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {prov.tier} • {prov.speed}
                      </span>
                    </div>

                    {prov.url && (
                      <a
                        href={prov.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.75rem',
                          color: 'var(--brand-primary)',
                          fontWeight: 600,
                          textDecoration: 'none',
                          marginTop: 'auto',
                          paddingTop: '0.25rem',
                        }}
                      >
                        <span>Get Free Key</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Key Configuration Card */}
          {aiSettings.provider !== 'offline_deterministic' && (
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <KeyRound size={15} color="var(--brand-primary)" />
                  <span>{aiSettings.provider.toUpperCase()} API Key:</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Stored in local browser storage only.
                </span>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder={
                    aiSettings.provider === 'groq' ? 'gsk_...' :
                    aiSettings.provider === 'openrouter' ? 'sk-or-...' :
                    aiSettings.provider === 'gemini' ? 'AIzaSy...' : 'Key...'
                  }
                  value={aiSettings.apiKey}
                  onChange={e => setAiSettings({ ...aiSettings, apiKey: e.target.value })}
                  className="input"
                  style={{
                    paddingRight: '44px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                    backgroundColor: '#ffffff',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={showApiKey ? 'Hide Key' : 'Show Key'}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Token-Saving Mode Switch */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    Token-Saving Evaluation Mode
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Uses compact JSON schemas and client-side prompt optimization to minimize free-tier token usage.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={aiSettings.tokenSavingMode}
                  onChange={e => setAiSettings({ ...aiSettings, tokenSavingMode: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
              </div>

            </div>
          )}

        </div>
      </div>

      {/* SECTION 3: ACTIONS & BACKUP */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        paddingTop: '0.75rem',
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleExportData}
            className="btn btn-secondary"
            style={{ padding: '0.7rem 1.25rem', gap: '0.5rem', fontSize: '0.88rem' }}
          >
            <Download size={15} />
            <span>Export JSON Backup</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-subtle"
            style={{ padding: '0.7rem 1.25rem', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--error)' }}
          >
            <Trash2 size={15} />
            <span>Reset History</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary btn-lg"
          style={{
            padding: '0.85rem 2.25rem',
            gap: '0.6rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.95rem',
            fontWeight: 700,
          }}
        >
          <Save size={16} />
          <span>Save Configuration</span>
        </button>
      </div>

    </div>
  );
};
