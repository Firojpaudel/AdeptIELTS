import { useState, useEffect } from 'react';
import { RotateCw, CheckCircle2, Plus, X, Sparkles, BookOpen, Volume2, ChevronLeft, ChevronRight, Clock, HelpCircle } from 'lucide-react';
import { VocabularyCard } from '../../lib/types';
import { getNextReviewDate } from '../../lib/adaptiveEngine';
import { saveVocabCards } from '../../lib/storage';
import { logStudyEvent } from '../../lib/studyTracker';

interface VocabularyViewProps {
  cards: VocabularyCard[];
  onCardsUpdated: (cards: VocabularyCard[]) => void;
}

export const VocabularyView = ({
  cards,
  onCardsUpdated,
}: VocabularyViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newDef, setNewDef] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newTopic, setNewTopic] = useState('Academic General');
  const [newTargetBand, setNewTargetBand] = useState<number>(7.5);
  const [newPartOfSpeech, setNewPartOfSpeech] = useState('academic collocation');

  const today = new Date().toISOString().split('T')[0];
  const dueCards = cards.filter(c => c.nextReviewDate <= today);
  const activeDeck = dueCards.length > 0 ? dueCards : cards;
  const currentCard = activeDeck[currentIndex % activeDeck.length];

  const speakWord = (word: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-GB';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRate = (quality: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    const { interval, nextDate } = getNextReviewDate(currentCard.intervalDays, quality);

    const updated = cards.map(c => {
      if (c.id === currentCard.id) {
        return {
          ...c,
          repetitions: c.repetitions + 1,
          intervalDays: interval,
          nextReviewDate: nextDate,
          lastReviewed: today,
        };
      }
      return c;
    });

    saveVocabCards(updated);
    logStudyEvent('vocab', `Vocabulary Review: "${currentCard.word}" (${quality})`, 1);
    onCardsUpdated(updated);
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddModal) {
        if (e.key === 'Escape') setShowAddModal(false);
        return;
      }

      // Ignore when focused in text inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === '1' && isFlipped) {
        e.preventDefault();
        handleRate('again');
      } else if (e.key === '2' && isFlipped) {
        e.preventDefault();
        handleRate('hard');
      } else if (e.key === '3' && isFlipped) {
        e.preventDefault();
        handleRate('good');
      } else if (e.key === '4' && isFlipped) {
        e.preventDefault();
        handleRate('easy');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIndex(prev => (prev + 1) % activeDeck.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIndex(prev => (prev - 1 + activeDeck.length) % activeDeck.length);
      } else if (e.key.toLowerCase() === 'p' && currentCard) {
        e.preventDefault();
        speakWord(currentCard.word);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, isFlipped, activeDeck.length, currentCard]);

  const handleAddCustomWord = () => {
    if (!newWord.trim() || !newDef.trim()) return;

    const newCard: VocabularyCard = {
      id: `voc-custom-${Date.now()}`,
      word: newWord.trim(),
      phonetic: '',
      partOfSpeech: newPartOfSpeech.trim() || 'academic collocation',
      definition: newDef.trim(),
      collocations: ['frequently used in Task 2 essays'],
      ieltsContext: newContext.trim() || 'Crucial concept for high-band academic argumentation.',
      topic: newTopic || 'Academic General',
      targetBand: newTargetBand || 7.5,
      repetitions: 0,
      intervalDays: 1,
      nextReviewDate: today,
    };

    const updated = [newCard, ...cards];
    saveVocabCards(updated);
    onCardsUpdated(updated);
    setShowAddModal(false);
    setNewWord('');
    setNewDef('');
    setNewContext('');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '820px', margin: '0 auto' }}>
      {/* Header & Status Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1.25rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', letterSpacing: '-0.025em' }}>Spaced Repetition Vocabulary</h1>
            <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)', maxWidth: '580px' }}>
              Master high-frequency academic vocabulary and collocations for IELTS Band 7.0+.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {dueCards.length > 0 ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fde68a',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}>
                <Clock size={13} color="#b45309" />
                <span>{dueCards.length} Scheduled for Review Today</span>
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--success-subtle)',
                color: 'var(--success)',
                border: '1px solid var(--success-border)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}>
                <CheckCircle2 size={13} color="var(--success)" />
                <span>All Reviews Caught Up</span>
              </div>
            )}

            <button onClick={() => setShowAddModal(true)} className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>Add Word</span>
            </button>
          </div>
        </div>

        {/* Deck Progress Bar & Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-subtle)',
          padding: '0.55rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '360px' }}>
            <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              Card {currentIndex + 1} of {activeDeck.length}
            </span>
            <div style={{ flex: 1, height: '5px', backgroundColor: 'var(--border-default)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{
                width: `${((currentIndex + 1) / activeDeck.length) * 100}%`,
                height: '100%',
                backgroundColor: 'var(--brand-primary)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 240ms cubic-bezier(0.16, 1, 0.3, 1)',
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(prev => (prev - 1 + activeDeck.length) % activeDeck.length);
              }}
              className="btn btn-ghost btn-sm"
              style={{ padding: '4px 8px' }}
              title="Previous Card (←)"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(prev => (prev + 1) % activeDeck.length);
              }}
              className="btn btn-ghost btn-sm"
              style={{ padding: '4px 8px' }}
              title="Next Card (→)"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Physical Flashcard Display */}
      {currentCard ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="flashcard-perspective">
            <div
              className={`flashcard-flipper ${isFlipped ? 'flipped' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ cursor: 'pointer' }}
            >
              {/* FRONT OF CARD */}
              <div className="flashcard-face flashcard-front double-bezel">
                <div
                  className="double-bezel-inner"
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: 'clamp(1.25rem, 5vw, 2.25rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>{currentCard.topic}</span>
                    <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Target Band {currentCard.targetBand.toFixed(1)}
                    </span>
                  </div>

                  {/* Card Center: Target Word */}
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: 'clamp(1.75rem, 6.5vw, 3rem)', letterSpacing: '-0.03em', color: 'var(--text-primary)', fontWeight: 750, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {currentCard.word}
                      </h2>
                      <button
                        onClick={(e) => speakWord(currentCard.word, e)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '6px', borderRadius: 'var(--radius-full)', color: 'var(--brand-primary)' }}
                        title="Listen to British English Pronunciation (P)"
                      >
                        <Volume2 size={22} />
                      </button>
                    </div>
                    {currentCard.phonetic && (
                      <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.4rem' }}>
                        {currentCard.phonetic} <span style={{ color: 'var(--border-default)', margin: '0 0.35rem' }}>•</span> {currentCard.partOfSpeech}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Flip Prompt */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--brand-primary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.85rem',
                  }}>
                    <RotateCw size={14} />
                    <span>Click Card or Press Space to Reveal Definition & Usage</span>
                  </div>
                </div>
              </div>

              {/* BACK OF CARD */}
              <div className="flashcard-face flashcard-back double-bezel">
                <div
                  className="double-bezel-inner"
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: 'clamp(1rem, 4vw, 2rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Back Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 750, fontSize: 'clamp(1.05rem, 4vw, 1.25rem)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        {currentCard.word}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        ({currentCard.partOfSpeech})
                      </span>
                      <button
                        onClick={(e) => speakWord(currentCard.word, e)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px', color: 'var(--brand-primary)' }}
                        title="Pronounce (P)"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <RotateCw size={12} /> Click to flip
                    </span>
                  </div>

                  {/* Back Content */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    textAlign: 'left',
                  }}>
                    {/* Definition */}
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Definition
                      </div>
                      <div style={{ fontSize: '1.02rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem', lineHeight: '1.4' }}>
                        {currentCard.definition}
                      </div>
                    </div>

                    {/* Collocations */}
                    {currentCard.collocations.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                          Academic Collocations
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                          {currentCard.collocations.map((col, idx) => (
                            <span
                              key={idx}
                              className="badge badge-brand"
                              style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Authentic Academic Example */}
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                        Contextual Example
                      </div>
                      <div style={{
                        padding: '0.65rem 0.95rem',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '3px solid var(--brand-primary)',
                        fontStyle: 'italic',
                        color: 'var(--text-primary)',
                        fontSize: '0.86rem',
                        lineHeight: '1.5',
                      }}>
                        "{currentCard.ieltsContext}"
                      </div>
                    </div>
                  </div>

                  {/* Back Footer Hint */}
                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                    Rate your recall below to schedule your next review
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guided Recall Assessment Bar - Constant Height (No layout shift) */}
          <div style={{
            minHeight: '92px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}>
            {isFlipped ? (
              <div className="fade-in" style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 650, color: 'var(--text-primary)' }}>
                    How easily did you recall this word?
                  </span>
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                    Keys: 1, 2, 3, 4
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(68px, 1fr))',
                  gap: '0.5rem',
                }}>
                  {/* Again */}
                  <button
                    onClick={() => handleRate('again')}
                    className="btn"
                    style={{
                      padding: '0.5rem 0.4rem',
                      backgroundColor: '#fff',
                      border: '1px solid #fecdd3',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 160ms ease-out',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff1f2'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <span className="font-mono" style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: '#ffe4e6', color: '#e11d48', fontWeight: 700 }}>1</span>
                    <span style={{ fontWeight: 700, color: '#e11d48', fontSize: '0.82rem' }}>Again</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(1d)</span>
                  </button>

                  {/* Hard */}
                  <button
                    onClick={() => handleRate('hard')}
                    className="btn"
                    style={{
                      padding: '0.5rem 0.4rem',
                      backgroundColor: '#fff',
                      border: '1px solid #fde68a',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 160ms ease-out',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fffbeb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <span className="font-mono" style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 700 }}>2</span>
                    <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.82rem' }}>Hard</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(2d)</span>
                  </button>

                  {/* Good */}
                  <button
                    onClick={() => handleRate('good')}
                    className="btn"
                    style={{
                      padding: '0.5rem 0.4rem',
                      backgroundColor: '#fff',
                      border: '1px solid #a7f3d0',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 160ms ease-out',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <span className="font-mono" style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: '#d1fae5', color: '#047857', fontWeight: 700 }}>3</span>
                    <span style={{ fontWeight: 700, color: '#047857', fontSize: '0.82rem' }}>Good</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(5d)</span>
                  </button>

                  {/* Easy */}
                  <button
                    onClick={() => handleRate('easy')}
                    className="btn"
                    style={{
                      padding: '0.5rem 0.4rem',
                      backgroundColor: 'var(--accent-zinc)',
                      border: '1px solid var(--accent-zinc)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      color: '#ffffff',
                      transition: 'all 160ms ease-out',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-zinc-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent-zinc)'}
                  >
                    <span className="font-mono" style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', fontWeight: 700 }}>4</span>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Easy</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>(14d)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  <HelpCircle size={16} color="var(--brand-primary)" />
                  <span>Attempt mental recall of definition and academic collocations before revealing.</span>
                </div>
                <button
                  onClick={() => setIsFlipped(true)}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.84rem' }}
                >
                  <RotateCw size={13} />
                  <span>Reveal Answer (Space)</span>
                </button>
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Legend */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.25rem',
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            paddingTop: '0.25rem',
          }}>
            <span><kbd style={{ padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)' }}>Space</kbd> Flip Card</span>
            <span><kbd style={{ padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)' }}>1-4</kbd> Rate Recall</span>
            <span><kbd style={{ padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)' }}>← / →</kbd> Prev / Next</span>
            <span><kbd style={{ padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)' }}>P</kbd> Pronounce</span>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <CheckCircle2 size={40} color="var(--success)" style={{ margin: '0 auto var(--space-4)' }} />
          <h3>All Vocabulary Cards Reviewed!</h3>
          <p style={{ marginTop: '0.25rem' }}>Your memory retention intervals have been updated in local storage and synced to Turso DB.</p>
        </div>
      )}

      {/* Add Custom Word Modal */}
      {showAddModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
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
            padding: '1.25rem',
          }}
        >
          <div
            className="double-bezel modal-enter"
            style={{
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              className="double-bezel-inner"
              style={{
                padding: '1.75rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* Close Icon Button */}
              <button
                onClick={() => setShowAddModal(false)}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                  <span className="badge badge-brand" style={{ fontSize: '0.72rem' }}>
                    <Sparkles size={11} /> Lexical Expansion
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 750, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Add High-Yield Vocabulary
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Add an academic word or collocation to your personalized Spaced Repetition queue.
                </p>
              </div>

              {/* Form Body */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCustomWord();
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {/* Word & Part of Speech */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                      Word / Collocation <span style={{ color: 'var(--brand-primary)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ubiquitous"
                      value={newWord}
                      onChange={e => setNewWord(e.target.value)}
                      className="input"
                      autoFocus
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                      Part of Speech
                    </label>
                    <select
                      value={newPartOfSpeech}
                      onChange={e => setNewPartOfSpeech(e.target.value)}
                      className="select"
                    >
                      <option value="adjective">Adjective</option>
                      <option value="noun">Noun</option>
                      <option value="verb">Verb</option>
                      <option value="academic collocation">Collocation</option>
                      <option value="idiomatic phrase">Idiom</option>
                    </select>
                  </div>
                </div>

                {/* Definition */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                    Definition & Core Meaning <span style={{ color: 'var(--brand-primary)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Present, appearing, or found everywhere simultaneously."
                    value={newDef}
                    onChange={e => setNewDef(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                {/* Topic & Target Band */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                      Topic Domain
                    </label>
                    <select
                      value={newTopic}
                      onChange={e => setNewTopic(e.target.value)}
                      className="select"
                    >
                      <option value="Academic General">Academic General</option>
                      <option value="Environment & Climate">Environment & Climate</option>
                      <option value="Technology & AI">Technology & AI</option>
                      <option value="Society & Urbanization">Society & Urbanization</option>
                      <option value="Education & Pedagogy">Education & Pedagogy</option>
                      <option value="Economics & Globalization">Economics & Globalization</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                      Target Band
                    </label>
                    <select
                      value={newTargetBand}
                      onChange={e => setNewTargetBand(parseFloat(e.target.value))}
                      className="select font-mono"
                    >
                      <option value="7.0">Band 7.0</option>
                      <option value="7.5">Band 7.5</option>
                      <option value="8.0">Band 8.0</option>
                      <option value="8.5">Band 8.5+</option>
                    </select>
                  </div>
                </div>

                {/* IELTS Context Sentence */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      IELTS Context Sentence
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Writing Task 2 / Speaking</span>
                  </div>
                  <textarea
                    placeholder="e.g. Smart portable technology has become ubiquitous across contemporary urban environments."
                    value={newContext}
                    onChange={e => setNewContext(e.target.value)}
                    className="textarea"
                    rows={3}
                    style={{ resize: 'vertical', minHeight: '76px', fontSize: '0.88rem', lineHeight: '1.5' }}
                  />
                </div>

                {/* Footer Controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: '0.25rem',
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Press Esc to dismiss
                  </span>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newWord.trim() || !newDef.trim()}
                      className="btn btn-primary"
                    >
                      <Plus size={15} />
                      <span>Save to Queue</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
