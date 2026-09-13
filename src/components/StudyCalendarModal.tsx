import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  BookOpen,
  Target,
  PenTool,
  Mic,
  Trophy,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  compileStudyActivityMap,
  computeStreakMetrics,
  getMonthCalendarGrid,
  formatLocalDate,
  parseLocalDate,
  DailyStudySummary,
} from '../lib/studyTracker';

interface StudyCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  onNavigateToTab?: (tab: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const StudyCalendarModal = ({
  isOpen,
  onClose,
  candidateName = 'Candidate',
  onNavigateToTab,
}: StudyCalendarModalProps) => {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatLocalDate(today));

  // Compile all activity records across storage and calculate real streak
  const activityMap = useMemo(() => {
    return compileStudyActivityMap();
  }, [isOpen]);

  const streakMetrics = useMemo(() => {
    return computeStreakMetrics(activityMap);
  }, [activityMap]);

  // Generate calendar day cells
  const calendarCells = useMemo(() => {
    return getMonthCalendarGrid(currentYear, currentMonthIndex, activityMap);
  }, [currentYear, currentMonthIndex, activityMap]);

  // Selected Day Summary
  const selectedDaySummary: DailyStudySummary | null = activityMap[selectedDateStr] || null;

  // Month stats
  const monthStats = useMemo(() => {
    let daysStudied = 0;
    let totalTasks = 0;
    let totalMinutes = 0;

    calendarCells.forEach(c => {
      if (c.isCurrentMonth && c.hasStudied) {
        daysStudied += 1;
        if (c.summary) {
          totalTasks += c.summary.totalEvents;
          totalMinutes += c.summary.totalMinutes;
        }
      }
    });

    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

    return {
      daysStudied,
      daysInMonth,
      totalTasks,
      totalMinutes,
      consistencyPct: Math.round((daysStudied / daysInMonth) * 100),
    };
  }, [calendarCells, currentYear, currentMonthIndex]);

  // Lock background body scroll while calendar modal is active on mobile
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonthIndex(11);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonthIndex(0);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonthIndex(today.getMonth());
    setSelectedDateStr(formatLocalDate(today));
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <Target size={14} color="var(--brand-primary)" />;
      case 'writing':
        return <PenTool size={14} color="#7c3aed" />;
      case 'speaking':
        return <Mic size={14} color="#059669" />;
      case 'vocab':
        return <Flame size={14} color="#ea580c" />;
      case 'reading':
        return <BookOpen size={14} color="#2563eb" />;
      default:
        return <CheckCircle2 size={14} color="var(--brand-primary)" />;
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 9, 11, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(0.4rem, 2vw, 1.25rem)',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        className="modal-enter double-bezel"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: 'min(92vh, 92dvh)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Close Button (Always visible during scroll) */}
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 40,
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 160ms ease, color 160ms ease',
          }}
          title="Close (Esc)"
        >
          <X size={18} />
        </button>

        <div
          className="double-bezel-inner"
          style={{
            padding: 'clamp(0.85rem, 3vw, 1.65rem)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Header */}
          <div style={{ paddingRight: '2.5rem', flexShrink: 0 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 750, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Study Calendar
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Daily activity tracking and consecutive study streak.
            </p>
          </div>

          {/* Top Streak & Consistency Dashboard */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))',
            gap: '0.65rem',
            flexShrink: 0,
            alignItems: 'stretch',
          }}>
            {/* Current Streak */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '104px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--warning)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', minHeight: '1.25rem', whiteSpace: 'nowrap' }}>
                <Flame size={14} color="var(--warning)" style={{ flexShrink: 0 }} />
                <span>Current Streak</span>
              </div>
              <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, margin: '0.35rem 0 0.2rem 0' }}>
                {streakMetrics.currentStreak} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{streakMetrics.currentStreak === 1 ? 'Day' : 'Days'}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {streakMetrics.studiedToday ? 'Active today' : streakMetrics.studiedYesterday ? 'Grace period active' : 'Start a drill today'}
              </div>
            </div>

            {/* Longest Streak */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '104px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', minHeight: '1.25rem', whiteSpace: 'nowrap' }}>
                <Trophy size={14} style={{ flexShrink: 0 }} />
                <span>Longest Streak</span>
              </div>
              <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, margin: '0.35rem 0 0.2rem 0' }}>
                {streakMetrics.longestStreak} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{streakMetrics.longestStreak === 1 ? 'Day' : 'Days'}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                All-time personal record
              </div>
            </div>

            {/* Monthly Consistency */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '104px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', minHeight: '1.25rem', whiteSpace: 'nowrap' }}>
                <CalendarIcon size={14} style={{ flexShrink: 0 }} />
                <span>Consistency</span>
              </div>
              <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, margin: '0.35rem 0 0.2rem 0' }}>
                {monthStats.daysStudied} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ {monthStats.daysInMonth}d</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {monthStats.consistencyPct}% active rate
              </div>
            </div>

            {/* Total Study Minutes */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '104px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', minHeight: '1.25rem', whiteSpace: 'nowrap' }}>
                <Clock size={14} style={{ flexShrink: 0 }} />
                <span>Practice Time</span>
              </div>
              <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, margin: '0.35rem 0 0.2rem 0' }}>
                {monthStats.totalMinutes} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>min</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Across {monthStats.totalTasks} tasks
              </div>
            </div>
          </div>

          {/* Calendar Month Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={handlePrevMonth}
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px 8px', transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)' }}
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>

              <h3 style={{ fontSize: '1.02rem', fontWeight: 750, color: 'var(--text-primary)', letterSpacing: '-0.01em', minWidth: 'clamp(120px, 30vw, 160px)', textAlign: 'center' }}>
                {MONTH_NAMES[currentMonthIndex]} {currentYear}
              </h3>

              <button
                onClick={handleNextMonth}
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px 8px', transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)' }}
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              onClick={handleJumpToToday}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem', transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)' }}
            >
              Today
            </button>
          </div>

          {/* Calendar Grid (Mon to Sun) */}
          <div style={{
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface)',
            flexShrink: 0,
          }}>
            {/* Weekday Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              backgroundColor: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border-default)',
              textAlign: 'center',
            }}>
              {WEEKDAY_NAMES.map(w => (
                <div key={w} style={{
                  padding: '0.55rem 0',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {w}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
            }}>
              {calendarCells.map((cell, idx) => {
                const isSelected = cell.date === selectedDateStr;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDateStr(cell.date)}
                    style={{
                      minHeight: 'clamp(46px, 8vw, 62px)',
                      padding: 'clamp(0.2rem, 1vw, 0.4rem)',
                      borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-subtle)' : 'none',
                      borderBottom: idx < calendarCells.length - 7 ? '1px solid var(--border-subtle)' : 'none',
                      backgroundColor: isSelected
                        ? 'var(--brand-primary-subtle)'
                        : cell.hasStudied
                        ? 'var(--warning-subtle)'
                        : cell.isCurrentMonth
                        ? 'var(--bg-surface)'
                        : 'var(--bg-subtle)',
                      cursor: 'pointer',
                      transition: 'background-color 150ms ease, box-shadow 150ms ease, filter 150ms ease',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      outline: isSelected ? '2px solid var(--brand-primary)' : 'none',
                      outlineOffset: '-2px',
                      zIndex: isSelected ? 2 : 1,
                    }}
                  >
                    {/* Top row: day number and today tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: cell.isToday || isSelected ? 800 : cell.isCurrentMonth ? 600 : 400,
                          color: cell.isToday
                            ? 'var(--brand-primary)'
                            : cell.isCurrentMonth
                            ? 'var(--text-primary)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {cell.dayNumber}
                      </span>

                      {cell.isToday && (
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '1px 4px',
                          borderRadius: '3px',
                          backgroundColor: 'var(--brand-primary)',
                          color: '#ffffff',
                          textTransform: 'uppercase',
                        }}>
                          Today
                        </span>
                      )}
                    </div>

                    {/* Middle: Study indicator flame or badge */}
                    {cell.hasStudied && cell.summary ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '0.2rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--warning)' }}>
                          <Flame size={13} color="var(--warning)" />
                          <span style={{ fontSize: '0.7rem', fontWeight: 750 }}>
                            {cell.summary.totalEvents}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {cell.summary.totalMinutes}m
                        </span>
                      </div>
                    ) : (
                      <div style={{ height: '16px' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Inspector Panel */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: 'clamp(0.85rem, 3vw, 1.25rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Daily Activity Breakdown
                </span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 750, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                  {parseLocalDate(selectedDateStr).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h4>
              </div>

              {selectedDaySummary && selectedDaySummary.totalEvents > 0 ? (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 650,
                }}>
                  <Flame size={14} color="var(--warning)" />
                  <span>{selectedDaySummary.totalEvents} Tasks Logged • {selectedDaySummary.totalMinutes} mins</span>
                </div>
              ) : (
                <span className="badge badge-zinc" style={{ fontSize: '0.75rem' }}>
                  Rest Day / No Activities
                </span>
              )}
            </div>

            {/* Activities List */}
            {selectedDaySummary && selectedDaySummary.entries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto' }}>
                {selectedDaySummary.entries.map((entry, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {getActivityTypeIcon(entry.type)}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {entry.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {entry.time} {entry.meta ? `• ${entry.meta}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ~{entry.durationMinutes} min
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '1.25rem 1rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: '0.84rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem',
              }}>
                <div>No study sessions were logged on this calendar date.</div>
                {onNavigateToTab && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab('practice');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)' }}
                    >
                      <Target size={13} /> Practice Drills
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab('vocabulary');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)' }}
                    >
                      <Flame size={13} color="var(--warning)" /> Review Vocabulary
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
