import React, { useState, useEffect } from 'react';
import { AppShell, ActiveTab } from './components/AppShell';
import { DashboardView } from './features/dashboard/DashboardView';
import { DiagnosticView } from './features/diagnostic/DiagnosticView';
import { PracticeView } from './features/practice/PracticeView';
import { LearnView } from './features/learn/LearnView';
import { WritingCoachView } from './features/writing/WritingCoachView';
import { SpeakingCoachView } from './features/speaking/SpeakingCoachView';
import { MockExamView } from './features/mock/MockExamView';
import { VocabularyView } from './features/vocabulary/VocabularyView';
import { ProgressView } from './features/progress/ProgressView';
import { ResourcesView } from './features/resources/ResourcesView';
import { SettingsView } from './features/settings/SettingsView';
import {
  loadLearnerProfile,
  loadQuestionAttempts,
  loadVocabCards,
  saveVocabCards,
  setActiveProfileId,
} from './lib/storage';
import { recalculateAndSaveStreak } from './lib/studyTracker';
import { IELTS_VOCABULARY } from './data/ieltsDataset';
import { LearnerProfile, QuestionAttempt, VocabularyCard } from './lib/types';
import { HomeView } from './features/home/HomeView';
import { AuthModal } from './components/AuthModal';
import { Lock, UserPlus, LogIn } from 'lucide-react';

interface CandidateAuthGateProps {
  title: string;
  description: string;
  onSignUp: () => void;
  onSignIn: () => void;
}

const CandidateAuthGate = ({ title, description, onSignUp, onSignIn }: CandidateAuthGateProps) => (
  <div className="fade-in double-bezel" style={{ maxWidth: '600px', margin: '3.5rem auto' }}>
    <div className="double-bezel-inner" style={{
      padding: '2.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '1.25rem',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--brand-primary-subtle)',
        color: 'var(--brand-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Lock size={22} />
      </div>
      <div>
        <span className="badge badge-brand">Candidate Access Required</span>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 750, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '460px' }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
        <button onClick={onSignUp} className="btn btn-primary btn-lg">
          <UserPlus size={16} />
          <span>Create Free Account</span>
        </button>
        <button onClick={onSignIn} className="btn btn-secondary btn-lg">
          <LogIn size={16} />
          <span>Sign In</span>
        </button>
      </div>
    </div>
  </div>
);

export const App: React.FC = () => {
  const [profile, setProfile] = useState<LearnerProfile | null>(() => loadLearnerProfile());
  const [attempts, setAttempts] = useState<QuestionAttempt[]>(() => (profile ? loadQuestionAttempts(profile.id) : []));
  const [vocabCards, setVocabCards] = useState<VocabularyCard[]>(() => {
    const existing = loadVocabCards(profile?.id);
    if (existing.length === 0) {
      saveVocabCards(IELTS_VOCABULARY, profile?.id);
      return IELTS_VOCABULARY;
    }
    return existing;
  });

  const [currentTab, setCurrentTab] = useState<ActiveTab>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');

  // Recalculate streak on app mount from real activity logs
  useEffect(() => {
    if (profile) {
      const metrics = recalculateAndSaveStreak(profile.id);
      if (metrics.currentStreak !== profile.streak) {
        setProfile(prev => prev ? { ...prev, streak: metrics.currentStreak } : null);
      }
    }
  }, [profile?.id]);

  const handleAttemptRecorded = (att: QuestionAttempt) => {
    setAttempts(prev => [...prev, att]);
  };

  const handleProfileChanged = (newProfile: LearnerProfile) => {
    const metrics = recalculateAndSaveStreak(newProfile.id);
    const updated = { ...newProfile, streak: metrics.currentStreak };
    setProfile(updated);
    setActiveProfileId(newProfile.id);
    setAttempts(loadQuestionAttempts(newProfile.id));
    const cards = loadVocabCards(newProfile.id);
    if (cards.length === 0) {
      saveVocabCards(IELTS_VOCABULARY, newProfile.id);
      setVocabCards(IELTS_VOCABULARY);
    } else {
      setVocabCards(cards);
    }
    setCurrentTab('dashboard');
  };

  const handleSignOut = () => {
    setActiveProfileId('');
    setProfile(null);
    setAttempts([]);
    setCurrentTab('home');
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <AppShell
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        onProfileChanged={handleProfileChanged}
        onSignOut={handleSignOut}
        onOpenAuthModal={handleOpenAuth}
      >
        {currentTab === 'home' && (
          <HomeView
            onStartSignUp={() => handleOpenAuth('signup')}
            onOpenSignIn={() => handleOpenAuth('signin')}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'dashboard' && (
          profile ? (
            <DashboardView
              profile={profile}
              attempts={attempts}
              vocabCards={vocabCards}
              onNavigate={setCurrentTab}
            />
          ) : (
            <CandidateAuthGate
              title="Candidate Dashboard"
              description="Sign in or create your candidate profile to view personalized target band milestones, study streaks, and daily practice queues."
              onSignUp={() => handleOpenAuth('signup')}
              onSignIn={() => handleOpenAuth('signin')}
            />
          )
        )}

        {currentTab === 'diagnostic' && (
          profile ? (
            <DiagnosticView
              profile={profile}
              onProfileUpdated={setProfile}
              onFinish={() => setCurrentTab('dashboard')}
            />
          ) : (
            <CandidateAuthGate
              title="Adaptive Diagnostic"
              description="Complete a short baseline test calibrated against official IELTS criteria to benchmark your current band score."
              onSignUp={() => handleOpenAuth('signup')}
              onSignIn={() => handleOpenAuth('signin')}
            />
          )
        )}

        {currentTab === 'practice' && (
          profile ? (
            <PracticeView
              profile={profile}
              onProfileUpdated={setProfile}
              onAttemptRecorded={handleAttemptRecorded}
            />
          ) : (
            <CandidateAuthGate
              title="Adaptive Question Bank"
              description="Sign in to track question attempts and target your high-yield IELTS weaknesses."
              onSignUp={() => handleOpenAuth('signup')}
              onSignIn={() => handleOpenAuth('signin')}
            />
          )
        )}

        {currentTab === 'learn' && (
          <LearnView />
        )}

        {currentTab === 'writing' && (
          <WritingCoachView />
        )}

        {currentTab === 'speaking' && (
          <SpeakingCoachView />
        )}

        {currentTab === 'mock' && (
          <MockExamView
            onExitMock={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'vocabulary' && (
          <VocabularyView
            cards={vocabCards}
            onCardsUpdated={setVocabCards}
          />
        )}

        {currentTab === 'progress' && (
          profile ? (
            <ProgressView
              profile={profile}
              attempts={attempts}
            />
          ) : (
            <CandidateAuthGate
              title="Learner Progress & Mastery"
              description="Real-time statistical evaluation calculated from your practice attempts and timed mock exams."
              onSignUp={() => handleOpenAuth('signup')}
              onSignIn={() => handleOpenAuth('signin')}
            />
          )
        )}

        {currentTab === 'resources' && (
          <ResourcesView />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            profile={profile || {
              id: '',
              displayName: 'Guest Visitor',
              avatar: 'GV',
              targetBand: 7.5,
              currentEstimatedBand: 5.5,
              testType: 'academic',
              examDate: '',
              availableDailyMinutes: 45,
              skillBands: { reading: 5.5, listening: 5.5, writing: 5.0, speaking: 5.0 },
              subskillMastery: {},
              streak: 0,
              lastActiveDate: '',
              totalStudyMinutes: 0,
              onboardingCompleted: false,
            }}
            onProfileUpdated={newP => {
              if (profile) setProfile(newP);
            }}
          />
        )}
      </AppShell>

      <AuthModal
        activeProfile={profile}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onProfileChanged={handleProfileChanged}
        initialMode={authModalMode}
      />
    </>
  );
};

export default App;
