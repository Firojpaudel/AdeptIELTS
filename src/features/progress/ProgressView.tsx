import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Award,
  Database,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Target,
  RefreshCw,
} from 'lucide-react';
import { LearnerProfile, QuestionAttempt, ExamScoreRecord } from '../../lib/types';
import { loadExamScores, loadReadResourceIds } from '../../lib/storage';
import { generateAIExamCritique, AIExamCritique } from '../../lib/aiService';
import { StudyCalendarModal } from '../../components/StudyCalendarModal';

interface ProgressViewProps {
  profile: LearnerProfile;
  attempts: QuestionAttempt[];
  onNavigate?: (tab: any) => void;
}

export const ProgressView = ({ profile, attempts, onNavigate }: ProgressViewProps) => {
  const masteryEntries = Object.entries(profile.subskillMastery || {});

  const totalCorrect = attempts.filter(a => a.isCorrect).length;
  const overallAccuracy = attempts.length > 0 ? Math.round((totalCorrect / attempts.length) * 100) : 0;

  const [examScores, setExamScores] = useState<ExamScoreRecord[]>([]);
  const [readResourceIds, setReadResourceIds] = useState<string[]>([]);
  const [loadingCloudData, setLoadingCloudData] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  const [aiCritique, setAiCritique] = useState<AIExamCritique | null>(null);
  const [isCritiquing, setIsCritiquing] = useState(false);

  const handleRefreshCritique = async (scoresToUse: ExamScoreRecord[]) => {
    setIsCritiquing(true);
    try {
      const critique = await generateAIExamCritique({
        profile,
        examScores: scoresToUse,
        attempts,
      });
      setAiCritique(critique);
    } catch (e) {
      console.warn('AI critique generation note:', e);
    } finally {
      setIsCritiquing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchCloudData() {
      try {
        const [scores, reads] = await Promise.all([
          loadExamScores(profile.id),
          loadReadResourceIds(profile.id),
        ]);
        if (isMounted) {
          setExamScores(scores);
          setReadResourceIds(reads);
          setLoadingCloudData(false);
          generateAIExamCritique({ profile, examScores: scores, attempts })
            .then(res => { if (isMounted) setAiCritique(res); })
            .catch(() => {});
        }
      } catch (e) {
        if (isMounted) setLoadingCloudData(false);
      }
    }
    fetchCloudData();
    return () => { isMounted = false; };
  }, [profile.id, attempts.length]);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <span className="badge badge-brand">Adaptive Metrics</span>
        <h1 style={{ marginTop: '0.35rem', fontSize: '1.85rem' }}>Learner Progress & Mastery</h1>
        <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
          Real-time statistical evaluation calculated from actual practice attempts, timed mocks, and SRS recall.
        </p>
      </div>

      {/* Top Stat KPI Row (Double-Bezel) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Current Estimated Band
          </div>
          <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--brand-primary)', marginTop: '0.25rem' }}>
            Band {profile.currentEstimatedBand ? profile.currentEstimatedBand.toFixed(1) : '5.5'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Target: Band {profile.targetBand ? profile.targetBand.toFixed(1) : '7.5'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Practice Accuracy
          </div>
          <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {attempts.length > 0 ? `${overallAccuracy}%` : '—'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {attempts.length > 0 ? `${totalCorrect} / ${attempts.length} correct questions` : 'No attempts logged yet'}
          </div>
        </div>

        <div
          className="card card-hover"
          onClick={() => setShowCalendar(true)}
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            border: '1px solid #fed7aa',
            backgroundColor: '#fffdfa',
            transition: 'all 150ms ease',
          }}
          title="Click to view real activity calendar"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Study Consistency
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--brand-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Calendar size={12} /> CALENDAR ↗
            </span>
          </div>
          <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--warning)', marginTop: '0.25rem' }}>
            🔥 {profile.streak || 0} {profile.streak === 1 ? 'Day' : 'Days'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '0.2rem', fontWeight: 500 }}>
            Click to view daily activity calendar
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Candidate Module
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem', textTransform: 'capitalize' }}>
            {profile.testType === 'academic' ? 'IELTS Academic' : 'IELTS General'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {profile.examDate ? `Exam: ${profile.examDate}` : 'Target date open'}
          </div>
        </div>
      </div>

      {/* AI Exam & Activity Diagnostic Critique Card */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--brand-primary-subtle)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    AI Exam Score & Diagnostic Critique
                  </h3>
                  <span className="badge badge-brand" style={{ fontSize: '0.68rem' }}>
                    Senior IELTS Psychometrician
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Holistic evaluation computed from your stored mock exam scores, error patterns, and subskill metrics.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleRefreshCritique(examScores)}
              disabled={isCritiquing}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            >
              <RefreshCw size={13} className={isCritiquing ? 'spin' : ''} />
              <span>{isCritiquing ? 'Evaluating Scores...' : 'Re-Evaluate Activities'}</span>
            </button>
          </div>

          {aiCritique ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Executive Diagnosis Banner */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(220px, 280px) 1fr',
                gap: '1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                border: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                    Target Band Readiness
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.25rem' }}>
                    {aiCritique.readinessPercentage}% Ready
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {aiCritique.overallReadiness}
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    borderRadius: 'var(--radius-full)',
                    marginTop: '0.65rem',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${aiCritique.readinessPercentage}%`,
                      height: '100%',
                      backgroundColor: 'var(--brand-primary)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Estimated timeline: <strong>{aiCritique.timelineEstimate}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                    Executive Examiner Synthesis
                  </div>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                    {aiCritique.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Diagnosed Bottlenecks */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldAlert size={14} color="var(--warning)" />
                  <span>Primary Score Impediments Diagnosed by AI</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.85rem' }}>
                  {aiCritique.keyBottlenecks.map((bn, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)' }}>
                          {bn.affectedSkill} Bottleneck
                        </span>
                        <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>
                          Score Drag
                        </span>
                      </div>
                      <div style={{ fontWeight: 650, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {bn.title}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {bn.description}
                      </p>
                      <div style={{ fontSize: '0.76rem', color: 'var(--error)', fontWeight: 500, marginTop: 'auto', paddingTop: '0.35rem', borderTop: '1px dashed var(--border-subtle)' }}>
                        Impact: {bn.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Adaptive Drills */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Target size={14} color="var(--brand-primary)" />
                  <span>AI Prescribed High-Yield Recovery Actions</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                  {aiCritique.priorityDrills.map((drill, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.65rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                            {drill.subskillLabel}
                          </span>
                          <span className="badge badge-brand" style={{ fontSize: '0.68rem' }}>
                            {drill.estimatedGain}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.45 }}>
                          <strong>Diagnosis:</strong> {drill.reason}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '0.3rem', lineHeight: 1.45 }}>
                          <strong>Prescription:</strong> {drill.action}
                        </p>
                      </div>

                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('practice')}
                          className="btn btn-secondary btn-sm"
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            marginTop: '0.25rem',
                            gap: '0.35rem',
                          }}
                        >
                          <span>Launch Adaptive Drill</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Synthesizing exam scores, question attempts, and subskill diagnostics...
            </div>
          )}
        </div>
      </div>

      {/* Subskill Mastery Table */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Subskill Mastery Index</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Weighted mastery formula (0.45 recent accuracy + 0.25 overall + 0.15 consistency + 0.15 confidence)
              </p>
            </div>
          </div>

          {masteryEntries.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>SUBSKILL / QUESTION TYPE</th>
                    <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>ATTEMPTS</th>
                    <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>RECENT ACCURACY</th>
                    <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>MASTERY SCORE</th>
                    <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {masteryEntries.map(([subskill, data]) => {
                    const masteryPct = Math.round(data.mastery * 100);
                    const isWeakness = masteryPct < 65;

                    return (
                      <tr key={subskill} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>
                          {subskill.replace(/_/g, ' ')}
                        </td>
                        <td className="font-mono" style={{ padding: '0.65rem 0.75rem' }}>
                          {data.attempts}
                        </td>
                        <td className="font-mono" style={{ padding: '0.65rem 0.75rem' }}>
                          {Math.round(data.recentAccuracy * 100)}%
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', minWidth: '160px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              flex: 1,
                              height: '6px',
                              backgroundColor: 'var(--bg-subtle)',
                              borderRadius: 'var(--radius-full)',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${masteryPct}%`,
                                height: '100%',
                                backgroundColor: isWeakness ? 'var(--warning)' : 'var(--brand-primary)',
                                borderRadius: 'var(--radius-full)',
                              }} />
                            </div>
                            <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                              {masteryPct}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <span className={`badge ${isWeakness ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.68rem' }}>
                            {isWeakness ? 'Needs Work' : 'On Track'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              padding: '2.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-default)',
            }}>
              <TrendingUp size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                No Practice Attempts Logged Yet
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0.35rem auto 0' }}>
                Complete reading questions, listening sections, or writing essays to generate your live subskill diagnostics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Question Attempts Log */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Question Log</h3>
        {attempts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {attempts.slice(-5).reverse().map(att => (
              <div
                key={att.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {att.isCorrect ? <CheckCircle2 size={14} color="var(--success)" /> : <AlertTriangle size={14} color="var(--error)" />}
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{att.skill}</span>
                  <span style={{ color: 'var(--text-muted)' }}>• {att.subskill.replace(/_/g, ' ')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{att.timeSpentSeconds}s</span>
                  <span className={`badge ${att.isCorrect ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                    {att.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            No question attempts recorded yet.
          </p>
        )}
      </div>

      {/* Cloud-Synced Full Mock Exam History (Turso Database) */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={18} color="var(--brand-primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Full Mock Exam Scores</h3>
          </div>
          <span className="badge badge-brand" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Database size={11} /> Synced to Turso DB
          </span>
        </div>

        {examScores.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {examScores.map(score => (
              <div
                key={score.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {score.examType.replace('_', ' ')} • Band {score.overallBand.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {new Date(score.createdAt).toLocaleDateString()} {new Date(score.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {score.readingBand !== undefined && ` • Reading: Band ${score.readingBand.toFixed(1)}`}
                    {score.writingBand !== undefined && ` • Writing: Band ${score.writingBand.toFixed(1)}`}
                    {score.timeSpentSeconds && ` • Duration: ${Math.round(score.timeSpentSeconds / 60)}m`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-brand" style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.65rem' }}>
                    Band {score.overallBand.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
            {loadingCloudData ? 'Loading exam scores from Turso database...' : 'No full mock exams completed yet. Take a Timed Mock Exam to log your official scores to the database.'}
          </div>
        )}
      </div>

      {/* Cloud-Synced Reading Ledger */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={18} color="var(--brand-primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Studied Materials & Reading Ledger</h3>
          </div>
          <span className="badge badge-brand" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Database size={11} /> {readResourceIds.length} items logged in Turso
          </span>
        </div>

        {readResourceIds.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {readResourceIds.map(id => (
              <span
                key={id}
                className="badge badge-brand"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  textTransform: 'capitalize',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <CheckCircle2 size={12} color="var(--brand-primary)" />
                {id.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
            {loadingCloudData ? 'Checking reading history from Turso database...' : 'No books or guides marked as read yet. Use the "Mark Read" button in Library or Study Masterclasses to track your readings.'}
          </div>
        )}
      </div>

      <StudyCalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        candidateName={profile.displayName}
      />
    </div>
  );
};
