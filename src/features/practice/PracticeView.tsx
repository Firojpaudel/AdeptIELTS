import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Quote,
  RefreshCw,
  Cpu,
  Check,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { IELTS_QUESTIONS } from '../../data/ieltsDataset';
import { Question, LearnerProfile, QuestionAttempt } from '../../lib/types';
import { calculateMastery } from '../../lib/adaptiveEngine';
import { recordQuestionAttempt, saveLearnerProfile, loadQuestionAttempts } from '../../lib/storage';
import { getTutorExplanation, generateAdaptiveQuestionsWithContext } from '../../lib/aiService';
import { logStudyEvent, recalculateAndSaveStreak } from '../../lib/studyTracker';

interface PracticeViewProps {
  profile: LearnerProfile;
  onProfileUpdated: (p: LearnerProfile) => void;
  onAttemptRecorded: (a: QuestionAttempt) => void;
}

export const PracticeView = ({
  profile,
  onProfileUpdated,
  onAttemptRecorded,
}: PracticeViewProps) => {
  const [questions, setQuestions] = useState<Question[]>(IELTS_QUESTIONS);
  const [selectedSkill, setSelectedSkill] = useState<'all' | 'reading' | 'listening'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [tutorExplanation, setTutorExplanation] = useState<string | null>(null);
  const [isLoadingTutor, setIsLoadingTutor] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMsg, setGenerationMsg] = useState('');
  const [selectedSubskillChoice, setSelectedSubskillChoice] = useState('auto');

  // Past user attempts for context retention
  const userAttempts = loadQuestionAttempts(profile.id);

  // Compute lowest mastery subskill from real user profile
  const subskillEntries = Object.entries(profile.subskillMastery || {});
  subskillEntries.sort((a, b) => a[1].mastery - b[1].mastery);
  const weakestSubskill = subskillEntries.length > 0 ? subskillEntries[0][0] : 'matching_headings';
  const weakestData = profile.subskillMastery[weakestSubskill];
  const weakestAcc = weakestData ? Math.round(weakestData.recentAccuracy * 100) : 45;

  const handleGenerateAdaptive = async () => {
    setIsGenerating(true);
    setGenerationMsg('');
    try {
      const targetSub = selectedSubskillChoice === 'auto' ? weakestSubskill : selectedSubskillChoice;
      const newQuestions = await generateAdaptiveQuestionsWithContext({
        profile,
        attempts: userAttempts,
        focusSubskill: targetSub,
        count: 2,
      });

      if (newQuestions.length > 0) {
        setQuestions(prev => [...newQuestions, ...prev]);
        setCurrentIndex(0);
        setSelectedAnswer('');
        setIsAnswerChecked(false);
        setTutorExplanation(null);
        setGenerationMsg(`Generated 2 adaptive Band ${profile.targetBand.toFixed(1)} questions targeting "${targetSub.replace(/_/g, ' ')}"!`);
        setTimeout(() => setGenerationMsg(''), 7000);
      }
    } catch (err: any) {
      console.warn('Adaptive generation error', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuestions = questions.filter(q =>
    selectedSkill === 'all' ? true : q.skill === selectedSkill
  );

  const currentQ: Question | undefined = filteredQuestions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(opt);
  };

  const handleCheckAnswer = () => {
    if (!currentQ || !selectedAnswer) return;

    const userAns = selectedAnswer.trim().toLowerCase();
    const correctAns = Array.isArray(currentQ.correctAnswer)
      ? currentQ.correctAnswer.map(a => a.toLowerCase())
      : [currentQ.correctAnswer.toLowerCase()];
    const isCorrect = correctAns.includes(userAns);

    const attempt: QuestionAttempt = {
      id: `att-${Date.now()}`,
      questionId: currentQ.id,
      skill: currentQ.skill,
      subskill: currentQ.subskill,
      userAnswer: selectedAnswer,
      isCorrect,
      timeSpentSeconds: 45,
      confidenceRating: confidence,
      timestamp: new Date().toISOString(),
    };

    recordQuestionAttempt(attempt);
    onAttemptRecorded(attempt);
    logStudyEvent('question', `Practice Drill: ${currentQ.skill.toUpperCase()} (${currentQ.subskill.replace(/_/g, ' ')})`, 1);
    const streakMetrics = recalculateAndSaveStreak(profile.id);

    // Update adaptive subskill mastery
    const existing = profile.subskillMastery[currentQ.subskill] || {
      attempts: 0,
      correct: 0,
      recentAccuracy: 0.5,
      confidence: 0.6,
      mastery: 0.5,
      lastPracticed: new Date().toISOString().split('T')[0],
    };

    const newAttempts = existing.attempts + 1;
    const newCorrect = existing.correct + (isCorrect ? 1 : 0);
    const newRecentAcc = isCorrect ? Math.min(1, existing.recentAccuracy * 0.8 + 0.2) : Math.max(0, existing.recentAccuracy * 0.8);
    const confVal = confidence === 'high' ? 1.0 : confidence === 'medium' ? 0.66 : 0.33;

    const newMastery = calculateMastery(newAttempts, newCorrect, newRecentAcc, confVal);

    const updatedProfile: LearnerProfile = {
      ...profile,
      streak: streakMetrics.currentStreak,
      lastActiveDate: streakMetrics.lastActiveDate || profile.lastActiveDate,
      subskillMastery: {
        ...profile.subskillMastery,
        [currentQ.subskill]: {
          attempts: newAttempts,
          correct: newCorrect,
          recentAccuracy: newRecentAcc,
          confidence: confVal,
          mastery: newMastery,
          lastPracticed: new Date().toISOString().split('T')[0],
        },
      },
    };

    saveLearnerProfile(updatedProfile);
    onProfileUpdated(updatedProfile);
    setIsAnswerChecked(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer('');
    setIsAnswerChecked(false);
    setTutorExplanation(null);
    setCurrentIndex((prev) => (prev + 1) % filteredQuestions.length);
  };

  const handleAskTutor = async () => {
    if (!currentQ) return;
    setIsLoadingTutor(true);
    const expl = await getTutorExplanation(
      currentQ.evidenceSpan || currentQ.passageText || '',
      currentQ.prompt,
      selectedAnswer,
      Array.isArray(currentQ.correctAnswer) ? currentQ.correctAnswer.join(', ') : currentQ.correctAnswer
    );
    setTutorExplanation(expl);
    setIsLoadingTutor(false);
  };

  if (!currentQ) {
    return <div>No questions available for selected criteria.</div>;
  }

  const isCurrentCorrect = Array.isArray(currentQ.correctAnswer)
    ? currentQ.correctAnswer.map(a => a.toLowerCase()).includes(selectedAnswer.trim().toLowerCase())
    : currentQ.correctAnswer.toLowerCase() === selectedAnswer.trim().toLowerCase();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Adaptive AI Question Generator Bar */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', flex: 1, minWidth: 'min(100%, 280px)' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--brand-primary-subtle)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                <Sparkles size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                    Adaptive AI Question Generator
                  </h3>
                  <span className="badge badge-brand" style={{ fontSize: '0.68rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <span className="feedback-tab-full">Context-Aware Engine</span>
                    <span className="feedback-tab-short">AI Engine</span>
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.45 }}>
                  Generates fresh, authentic reading passages with line citations tuned to your stored error patterns.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                {userAttempts.length} Past Attempts Logged
              </span>
              <span className="badge badge-brand" style={{ fontSize: '0.72rem' }}>
                Calibrated Band {profile.targetBand.toFixed(1)}
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Targeting Subskill: <strong style={{ color: 'var(--brand-primary)' }}>{weakestSubskill.replace(/_/g, ' ').toUpperCase()}</strong> ({weakestAcc}% mastery accuracy)
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                value={selectedSubskillChoice}
                onChange={(e) => setSelectedSubskillChoice(e.target.value)}
                className="input"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', height: 'auto', width: 'auto' }}
              >
                <option value="auto">Auto-Target Weakest ({weakestSubskill.replace(/_/g, ' ')})</option>
                <option value="matching_headings">Matching Headings</option>
                <option value="true_false_not_given">True / False / Not Given</option>
                <option value="summary_completion">Summary Completion</option>
                <option value="sentence_completion">Sentence Completion</option>
                <option value="multiple_choice">Multiple Choice</option>
              </select>

              <button
                onClick={handleGenerateAdaptive}
                disabled={isGenerating}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
              >
                <Sparkles size={13} className={isGenerating ? 'spin' : ''} />
                <span className="feedback-tab-full">{isGenerating ? 'Generating Passage & Questions...' : 'Generate Adaptive Questions'}</span>
                <span className="feedback-tab-short">{isGenerating ? 'Generating...' : 'Generate Questions'}</span>
              </button>
            </div>
          </div>

          {generationMsg && (
            <div style={{
              padding: '0.6rem 0.85rem',
              backgroundColor: 'var(--success-subtle)',
              border: '1px solid var(--success-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <CheckCircle2 size={15} />
              <span>{generationMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Progress Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Skill Filter:</span>
          <div style={{
            display: 'inline-flex',
            gap: '2px',
            backgroundColor: 'var(--bg-subtle)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
          }}>
            {(['all', 'reading', 'listening'] as const).map(s => {
              const isActive = selectedSkill === s;
              return (
                <button
                  key={s}
                  onClick={() => { setSelectedSkill(s); setCurrentIndex(0); setIsAnswerChecked(false); setSelectedAnswer(''); }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'calc(var(--radius-md) - 2px)',
                    backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.82rem',
                    boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'background-color 140ms var(--ease-out), color 140ms var(--ease-out), box-shadow 140ms var(--ease-out)',
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {currentQ.id.startsWith('ai-') && (
            <span className="badge badge-brand" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Zap size={11} /> AI Generated Drill
            </span>
          )}
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Item {currentIndex + 1} of {filteredQuestions.length}
          </span>
          <span className="badge badge-neutral">
            Target Band {currentQ.targetBand.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Main Two-Column Split Layout for Reading / Single Column for Listening (Stacks on screens <= 900px) */}
      <div
        className={currentQ.passageText ? 'responsive-split-grid' : ''}
        style={{
          display: 'grid',
          gridTemplateColumns: currentQ.passageText ? undefined : '1fr',
          gap: 'var(--space-6)',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Authentic Passage with Evidence Highlighting */}
        {currentQ.passageText && (
          <div className="double-bezel">
            <div className="double-bezel-inner" style={{
              maxHeight: '680px',
              overflowY: 'auto',
              padding: 'clamp(1rem, 4vw, 1.5rem)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                <BookOpen size={18} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)', margin: 0, lineHeight: 1.35 }}>{currentQ.passageTitle}</h3>
              </div>

              <div style={{
                fontSize: 'clamp(0.95rem, 2.2vw, 1.02rem)',
                lineHeight: 1.76,
                color: 'var(--text-primary)',
                fontWeight: 450,
                letterSpacing: '-0.005em',
                whiteSpace: 'pre-line',
                textAlign: 'left',
              }}>
                {isAnswerChecked && currentQ.evidenceSpan ? (
                  (() => {
                    const parts = currentQ.passageText.split(currentQ.evidenceSpan);
                    if (parts.length > 1) {
                      return (
                        <>
                          {parts[0]}
                          <mark style={{
                            backgroundColor: '#fef08a',
                            padding: '2px 4px',
                            borderRadius: '2px',
                            color: '#854d0e',
                            fontWeight: 600,
                          }}>
                            {currentQ.evidenceSpan}
                          </mark>
                          {parts.slice(1).join(currentQ.evidenceSpan)}
                        </>
                      );
                    }
                    return currentQ.passageText;
                  })()
                ) : (
                  currentQ.passageText
                )}
              </div>

              {isAnswerChecked && currentQ.evidenceSpan && (
                <div style={{
                  marginTop: 'auto',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--brand-primary-subtle)',
                  border: '1px solid var(--brand-primary-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <Quote size={15} color="var(--brand-primary)" />
                  <span>Textual evidence span highlighted above in yellow.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Column: Question & Interaction Area */}
        <div className="double-bezel">
          <div className="double-bezel-inner" style={{
            padding: 'clamp(1rem, 3.5vw, 1.5rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)', letterSpacing: '0.05em' }}>
                {currentQ.questionType.replace(/_/g, ' ')}
              </span>
              <span className="badge badge-neutral">{currentQ.difficulty}</span>
            </div>

            <div style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)' }}>
              {currentQ.prompt}
            </div>

            {/* Answer Options */}
            {currentQ.options ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {currentQ.options.map((opt, optIdx) => {
                  const selected = selectedAnswer === opt;
                  const letter = String.fromCharCode(65 + optIdx);
                  let borderColor = 'var(--border-default)';
                  let bg = 'var(--bg-surface)';

                  if (selected) {
                    borderColor = 'var(--brand-primary)';
                    bg = 'var(--brand-primary-subtle)';
                  }

                  if (isAnswerChecked) {
                    const isThisCorrect = Array.isArray(currentQ.correctAnswer)
                      ? currentQ.correctAnswer.includes(opt)
                      : currentQ.correctAnswer === opt;
                    if (isThisCorrect) {
                      borderColor = 'var(--success-border)';
                      bg = 'var(--success-subtle)';
                    } else if (selected && !isThisCorrect) {
                      borderColor = 'var(--error-border)';
                      bg = 'var(--error-subtle)';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      disabled={isAnswerChecked}
                      className="card-hover"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.85rem 1.15rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${borderColor}`,
                        backgroundColor: bg,
                        color: 'var(--text-primary)',
                        fontWeight: selected ? 650 : 500,
                        textAlign: 'left',
                        transition: 'all var(--transition-fast)',
                        boxShadow: selected ? 'var(--shadow-xs)' : 'none',
                        cursor: isAnswerChecked ? 'default' : 'pointer',
                      }}
                    >
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: `1.5px solid ${selected ? 'var(--brand-primary)' : 'var(--border-strong)'}`,
                        backgroundColor: selected ? 'var(--brand-primary)' : 'transparent',
                        color: selected ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0,
                        transition: 'all var(--transition-fast)',
                      }}>
                        {letter}
                      </span>
                      <span style={{ flex: 1, fontSize: '0.92rem' }}>{opt}</span>
                      {isAnswerChecked && (
                        (Array.isArray(currentQ.correctAnswer) ? currentQ.correctAnswer.includes(opt) : currentQ.correctAnswer === opt)
                          ? <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                          : selected ? <XCircle size={16} color="var(--error)" style={{ flexShrink: 0 }} /> : null
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Enter exact words from the text..."
                  value={selectedAnswer}
                  disabled={isAnswerChecked}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="input"
                />
              </div>
            )}

            {/* Confidence Selector before checking */}
            {!isAnswerChecked && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Confidence:</span>
                {(['low', 'medium', 'high'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setConfidence(lvl)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${confidence === lvl ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                      backgroundColor: confidence === lvl ? 'var(--brand-primary-subtle)' : 'transparent',
                      color: confidence === lvl ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}

            {/* Action Button: Check vs Next */}
            <div>
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!selectedAnswer.trim()}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>Next Practice Question</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>

            {/* Checked Results & Explanation Feedback */}
            {isAnswerChecked && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                backgroundColor: isCurrentCorrect ? 'var(--success-subtle)' : 'var(--error-subtle)',
                border: `1px solid ${isCurrentCorrect ? 'var(--success-border)' : 'var(--error-border)'}`,
                borderRadius: 'var(--radius-sm)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isCurrentCorrect ? <CheckCircle2 size={18} color="var(--success)" /> : <XCircle size={18} color="var(--error)" />}
                  <span style={{ fontWeight: 600, color: isCurrentCorrect ? 'var(--success)' : 'var(--error)' }}>
                    {isCurrentCorrect ? 'Correct!' : `Incorrect — Correct Answer: ${Array.isArray(currentQ.correctAnswer) ? currentQ.correctAnswer.join(', ') : currentQ.correctAnswer}`}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {currentQ.explanation}
                </p>

                {/* AI Tutor breakdown button */}
                {!tutorExplanation ? (
                  <button
                    onClick={handleAskTutor}
                    disabled={isLoadingTutor}
                    className="btn btn-secondary btn-sm"
                    style={{ alignSelf: 'flex-start', marginTop: '0.25rem', gap: '0.4rem' }}
                  >
                    <Lightbulb size={14} color="var(--brand-primary)" />
                    <span>{isLoadingTutor ? 'Analyzing Passage...' : 'Get Deep AI Tutor Breakdown'}</span>
                  </button>
                ) : (
                  <div style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                  }}>
                    <strong style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--brand-primary)' }}>
                      AI Examiner Rationale:
                    </strong>
                    {tutorExplanation}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
