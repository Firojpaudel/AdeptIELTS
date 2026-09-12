import {
  ArrowRight,
  Clock,
  Zap,
  Sparkles,
  BookOpen,
  PenTool,
  Mic,
  Brain,
  Layers,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { LearnerProfile, QuestionAttempt, VocabularyCard } from '../../lib/types';
import { getRecommendedActivities } from '../../lib/adaptiveEngine';
import { SkillMeter } from '../../components/SkillMeter';
import { ActiveTab } from '../../components/AppShell';
import { saveLearnerProfile } from '../../lib/storage';

interface DashboardViewProps {
  profile: LearnerProfile;
  attempts: QuestionAttempt[];
  vocabCards: VocabularyCard[];
  onNavigate: (tab: ActiveTab) => void;
  onProfileUpdated?: (profile: LearnerProfile) => void;
}

export const DashboardView = ({
  profile,
  attempts,
  vocabCards,
  onNavigate,
  onProfileUpdated,
}: DashboardViewProps) => {
  const recommendations = getRecommendedActivities(profile, attempts, vocabCards);
  const primaryRec = recommendations[0];

  const handleTargetBandChange = (newBand: number) => {
    const updated: LearnerProfile = { ...profile, targetBand: newBand };
    saveLearnerProfile(updated);
    onProfileUpdated?.(updated);
  };

  // Dynamic date calculations
  const examDate = profile.examDate ? new Date(profile.examDate) : new Date(Date.now() + 42 * 24 * 60 * 60 * 1000);
  const today = new Date();
  const diffTime = examDate.getTime() - today.getTime();
  const daysUntilExam = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const correctAttempts = attempts.filter(a => a.isCorrect).length;
  const userAccuracy = attempts.length > 0 ? Math.round((correctAttempts / attempts.length) * 100) : 74;
  const todayStr = today.toISOString().split('T')[0];
  const dueVocabCount = vocabCards.filter(c => c.nextReviewDate <= todayStr).length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* Editorial Candidate Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.25rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', letterSpacing: '-0.025em', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Study Plan & Mastery
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 550, color: 'var(--text-secondary)' }}>
              {profile.testType === 'academic' ? 'IELTS Academic' : 'General Training'}
            </span>
            <span>•</span>
            <span>{daysUntilExam} days to test</span>
          </p>
        </div>

        {/* Top Right Controls: Target Band Modifier + Mock Exam */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target</span>
            <select
              id="header-target-band-select"
              value={profile.targetBand}
              onChange={(e) => handleTargetBandChange(parseFloat(e.target.value))}
              className="target-band-select"
              style={{
                border: 'none',
                padding: '0.1rem 0.25rem',
                fontSize: '0.85rem',
                background: 'transparent',
                boxShadow: 'none',
                cursor: 'pointer',
              }}
              aria-label="Change target band"
              title="Click to adjust your target band"
            >
              {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(b => (
                <option key={b} value={b}>Band {b.toFixed(1)}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onNavigate('mock')}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600, padding: '0.45rem 1rem' }}
          >
            Full Mock Exam
          </button>
        </div>
      </div>

      {/* Hero Recommendation — Machined Double-Bezel Card */}
      {primaryRec && (
        <div className="double-bezel">
          <div className="double-bezel-inner" style={{
            padding: '1.5rem 1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}>
            <div style={{ maxWidth: '720px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span className={`badge ${primaryRec.priority === 'urgent' ? 'badge-error' : 'badge-brand'}`}>
                  <Zap size={11} />
                  {primaryRec.priority === 'urgent' ? 'High-Priority Remediation' : 'Recommended Next Action'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} /> ~{primaryRec.targetMinutes} minutes
                </span>
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {primaryRec.title}
              </h2>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {primaryRec.reason}
              </p>
            </div>

            {/* Nested "Button-in-Button" Trailing Icon Architecture */}
            <div>
              <button
                onClick={() => {
                  if (primaryRec.type === 'spaced_review') onNavigate('vocabulary');
                  else if (primaryRec.skill === 'writing') onNavigate('writing');
                  else if (primaryRec.skill === 'speaking') onNavigate('speaking');
                  else onNavigate('practice');
                }}
                className="btn btn-primary btn-lg"
                style={{
                  padding: '0.65rem 0.75rem 0.65rem 1.25rem',
                  gap: '0.75rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <span>Launch Adaptive Drill</span>
                <span style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ArrowRight size={13} color="#ffffff" />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asymmetric Bento Grid: Skill Breakdown & Diagnostic Analytics */}
      <div className="dashboard-bento">
        
        {/* Left Column (7 cols on desktop, 1 col on mobile): 4 Skills Breakdown */}
        <div className="card dashboard-bento-main" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Candidate Skill Breakdown</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Official Band Scale (1.0–9.0) with real-time adaptive mastery
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target:</span>
              <select
                value={profile.targetBand}
                onChange={(e) => handleTargetBandChange(parseFloat(e.target.value))}
                className="target-band-select"
                style={{ padding: '0.18rem 0.5rem', fontSize: '0.78rem' }}
                aria-label="Change Target Band"
                title="Change Target Band"
              >
                {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(b => (
                  <option key={b} value={b}>Band {b.toFixed(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <SkillMeter
              label="Reading"
              currentBand={profile.skillBands.reading}
              targetBand={profile.targetBand}
              masteryPercentage={Math.round((profile.skillBands.reading / profile.targetBand) * 100)}
              onAction={() => onNavigate('practice')}
            />
            <SkillMeter
              label="Listening"
              currentBand={profile.skillBands.listening}
              targetBand={profile.targetBand}
              masteryPercentage={Math.round((profile.skillBands.listening / profile.targetBand) * 100)}
              onAction={() => onNavigate('practice')}
            />
            <SkillMeter
              label="Writing"
              currentBand={profile.skillBands.writing}
              targetBand={profile.targetBand}
              masteryPercentage={Math.round((profile.skillBands.writing / profile.targetBand) * 100)}
              onAction={() => onNavigate('writing')}
            />
            <SkillMeter
              label="Speaking"
              currentBand={profile.skillBands.speaking}
              targetBand={profile.targetBand}
              masteryPercentage={Math.round((profile.skillBands.speaking / profile.targetBand) * 100)}
              onAction={() => onNavigate('speaking')}
            />
          </div>
        </div>

        {/* Right Column (5 cols on desktop, 1 col on mobile): Diagnostic Engine & Spaced Review */}
        <div className="dashboard-bento-side" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Spaced Memory Box */}
          <div className="card card-hover" style={{ padding: '1.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Brain size={17} color="var(--brand-primary)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Spaced Memory Engine</h4>
              </div>
              <span className="badge badge-brand">{dueVocabCount} due today</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Active SM-2 interval schedule ensures Academic Word List retention with optimal review intervals.
            </p>

            <button
              onClick={() => onNavigate('vocabulary')}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <span>Review Flashcard Deck</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick Metrics Bento Card */}
          <div className="card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Candidate Diagnostics
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <TrendingUp size={12} color="var(--brand-primary)" /> Accuracy
                </div>
                <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {userAccuracy}%
                </div>
              </div>

              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={12} color="var(--success)" /> Questions
                </div>
                <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {attempts.length} logged
                </div>
              </div>
            </div>

            <div className="alert alert-info" style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
              <span>
                <strong>Adaptive Focus:</strong> Speed up inference scanning on Passage 2 to increase overall band ceiling.
              </span>
            </div>

            <button
              onClick={() => onNavigate('progress')}
              className="btn btn-secondary btn-sm"
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '0.6rem 0.85rem',
                fontWeight: 650,
                marginTop: '0.15rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={14} color="var(--brand-primary)" />
                <span>Deep Diagnostics & Mastery Hub</span>
              </span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </div>

      {/* Quick Launchpad Strip (Horizontal Bento) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Quick Study Modules
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          
          <button
            onClick={() => onNavigate('practice')}
            className="card card-hover"
            style={{
              padding: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-primary-subtle)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BookOpen size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Adaptive Reading
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                True/False, Headings
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('writing')}
            className="card card-hover"
            style={{
              padding: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--warning-subtle)',
              color: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PenTool size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Writing Coach
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Task 1 & Task 2 Rubric
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('speaking')}
            className="card card-hover"
            style={{
              padding: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--info-subtle)',
              color: 'var(--info)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Mic size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Speaking Examiner
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Part 1, 2, 3 Audio Sim
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('learn')}
            className="card card-hover"
            style={{
              padding: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-primary-subtle)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Layers size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Strategy Lessons
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Official Frameworks
              </div>
            </div>
          </button>

        </div>
      </div>

    </div>
  );
};
