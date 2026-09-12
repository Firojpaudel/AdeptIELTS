import { useState, useEffect } from 'react';
import {
  User,
  Plus,
  Check,
  X,
  Target,
  Flame,
  Database,
  Calendar,
  Clock,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { LearnerProfile } from '../lib/types';
import { loadAllProfiles, createNewProfile, setActiveProfileId, saveLearnerProfile } from '../lib/storage';
import { isTursoConfigured } from '../lib/tursoClient';
import { StudyCalendarModal } from './StudyCalendarModal';
import { recalculateAndSaveStreak } from '../lib/studyTracker';

interface CandidateProfileModalProps {
  currentProfile: LearnerProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileChanged: (profile: LearnerProfile) => void;
  onSignOut?: () => void;
  onNavigateSettings?: () => void;
}

export const CandidateProfileModal = ({
  currentProfile,
  isOpen,
  onClose,
  onProfileChanged,
  onSignOut,
  onNavigateSettings,
}: CandidateProfileModalProps) => {
  const [profiles, setProfiles] = useState<LearnerProfile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTargetBand, setNewTargetBand] = useState(7.5);
  const [newTestType, setNewTestType] = useState<'academic' | 'general'>('academic');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfiles(loadAllProfiles());
      setIsCreating(false);
      setNewName('');
      recalculateAndSaveStreak(currentProfile.id);
    }
  }, [isOpen, currentProfile.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (isCreating) {
          setIsCreating(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCreating, onClose]);

  if (!isOpen) return null;

  const handleSelect = (p: LearnerProfile) => {
    setActiveProfileId(p.id);
    onProfileChanged(p);
    onClose();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = createNewProfile(newName.trim(), newTargetBand, newTestType);
    setProfiles(loadAllProfiles());
    onProfileChanged(created);
    setIsCreating(false);
    onClose();
  };

  const otherProfiles = profiles.filter(p => p.id !== currentProfile.id);
  const initials = currentProfile.avatar || currentProfile.displayName.slice(0, 2).toUpperCase();

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 9, 11, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'clamp(0.5rem, 2vw, 1.25rem)',
      }}
    >
      <div
        className="double-bezel modal-enter"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div
          className="double-bezel-inner"
          style={{
            padding: 'clamp(1.25rem, 4vw, 1.75rem)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            gap: '1.25rem',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
            }}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>

          {/* Modal Header */}
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 750, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Candidate Account Details
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Active student session, exam targets, and diagnostic progress storage.
            </p>
          </div>

          {/* Active Candidate Hero Card */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                className="avatar-badge"
                style={{
                  width: '52px',
                  height: '52px',
                  fontSize: '1.2rem',
                  boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
                }}
              >
                {initials}
                <span style={{
                  position: 'absolute',
                  bottom: '0px',
                  right: '0px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  border: '2px solid #ffffff',
                }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                    {currentProfile.displayName}
                  </h3>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                    Active
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  ID: <span className="font-mono">{currentProfile.id}</span>
                </div>
              </div>
            </div>

            {/* Candidate Specs Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.6rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
              }}>
                <div style={{
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>Target Band</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--brand-primary)' }}>Change</span>
                </div>
                <select
                  value={currentProfile.targetBand}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    const updated = { ...currentProfile, targetBand: val };
                    saveLearnerProfile(updated);
                    onProfileChanged(updated);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.1rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                    padding: '0',
                    outline: 'none',
                  }}
                  title="Click to change your target band at any time"
                >
                  {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(b => (
                    <option key={b} value={b} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                      Band {b.toFixed(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Module
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem', textTransform: 'capitalize' }}>
                  {currentProfile.testType}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Study Streak
                </div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--warning)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Flame size={16} color="var(--warning)" />
                  <span>{currentProfile.streak}d</span>
                </div>
              </div>
            </div>

            {/* Launch Study Calendar Button */}
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="btn btn-secondary btn-sm"
              style={{
                width: '100%',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                padding: '0.55rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 160ms ease',
              }}
            >
              <Calendar size={14} />
              <span>View Study Calendar</span>
            </button>
          </div>

          {/* Create Profile or Switch Candidate Area */}
          {!isCreating ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {otherProfiles.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    Switch Candidate Account ({otherProfiles.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto' }}>
                    {otherProfiles.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(p)}
                        className="card-hover"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.6rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-surface)',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div className="avatar-badge" style={{ width: '28px', height: '28px', fontSize: '0.72rem' }}>
                            {p.avatar || p.displayName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {p.displayName}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Band {p.targetBand.toFixed(1)} • <span style={{ textTransform: 'capitalize' }}>{p.testType}</span>
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          Switch <ChevronRight size={13} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsCreating(true)}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem' }}
              >
                <Plus size={15} />
                <span>Add Another Candidate Profile</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                New Candidate Profile
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Candidate Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="input"
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Target Band:
                  </label>
                  <select
                    value={newTargetBand}
                    onChange={e => setNewTargetBand(parseFloat(e.target.value))}
                    className="select font-mono"
                  >
                    {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(b => (
                      <option key={b} value={b}>Band {b.toFixed(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Module:
                  </label>
                  <select
                    value={newTestType}
                    onChange={e => setNewTestType(e.target.value as any)}
                    className="select"
                  >
                    <option value="academic">IELTS Academic</option>
                    <option value="general">IELTS General</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} />
                  <span>Save Candidate</span>
                </button>
              </div>
            </form>
          )}

          {/* Modal Footer Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '0.25rem',
          }}>
            {onNavigateSettings ? (
              <button
                type="button"
                onClick={() => {
                  onNavigateSettings();
                  onClose();
                }}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <Settings size={14} />
                <span>Account & Goal Settings</span>
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--error)', borderColor: 'var(--error-border)', gap: '0.35rem' }}
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <StudyCalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        candidateName={currentProfile.displayName}
      />
    </div>
  );
};
