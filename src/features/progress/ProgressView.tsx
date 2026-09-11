import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Award,
  Database,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Target,
  RefreshCw,
  History,
  BarChart3,
  Clock,
  Zap,
  Compass,
  PenTool,
  Mic,
  Headphones,
  Check,
  ChevronRight,
  Filter,
  ShieldCheck,
  Cloud,
} from 'lucide-react';
import { LearnerProfile, QuestionAttempt, ExamScoreRecord } from '../../lib/types';
import { loadExamScores, loadReadResourceIds, loadCritiqueHistory } from '../../lib/storage';
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
  const [critiqueHistory, setCritiqueHistory] = useState<any[]>([]);
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [subskillFilter, setSubskillFilter] = useState<'all' | 'reading' | 'writing' | 'speaking'>('all');

  const getSkillFromSubskill = (subskill: string): 'reading' | 'writing' | 'speaking' | 'listening' => {
    const s = (subskill || '').toLowerCase();
    if (s.includes('task') || s.includes('essay') || s.includes('writ')) return 'writing';
    if (s.includes('speak') || s.includes('monologue') || s.includes('part 2')) return 'speaking';
    if (s.includes('listen')) return 'listening';
    return 'reading';
  };

  const getDestinationTab = (affectedSkill: string, subskillKey?: string): string => {
    const s = (affectedSkill || subskillKey || '').toLowerCase();
    if (s.includes('writ') || s.includes('task') || s.includes('essay')) return 'writing';
    if (s.includes('speak') || s.includes('monologue') || s.includes('part 2')) return 'speaking';
    return 'practice';
  };

  const handleRefreshCritique = async (scoresToUse: ExamScoreRecord[]) => {
    setIsCritiquing(true);
    try {
      const critique = await generateAIExamCritique({
        profile,
        examScores: scoresToUse,
        attempts,
      });
      setAiCritique(critique);
      const updatedHistory = await loadCritiqueHistory(profile.id);
      setCritiqueHistory(updatedHistory);
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
        const [scores, reads, history] = await Promise.all([
          loadExamScores(profile.id),
          loadReadResourceIds(profile.id),
          loadCritiqueHistory(profile.id),
        ]);
        if (isMounted) {
          setExamScores(scores);
          setReadResourceIds(reads);
          setCritiqueHistory(history);
          setLoadingCloudData(false);
          generateAIExamCritique({ profile, examScores: scores, attempts })
            .then(res => {
              if (isMounted) {
                setAiCritique(res);
                loadCritiqueHistory(profile.id).then(h => {
                  if (isMounted && h && h.length > 0) setCritiqueHistory(h);
                });
              }
            })
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Executive Diagnosis & Readiness Card */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(280px, 340px) 1fr',
                gap: '1.5rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                {/* Visual Radial Readiness Meter */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  paddingRight: '1rem',
                  borderRight: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    {/* SVG Circular Readiness Meter */}
                    <div style={{ position: 'relative', width: '92px', height: '92px', flexShrink: 0 }}>
                      <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: 'rotate(-90deg)' }}>
                        <circle
                          cx="46"
                          cy="46"
                          r="38"
                          stroke="rgba(0,0,0,0.06)"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="46"
                          cy="46"
                          r="38"
                          stroke="var(--brand-primary)"
                          strokeWidth="8"
                          strokeDasharray={238.76}
                          strokeDashoffset={238.76 * (1 - (aiCritique.readinessPercentage || 50) / 100)}
                          strokeLinecap="round"
                          fill="transparent"
                          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}
                        />
                      </svg>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)', lineHeight: 1 }}>
                          {aiCritique.readinessPercentage}%
                        </span>
                        <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
                          Ready
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                        Target Readiness
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 750, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                        Band {(profile.currentEstimatedBand || 5.5).toFixed(1)} <span style={{ color: 'var(--brand-primary)' }}>➔</span> Band {(profile.targetBand || 7.5).toFixed(1)}
                      </div>
                      <span className="badge badge-brand" style={{ fontSize: '0.66rem', marginTop: '0.35rem' }}>
                        On Track for Goal
                      </span>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                  }}>
                    <Calendar size={14} color="var(--brand-primary)" />
                    <span>Study pace: <strong>{aiCritique.timelineEstimate}</strong></span>
                  </div>
                </div>

                {/* Supportive Examiner Insights */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)', letterSpacing: '0.04em' }}>
                      <Sparkles size={14} />
                      <span>Senior IELTS Examiner Assessment</span>
                    </div>
                    {aiCritique.bandProgressionDelta !== undefined && (
                      <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                        {aiCritique.bandProgressionDelta >= 0 ? '+' : ''}{aiCritique.bandProgressionDelta.toFixed(1)} Band Trajectory
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--text-primary)', margin: 0 }}>
                    {aiCritique.executiveSummary}
                  </p>

                  {attempts.length === 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.78rem',
                      color: 'var(--brand-primary)',
                      backgroundColor: 'var(--brand-surface)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '0.35rem',
                    }}>
                      <Compass size={14} />
                      <span>
                        <strong>Baseline Diagnostic Mode:</strong> Complete your first quick practice drill or mock test to see your live calibrated accuracy adapt here in real time!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* High-Impact Band Boosters */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Zap size={16} color="var(--warning)" />
                    <span style={{ fontSize: '0.86rem', fontWeight: 750, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      High-Impact Band Boosters
                    </span>
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>
                    Target: +0.5 to +1.0 Band Leap
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '0.85rem' }}>
                  {aiCritique.keyBottlenecks.map((bn, i) => {
                    const skill = bn.affectedSkill || 'reading';
                    const iconColor =
                      skill === 'reading' ? 'var(--brand-primary)' :
                      skill === 'writing' ? '#8b5cf6' :
                      skill === 'speaking' ? '#f59e0b' : '#3b82f6';
                    const iconBg =
                      skill === 'reading' ? 'rgba(13, 148, 136, 0.08)' :
                      skill === 'writing' ? 'rgba(139, 92, 246, 0.08)' :
                      skill === 'speaking' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(59, 130, 246, 0.08)';

                    return (
                      <div
                        key={i}
                        style={{
                          padding: '1.15rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-default)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.65rem',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'border-color 0.15s ease, transform 0.15s ease',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: iconBg,
                                color: iconColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                {skill === 'reading' ? <BookOpen size={13} /> :
                                 skill === 'writing' ? <PenTool size={13} /> :
                                 skill === 'speaking' ? <Mic size={13} /> : <Headphones size={13} />}
                              </div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: iconColor }}>
                                {skill} Focus
                              </span>
                            </div>
                            <span className="badge badge-brand" style={{ fontSize: '0.66rem' }}>
                              Band +0.5 Potential
                            </span>
                          </div>

                          <div style={{ fontWeight: 650, fontSize: '0.94rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                            {bn.title}
                          </div>

                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.35rem' }}>
                            {bn.description}
                          </p>
                        </div>

                        <div>
                          <div style={{
                            fontSize: '0.76rem',
                            color: 'var(--brand-primary)',
                            backgroundColor: 'var(--brand-surface)',
                            padding: '0.45rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 500,
                            lineHeight: 1.4,
                          }}>
                            <strong>Examiner Tip:</strong> {bn.impact}
                          </div>

                          {onNavigate && (
                            <button
                              type="button"
                              onClick={() => onNavigate(getDestinationTab(skill))}
                              className="btn btn-secondary btn-sm"
                              style={{
                                marginTop: '0.65rem',
                                width: '100%',
                                justifyContent: 'center',
                                gap: '0.4rem',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                transition: 'transform 120ms ease-out',
                              }}
                            >
                              <span>Practice {skill.charAt(0).toUpperCase() + skill.slice(1)} Drills</span>
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subskill Accuracy & Mastery Matrix */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.35rem',
                border: '1px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <BarChart3 size={16} color="var(--brand-primary)" />
                      <span style={{ fontSize: '0.86rem', fontWeight: 750, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Subskill Accuracy & Mastery Matrix
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                      Real-time accuracy across IELTS question types. Jump directly into any drill to train.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {(['all', 'reading', 'writing', 'speaking'] as const).map(tabKey => (
                      <button
                        key={tabKey}
                        type="button"
                        onClick={() => setSubskillFilter(tabKey)}
                        style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          border: subskillFilter === tabKey ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          backgroundColor: subskillFilter === tabKey ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                          color: subskillFilter === tabKey ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 150ms ease-out',
                        }}
                      >
                        {tabKey === 'all' ? 'All Subskills' : tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(aiCritique.strugglingAreas || [])
                    .filter(area => {
                      if (subskillFilter === 'all') return true;
                      return getSkillFromSubskill(area.subskill) === subskillFilter;
                    })
                    .slice(0, 6)
                    .map((area, idx) => {
                      const masteryRate = Math.max(0, Math.min(100, 100 - area.failureRate));
                      const isPriority = masteryRate < 50;
                      const isActive = masteryRate >= 50 && masteryRate < 70;
                      const statusLabel = isPriority ? 'Priority Focus' : isActive ? 'Active Practice' : 'Mastered';
                      const statusColor = isPriority ? '#f43f5e' : isActive ? '#f59e0b' : '#10b981';
                      const badgeClass = isPriority ? 'badge-error' : isActive ? 'badge-warning' : 'badge-success';
                      const skill = getSkillFromSubskill(area.subskill);

                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-subtle)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                backgroundColor: 'var(--bg-surface)',
                                padding: '0.15rem 0.45rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-subtle)',
                              }}>
                                {skill}
                              </span>
                              <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                                {area.subskillLabel}
                              </strong>
                              <span className={`badge ${badgeClass}`} style={{ fontSize: '0.64rem' }}>
                                {statusLabel}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span className="font-mono" style={{ fontWeight: 700, color: statusColor, fontSize: '0.82rem' }}>
                                {masteryRate}% Mastery
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {area.attemptCount > 0 ? `(${area.attemptCount} drills)` : '(Baseline Estimate)'}
                              </span>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: area.trend === 'improving' ? 'var(--success)' : area.trend === 'regressing' ? '#f43f5e' : 'var(--text-muted)',
                              }}>
                                {area.trend === 'improving' ? '↑ Improving' : area.trend === 'regressing' ? '↓ Needs Work' : '→ Stable'}
                              </span>
                              {onNavigate && (
                                <button
                                  type="button"
                                  onClick={() => onNavigate(getDestinationTab(skill, area.subskill))}
                                  className="btn btn-subtle btn-sm"
                                  style={{
                                    fontSize: '0.72rem',
                                    padding: '0.2rem 0.55rem',
                                    gap: '0.25rem',
                                    color: 'var(--brand-primary)',
                                    fontWeight: 600,
                                  }}
                                  title={`Practice ${area.subskillLabel}`}
                                >
                                  <span>Train Now</span>
                                  <ChevronRight size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Accuracy Bar */}
                          <div style={{
                            width: '100%',
                            height: '6px',
                            backgroundColor: 'rgba(0,0,0,0.06)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${masteryRate}%`,
                              height: '100%',
                              backgroundColor: statusColor,
                              borderRadius: 'var(--radius-full)',
                              transition: 'width 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                            }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Recommended High-Yield Action Plan */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Target size={16} color="var(--brand-primary)" />
                    <span style={{ fontSize: '0.86rem', fontWeight: 750, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Recommended High-Yield Action Plan
                    </span>
                  </div>
                  <span className="badge badge-brand" style={{ fontSize: '0.68rem' }}>
                    Curated by Senior AI Examiner
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                  {aiCritique.priorityDrills.map((drill, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '1.15rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 750, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {drill.subskillLabel}
                          </span>
                          <span className="badge badge-brand" style={{ fontSize: '0.68rem' }}>
                            {drill.estimatedGain}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.45rem', lineHeight: 1.45 }}>
                          <strong>Key Focus:</strong> {drill.reason}
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.3rem', lineHeight: 1.45 }}>
                          <strong>Action Plan:</strong> {drill.action}
                        </p>
                      </div>

                      {onNavigate && (
                        <button
                          type="button"
                          onClick={() => onNavigate(getDestinationTab(drill.subskill))}
                          className="btn btn-primary btn-sm"
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            marginTop: '0.35rem',
                            gap: '0.35rem',
                            fontWeight: 650,
                            transition: 'transform 120ms ease-out',
                          }}
                        >
                          <span>Start Adaptive Drill</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Temporal Band Trajectory & Cloud Snapshots */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.35rem',
                border: '1px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <History size={16} color="var(--brand-primary)" />
                    <span style={{ fontSize: '0.86rem', fontWeight: 750, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Learning Trajectory & Turso Cloud Snapshots
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-brand" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Cloud size={11} />
                      <span>{critiqueHistory.length} Cloud Snapshots</span>
                    </span>
                    {aiCritique.bandProgressionDelta !== undefined && (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        {aiCritique.bandProgressionDelta >= 0 ? '+' : ''}{aiCritique.bandProgressionDelta.toFixed(1)} Band
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Every mock exam attempt and AI analysis snapshot is encrypted and backed up to your Turso Cloud database, letting you track your steady rise across every session and device.
                </p>

                {/* Timeline Visual Nodes */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(auto-fit, minmax(210px, 1fr))`,
                  gap: '0.75rem',
                  marginTop: '0.25rem',
                }}>
                  {critiqueHistory.length > 0 ? (
                    critiqueHistory.slice(-4).map((snap, i) => (
                      <div
                        key={snap.id || i}
                        style={{
                          padding: '0.9rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-subtle)',
                          border: i === critiqueHistory.slice(-4).length - 1 ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          transition: 'border-color 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={10} />
                            {new Date(snap.createdAt || snap.timestamp).toLocaleDateString()} {new Date(snap.createdAt || snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {i === critiqueHistory.slice(-4).length - 1 && (
                            <span className="badge badge-brand" style={{ fontSize: '0.62rem' }}>
                              Latest
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <span className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--brand-primary)' }}>
                            Band {snap.currentEstimatedBand ? snap.currentEstimatedBand.toFixed(1) : '5.5'}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            ({snap.readinessPercentage}% ready)
                          </span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                          {snap.executiveSummary ? snap.executiveSummary.slice(0, 95) + '...' : 'Evaluation recorded.'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Initial baseline recorded. Complete more questions to build your historical progression curve.
                    </div>
                  )}
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
