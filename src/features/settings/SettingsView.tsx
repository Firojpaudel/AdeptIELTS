import { useState, useEffect } from 'react';
import {
  Save,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  Zap,
  Clock,
  Calendar,
  Award,
  KeyRound,
  Check,
  RotateCcw,
  Lock,
  Cloud,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { LearnerProfile, AISettings } from '../../lib/types';
import { saveLearnerProfile, saveAISettings, saveAISettingsAsync, loadAISettings, resetAllData } from '../../lib/storage';
import { testAIConnection, getDefaultModelForProvider, fetchLiveProviderModels, getOrSyncLiveModels } from '../../lib/aiService';

interface SettingsViewProps {
  profile: LearnerProfile;
  onProfileUpdated: (p: LearnerProfile) => void;
}

export const SettingsView = ({
  profile,
  onProfileUpdated,
}: SettingsViewProps) => {
  const [profileState, setProfileState] = useState<LearnerProfile>(profile);
  const [aiSettings, setAiSettings] = useState<AISettings>(loadAISettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Key Visibility toggle for user's personal AI key
  const [showApiKey, setShowApiKey] = useState(false);

  // Connection Test State
  const [testState, setTestState] = useState<{
    loading: boolean;
    result: { success: boolean; model: string; message: string } | null;
  }>({ loading: false, result: null });

  // Live Model Discovery State
  const [isFetchingLiveModels, setIsFetchingLiveModels] = useState(false);
  const [liveDiscoveredModels, setLiveDiscoveredModels] = useState<Record<string, string[]>>({});
  const [fetchModelMsg, setFetchModelMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  // Automated Daily Model Synchronization Hook:
  // Runs seamlessly in the background to detect newly supported LLM models from the provider API.
  useEffect(() => {
    let isMounted = true;
    const runAutoSync = async () => {
      if (!aiSettings.apiKey || aiSettings.provider === 'offline_deterministic') return;
      try {
        const res = await getOrSyncLiveModels(aiSettings.provider, aiSettings.apiKey, false);
        if (isMounted && res.models && res.models.length > 0) {
          setLiveDiscoveredModels(prev => ({ ...prev, [aiSettings.provider]: res.models }));
          setLastSyncTime(res.syncedAt);
        }
      } catch {
        // Transparent fallback to static defaults if offline
      }
    };
    runAutoSync();
    return () => {
      isMounted = false;
    };
  }, [aiSettings.provider, aiSettings.apiKey]);

  const handleFetchLiveModels = async () => {
    if (!aiSettings.apiKey && aiSettings.provider !== 'offline_deterministic') {
      setFetchModelMsg({ text: 'Please paste your API key above first to query live models.', isError: true });
      setTimeout(() => setFetchModelMsg(null), 5000);
      return;
    }
    setIsFetchingLiveModels(true);
    setFetchModelMsg(null);
    try {
      const res = await getOrSyncLiveModels(aiSettings.provider, aiSettings.apiKey, true);
      if (res.models && res.models.length > 0) {
        setLiveDiscoveredModels(prev => ({ ...prev, [aiSettings.provider]: res.models }));
        setLastSyncTime(res.syncedAt);
        setFetchModelMsg({ text: `Discovered ${res.models.length} live models directly from ${aiSettings.provider.toUpperCase()} API endpoint!` });
      } else {
        setFetchModelMsg({ text: `No chat models returned from ${aiSettings.provider.toUpperCase()} models endpoint.`, isError: true });
      }
    } catch (err: any) {
      setFetchModelMsg({ text: `Models endpoint error: ${err.message || err}`, isError: true });
    } finally {
      setIsFetchingLiveModels(false);
      setTimeout(() => setFetchModelMsg(null), 7000);
    }
  };

  const handleTestConnection = async () => {
    if (!aiSettings.apiKey && aiSettings.provider !== 'offline_deterministic' && !aiSettings.workerUrl) {
      setTestState({
        loading: false,
        result: {
          success: false,
          model: aiSettings.modelOverride || getDefaultModelForProvider(aiSettings.provider),
          message: 'Please paste your API key first before testing.',
        },
      });
      return;
    }
    setTestState({ loading: true, result: null });
    const res = await testAIConnection(aiSettings);
    setTestState({ loading: false, result: res });
  };

  const handleSave = async () => {
    setIsSaving(true);
    saveLearnerProfile(profileState);
    const syncRes = await saveAISettingsAsync(aiSettings, profileState.id);
    onProfileUpdated(profileState);
    setIsSaving(false);
    setCloudSynced(syncRes.syncedToTurso);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setCloudSynced(false);
    }, 4500);
  };

  const handleExportData = () => {
    const data = {
      profile: profileState,
      aiSettings: { ...aiSettings, apiKey: 'REDACTED' },
      exportedAt: new Date().toISOString(),
      schemaVersion: '1.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ielts_prep_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('Reset all practice history, flashcard intervals, and test attempts? Your profile settings will remain.')) {
      resetAllData();
      window.location.reload();
    }
  };

  const bandOptions = [
    { band: 6.0, cefr: 'B2 Competent' },
    { band: 6.5, cefr: 'B2+ Strong' },
    { band: 7.0, cefr: 'C1 Good' },
    { band: 7.5, cefr: 'C1+ Very Good' },
    { band: 8.0, cefr: 'C2 Very Good' },
    { band: 8.5, cefr: 'C2 Expert' },
    { band: 9.0, cefr: 'C2 Native-Mastery' },
  ];

  const aiProviders = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      tier: 'Google AI Studio Free Tier',
      model: 'Gemini 3.8 / 3.5 / 2.5 Flash',
      speed: '1M+ Context • Multimodal',
      url: 'https://aistudio.google.com/app/apikey',
      badge: 'Recommended',
      presets: ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'],
    },
    {
      id: 'groq',
      name: 'Groq Cloud',
      tier: 'Ultra-Fast Inference',
      model: 'OpenAI GPT OSS 120B / 20B & Qwen 3.8',
      speed: '~500 tok/sec • Ultra-Low Latency',
      url: 'https://console.groq.com/keys',
      badge: 'Ultra-Fast',
      presets: ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'qwen/qwen3.6-27b', 'groq/compound'],
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      tier: 'Direct API Key',
      model: 'Claude Sonnet 5 / Claude 3.7 Sonnet',
      speed: 'Elite Pedagogical Reasoning',
      url: 'https://console.anthropic.com/settings/keys',
      badge: 'Elite Model',
      presets: ['claude-sonnet-5', 'claude-3-7-sonnet-20250219', 'claude-haiku-4-5', 'claude-opus-5', 'claude-3-5-sonnet-latest'],
    },
    {
      id: 'openai',
      name: 'OpenAI Direct',
      tier: 'Direct API Key',
      model: 'GPT-6 Astra / GPT-5.6 Terra / GPT-5.4',
      speed: 'Industry Standard',
      url: 'https://platform.openai.com/api-keys',
      badge: 'Standard',
      presets: ['gpt-5.6-terra', 'gpt-5.4-mini', 'gpt-6-astra', 'gpt-4.1-mini', 'gpt-4o-mini', 'gpt-4o'],
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      tier: 'Multi-Model Hub',
      model: 'Free & Commercial Router',
      speed: 'Flexible Model Switching',
      url: 'https://openrouter.ai/keys',
      badge: 'Aggregator',
      presets: ['google/gemini-2.5-flash', 'meta-llama/llama-3.3-70b-instruct:free', 'anthropic/claude-3.7-sonnet', 'openai/gpt-4o-mini'],
    },
    {
      id: 'offline_deterministic',
      name: 'Offline Evaluator',
      tier: 'Zero Network Needed',
      model: 'Heuristic Rule Evaluator',
      speed: 'Instant (0ms)',
      url: '',
      badge: 'Private',
      presets: [],
    },
  ];

  return (
    <div className="fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem',
      maxWidth: '920px',
      margin: '0 auto',
      paddingBottom: '5rem',
    }}>
      
      {/* View Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
          letterSpacing: '-0.03em',
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          Settings
        </h1>
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '680px',
          margin: 0,
        }}>
          Manage your target band descriptors, exam schedule, and AI evaluation preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="alert alert-success fade-in" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.12)',
        }}>
          <CheckCircle2 size={20} color="var(--brand-primary)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {cloudSynced ? 'Configuration Saved & Synced to Turso Cloud' : 'Settings Saved Successfully'}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              {cloudSynced
                ? 'Your AI credentials were AES-256 encrypted in-browser and synced to Turso LibSQL Cloud. You can now access your keys on your phone and other devices!'
                : 'Your candidate target band, study schedule, and AI engine preferences have been saved.'}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: CANDIDATE PROFILE & TARGET BAND */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="var(--brand-primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                  Study Profile & Target Goals
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: 0 }}>
                Drives adaptive difficulty calibration, feedback harshness, and CEFR level benchmarks.
              </p>
            </div>
            <span className="badge badge-zinc" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {profileState.testType === 'academic' ? 'IELTS Academic' : 'IELTS General Training'}
            </span>
          </div>

          {/* Target Band Interactive Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
              Target IELTS Band:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '0.65rem',
            }}>
              {bandOptions.map(opt => {
                const isSelected = profileState.targetBand === opt.band;
                return (
                  <button
                    key={opt.band}
                    type="button"
                    onClick={() => setProfileState({ ...profileState, targetBand: opt.band })}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                      backgroundColor: isSelected ? 'var(--brand-primary-subtle)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'border-color 140ms var(--ease-out), background-color 140ms var(--ease-out), color 140ms var(--ease-out)',
                    }}
                  >
                    <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                      Band {opt.band.toFixed(1)}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                      {opt.cefr.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exam Module & Timing Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            
            {/* Exam Module Segmented Switcher */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Examination Module:
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                padding: '4px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                gap: '4px',
              }}>
                {(['academic', 'general'] as const).map(mod => {
                  const isActive = profileState.testType === mod;
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => setProfileState({ ...profileState, testType: mod })}
                      style={{
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        borderRadius: 'calc(var(--radius-md) - 3px)',
                        border: 'none',
                        backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                        cursor: 'pointer',
                        transition: 'background-color 140ms var(--ease-out), color 140ms var(--ease-out), box-shadow 140ms var(--ease-out)',
                      }}
                    >
                      {mod === 'academic' ? 'IELTS Academic' : 'General Training'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Exam Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Planned Test Date:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={profileState.examDate || ''}
                  onChange={e => setProfileState({ ...profileState, examDate: e.target.value })}
                  className="input"
                  style={{
                    paddingLeft: '2.5rem',
                    fontSize: '0.9rem',
                    height: '42px',
                  }}
                />
                <Calendar
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Daily Target Study Time */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Daily Study Target:
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                height: '42px',
                padding: '0 1rem',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
              }}>
                <Clock size={16} color="var(--text-muted)" />
                <input
                  type="range"
                  min={15}
                  max={120}
                  step={15}
                  value={profileState.availableDailyMinutes}
                  onChange={e => setProfileState({ ...profileState, availableDailyMinutes: Number(e.target.value) })}
                  style={{ flex: 1, accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)', minWidth: '60px', textAlign: 'right' }}>
                  {profileState.availableDailyMinutes} mins
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* SECTION 2: AI ORCHESTRATION & FREE TIER ROUTING */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} color="var(--brand-primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                  AI Provider & Zero-Waste Routing
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: 0 }}>
                Connect 100% free high-speed LLM APIs for live writing evaluation and speech diagnostics.
              </p>
            </div>
            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={12} />
              <span>Keys Stored Locally</span>
            </span>
          </div>

          {/* Provider Card Selection Grid */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Active AI Provider Engine:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}>
              {aiProviders.map(prov => {
                const isActive = aiSettings.provider === prov.id;
                return (
                  <div
                    key={prov.id}
                    onClick={() => setAiSettings({ ...aiSettings, provider: prov.id as any })}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isActive ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                      backgroundColor: isActive ? 'var(--brand-primary-subtle)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      position: 'relative',
                      transition: 'border-color 140ms var(--ease-out), background-color 140ms var(--ease-out), box-shadow 140ms var(--ease-out)',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isActive ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                        {prov.name}
                      </span>
                      {isActive ? (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} color="#ffffff" />
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>
                          {prov.badge}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {prov.model}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {prov.tier} • {prov.speed}
                      </span>
                    </div>

                    {prov.url && (
                      <a
                        href={prov.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.75rem',
                          color: 'var(--brand-primary)',
                          fontWeight: 600,
                          textDecoration: 'none',
                          marginTop: 'auto',
                          paddingTop: '0.25rem',
                        }}
                      >
                        <span>Get Free Key</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Key Configuration Card */}
          {aiSettings.provider !== 'offline_deterministic' && (
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <KeyRound size={15} color="var(--brand-primary)" />
                  <span>{aiSettings.provider.toUpperCase()} API Key:</span>
                </label>
                <span style={{
                  fontSize: '0.74rem',
                  color: 'var(--brand-primary)',
                  backgroundColor: 'var(--brand-surface)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}>
                  <Shield size={12} />
                  <span>Turso Cloud Encrypted (AES-256)</span>
                </span>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder={
                    aiSettings.provider === 'gemini' ? 'AIzaSy... (Google AI Studio key)' :
                    aiSettings.provider === 'groq' ? 'gsk_... (Groq Console key)' :
                    aiSettings.provider === 'anthropic' ? 'sk-ant-api03-... (Anthropic key)' :
                    aiSettings.provider === 'openai' ? 'sk-proj-... (OpenAI key)' :
                    aiSettings.provider === 'openrouter' ? 'sk-or-v1-... (OpenRouter key)' : 'API Key...'
                  }
                  value={aiSettings.apiKey}
                  onChange={e => {
                    setAiSettings({ ...aiSettings, apiKey: e.target.value });
                    setTestState({ loading: false, result: null });
                  }}
                  className="input"
                  style={{
                    paddingRight: '44px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={showApiKey ? 'Hide Key' : 'Show Key'}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Model Engine Selector & Custom Override */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                backgroundColor: 'var(--bg-surface)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Cpu size={13} color="var(--brand-primary)" />
                    <span>Model Engine / Checkpoint:</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleFetchLiveModels}
                      disabled={isFetchingLiveModels || !aiSettings.apiKey}
                      className="btn btn-ghost btn-sm"
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.55rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: 'var(--brand-primary)',
                        border: '1px solid var(--brand-primary-border)',
                        backgroundColor: 'var(--brand-primary-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: !aiSettings.apiKey ? 'not-allowed' : 'pointer',
                      }}
                      title="Query live /v1/models endpoint to fetch all active models for your API key"
                    >
                      <RefreshCw size={11} className={isFetchingLiveModels ? 'spin' : ''} />
                      <span>{isFetchingLiveModels ? 'Querying API...' : 'Fetch Live Models'}</span>
                    </button>
                    {lastSyncTime && (
                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--brand-primary)',
                        backgroundColor: 'var(--brand-surface)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600,
                        border: '1px solid var(--brand-primary-border)',
                      }}>
                        Auto-synced today
                      </span>
                    )}
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Active: <strong style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>{aiSettings.modelOverride || getDefaultModelForProvider(aiSettings.provider)}</strong>
                    </span>
                  </div>
                </div>

                {fetchModelMsg && (
                  <div style={{
                    fontSize: '0.76rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: fetchModelMsg.isError ? 'var(--error-subtle)' : 'var(--success-subtle)',
                    color: fetchModelMsg.isError ? 'var(--error-text)' : 'var(--success-text)',
                    border: `1px solid ${fetchModelMsg.isError ? 'var(--error-border)' : 'var(--success-border)'}`,
                  }}>
                    {fetchModelMsg.text}
                  </div>
                )}

                {/* Preset Pills */}
                {(() => {
                  const activeProv = aiProviders.find(p => p.id === aiSettings.provider);
                  const isLive = !!liveDiscoveredModels[aiSettings.provider]?.length;
                  const presets = liveDiscoveredModels[aiSettings.provider] || activeProv?.presets || [];
                  if (presets.length === 0) return null;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {isLive && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 650, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Live Models Discovered from {aiSettings.provider.toUpperCase()} API ({presets.length}):
                          </div>
                          {lastSyncTime && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              Auto-synced: {new Date(lastSyncTime).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                        {presets.map(modelName => {
                          const isChosen = (aiSettings.modelOverride || getDefaultModelForProvider(aiSettings.provider)) === modelName;
                          return (
                            <button
                              key={modelName}
                              type="button"
                              onClick={() => {
                                setAiSettings({ ...aiSettings, modelOverride: modelName });
                                setTestState({ loading: false, result: null });
                              }}
                              className="btn btn-sm"
                              style={{
                                padding: '0.25rem 0.65rem',
                                fontSize: '0.78rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: isChosen ? 700 : 500,
                                backgroundColor: isChosen ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                                color: isChosen ? '#ffffff' : 'var(--text-secondary)',
                                border: `1px solid ${isChosen ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                                borderRadius: 'var(--radius-sm)',
                                transition: 'all 140ms ease',
                              }}
                            >
                              {modelName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Custom Model Override Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Custom Model ID:</span>
                  <input
                    type="text"
                    placeholder={`e.g. ${getDefaultModelForProvider(aiSettings.provider)}`}
                    value={aiSettings.modelOverride || ''}
                    onChange={e => {
                      setAiSettings({ ...aiSettings, modelOverride: e.target.value.trim() });
                      setTestState({ loading: false, result: null });
                    }}
                    className="input"
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: 'var(--bg-canvas)',
                      flex: 1,
                    }}
                  />
                  {aiSettings.modelOverride && (
                    <button
                      type="button"
                      onClick={() => {
                        setAiSettings({ ...aiSettings, modelOverride: undefined });
                        setTestState({ loading: false, result: null });
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}
                      title="Reset to default model"
                    >
                      Reset Default
                    </button>
                  )}
                </div>
              </div>

              {/* Test Connection Button & Status Output */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingTop: '0.4rem',
              }}>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testState.loading}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <Zap size={14} color="var(--brand-primary)" />
                  <span>{testState.loading ? 'Testing API...' : `Test ${aiSettings.provider.toUpperCase()} Connection`}</span>
                </button>

                {testState.result && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.8rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: testState.result.success ? 'var(--brand-primary-subtle)' : 'rgba(239, 68, 68, 0.1)',
                    color: testState.result.success ? 'var(--brand-primary)' : 'var(--error)',
                    border: `1px solid ${testState.result.success ? 'rgba(13, 148, 136, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}>
                    {testState.result.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    <span>{testState.result.message}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Lock size={12} color="var(--success)" />
                  <span>Encrypted client-side with AES-GCM before syncing to Turso Edge Database.</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand-primary)', fontWeight: 500 }}>
                  <Cloud size={12} />
                  <span>Available on phone & all devices</span>
                </span>
              </div>

              {/* Token-Saving Mode Switch */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    Token-Saving Evaluation Mode
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Uses compact JSON schemas and client-side prompt optimization to minimize free-tier token usage.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={aiSettings.tokenSavingMode}
                  onChange={e => setAiSettings({ ...aiSettings, tokenSavingMode: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
              </div>

            </div>
          )}

        </div>
      </div>

      {/* SECTION 3: ACTIONS & BACKUP */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        paddingTop: '0.75rem',
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleExportData}
            className="btn btn-secondary"
            style={{ padding: '0.7rem 1.25rem', gap: '0.5rem', fontSize: '0.88rem' }}
          >
            <Download size={15} />
            <span>Export JSON Backup</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-subtle"
            style={{ padding: '0.7rem 1.25rem', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--error)' }}
          >
            <Trash2 size={15} />
            <span>Reset History</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary btn-lg"
          style={{
            padding: '0.85rem 2.25rem',
            gap: '0.6rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.95rem',
            fontWeight: 700,
            transition: 'transform 150ms ease-out',
          }}
        >
          <Save size={16} />
          <span>{isSaving ? 'Encrypting & Syncing...' : 'Save Configuration'}</span>
        </button>
      </div>

    </div>
  );
};
