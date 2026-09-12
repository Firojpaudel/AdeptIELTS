import {
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  PenTool,
  Mic,
  Brain,
  CheckCircle2,
  FileCheck2,
  Globe2,
  Award,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { ActiveTab } from '../../components/AppShell';
import { LearnerProfile } from '../../lib/types';

interface HomeViewProps {
  profile?: LearnerProfile | null;
  onStartSignUp: () => void;
  onOpenSignIn: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const HomeView = ({
  profile,
  onStartSignUp,
  onOpenSignIn,
  onNavigateTab,
}: HomeViewProps) => {
  return (
    <div className="fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4.5rem',
      maxWidth: '1200px',
      margin: '0 auto',
      paddingBottom: '4rem',
    }}>
      
      {/* Hero Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        paddingTop: 'clamp(4.5rem, 8vw, 7rem)',
        paddingBottom: 'clamp(3rem, 5vw, 4.5rem)',
        gap: '2rem',
      }}>
        {/* Academic Provenance Marker */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--brand-primary)',
          backgroundColor: 'var(--brand-primary-subtle)',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)' }} />
          <span>Cambridge & British Council Standard</span>
        </div>

        {/* Massive Headline with Optical Spacing */}
        <h1 style={{
          fontSize: 'clamp(2.6rem, 5.8vw, 4.4rem)',
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: '-0.04em',
          maxWidth: '860px',
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          Master the IELTS with real exam rigor and adaptive AI.
        </h1>

        {/* Spacious, Light Subtitle */}
        <p style={{
          fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '580px',
          lineHeight: 1.75,
          letterSpacing: '-0.01em',
          margin: 0,
          fontWeight: 400,
        }}>
          Authentic test texts, instant criterion diagnostics, and genuine band rubrics.
        </p>

        {/* CTA Button Group with Emil Kowalski Button-in-Button Physics */}
        {profile ? (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
            justifyContent: 'center',
            marginTop: '0.75rem',
          }}>
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="btn btn-primary btn-lg"
              style={{
                padding: '0.85rem 1.25rem 0.85rem 2rem',
                borderRadius: 'var(--radius-full)',
                gap: '0.85rem',
                fontSize: '1rem',
                fontWeight: 650,
              }}
            >
              <span>Enter Candidate Dashboard</span>
              <span className="btn-arrow-badge">
                <ArrowRight size={16} className="btn-arrow-icon" />
              </span>
            </button>

            <button
              onClick={() => onNavigateTab('progress')}
              className="btn btn-secondary btn-lg"
              style={{
                padding: '0.85rem 2rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              View Deep Diagnostics & Mastery
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
            justifyContent: 'center',
            marginTop: '0.75rem',
          }}>
            <button
              onClick={onStartSignUp}
              className="btn btn-primary btn-lg"
              style={{
                padding: '0.85rem 1.15rem 0.85rem 2rem',
                borderRadius: 'var(--radius-full)',
                gap: '0.85rem',
                fontSize: '1rem',
                fontWeight: 650,
              }}
            >
              <span>Create Candidate Profile</span>
              <span className="btn-arrow-badge">
                <ArrowRight size={16} className="btn-arrow-icon" />
              </span>
            </button>

            <button
              onClick={onOpenSignIn}
              className="btn btn-secondary btn-lg"
              style={{
                padding: '0.85rem 2rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              Candidate Sign In
            </button>
          </div>
        )}

        {/* Trust Badges with Generous Whitespace */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3rem',
          marginTop: '2.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--brand-primary)" />
            <span>Official Band 1.0–9.0 Descriptors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--brand-primary)" />
            <span>Academic & General Training</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--brand-primary)" />
            <span>Free & Open Source</span>
          </div>
        </div>
      </div>

      {/* Feature Showcase Grid (Asymmetric Bento) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <span className="badge badge-zinc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Platform Modules
          </span>
          <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem', letterSpacing: '-0.025em' }}>
            A complete ecosystem for test day mastery
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap: '1.25rem',
        }}>
          
          {/* Card 1: Adaptive Practice */}
          <div className="card card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="feature-badge feature-badge-teal">
              <BookOpen size={20} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                Adaptive Reading & Listening
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Full authentic texts covering urban microclimates, marine acoustics, and environmental science. Dynamic error categorization for True/False/Not Given, Headings, and multiple choice.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('practice')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 'auto', alignSelf: 'flex-start', paddingLeft: 0, color: 'var(--brand-primary)', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}
            >
              Explore reading drills <ChevronRight size={14} className="feature-link-arrow" />
            </button>
          </div>

          {/* Card 2: Writing Coach */}
          <div className="card card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="feature-badge feature-badge-amber">
              <PenTool size={20} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                4-Criteria Writing Coach
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Timed essay simulator for Academic Task 1 (Data/Processes), General Task 1 (Formal letters), and Task 2. Evaluates Task Response, Cohesion, Vocabulary, and Grammar with sentence-level revisions.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('writing')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 'auto', alignSelf: 'flex-start', paddingLeft: 0, color: 'var(--warning)', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}
            >
              Open essay coach <ChevronRight size={14} className="feature-link-arrow" />
            </button>
          </div>

          {/* Card 3: Speaking Examiner */}
          <div className="card card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="feature-badge feature-badge-blue">
              <Mic size={20} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                Speaking Mock Simulator
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Interactive Part 1 introductory questions, Part 2 Long Turn with 60-second cue card preparation timer, and Part 3 abstract reasoning.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('speaking')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 'auto', alignSelf: 'flex-start', paddingLeft: 0, color: '#3b82f6', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}
            >
              Start speaking test <ChevronRight size={14} className="feature-link-arrow" />
            </button>
          </div>

          {/* Card 4: Spaced Vocabulary Deck */}
          <div className="card card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="feature-badge feature-badge-purple">
              <Brain size={20} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                Academic Word List (AWL) Flashcards
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Spaced repetition memory engine (SM-2 algorithm) ensures you retain band 7.5+ collocations, formal synonyms, and context-dependent usage.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('vocabulary')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 'auto', alignSelf: 'flex-start', paddingLeft: 0, color: '#8b5cf6', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}
            >
              Browse vocabulary deck <ChevronRight size={14} className="feature-link-arrow" />
            </button>
          </div>

          {/* Card 5: Strategy Lessons */}
          <div className="card card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="feature-badge feature-badge-emerald">
              <GraduationCap size={20} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                Methodology & Strategy Lessons
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Proven frameworks: True/False vs Not Given verification protocols, Task 2 paragraph structure, and fluency hesitation counters.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('learn')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 'auto', alignSelf: 'flex-start', paddingLeft: 0, color: 'var(--success)', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}
            >
              Read lessons <ChevronRight size={14} className="feature-link-arrow" />
            </button>
          </div>

          {/* Card 6: Master Resources Directory */}
          <div className="card card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="feature-badge feature-badge-slate">
              <Globe2 size={20} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                26+ Verified Master Resources
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Direct curated links to official IELTS.org materials, British Council preparation webinars, IDP familiarisation tests, Cambridge English activities, and BBC Learning English.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('resources')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 'auto', alignSelf: 'flex-start', paddingLeft: 0, color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}
            >
              View directory <ChevronRight size={14} className="feature-link-arrow" />
            </button>
          </div>

        </div>
      </div>

      {/* Call to Action Footer Box */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1rem',
        }}>
          {profile ? (
            <>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 750, letterSpacing: '-0.025em' }}>
                Ready to continue your Band {profile.targetBand.toFixed(1)} preparation?
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '560px' }}>
                All your reading & listening attempts, 4-criteria AI writing critique, and spaced vocabulary reviews are stored in your active session.
              </p>
              <button
                onClick={() => onNavigateTab('dashboard')}
                className="btn btn-primary btn-lg"
                style={{ marginTop: '0.5rem', borderRadius: 'var(--radius-full)', padding: '0.75rem 2rem' }}
              >
                Resume Candidate Dashboard
              </button>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 750, letterSpacing: '-0.025em' }}>
                Ready to determine your true IELTS baseline?
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '560px' }}>
                Create your candidate profile today. All practice attempts, essay feedback, and vocabulary drills are tracked with zero data loss.
              </p>
              <button
                onClick={onStartSignUp}
                className="btn btn-primary btn-lg"
                style={{ marginTop: '0.5rem', borderRadius: 'var(--radius-full)', padding: '0.75rem 2rem' }}
              >
                Get Started Free
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
