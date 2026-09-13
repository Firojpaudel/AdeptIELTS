import { useState } from 'react';
import { User, Plus, Check, X, Calendar, Target, Flame } from 'lucide-react';
import { LearnerProfile } from '../lib/types';
import { loadAllProfiles, createNewProfile, setActiveProfileId } from '../lib/storage';

interface UserSwitcherModalProps {
  currentProfile: LearnerProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileChanged: (profile: LearnerProfile) => void;
}

export const UserSwitcherModal = ({
  currentProfile,
  isOpen,
  onClose,
  onProfileChanged,
}: UserSwitcherModalProps) => {
  const [profiles, setProfiles] = useState<LearnerProfile[]>(loadAllProfiles());
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTargetBand, setNewTargetBand] = useState(7.5);
  const [newTestType, setNewTestType] = useState<'academic' | 'general'>('academic');

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

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 'var(--space-4)',
    }}>
      <div className="card fade-in" style={{
        width: '100%',
        maxWidth: '480px',
        padding: 'clamp(1.15rem, 4vw, var(--space-6))',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>
              {isCreating ? 'Add New Student Profile' : 'Select Active Student'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {isCreating ? 'Create a personalized learning path with isolated diagnostic history.' : 'Switch between candidates or create a new student account.'}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-subtle btn-sm" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {!isCreating ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: '320px', overflowY: 'auto' }}>
              {profiles.map((p) => {
                const isActive = p.id === currentProfile.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                      border: `1px solid ${isActive ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div className="avatar-badge" style={{ backgroundColor: isActive ? 'var(--text-primary)' : 'var(--border-default)', color: isActive ? '#fff' : 'var(--text-secondary)' }}>
                        {p.avatar || p.displayName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                          {p.displayName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ textTransform: 'capitalize' }}>{p.testType}</span>
                          <span>•</span>
                          <span>Target Band {p.targetBand.toFixed(1)}</span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--warning)' }}>
                            <Flame size={12} /> {p.streak}d
                          </span>
                        </div>
                      </div>
                    </div>

                    {isActive && <Check size={18} color="var(--text-primary)" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsCreating(true)}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }}
            >
              <Plus size={15} />
              <span>Add New Student Profile</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Student Name:
              </label>
              <input
                type="text"
                placeholder="e.g. Liam Henderson"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
                className="input"
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Target Band:
                </label>
                <select
                  value={newTargetBand}
                  onChange={e => setNewTargetBand(Number(e.target.value))}
                  className="select"
                >
                  {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(b => (
                    <option key={b} value={b}>Band {b.toFixed(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Exam Module:
                </label>
                <select
                  value={newTestType}
                  onChange={e => setNewTestType(e.target.value as any)}
                  className="select"
                >
                  <option value="academic">Academic</option>
                  <option value="general">General Training</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="btn btn-subtle"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Create Profile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
