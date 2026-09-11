import {
  LearnerProfile,
  QuestionAttempt,
  WritingSubmission,
  SpeakingSession,
  VocabularyCard,
  AISettings,
  ReadResourceRecord,
  ExamScoreRecord,
} from './types';
import { supabase, getSupabaseClient } from './supabaseClient';
import {
  getTursoClient,
  saveTursoUserSettings,
  fetchUserCompleteDataFromTurso,
  saveTursoCritiqueSnapshot,
  loadTursoCritiqueHistory,
} from './tursoClient';

const PROFILES_KEY = 'adept_ielts_profiles_list';
const ACTIVE_PROFILE_ID_KEY = 'adept_ielts_active_profile_id';
const SETTINGS_KEY = 'adept_ielts_ai_settings';

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'groq',
  apiKey: '',
  workerUrl: '',
  tokenSavingMode: true,
};

// Zero mock candidates - pure real user data
export function loadAllProfiles(): LearnerProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    let list: LearnerProfile[] = JSON.parse(raw);
    // Automatically purge old mock personas (Aarav, Emma, Carlos)
    list = list.filter(
      p => p && p.id !== 'user-aarav' && p.id !== 'user-emma' && p.id !== 'user-carlos' && p.displayName !== 'Aarav Sharma'
    );
    return list;
  } catch (e) {
    return [];
  }
}

export function saveAllProfiles(profiles: LearnerProfile[]): void {
  try {
    const cleanList = profiles.filter(
      p => p && p.id !== 'user-aarav' && p.id !== 'user-emma' && p.id !== 'user-carlos' && p.displayName !== 'Aarav Sharma'
    );
    localStorage.setItem(PROFILES_KEY, JSON.stringify(cleanList));
  } catch (e) {
    console.error('Failed to save profiles list', e);
  }
}

export function getActiveProfileId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_PROFILE_ID_KEY) || '';
    if (id === 'user-aarav' || id === 'user-emma' || id === 'user-carlos') {
      localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
      return '';
    }
    return id;
  } catch (e) {
    return '';
  }
}

export function setActiveProfileId(id: string): void {
  try {
    if (id && id !== 'user-aarav' && id !== 'user-emma' && id !== 'user-carlos') {
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
    }
  } catch (e) {
    console.error('Failed to set active profile id', e);
  }
}

export function loadLearnerProfile(profileId?: string): LearnerProfile | null {
  const targetId = profileId || getActiveProfileId();
  if (!targetId) return null;
  const all = loadAllProfiles();
  return all.find(p => p.id === targetId) || null;
}

export function saveLearnerProfile(profile: LearnerProfile): void {
  const all = loadAllProfiles();
  const idx = all.findIndex(p => p.id === profile.id);
  if (idx >= 0) {
    all[idx] = profile;
  } else {
    all.push(profile);
  }
  saveAllProfiles(all);

  // Sync directly to online Supabase database if configured
  const client = getSupabaseClient();
  if (client) {
    client.from('learner_profiles').upsert({
      id: profile.id,
      display_name: profile.displayName,
      target_band: profile.targetBand,
      current_estimated_band: profile.currentEstimatedBand,
      test_type: profile.testType,
      exam_date: profile.examDate,
      available_daily_minutes: profile.availableDailyMinutes,
      skill_bands: profile.skillBands,
      subskill_mastery: profile.subskillMastery,
      streak: profile.streak,
    }).then(({ error }: { error: any }) => {
      if (error) console.warn('Supabase profile sync note:', error.message);
    });
  }

  // Sync directly to online Turso database (9GB generous free tier)
  const turso = getTursoClient();
  if (turso) {
    turso.execute({
      sql: `INSERT OR REPLACE INTO learner_profiles (
        id, display_name, target_band, current_estimated_band, test_type, exam_date, available_daily_minutes, skill_bands, subskill_mastery, streak
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        profile.id,
        profile.displayName,
        profile.targetBand,
        profile.currentEstimatedBand,
        profile.testType,
        profile.examDate,
        profile.availableDailyMinutes,
        JSON.stringify(profile.skillBands),
        JSON.stringify(profile.subskillMastery),
        profile.streak,
      ],
    }).catch(err => console.warn('Turso profile sync note:', err));
  }
}

export function createNewProfile(
  name: string,
  targetBand: number,
  testType: 'academic' | 'general',
  examDate?: string
): LearnerProfile {
  const initials = name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2) || 'ST';
  const newProfile: LearnerProfile = {
    id: `user-${Date.now()}`,
    displayName: name,
    avatar: initials,
    targetBand,
    currentEstimatedBand: 5.5,
    testType,
    examDate: examDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    availableDailyMinutes: 45,
    skillBands: {
      reading: 5.5,
      listening: 6.0,
      writing: 5.0,
      speaking: 5.5,
    },
    subskillMastery: {},
    streak: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalStudyMinutes: 0,
    onboardingCompleted: true,
  };

  const all = loadAllProfiles();
  all.push(newProfile);
  saveAllProfiles(all);
  setActiveProfileId(newProfile.id);
  saveLearnerProfile(newProfile);
  return newProfile;
}

// User-Scoped Data Helpers
function getScopedKey(baseKey: string, profileId?: string): string {
  const pid = profileId || getActiveProfileId();
  return `${baseKey}_${pid}`;
}

export function loadQuestionAttempts(profileId?: string): QuestionAttempt[] {
  try {
    const raw = localStorage.getItem(getScopedKey('adept_ielts_attempts', profileId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function recordQuestionAttempt(attempt: QuestionAttempt, profileId?: string): void {
  try {
    const attempts = loadQuestionAttempts(profileId);
    attempts.push(attempt);
    localStorage.setItem(getScopedKey('adept_ielts_attempts', profileId), JSON.stringify(attempts));

    const client = getSupabaseClient();
    if (client) {
      client.from('question_attempts').insert({
        id: attempt.id,
        user_id: profileId || getActiveProfileId(),
        question_id: attempt.questionId,
        skill: attempt.skill,
        subskill: attempt.subskill,
        user_answer: attempt.userAnswer,
        is_correct: attempt.isCorrect,
        time_spent_seconds: attempt.timeSpentSeconds,
        confidence_rating: attempt.confidenceRating,
      }).then(({ error }: { error: any }) => {
        if (error) console.warn('Supabase attempt sync note:', error.message);
      });
    }

    const turso = getTursoClient();
    if (turso) {
      turso.execute({
        sql: `INSERT OR REPLACE INTO question_attempts (
          id, user_id, question_id, skill, subskill, user_answer, is_correct, time_spent_seconds, confidence_rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          attempt.id,
          profileId || getActiveProfileId(),
          attempt.questionId,
          attempt.skill,
          attempt.subskill,
          attempt.userAnswer,
          attempt.isCorrect ? 1 : 0,
          attempt.timeSpentSeconds,
          attempt.confidenceRating || 'medium',
        ],
      }).catch(err => console.warn('Turso attempt sync note:', err));
    }
  } catch (e) {
    console.error('Failed to record attempt', e);
  }
}

export function loadWritingSubmissions(profileId?: string): WritingSubmission[] {
  try {
    const raw = localStorage.getItem(getScopedKey('adept_ielts_writing', profileId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveWritingSubmission(sub: WritingSubmission, profileId?: string): void {
  try {
    const subs = loadWritingSubmissions(profileId);
    subs.unshift(sub);
    localStorage.setItem(getScopedKey('adept_ielts_writing', profileId), JSON.stringify(subs));

    const client = getSupabaseClient();
    if (client) {
      client.from('writing_submissions').insert({
        id: sub.id,
        user_id: profileId || getActiveProfileId(),
        task_type: sub.taskType,
        prompt_title: sub.promptTitle,
        prompt_text: sub.promptText,
        essay_text: sub.essayText,
        word_count: sub.wordCount,
        time_spent_seconds: sub.timeSpentSeconds,
        feedback: sub.feedback,
      }).then(({ error }: { error: any }) => {
        if (error) console.warn('Supabase writing sync note:', error.message);
      });
    }

    const turso = getTursoClient();
    if (turso) {
      turso.execute({
        sql: `INSERT OR REPLACE INTO writing_submissions (
          id, user_id, task_type, prompt_title, prompt_text, essay_text, word_count, time_spent_seconds, feedback
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          sub.id,
          profileId || getActiveProfileId(),
          sub.taskType,
          sub.promptTitle,
          sub.promptText,
          sub.essayText,
          sub.wordCount,
          sub.timeSpentSeconds,
          JSON.stringify(sub.feedback || null),
        ],
      }).catch(err => console.warn('Turso writing sync note:', err));
    }
  } catch (e) {
    console.error('Failed to save writing submission', e);
  }
}

export function loadSpeakingSessions(profileId?: string): SpeakingSession[] {
  try {
    const raw = localStorage.getItem(getScopedKey('adept_ielts_speaking', profileId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveSpeakingSession(session: SpeakingSession, profileId?: string): void {
  try {
    const sessions = loadSpeakingSessions(profileId);
    sessions.unshift(session);
    localStorage.setItem(getScopedKey('adept_ielts_speaking', profileId), JSON.stringify(sessions));

    const client = getSupabaseClient();
    if (client) {
      client.from('speaking_sessions').insert({
        id: session.id,
        user_id: profileId || getActiveProfileId(),
        part: session.part,
        topic: session.topic,
        prompt: session.prompt,
        bullet_points: session.bulletPoints,
        transcript: session.transcript,
        duration_seconds: session.durationSeconds,
        feedback: session.feedback,
      }).then(({ error }: { error: any }) => {
        if (error) console.warn('Supabase speaking sync note:', error.message);
      });
    }

    const turso = getTursoClient();
    if (turso) {
      turso.execute({
        sql: `INSERT OR REPLACE INTO speaking_sessions (
          id, user_id, part, topic, prompt, bullet_points, transcript, duration_seconds, feedback
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          session.id,
          profileId || getActiveProfileId(),
          session.part,
          session.topic,
          session.prompt,
          JSON.stringify(session.bulletPoints || []),
          session.transcript,
          session.durationSeconds,
          JSON.stringify(session.feedback || null),
        ],
      }).catch(err => console.warn('Turso speaking sync note:', err));
    }
  } catch (e) {
    console.error('Failed to save speaking session', e);
  }
}

export function loadVocabCards(profileId?: string): VocabularyCard[] {
  try {
    const raw = localStorage.getItem(getScopedKey('adept_ielts_vocab', profileId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveVocabCards(cards: VocabularyCard[], profileId?: string): void {
  try {
    localStorage.setItem(getScopedKey('adept_ielts_vocab', profileId), JSON.stringify(cards));

    const client = getSupabaseClient();
    if (client) {
      client.from('vocabulary_progress').upsert(
        cards.map(c => ({
          id: `${profileId || getActiveProfileId()}_${c.id}`,
          user_id: profileId || getActiveProfileId(),
          card_id: c.id,
          word: c.word,
          repetitions: c.repetitions,
          interval_days: c.intervalDays,
          next_review_date: c.nextReviewDate,
          last_reviewed: c.lastReviewed,
        }))
      ).then(({ error }: { error: any }) => {
        if (error) console.warn('Supabase vocab sync note:', error.message);
      });
    }

    const turso = getTursoClient();
    if (turso) {
      const pid = profileId || getActiveProfileId();
      Promise.all(cards.map(c => turso.execute({
        sql: `INSERT OR REPLACE INTO vocabulary_cards (
          id, user_id, word, repetitions, interval_days, next_review_date, last_reviewed, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'));`,
        args: [c.id, pid, c.word, c.repetitions, c.intervalDays, c.nextReviewDate, c.lastReviewed || null]
      }))).catch(err => console.warn('Turso vocab sync note:', err));
    }
  } catch (e) {
    console.error('Failed to save vocab cards', e);
  }
}

export function loadAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) } : DEFAULT_AI_SETTINGS;
  } catch (e) {
    return DEFAULT_AI_SETTINGS;
  }
}

export function saveAISettings(settings: AISettings, profileId?: string): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    const pid = profileId || getActiveProfileId();
    if (pid) {
      saveTursoUserSettings(pid, settings).catch(err => {
        console.warn('Failed to sync AI settings to Turso:', err);
      });
    }
  } catch (e) {
    console.error('Failed to save AI settings', e);
  }
}

export async function saveAISettingsAsync(
  settings: AISettings,
  profileId?: string
): Promise<{ success: boolean; syncedToTurso: boolean }> {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    const pid = profileId || getActiveProfileId();
    if (pid) {
      await saveTursoUserSettings(pid, settings);
      return { success: true, syncedToTurso: true };
    }
    return { success: true, syncedToTurso: false };
  } catch (e) {
    console.error('Failed to save AI settings async', e);
    return { success: false, syncedToTurso: false };
  }
}

export async function hydrateUserFromTurso(userId: string): Promise<{
  attempts: QuestionAttempt[];
  writings: WritingSubmission[];
  speakings: SpeakingSession[];
  scores: ExamScoreRecord[];
  settings: AISettings | null;
}> {
  if (!userId) return { attempts: [], writings: [], speakings: [], scores: [], settings: null };
  try {
    const data = await fetchUserCompleteDataFromTurso(userId);

    // 1. Attempts
    if (data.attempts && data.attempts.length > 0) {
      const localAttempts = loadQuestionAttempts(userId);
      const attemptMap = new Map<string, QuestionAttempt>();
      [...data.attempts, ...localAttempts].forEach(a => attemptMap.set(a.id, a));
      const mergedAttempts = Array.from(attemptMap.values());
      localStorage.setItem(getScopedKey('adept_ielts_attempts', userId), JSON.stringify(mergedAttempts));
    }

    // 2. Writings
    if (data.writings && data.writings.length > 0) {
      const localWritings = loadWritingSubmissions(userId);
      const writeMap = new Map<string, WritingSubmission>();
      [...data.writings, ...localWritings].forEach(w => writeMap.set(w.id, w));
      const mergedWritings = Array.from(writeMap.values());
      localStorage.setItem(getScopedKey('adept_ielts_writing', userId), JSON.stringify(mergedWritings));
    }

    // 3. Speakings
    if (data.speakings && data.speakings.length > 0) {
      const localSpeakings = loadSpeakingSessions(userId);
      const speakMap = new Map<string, SpeakingSession>();
      [...data.speakings, ...localSpeakings].forEach(s => speakMap.set(s.id, s));
      const mergedSpeakings = Array.from(speakMap.values());
      localStorage.setItem(getScopedKey('adept_ielts_speaking', userId), JSON.stringify(mergedSpeakings));
    }

    // 4. Exam Scores
    if (data.scores && data.scores.length > 0) {
      const localScores = await loadExamScores(userId);
      const scoreMap = new Map<string, ExamScoreRecord>();
      [...data.scores, ...localScores].forEach(s => scoreMap.set(s.id, s));
      const mergedScores = Array.from(scoreMap.values());
      localStorage.setItem(getScopedKey(EXAM_SCORES_KEY, userId), JSON.stringify(mergedScores));
    }

    // 5. Custom AI Settings
    if (data.settings && data.settings.apiKey) {
      const current = loadAISettings();
      const updatedSettings = {
        ...current,
        provider: data.settings.provider || current.provider,
        apiKey: data.settings.apiKey || current.apiKey,
        workerUrl: data.settings.workerUrl || current.workerUrl,
        tokenSavingMode: data.settings.tokenSavingMode ?? current.tokenSavingMode,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    }

    return data;
  } catch (err) {
    console.warn('Hydration from Turso failed or offline:', err);
    return { attempts: [], writings: [], speakings: [], scores: [], settings: null };
  }
}

export function resetActiveUserData(): void {
  const pid = getActiveProfileId();
  localStorage.removeItem(`adept_ielts_attempts_${pid}`);
  localStorage.removeItem(`adept_ielts_writing_${pid}`);
  localStorage.removeItem(`adept_ielts_speaking_${pid}`);
  localStorage.removeItem(`adept_ielts_vocab_${pid}`);
}

export function resetAllData(): void {
  resetActiveUserData();
  localStorage.removeItem(PROFILES_KEY);
  localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}

// ============================================================================
// READING & STUDY TRACKING (SYNCED TO TURSO & LOCALSTORAGE)
// ============================================================================

export const STUDIED_RESOURCES_KEY = 'adept_studied_resources';

export async function recordReadResource(
  resourceId: string,
  resourceType: 'book' | 'guide' | 'lesson',
  title: string,
  profileId?: string
): Promise<void> {
  const pid = profileId || getActiveProfileId();
  try {
    // 1. LocalStorage
    const key = getScopedKey(STUDIED_RESOURCES_KEY, pid);
    const existing: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (!existing.includes(resourceId)) {
      existing.push(resourceId);
      localStorage.setItem(key, JSON.stringify(existing));
    }

    // 2. Turso Cloud Edge Database
    const turso = getTursoClient();
    if (turso && pid) {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO reading_history (
          id, user_id, resource_id, resource_type, title, completed_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'));`,
        args: [`read-${pid}-${resourceId}`, pid, resourceId, resourceType, title],
      }).catch(err => console.warn('Turso reading sync note:', err));
    }
  } catch (e) {
    console.error('Failed to record read resource:', e);
  }
}

export async function unrecordReadResource(
  resourceId: string,
  profileId?: string
): Promise<void> {
  const pid = profileId || getActiveProfileId();
  try {
    const key = getScopedKey(STUDIED_RESOURCES_KEY, pid);
    const existing: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    const next = existing.filter(id => id !== resourceId);
    localStorage.setItem(key, JSON.stringify(next));

    const turso = getTursoClient();
    if (turso && pid) {
      await turso.execute({
        sql: `DELETE FROM reading_history WHERE user_id = ? AND resource_id = ?;`,
        args: [pid, resourceId],
      }).catch(err => console.warn('Turso unread sync note:', err));
    }
  } catch (e) {
    console.error('Failed to unrecord read resource:', e);
  }
}

export async function loadReadResourceIds(profileId?: string): Promise<string[]> {
  const pid = profileId || getActiveProfileId();
  const key = getScopedKey(STUDIED_RESOURCES_KEY, pid);
  let localIds: string[] = [];
  try {
    localIds = JSON.parse(localStorage.getItem(key) || '[]');
  } catch {}

  const turso = getTursoClient();
  if (turso && pid) {
    try {
      const res = await turso.execute({
        sql: `SELECT resource_id FROM reading_history WHERE user_id = ?;`,
        args: [pid],
      });
      const remoteIds = res.rows.map(r => String(r.resource_id));
      const merged = Array.from(new Set([...localIds, ...remoteIds]));
      localStorage.setItem(key, JSON.stringify(merged));
      return merged;
    } catch (e) {
      console.warn('Could not fetch reading history from Turso; using local cache:', e);
    }
  }
  return localIds;
}

// ============================================================================
// EXAM SCORES TRACKING (SYNCED TO TURSO & LOCALSTORAGE)
// ============================================================================

export const EXAM_SCORES_KEY = 'adept_ielts_exam_scores';

export async function saveExamScore(
  record: ExamScoreRecord,
  profileId?: string
): Promise<void> {
  const pid = profileId || record.userId || getActiveProfileId();
  try {
    // 1. LocalStorage
    const key = getScopedKey(EXAM_SCORES_KEY, pid);
    const existing: ExamScoreRecord[] = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift(record);
    localStorage.setItem(key, JSON.stringify(existing));

    // 2. Turso Cloud Edge Database
    const turso = getTursoClient();
    if (turso && pid) {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO exam_scores (
          id, user_id, exam_type, overall_band, reading_band, writing_band, listening_band, speaking_band, raw_score, total_questions, time_spent_seconds, details, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          record.id,
          pid,
          record.examType,
          record.overallBand,
          record.readingBand ?? null,
          record.writingBand ?? null,
          record.listeningBand ?? null,
          record.speakingBand ?? null,
          record.rawScore ?? null,
          record.totalQuestions ?? null,
          record.timeSpentSeconds ?? null,
          record.details || null,
          record.createdAt,
        ],
      }).catch(err => console.warn('Turso exam score sync note:', err));
    }
  } catch (e) {
    console.error('Failed to save exam score:', e);
  }
}

export async function loadExamScores(profileId?: string): Promise<ExamScoreRecord[]> {
  const pid = profileId || getActiveProfileId();
  const key = getScopedKey(EXAM_SCORES_KEY, pid);
  let localScores: ExamScoreRecord[] = [];
  try {
    localScores = JSON.parse(localStorage.getItem(key) || '[]');
  } catch {}

  const turso = getTursoClient();
  if (turso && pid) {
    try {
      const res = await turso.execute({
        sql: `SELECT * FROM exam_scores WHERE user_id = ? ORDER BY created_at DESC;`,
        args: [pid],
      });
      const remoteScores: ExamScoreRecord[] = res.rows.map(r => ({
        id: String(r.id),
        userId: String(r.user_id),
        examType: (r.exam_type as any) || 'full_mock',
        overallBand: Number(r.overall_band),
        readingBand: r.reading_band !== null && r.reading_band !== undefined ? Number(r.reading_band) : undefined,
        writingBand: r.writing_band !== null && r.writing_band !== undefined ? Number(r.writing_band) : undefined,
        listeningBand: r.listening_band !== null && r.listening_band !== undefined ? Number(r.listening_band) : undefined,
        speakingBand: r.speaking_band !== null && r.speaking_band !== undefined ? Number(r.speaking_band) : undefined,
        rawScore: r.raw_score !== null && r.raw_score !== undefined ? Number(r.raw_score) : undefined,
        totalQuestions: r.total_questions !== null && r.total_questions !== undefined ? Number(r.total_questions) : undefined,
        timeSpentSeconds: r.time_spent_seconds !== null && r.time_spent_seconds !== undefined ? Number(r.time_spent_seconds) : undefined,
        details: r.details ? String(r.details) : undefined,
        createdAt: String(r.created_at),
      }));

      const byId = new Map<string, ExamScoreRecord>();
      [...remoteScores, ...localScores].forEach(s => byId.set(s.id, s));
      const merged = Array.from(byId.values());
      localStorage.setItem(key, JSON.stringify(merged));
      return merged;
    } catch (e) {
      console.warn('Could not fetch exam scores from Turso; using local cache:', e);
    }
  }
  return localScores;
}

// ============================================================================
// TEMPORAL AI CRITIQUE HISTORY (SYNCED TO TURSO & LOCALSTORAGE)
// ============================================================================

export const AI_CRITIQUES_KEY = 'adept_ielts_ai_critiques';

export async function saveCritiqueSnapshot(
  critique: any,
  profileId?: string
): Promise<void> {
  const pid = profileId || getActiveProfileId();
  if (!pid) return;

  try {
    const key = getScopedKey(AI_CRITIQUES_KEY, pid);
    const existing: any[] = JSON.parse(localStorage.getItem(key) || '[]');
    // Filter out duplicates with same id
    const filtered = existing.filter(c => c.id !== critique.id);
    filtered.push(critique);
    // Keep 30 most recent
    const capped = filtered.slice(-30);
    localStorage.setItem(key, JSON.stringify(capped));

    // Save to Turso LibSQL database
    await saveTursoCritiqueSnapshot(pid, critique);
  } catch (e) {
    console.error('Failed to save AI critique snapshot', e);
  }
}

export async function loadCritiqueHistory(profileId?: string): Promise<any[]> {
  const pid = profileId || getActiveProfileId();
  if (!pid) return [];

  const key = getScopedKey(AI_CRITIQUES_KEY, pid);
  let localList: any[] = [];
  try {
    localList = JSON.parse(localStorage.getItem(key) || '[]');
  } catch {}

  try {
    const remoteList = await loadTursoCritiqueHistory(pid);
    if (remoteList && remoteList.length > 0) {
      const byId = new Map<string, any>();
      [...localList, ...remoteList].forEach(c => byId.set(c.id, c));
      const merged = Array.from(byId.values()).sort(
        (a, b) => new Date(a.createdAt || a.timestamp).getTime() - new Date(b.createdAt || b.timestamp).getTime()
      );
      localStorage.setItem(key, JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    console.warn('Could not fetch critique history from Turso; using local cache:', e);
  }

  return localList;
}
