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
} from 'lucide-react';
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

    // 2. Study & Foundations (Input)
    { id: 'resources', label: 'Study Library & Books', icon: <Library size={18} />, sectionLabel: 'Learn & Study' },
    { id: 'learn', label: 'Strategy Lessons', icon: <GraduationCap size={18} /> },
    { id: 'vocabulary', label: 'Vocabulary Queue', icon: <SpellCheck size={18} />, requiresAuth: true },

    // 3. Module Training (Active Drills)
    { id: 'practice', label: 'Adaptive Practice', icon: <Target size={18} />, requiresAuth: true, sectionLabel: 'Module Training' },
    { id: 'writing', label: 'Writing Evaluator', icon: <PenTool size={18} />, requiresAuth: true },
    { id: 'speaking', label: 'Speaking Coach', icon: <Mic size={18} />, requiresAuth: true },

    // 4. Assessment & Performance (Validation)
    { id: 'mock', label: 'Exam Simulation', icon: <ClipboardCheck size={18} />, requiresAuth: true, sectionLabel: 'Assessment' },
    { id: 'progress', label: 'Analytics & Mastery', icon: <TrendingUp size={18} />, requiresAuth: true },

    // 5. Preferences
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, sectionLabel: 'Preferences' },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Sidebar Desktop (Collapsible) */}
      <aside style={{
        width: sidebarCollapsed ? '68px' : '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 20,
        transition: 'width 200ms cubic-bezier(0.23, 1, 0.32, 1)',
      }} className="desktop-sidebar">
        
        {/* Brand Header - Morphing toggle when collapsed (Pure CSS - No Stuck Tooltips) */}
        <div style={{
          padding: sidebarCollapsed ? 'var(--space-3) 0' : 'var(--space-4) var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        }}>
          {sidebarCollapsed ? (
            /* Collapsed Rail Mode: Pure CSS toggle with zero chance of stuck tooltips */
            <div className="rail-toggle-wrapper">
              <button
                type="button"
                className="rail-toggle-btn"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Open sidebar"
              >
                <PanelLeft size={18} className="icon-panel" />
                <GraduationCap size={18} className="icon-cap" />
              </button>
              <div className="rail-tooltip">Open sidebar</div>
            </div>
          ) : (
            /* Expanded Mode: Brand on left, collapse button on right */
            <>
              <div
                onClick={() => handleNavClick('home')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                title="Click to redirect to platform home"
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--text-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-xs)',
                  flexShrink: 0,
                }}>
                  <GraduationCap size={18} />
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                    Adept<span style={{ color: 'var(--brand-primary)' }}>IELTS</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Adaptive Preparation
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '6px', color: 'var(--text-muted)' }}
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            </>
          )}
        </div>

        {/* Navigation Items Organized by Logical Pedagogical Flow */}
        <nav style={{ flex: 1, padding: sidebarCollapsed ? 'var(--space-2) 0' : 'var(--space-3)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: sidebarCollapsed ? 'center' : 'stretch' }}>
            {navItems.map((item, index) => {
              const active = currentTab === item.id;
              return (
                <div key={item.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: sidebarCollapsed ? 'center' : 'stretch' }}>
                  {item.sectionLabel && (
                    sidebarCollapsed ? (
                      index > 0 ? (
                        <div style={{
                          width: '24px',
                          height: '1px',
                          backgroundColor: 'var(--border-subtle)',
                          margin: '0.4rem 0',
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
                      padding: sidebarCollapsed ? '0.6rem' : '0.48rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: active ? 'rgba(24, 24, 27, 0.06)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 600 : 500,
                      fontSize: '0.84rem',
                      textAlign: 'left',
                      border: active ? '1px solid rgba(228, 228, 231, 0.9)' : '1px solid transparent',
                      boxShadow: active ? 'var(--shadow-xs)' : 'none',
                      transition: 'all var(--transition-fast)',
                      cursor: 'pointer',
                      width: sidebarCollapsed ? '42px' : '100%',
                    }}
                  >
                    <span style={{
                      color: active ? 'var(--brand-primary)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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

        {/* Sidebar Footer: Candidate Status / Sign In */}
        <div style={{
          padding: sidebarCollapsed ? 'var(--space-3) 0' : 'var(--space-3)',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-canvas)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: sidebarCollapsed ? 'center' : 'stretch',
        }}>
          {profile ? (
            <>
              <button
                onClick={() => setProfileModalOpen(true)}
                style={{
                  width: sidebarCollapsed ? '42px' : '100%',
                  height: sidebarCollapsed ? '42px' : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                  padding: sidebarCollapsed ? '0' : '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all 160ms ease-out',
                }}
                title={`Candidate Profile: ${profile.displayName} (Band ${profile.targetBand.toFixed(1)})`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="avatar-badge" style={{ width: '32px', height: '32px', fontSize: '0.78rem' }}>
                    {profile.avatar || profile.displayName.slice(0, 2).toUpperCase()}
                    <span style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '8px',
                      height: '8px',
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
                  onClick={() => openAuth('signup')}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', fontSize: '0.8rem' }}
                >
                  <UserPlus size={13} /> Sign Up Free
                </button>
                <button
                  onClick={() => openAuth('signin')}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', fontSize: '0.76rem', color: 'var(--text-muted)' }}
                >
                  Candidate Sign In
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuth('signin')}
                className="btn btn-primary btn-sm"
                style={{ width: '38px', height: '38px', padding: 0 }}
                title="Candidate Sign In"
              >
                <LogIn size={16} />
              </button>
            )
          )}
        </div>
      </aside>

      {/* Main Layout Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar (Mobile Only) */}
        <header className="app-topbar" style={{
          height: '56px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-6)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-subtle btn-sm mobile-only"
              style={{ display: 'none', padding: '6px' }}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>


            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {navItems.find(i => i.id === currentTab)?.label || 'AdeptIELTS'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  <span>{profile.streak}d Streak</span>
                </div>

                {/* Target Band Pill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}>
                  <span>Target: <strong style={{ color: 'var(--text-primary)' }}>Band {profile.targetBand.toFixed(1)}</strong></span>
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
                  style={{ fontSize: '0.82rem', fontWeight: 600, padding: '0.35rem 0.9rem' }}
                >
                  Create Account
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
        <main style={{ flex: 1, padding: 'var(--space-8) var(--space-6)', overflowY: 'auto' }}>
          <div className="container">
            {children}
          </div>
        </main>
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
        }
        @media (max-width: 900px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
