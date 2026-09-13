import { useState, useEffect } from 'react';
import {
  ExternalLink,
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Download,
  BookmarkCheck,
  Library,
  FileText,
  BookMarked,
  Maximize2,
  Lightbulb,
} from 'lucide-react';
import { IELTS_RESOURCES, IELTS_BOOKS } from '../../data/ieltsDataset';
import { LearningResource, IELTSBook, SkillType } from '../../lib/types';
import { recordReadResource, unrecordReadResource, loadReadResourceIds } from '../../lib/storage';
import { logStudyEvent } from '../../lib/studyTracker';

export const ResourcesView = () => {
  const [viewMode, setViewMode] = useState<'guides' | 'books'>('guides');
  const [selectedSkill, setSelectedSkill] = useState<SkillType | 'all'>('all');
  const [selectedAuthority, setSelectedAuthority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookReaderMode, setBookReaderMode] = useState<'pdf' | 'embed'>('pdf');
  
  // Active Reader States
  const [readingResource, setReadingResource] = useState<LearningResource | null>(null);
  const [readingBook, setReadingBook] = useState<IELTSBook | null>(null);

  const [studiedIds, setStudiedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('adept_studied_resources');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync with Turso Cloud Edge Database on mount
  useEffect(() => {
    loadReadResourceIds().then(ids => {
      if (ids && ids.length > 0) {
        setStudiedIds(ids);
      }
    });
  }, []);

  const toggleStudied = (id: string, type: 'book' | 'guide', title: string) => {
    if (studiedIds.includes(id)) {
      setStudiedIds(prev => prev.filter(x => x !== id));
      unrecordReadResource(id);
    } else {
      setStudiedIds(prev => [...prev, id]);
      recordReadResource(id, type, title);
      logStudyEvent('reading', `Studied Resource: ${title}`, 15);
    }
  };

  const filteredGuides = IELTS_RESOURCES.filter(r => {
    const matchesSkill = selectedSkill === 'all' || r.skill === selectedSkill || r.skill === 'all';
    const matchesAuthority = selectedAuthority === 'all' || r.authority === selectedAuthority;
    const matchesSearch =
      !searchQuery.trim() ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSkill && matchesAuthority && matchesSearch;
  });

  const filteredBooks = IELTS_BOOKS.filter(b => {
    const matchesSkill = selectedSkill === 'all' || b.skill === selectedSkill || b.skill === 'all';
    const matchesSearch =
      !searchQuery.trim() ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSkill && matchesSearch;
  });

  // 1. In-Platform Interactive Book Reader View
  if (readingBook) {
    const isCompleted = studiedIds.includes(readingBook.id);
    const pdfFileName = readingBook.pdfFileName || `${readingBook.identifier}.pdf`;
    const directPdfUrl = `https://archive.org/download/${readingBook.identifier}/${encodeURIComponent(pdfFileName)}#view=FitH&toolbar=1`;
    const singlePageEmbedUrl = `https://archive.org/embed/${readingBook.identifier}?ui=embed#page/n1/mode/1up`;

    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
        {/* Book Reader Control Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.75rem 1.25rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setReadingBook(null)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.45rem', padding: '0.45rem 0.95rem' }}
            >
              <ArrowLeft size={15} />
              <span>Back to Library</span>
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                  {readingBook.title}
                </div>
                {readingBook.quality === 'vector_hd' ? (
                  <span className="badge badge-brand" style={{ fontSize: '0.7rem', padding: '0.18rem 0.55rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Vector HD
                  </span>
                ) : (
                  <span className="badge badge-zinc" style={{ fontSize: '0.7rem', padding: '0.18rem 0.55rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Authentic Edition
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {readingBook.author} • {readingBook.publisher} {readingBook.year ? `(${readingBook.year})` : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* View Engine Switcher */}
            <div style={{
              display: 'inline-flex',
              backgroundColor: 'var(--bg-subtle)',
              padding: '2px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
            }}>
              <button
                type="button"
                onClick={() => setBookReaderMode('pdf')}
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: bookReaderMode === 'pdf' ? 650 : 500,
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  backgroundColor: bookReaderMode === 'pdf' ? 'var(--bg-surface)' : 'transparent',
                  color: bookReaderMode === 'pdf' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: bookReaderMode === 'pdf' ? 'var(--shadow-xs)' : 'none',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background-color 140ms var(--ease-out), color 140ms var(--ease-out), box-shadow 140ms var(--ease-out)',
                }}
              >
                High-Definition PDF
              </button>
              <button
                type="button"
                onClick={() => setBookReaderMode('embed')}
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: bookReaderMode === 'embed' ? 650 : 500,
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  backgroundColor: bookReaderMode === 'embed' ? 'var(--bg-surface)' : 'transparent',
                  color: bookReaderMode === 'embed' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: bookReaderMode === 'embed' ? 'var(--shadow-xs)' : 'none',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background-color 140ms var(--ease-out), color 140ms var(--ease-out), box-shadow 140ms var(--ease-out)',
                }}
              >
                Archive Flipbook
              </button>
            </div>

            <button
              type="button"
              onClick={() => toggleStudied(readingBook.id, 'book', readingBook.title)}
              className={`btn btn-sm ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
              style={{ gap: '0.4rem', padding: '0.45rem 0.9rem' }}
            >
              <BookmarkCheck size={14} />
              <span>{isCompleted ? 'Studied ✓' : 'Mark as Studied'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.open(directPdfUrl, '_blank', 'noopener,noreferrer')}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem', padding: '0.45rem 0.9rem' }}
              title="Open direct PDF in native fullscreen browser tab"
            >
              <Maximize2 size={14} />
              <span>Popout Window</span>
            </button>

            <a
              href={`https://archive.org/download/${readingBook.identifier}/${encodeURIComponent(pdfFileName)}`}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem', padding: '0.45rem 0.9rem' }}
              title="Download offline PDF directly"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </a>
          </div>
        </div>

        {/* Embedded Interactive Book Viewer with Crisp Clean Shell */}
        <div style={{
          width: '100%',
          height: 'calc(100vh - 175px)',
          minHeight: '700px',
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          border: '1px solid var(--border-default)',
        }}>
          <iframe
            src={bookReaderMode === 'pdf' ? directPdfUrl : singlePageEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 'none', display: 'block', backgroundColor: '#ffffff' }}
            allowFullScreen
            title={readingBook.title}
          />
        </div>
      </div>
    );
  }

  // 2. In-Platform Strategy Guide Reader View
  if (readingResource && readingResource.fullGuide) {
    const guide = readingResource.fullGuide;
    const isCompleted = studiedIds.includes(readingResource.id);

    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
        {/* Reader Top Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => setReadingResource(null)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.45rem', padding: '0.45rem 0.95rem' }}
          >
            <ArrowLeft size={15} />
            <span>Back to Guides</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => toggleStudied(readingResource.id, 'guide', readingResource.title)}
              className={`btn btn-sm ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
              style={{ gap: '0.4rem', padding: '0.45rem 1rem' }}
            >
              <BookmarkCheck size={15} />
              <span>{isCompleted ? 'Studied ✓' : 'Mark as Studied'}</span>
            </button>

            {readingResource.url && (
              <a
                href={readingResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-subtle btn-sm"
                style={{ gap: '0.35rem' }}
                title="View original publisher page"
              >
                <span>External Source</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Reader Article Container */}
        <article className="card" style={{ padding: 'clamp(1.5rem, 4vw, 2.75rem)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge badge-brand" style={{ textTransform: 'capitalize' }}>
                {readingResource.skill === 'all' ? 'All Skills' : readingResource.skill}
              </span>
              <span className="badge badge-neutral">{readingResource.level}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={12} />
                <span>{readingResource.readingTimeMinutes || 8} min read</span>
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', lineHeight: 1.25, fontWeight: 800, margin: 0 }}>
              {readingResource.title}
            </h1>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Published by <strong style={{ color: 'var(--text-primary)' }}>{readingResource.provider}</strong> • {readingResource.type}
            </div>
          </div>

          {/* Executive Summary Callout */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            borderLeft: '4px solid var(--brand-primary)',
            padding: '1.25rem 1.5rem',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            fontSize: '0.96rem',
            lineHeight: 1.65,
            color: 'var(--text-primary)',
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-primary)', marginBottom: '0.35rem' }}>
              Core Strategy Overview
            </div>
            {guide.summary}
          </div>

          {/* Structured Guide Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {guide.sections.map((sec, idx) => (
              <section
                key={idx}
                id={`guide-sec-${idx}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  scrollMarginTop: '72px',
                  paddingTop: idx > 0 ? '1.75rem' : '0.25rem',
                  borderTop: idx > 0 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Section {idx + 1}
                  </span>
                  <h2 style={{
                    fontSize: 'clamp(1.18rem, 3.6vw, 1.45rem)',
                    fontWeight: 750,
                    color: 'var(--text-primary)',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.35,
                  }}>
                    {sec.title}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {sec.content.map((p, pIdx) => (
                    <p key={pIdx} style={{ fontSize: '0.94rem', lineHeight: 1.72, color: 'var(--text-secondary)', margin: 0 }}>
                      {p}
                    </p>
                  ))}
                </div>

                {sec.callout && (
                  <div style={{
                    backgroundColor: 'var(--brand-primary-subtle)',
                    border: '1px solid var(--brand-primary-border)',
                    borderLeft: '4px solid var(--brand-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem 1.25rem',
                    margin: '0.5rem 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                  }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(13, 148, 136, 0.15)',
                      color: 'var(--brand-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}>
                      <Lightbulb size={17} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--brand-primary)',
                      }}>
                        Core Strategy Insight
                      </div>
                      <div style={{
                        fontSize: '0.92rem',
                        lineHeight: 1.62,
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                      }}>
                        {sec.callout}
                      </div>
                    </div>
                  </div>
                )}

                {sec.keyRules && (
                  <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Key Rules to Remember
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {sec.keyRules.map((rule, rIdx) => (
                        <li key={rIdx} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sec.examples && (
                  <div style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
                      Contrast Examples
                    </div>
                    {sec.examples.map((ex, eIdx) => (
                      <div key={eIdx} style={{ fontSize: '0.88rem', fontFamily: 'var(--font-mono)', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                        {ex}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Examiner Model Answer */}
          {guide.modelAnswer && (
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1.5px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}>
              <div>
                <span className="badge badge-brand" style={{ marginBottom: '0.4rem' }}>
                  Official Cambridge Band 9.0 Model Response
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.25rem 0 0 0' }}>
                  Prompt:
                </h3>
                <p style={{ fontStyle: 'italic', fontSize: '0.92rem', color: 'var(--text-primary)', margin: '0.35rem 0 0 0' }}>
                  "{guide.modelAnswer.prompt}"
                </p>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                fontSize: '0.92rem',
                lineHeight: 1.75,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-line',
              }}>
                {guide.modelAnswer.response}
              </div>

              <div style={{
                backgroundColor: 'rgba(13, 148, 136, 0.06)',
                border: '1px solid var(--brand-primary-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                fontSize: '0.86rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
              }}>
                <strong style={{ color: 'var(--brand-primary)', display: 'block', marginBottom: '0.25rem' }}>
                  Examiner Assessment Breakdown:
                </strong>
                {guide.modelAnswer.examinerAnalysis}
              </div>
            </div>
          )}

          {/* Action Checklist */}
          {guide.actionChecklist && (
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Candidate Action Checklist
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {guide.actionChecklist.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={16} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Complete Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setReadingResource(null)}
              className="btn btn-secondary"
            >
              Back to Library
            </button>

            <button
              type="button"
              onClick={() => toggleStudied(readingResource.id, 'guide', readingResource.title)}
              className="btn btn-primary"
              style={{ gap: '0.5rem' }}
            >
              <BookmarkCheck size={16} />
              <span>{isCompleted ? 'Completed (Click to unmark)' : 'Mark Guide as Mastered'}</span>
            </button>
          </div>
        </article>
      </div>
    );
  }

  // 3. Main Library Catalog View
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', letterSpacing: '-0.03em', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Study Library & Official Books
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '680px', margin: 0 }}>
            Read complete official preparation books, authentic Cambridge exam test papers, and structured strategy guides directly in your browser.
          </p>
        </div>

        {/* View Mode Segmented Pill */}
        <div style={{
          display: 'inline-flex',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          gap: '4px',
          maxWidth: '100%',
          overflowX: 'auto',
        }}>
          <button
            type="button"
            onClick={() => setViewMode('guides')}
            style={{
              padding: '0.45rem clamp(0.75rem, 2.5vw, 1.15rem)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 650,
              backgroundColor: viewMode === 'guides' ? '#09090b' : 'transparent',
              color: viewMode === 'guides' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              whiteSpace: 'nowrap',
              transition: 'all 140ms ease',
            }}
          >
            <FileText size={14} />
            <span className="feedback-tab-full">Strategy Guides ({IELTS_RESOURCES.length})</span>
            <span className="feedback-tab-short">Guides ({IELTS_RESOURCES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('books')}
            style={{
              padding: '0.45rem clamp(0.75rem, 2.5vw, 1.15rem)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 650,
              backgroundColor: viewMode === 'books' ? '#09090b' : 'transparent',
              color: viewMode === 'books' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              whiteSpace: 'nowrap',
              transition: 'all 140ms ease',
            }}
          >
            <Library size={14} />
            <span className="feedback-tab-full">Complete Books & PDFs ({IELTS_BOOKS.length})</span>
            <span className="feedback-tab-short">Books & PDFs ({IELTS_BOOKS.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: 'clamp(1rem, 3.5vw, 1.25rem)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={viewMode === 'books' ? "Search books, Cambridge tests, authors, publishers..." : "Search guides, rubrics, question types..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
            />
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Showing {viewMode === 'books' ? filteredBooks.length : filteredGuides.length} of {viewMode === 'books' ? IELTS_BOOKS.length : IELTS_RESOURCES.length} {viewMode === 'books' ? 'Books' : 'Guides'}
          </span>
        </div>

        {/* Skill Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '0.2rem' }}>
            Filter by Skill:
          </span>
          {(['all', 'reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar'] as const).map(s => {
            const isActive = selectedSkill === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSkill(s)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  padding: '0.35rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? '#09090b' : 'var(--bg-subtle)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? '#09090b' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 140ms ease',
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: STRATEGY GUIDES GRID */}
      {viewMode === 'guides' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
          {filteredGuides.map((res) => {
            const isStudied = studiedIds.includes(res.id);

            return (
              <div
                key={res.id}
                className="card card-hover"
                onClick={() => setReadingResource(res)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 'clamp(1rem, 3.5vw, 1.5rem)',
                  gap: '1.25rem',
                  cursor: 'pointer',
                  border: isStudied ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  position: 'relative',
                  transition: 'all 180ms ease',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {res.provider}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {res.type}
                      </span>
                    </div>

                    {isStudied && (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px', gap: '3px' }}>
                        <CheckCircle2 size={11} /> Studied
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.05rem', lineHeight: 1.35, color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
                    {res.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
                    {res.description}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                      {res.level}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} /> {res.readingTimeMinutes || 8}m read
                    </span>
                  </div>
                </div>

                <div style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReadingResource(res);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.45rem', fontSize: '0.82rem', padding: '0.45rem 1rem' }}
                  >
                    <BookOpen size={14} />
                    <span>Read Guide</span>
                  </button>

                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                      }}
                      title="External source reference"
                    >
                      <span>Source</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: E-BOOKS & PDF LIBRARY GRID */}
      {viewMode === 'books' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
          {filteredBooks.map((book) => {
            const isStudied = studiedIds.includes(book.id);
            const pdfFileName = book.pdfFileName || `${book.identifier}.pdf`;
            const pdfDownloadUrl = `https://archive.org/download/${book.identifier}/${encodeURIComponent(pdfFileName)}`;

            return (
              <div
                key={book.id}
                className="card card-hover"
                onClick={() => setReadingBook(book)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 'clamp(1rem, 3.5vw, 1.5rem)',
                  gap: '1.25rem',
                  cursor: 'pointer',
                  border: isStudied ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  position: 'relative',
                  transition: 'all 180ms ease',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {book.publisher}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {book.category} {book.year ? `• ${book.year}` : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      {book.quality === 'vector_hd' && (
                        <span className="badge badge-brand" style={{ fontSize: '0.66rem', padding: '1px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          Vector HD
                        </span>
                      )}
                      <span className="badge badge-zinc" style={{ fontSize: '0.66rem', padding: '1px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {book.downloads}
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', lineHeight: 1.35, color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
                    {book.title}
                  </h3>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    By {book.author}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
                    {book.description}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                      {book.level}
                    </span>
                    <span className="badge badge-zinc" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                      {book.skill === 'all' ? 'All Skills' : book.skill}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReadingBook(book);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.45rem', fontSize: '0.82rem', padding: '0.45rem 1rem' }}
                  >
                    <BookOpen size={14} />
                    <span>Read Online</span>
                  </button>

                  <a
                    href={pdfDownloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem', fontSize: '0.76rem', padding: '0.45rem 0.75rem' }}
                    title="Direct PDF download"
                  >
                    <Download size={13} />
                    <span>PDF</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
