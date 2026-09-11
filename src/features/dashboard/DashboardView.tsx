import {
  ArrowRight,
  Clock,
  Calendar,
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
import { getBandDescriptor } from '../../lib/ieltsScoring';
import { ActiveTab } from '../../components/AppShell';

interface DashboardViewProps {
  profile: LearnerProfile;
  attempts: QuestionAttempt[];
  vocabCards: VocabularyCard[];
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView = ({
  profile,
  attempts,
  vocabCards,
  onNavigate,
}: DashboardViewProps) => {
  const recommendations = getRecommendedActivities(profile, attempts, vocabCards);
  const primaryRec = recommendations[0];
  const descriptor = getBandDescriptor(profile.currentEstimatedBand || 6.5);

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
        alignItems: 'flex-end',
        gap: '1.25rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-brand" style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {profile.testType === 'academic' ? 'IELTS Academic Module' : 'IELTS General Training'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Candidate: <strong style={{ color: 'var(--text-primary)' }}>{profile.displayName}</strong>
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', letterSpacing: '-0.03em', fontWeight: 700 }}>
            Target Band {profile.targetBand.toFixed(1)} Mastery Path
          </h1>
          <p style={{ marginTop: '0.25rem', maxWidth: '680px', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            {descriptor.summary}
          </p>
        </div>

        {/* Top Right Quick Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.85rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <Calendar size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {daysUntilExam} Days to Test
            </span>
          </div>

          <button
            onClick={() => onNavigate('mock')}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600 }}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>
        
        {/* Left Column (7 cols): 4 Skills Breakdown */}
        <div className="card" style={{
          gridColumn: 'span 7',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Candidate Skill Breakdown</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Official Band Scale (1.0–9.0) with real-time adaptive mastery
              </p>
            </div>
            <span className="badge badge-zinc" style={{ fontSize: '0.75rem' }}>
              Target: Band {profile.targetBand.toFixed(1)}
            </span>
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

        {/* Right Column (5 cols): Diagnostic Engine & Spaced Review */}
        <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
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
              background: '#ffffff',
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
              background: '#ffffff',
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fffbeb',
              color: '#d97706',
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
              background: '#ffffff',
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
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
              background: '#ffffff',
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
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
