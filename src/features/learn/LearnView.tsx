import { useState, useEffect } from 'react';
import { CheckCircle, Clock, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { IELTS_LESSONS } from '../../data/ieltsDataset';
import { Lesson } from '../../lib/types';
import { recordReadResource, loadReadResourceIds } from '../../lib/storage';

export const LearnView = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(IELTS_LESSONS[0]);
  const [answeredChecks, setAnsweredChecks] = useState<Record<string, number>>({});
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  useEffect(() => {
    loadReadResourceIds().then(ids => {
      if (ids && ids.length > 0) {
        setCompletedLessonIds(ids.filter(id => id.startsWith('les-')));
      }
    });
  }, []);

  const handleSelectAnswer = (qId: string, optIndex: number) => {
    setAnsweredChecks(prev => ({ ...prev, [qId]: optIndex }));
  };

  const markComplete = () => {
    if (!completedLessonIds.includes(selectedLesson.id)) {
      setCompletedLessonIds(prev => [...prev, selectedLesson.id]);
      recordReadResource(selectedLesson.id, 'lesson', selectedLesson.title);
    }
  };

  return (
    <div className="fade-in learn-split-grid">
      {/* Lessons Sidebar / Directory */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 650, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            IELTS Strategy Curriculum
          </div>
          <h2 style={{ fontSize: '1.35rem', marginTop: '0.2rem' }}>Concept Masterclasses</h2>
        </div>

        {IELTS_LESSONS.map((les) => {
          const isSelected = selectedLesson.id === les.id;
          const isDone = completedLessonIds.includes(les.id);

          return (
            <button
              key={les.id}
              onClick={() => setSelectedLesson(les)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{les.skill}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Clock size={11} /> {les.estimatedMinutes}m
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)', lineHeight: 1.3 }}>
                  {les.title}
                </div>
              </div>

              {isDone ? (
                <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0 }} />
              ) : (
                <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Lesson Content Area */}
      <article className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'clamp(1rem, 3.5vw, 2rem)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-brand">{selectedLesson.category}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Estimated read: {selectedLesson.estimatedMinutes} mins
            </span>
          </div>
          <h1>{selectedLesson.title}</h1>
          <p style={{ fontSize: '1.05rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            {selectedLesson.overview}
          </p>
        </div>

        {/* Key Takeaways Callout */}
        <div style={{
          backgroundColor: 'var(--brand-primary-subtle)',
          border: '1px solid var(--brand-primary-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
        }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--brand-primary)', marginBottom: '0.5rem' }}>
            Key Strategy Takeaways
          </h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {selectedLesson.keyTakeaways.map((tk, idx) => (
              <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {tk}
              </li>
            ))}
          </ul>
        </div>

        {/* Detailed Lesson Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
          {selectedLesson.content.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Comprehension Check Questions */}
        {selectedLesson.checkQuestions.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: 'var(--space-4)' }}>
              Comprehension Check
            </h3>

            {selectedLesson.checkQuestions.map((cq) => {
              const selectedOpt = answeredChecks[cq.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === cq.correctIndex;

              return (
                <div key={cq.id} style={{
                  padding: 'var(--space-5)',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {cq.question}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {cq.options.map((opt, idx) => (
                      <button
                        key={opt}
                        onClick={() => handleSelectAnswer(cq.id, idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: selectedOpt === idx ? 'var(--bg-surface)' : 'transparent',
                          border: `1px solid ${selectedOpt === idx ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                          color: 'var(--text-primary)',
                          fontWeight: selectedOpt === idx ? 600 : 500,
                          textAlign: 'left',
                          fontSize: '0.9rem',
                        }}
                      >
                        <span>{opt}</span>
                        {isAnswered && idx === cq.correctIndex && (
                          <CheckCircle2 size={16} color="var(--success)" />
                        )}
                      </button>
                    ))}
                  </div>

                  {isAnswered && (
                    <div style={{
                      padding: 'var(--space-3)',
                      backgroundColor: isCorrect ? 'var(--success-subtle)' : 'var(--warning-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      color: isCorrect ? 'var(--success)' : 'var(--warning)',
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>
                        {isCorrect ? 'Accurate!' : 'Strategy Insight:'}
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }}>{cq.rationale}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Completion Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-4)' }}>
          <button
            onClick={markComplete}
            className="btn btn-primary"
            style={{ gap: '0.5rem' }}
          >
            <Award size={16} />
            <span>{completedLessonIds.includes(selectedLesson.id) ? 'Lesson Completed' : 'Mark Lesson Complete'}</span>
          </button>
        </div>
      </article>
    </div>
  );
};
