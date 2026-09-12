import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Home,
  Library,
  GraduationCap,
  SpellCheck,
  Target,
  PenTool,
  Mic,
  ClipboardCheck,
  TrendingUp,
  Settings,
  Flame,
  Menu,
  X,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  UserPlus,
  LogIn,
  UserCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AdeptLogo } from './AdeptLogo';
import { LearnerProfile } from '../lib/types';
import { AuthModal } from './AuthModal';
import { CandidateProfileModal } from './CandidateProfileModal';

export type ActiveTab =
  | 'home'
  | 'dashboard'
  | 'diagnostic'
  | 'practice'
  | 'learn'
  | 'writing'
  | 'speaking'
  | 'mock'
  | 'vocabulary'
  | 'progress'
  | 'resources'
  | 'settings';

interface AppShellProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  profile: LearnerProfile | null;
  onProfileChanged: (profile: LearnerProfile) => void;
  onSignOut?: () => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
  children: ReactNode;
}

export const AppShell = ({
  currentTab,
  onSelectTab,
  profile,
  onProfileChanged,
  onSignOut,
  onOpenAuthModal,
  children,
}: AppShellProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const openAuth = (mode: 'signin' | 'signup' = 'signup') => {
    if (onOpenAuthModal) {
      onOpenAuthModal(mode);
    } else {
      setAuthModalMode(mode);
      setUserModalOpen(true);
    }
  };

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    requiresAuth?: boolean;
    sectionLabel?: string;
  }

  // Pedagogical Flow: Overview -> Learn & Study -> Module Training -> Assessment -> Preferences
  const navItems: NavItem[] = [
    // 1. Overview
    { id: 'home', label: 'Platform Home', icon: <Home size={18} />, sectionLabel: 'Overview' },
    { id: 'dashboard', label: 'Candidate Dashboard', icon: <LayoutDashboard size={18} />, requiresAuth: true },

    // 2. Foundations & Active Acquisition
    { id: 'vocabulary', label: 'Vocabulary & Lexicon', icon: <SpellCheck size={18} />, sectionLabel: 'Foundations' },
    { id: 'learn', label: 'Examiner Video Lessons', icon: <Library size={18} /> },
    { id: 'resources', label: 'Cambridge Official Bank', icon: <GraduationCap size={18} /> },

    // 3. Module Practice & AI Coaching
    { id: 'diagnostic', label: 'Adaptive Diagnostic Test', icon: <Target size={18} />, sectionLabel: 'Modules & Practice' },
    { id: 'practice', label: 'Question Bank Practice', icon: <ClipboardCheck size={18} /> },
    { id: 'writing', label: 'Writing AI Evaluator', icon: <PenTool size={18} /> },
    { id: 'speaking', label: 'Speaking AI Examiner', icon: <Mic size={18} /> },

    // 4. Timed Full Assessment
    { id: 'mock', label: 'Timed Full Mock Exam', icon: <GraduationCap size={18} />, sectionLabel: 'Simulation' },

    // 5. Analytics & Configurations
    { id: 'progress', label: 'Mastery & Progress', icon: <TrendingUp size={18} />, requiresAuth: true, sectionLabel: 'Analytics & Settings' },
    { id: 'settings', label: 'Candidate Settings', icon: <Settings size={18} /> },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    const item = navItems.find(i => i.id === tabId);
    if (item?.requiresAuth && !profile) {
      openAuth('signin');
      return;
    }
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-canvas)',
    }}>
      {/* Precision Pedagogical Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{
        width: sidebarCollapsed ? '64px' : '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 20,
        flexShrink: 0,
        transition: 'width 200ms var(--ease-out)',
      }}>
        {/* Sidebar Header: Brand + Theme Toggle + Collapse Toggle */}
        <div style={{
          padding: sidebarCollapsed ? 'var(--space-3) 0' : 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        }}>
          {sidebarCollapsed ? (
            /* Collapsed Rail Mode: PanelLeft toggle icon matching User's reference */
            <div className="rail-toggle-wrapper">
              <button
                type="button"
                className="rail-toggle-btn"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Open sidebar"
              >
                <PanelLeft size={18} strokeWidth={2} />
              </button>
              <div className="rail-tooltip">Open sidebar</div>
            </div>
          ) : (
            /* Expanded Mode: Clean brand logo on left, close sidebar toggle on right with tooltip going outward */
            <>
              <div
                onClick={() => handleNavClick('home')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                title="AdeptIELTS — Adaptive Preparation"
              >
                <AdeptLogo variant="full" height={32} />
              </div>

              <div className="rail-toggle-wrapper">
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  className="btn btn-ghost btn-sm"
                  style={{
                    padding: '6px',
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Close sidebar"
                >
                  <PanelLeft size={18} strokeWidth={2} />
                </button>
                <div className="rail-tooltip">Close sidebar</div>
              </div>
            </>
          )}
        </div>

        {/* Navigation Items Organized by Logical Pedagogical Flow */}
        <nav style={{
          flex: 1,
          padding: sidebarCollapsed ? '4px 0' : 'var(--space-3)',
          overflowY: sidebarCollapsed ? 'hidden' : 'auto',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: sidebarCollapsed ? '2px' : '3px',
            alignItems: sidebarCollapsed ? 'center' : 'stretch',
          }}>
            {navItems.map((item, index) => {
              const active = currentTab === item.id;
              return (
                <div key={item.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: sidebarCollapsed ? 'center' : 'stretch' }}>
                  {item.sectionLabel && (
                    sidebarCollapsed ? (
                      index > 0 ? (
                        <div style={{
                          width: '20px',
                          height: '1px',
                          backgroundColor: 'var(--border-subtle)',
                          margin: '2px 0',
                        }} />
                      ) : null
                    ) : (
                      <div style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        color: 'var(--text-subtle)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        padding: index === 0 ? '0.2rem 0.75rem 0.35rem' : '0.8rem 0.75rem 0.35rem',
                      }}>
                        {item.sectionLabel}
                      </div>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      gap: '0.65rem',
                      padding: sidebarCollapsed ? '0' : '0.48rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: active ? 'var(--bg-subtle)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 600 : 500,
                      fontSize: '0.84rem',
                      textAlign: 'left',
                      border: active ? '1px solid var(--border-default)' : '1px solid transparent',
                      boxShadow: active ? 'var(--shadow-xs)' : 'none',
                      transition: 'all var(--transition-fast)',
                      cursor: 'pointer',
                      width: sidebarCollapsed ? '34px' : '100%',
                      height: sidebarCollapsed ? '34px' : 'auto',
                    }}
                  >
                    <span style={{
                      color: active ? 'var(--brand-primary)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: sidebarCollapsed ? 'scale(0.88)' : 'none',
                      transition: 'transform 120ms var(--ease-out), color 120ms var(--ease-out)',
                    }}>
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Candidate Profile / Sign In Section & Theme Switcher */}
        <div style={{
          padding: sidebarCollapsed ? '6px 0' : 'var(--space-3)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: sidebarCollapsed ? 'center' : 'stretch',
          gap: '0.35rem',
        }}>
          {/* Dedicated Theme Switcher Pill (Expanded sidebar - topbar also has quick toggle) */}
          {!sidebarCollapsed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '0.25rem',
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {theme === 'dark' ? <Moon size={14} color="var(--brand-primary)" /> : <Sun size={14} color="#f59e0b" />}
                <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </span>
              <button
                type="button"
                onClick={(e) => toggleTheme(e)}
                className="theme-switch-pill"
                aria-label="Toggle theme mode"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                style={{
                  backgroundColor: theme === 'dark' ? 'var(--brand-primary)' : 'var(--border-strong)',
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  transform: theme === 'dark' ? 'translateX(18px)' : 'translateX(0px)',
                  transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
                }} />
              </button>
            </div>
          )}

          {profile ? (
            <>
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                  padding: sidebarCollapsed ? '0' : '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  width: sidebarCollapsed ? '34px' : '100%',
                  height: sidebarCollapsed ? '34px' : 'auto',
                  cursor: 'pointer',
                  transition: 'background-color 150ms var(--ease-out), border-color 150ms var(--ease-out)',
                }}
                title={sidebarCollapsed ? profile.displayName : 'Candidate Profile & Settings'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="avatar-badge" style={{ width: sidebarCollapsed ? '28px' : '32px', height: sidebarCollapsed ? '28px' : '32px', fontSize: sidebarCollapsed ? '0.72rem' : '0.78rem' }}>
                    {profile.avatar || profile.displayName.slice(0, 2).toUpperCase()}
                    <span style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      border: '1.5px solid var(--bg-surface)',
                    }} />
                  </div>
                  {!sidebarCollapsed && (
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-primary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profile.displayName}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Band {profile.targetBand.toFixed(1)} {profile.streak > 0 ? `• 🔥 ${profile.streak}d` : ''} • <span style={{ textTransform: 'capitalize' }}>{profile.testType}</span>
                      </div>
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && <ChevronDown size={14} color="var(--text-muted)" />}
              </button>

              {!sidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => {
                    if (onSignOut) onSignOut();
                    else handleNavClick('home');
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <LogOut size={12} /> Sign Out
                </button>
              )}
            </>
          ) : (
            !sidebarCollapsed ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => openAuth('signup')}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', fontSize: '0.8rem' }}
                >
                  <UserPlus size={13} /> Sign Up Free
                </button>
                <button
                  type="button"
                  onClick={() => openAuth('signin')}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', fontSize: '0.76rem', color: 'var(--text-muted)' }}
                >
                  Candidate Sign In
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuth('signin')}
                className="btn btn-primary btn-sm"
                style={{ width: '34px', height: '34px', padding: 0, borderRadius: 'var(--radius-md)' }}
                title="Candidate Sign In"
              >
                <LogIn size={15} />
              </button>
            )
          )}
        </div>
      </aside>

      {/* Main Layout Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar (Sticky header for mobile and tablet with brand, active route, and theme toggle) */}
        <header className="app-topbar" style={{
          height: '56px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-4)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-subtle btn-sm mobile-only"
              style={{ padding: '6px' }}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div onClick={() => handleNavClick('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <AdeptLogo variant="full" height={26} />
            </div>

            <span className="desktop-breadcrumb" style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', margin: '0 2px' }}>/</span>

            <span className="desktop-breadcrumb" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {navItems.find(i => i.id === currentTab)?.label || 'Overview'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Theme Toggle Button with Motion Feedback */}
            <button
              type="button"
              onClick={(e) => toggleTheme(e)}
              className="theme-toggle-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme mode"
            >
              <span className="theme-toggle-icon">
                {theme === 'dark' ? <Sun size={15} style={{ color: '#fbbf24' }} /> : <Moon size={15} />}
              </span>
            </button>

            {profile ? (
              <>
                {/* Candidate Switcher */}
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem', padding: '0.3rem 0.65rem' }}
                  title="Candidate Profile & Account"
                >
                  <UserCheck size={14} color="var(--brand-primary)" />
                  <span style={{ fontWeight: 600 }}>{profile.displayName}</span>
                  <ChevronDown size={12} color="var(--text-muted)" />
                </button>

                {/* Streak Counter */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--warning-subtle)',
                  border: '1px solid var(--warning-border)',
                  color: 'var(--warning)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  <Flame size={13} />
                  <span>{profile.streak}d</span>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuth('signin')}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.82rem', fontWeight: 600 }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.82rem', fontWeight: 600, padding: '0.35rem 0.8rem' }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            position: 'fixed',
            inset: '56px 0 0 0',
            backgroundColor: 'var(--bg-surface)',
            zIndex: 100,
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              marginBottom: '0.5rem',
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Theme Appearance
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.4rem', fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
              >
                {theme === 'dark' ? <Sun size={14} style={{ color: '#fbbf24' }} /> : <Moon size={14} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: currentTab === item.id ? 'var(--bg-subtle)' : 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: 550,
                  fontSize: '0.875rem',
                  textAlign: 'left',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="main-content-viewport" style={{ flex: 1, padding: 'var(--space-8) var(--space-6)', overflowY: 'auto' }}>
          <div className="container">
            {children}
          </div>
        </main>

        {/* Native-Feeling Mobile Bottom Tab Bar (App-Native) */}
        <nav className="mobile-bottom-nav">
          <button
            type="button"
            className={`mobile-tab-item ${currentTab === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
            aria-label="Home"
          >
            <Home size={19} />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`mobile-tab-item ${currentTab === 'practice' ? 'active' : ''}`}
            onClick={() => handleNavClick('practice')}
            aria-label="Practice"
          >
            <ClipboardCheck size={19} />
            <span>Practice</span>
          </button>

          <button
            type="button"
            className={`mobile-tab-item ${currentTab === 'diagnostic' ? 'active' : ''}`}
            onClick={() => handleNavClick('diagnostic')}
            aria-label="Diagnostic"
          >
            <Target size={19} />
            <span>Diagnostic</span>
          </button>

          <button
            type="button"
            className={`mobile-tab-item ${currentTab === 'writing' ? 'active' : ''}`}
            onClick={() => handleNavClick('writing')}
            aria-label="Writing"
          >
            <PenTool size={19} />
            <span>Writing</span>
          </button>

          <button
            type="button"
            className={`mobile-tab-item ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="More Curriculum"
          >
            <Menu size={19} />
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        activeProfile={profile}
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onProfileChanged={(newProfile) => {
          onProfileChanged(newProfile);
          setUserModalOpen(false);
        }}
        initialMode={authModalMode}
      />

      {/* Candidate Profile Details & Switcher Modal */}
      {profile && (
        <CandidateProfileModal
          currentProfile={profile}
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onProfileChanged={(newProfile) => {
            onProfileChanged(newProfile);
            setProfileModalOpen(false);
          }}
          onSignOut={onSignOut}
          onNavigateSettings={() => handleNavClick('settings')}
        />
      )}

      <style>{`
        @media (min-width: 901px) {
          .app-topbar {
            display: none !important;
          }
          .mobile-bottom-nav {
            display: none !important;
          }
        }
        @media (max-width: 900px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }
        @media (max-width: 640px) {
          .desktop-breadcrumb {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
