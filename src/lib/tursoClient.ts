import { createClient, Client } from '@libsql/client/web';

export const TURSO_URL_KEY = 'adept_turso_db_url';
export const TURSO_TOKEN_KEY = 'adept_turso_auth_token';

export const DEFAULT_TURSO_URL = 'libsql://adeptielts-fp-ielts.aws-ap-south-1.turso.io';
export const DEFAULT_TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkxNDU4MDEsImlkIjoiMDFhMDkxNjUtYjYwMS03YzljLTg1MjItNGY3OTk2Y2M4ZTcwIiwia2lkIjoiN0p6b0ZycmlkdFI5T3RDUldPSDFvRS1STkFNWGE0S0hCSGhEcFhHZmlPayIsInJpZCI6IjQ5ZWEyODQyLTIyNWQtNDdkYi1iYzEwLWJmOWFhMDI2NGFlNiJ9.YuGTJN4ty4GEb390YE_1TpQTLSPzmHb7m8sgXrOWyfA_A5KunaLK4uWFGwQ1V4dzBx53hCim4Rg2WsjFqN6kCw';

export function getStoredTursoCredentials(): { url: string; authToken: string } {
  const envUrl = (import.meta as any).env?.VITE_TURSO_DB_URL || '';
  const envToken = (import.meta as any).env?.VITE_TURSO_AUTH_TOKEN || '';

  const storedUrl = typeof localStorage !== 'undefined' ? (localStorage.getItem(TURSO_URL_KEY) || '') : '';
  const storedToken = typeof localStorage !== 'undefined' ? (localStorage.getItem(TURSO_TOKEN_KEY) || '') : '';

  return {
    url: envUrl || storedUrl || DEFAULT_TURSO_URL,
    authToken: envToken || storedToken || DEFAULT_TURSO_TOKEN,
  };
}

let activeTursoClient: Client | null = null;
let schemaEnsured = false;

export function getTursoClient(): Client | null {
  if (activeTursoClient) return activeTursoClient;

  const { url, authToken } = getStoredTursoCredentials();
  if (url && authToken) {
    try {
      activeTursoClient = createClient({
        url: url.trim(),
        authToken: authToken.trim(),
      });
      if (!schemaEnsured) {
        ensureTursoSchema().catch(() => {});
      }
      return activeTursoClient;
    } catch (e) {
      console.error('Failed to initialize Turso client:', e);
      return null;
    }
  }
  return null;
}

export async function ensureTursoSchema(): Promise<void> {
  if (schemaEnsured) return;
  const client = activeTursoClient;
  if (!client) return;
  try {
    await testTursoConnection();
    schemaEnsured = true;
  } catch (e) {
    console.warn('Auto Turso schema note:', e);
  }
}

export function saveTursoCredentials(url: string, authToken: string): void {
  try {
    localStorage.setItem(TURSO_URL_KEY, url.trim());
    localStorage.setItem(TURSO_TOKEN_KEY, authToken.trim());
    activeTursoClient = null; // force re-instantiation
  } catch (e) {
    console.error('Failed to save Turso credentials', e);
  }
}

export function clearTursoCredentials(): void {
  try {
    localStorage.removeItem(TURSO_URL_KEY);
    localStorage.removeItem(TURSO_TOKEN_KEY);
    activeTursoClient = null;
  } catch (e) {
    console.error('Failed to clear Turso credentials', e);
  }
}

export const isTursoConfigured = (): boolean => {
  const { url, authToken } = getStoredTursoCredentials();
  return Boolean(url && authToken);
};

export async function testTursoConnection(): Promise<{ success: boolean; message: string }> {
  const client = getTursoClient();
  if (!client) {
    return { success: false, message: 'Turso Database URL or Auth Token is missing.' };
  }

  try {
    // 1. Verify connection
    await client.execute('SELECT 1;');

    // 2. Automatically provision tables if not present
    await client.batch([
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password_hash TEXT,
        display_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY,
        ai_provider TEXT,
        api_key TEXT,
        worker_url TEXT,
        token_saving_mode INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS learner_profiles (
        id TEXT PRIMARY KEY,
        display_name TEXT,
        target_band REAL,
        current_estimated_band REAL,
        test_type TEXT,
        exam_date TEXT,
        available_daily_minutes INTEGER,
        skill_bands TEXT,
        subskill_mastery TEXT,
        streak INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS question_attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        question_id TEXT,
        skill TEXT,
        subskill TEXT,
        user_answer TEXT,
        is_correct INTEGER,
        time_spent_seconds INTEGER,
        confidence_rating TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS writing_submissions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        task_type TEXT,
        prompt_title TEXT,
        prompt_text TEXT,
        essay_text TEXT,
        word_count INTEGER,
        time_spent_seconds INTEGER,
        feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS speaking_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        part INTEGER,
        topic TEXT,
        prompt TEXT,
        bullet_points TEXT,
        transcript TEXT,
        duration_seconds INTEGER,
        feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS vocabulary_cards (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        word TEXT,
        repetitions INTEGER,
        interval_days INTEGER,
        next_review_date TEXT,
        last_reviewed TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS reading_history (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        resource_id TEXT,
        resource_type TEXT,
        title TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, resource_id)
      );`,
      `CREATE TABLE IF NOT EXISTS exam_scores (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        exam_type TEXT,
        overall_band REAL,
        reading_band REAL,
        writing_band REAL,
        listening_band REAL,
        speaking_band REAL,
        raw_score INTEGER,
        total_questions INTEGER,
        time_spent_seconds INTEGER,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    ], 'write');

    return {
      success: true,
      message: 'Connected to Turso LibSQL edge database! 9 GB online storage & tables provisioned.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to connect to Turso database. Please verify URL and Auth Token.',
    };
  }
}

// -------------------------------------------------------------
// Authentication & User Data Hydration via Turso
// -------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function registerTursoAccount(
  email: string,
  pass: string,
  displayName: string,
  targetBand: number = 7.5,
  testType: 'academic' | 'general' = 'academic'
): Promise<{ success: boolean; error?: string; profile?: any; userId?: string }> {
  const client = getTursoClient();
  if (!client) {
    return { success: false, error: 'Turso database is not connected.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = displayName.trim();

  try {
    // 1. Check if email exists
    const checkRes = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ? LIMIT 1;',
      args: [cleanEmail],
    });

    if (checkRes.rows.length > 0) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    // 2. Hash password
    const passwordHash = await hashPassword(pass);
    const userId = `user-${Date.now()}`;

    // 3. Create user & profile in atomic batch
    const profile = {
      id: userId,
      displayName: cleanName,
      avatar: cleanName.slice(0, 2).toUpperCase(),
      targetBand,
      currentEstimatedBand: 5.5,
      testType,
      examDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availableDailyMinutes: 45,
      skillBands: { reading: 5.5, listening: 6.0, writing: 5.0, speaking: 5.5 },
      subskillMastery: {},
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      totalStudyMinutes: 0,
      onboardingCompleted: true,
    };

    await client.batch([
      {
        sql: 'INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?);',
        args: [userId, cleanEmail, passwordHash, cleanName],
      },
      {
        sql: `INSERT INTO learner_profiles (
          id, display_name, target_band, current_estimated_band, test_type, exam_date, available_daily_minutes, skill_bands, subskill_mastery, streak
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          userId,
          cleanName,
          targetBand,
          5.5,
          testType,
          profile.examDate,
          45,
          JSON.stringify(profile.skillBands),
          JSON.stringify({}),
          0,
        ],
      }
    ], 'write');

    return { success: true, userId, profile };
  } catch (err: any) {
    console.error('Turso registration error', err);
    return { success: false, error: err?.message || 'Registration failed on database.' };
  }
}

export async function loginTursoAccount(
  email: string,
  pass: string
): Promise<{ success: boolean; error?: string; profile?: any; userId?: string }> {
  const client = getTursoClient();
  if (!client) {
    return { success: false, error: 'Turso database is not connected.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const passwordHash = await hashPassword(pass);

    const userRes = await client.execute({
      sql: 'SELECT id, email, password_hash, display_name FROM users WHERE email = ? LIMIT 1;',
      args: [cleanEmail],
    });

    if (userRes.rows.length === 0) {
      return { success: false, error: 'No account found with this email address.' };
    }

    const userRow = userRes.rows[0];
    if (userRow.password_hash !== passwordHash) {
      return { success: false, error: 'Incorrect password entered.' };
    }

    const userId = String(userRow.id);

    // Fetch corresponding profile
    const profileRes = await client.execute({
      sql: 'SELECT * FROM learner_profiles WHERE id = ? LIMIT 1;',
      args: [userId],
    });

    let profile: any = null;
    if (profileRes.rows.length > 0) {
      const p = profileRes.rows[0];
      profile = {
        id: String(p.id),
        displayName: String(p.display_name || userRow.display_name),
        avatar: String(p.display_name || userRow.display_name).slice(0, 2).toUpperCase(),
        targetBand: Number(p.target_band) || 7.5,
        currentEstimatedBand: Number(p.current_estimated_band) || 5.5,
        testType: (p.test_type as any) || 'academic',
        examDate: String(p.exam_date || ''),
        availableDailyMinutes: Number(p.available_daily_minutes) || 45,
        skillBands: typeof p.skill_bands === 'string' ? JSON.parse(p.skill_bands) : { reading: 5.5, listening: 6.0, writing: 5.0, speaking: 5.5 },
        subskillMastery: typeof p.subskill_mastery === 'string' ? JSON.parse(p.subskill_mastery) : {},
        streak: Number(p.streak) || 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        totalStudyMinutes: 0,
        onboardingCompleted: true,
      };
    } else {
      profile = {
        id: userId,
        displayName: String(userRow.display_name),
        avatar: String(userRow.display_name).slice(0, 2).toUpperCase(),
        targetBand: 7.5,
        currentEstimatedBand: 5.5,
        testType: 'academic',
        examDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availableDailyMinutes: 45,
        skillBands: { reading: 5.5, listening: 6.0, writing: 5.0, speaking: 5.5 },
        subskillMastery: {},
        streak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        totalStudyMinutes: 0,
        onboardingCompleted: true,
      };
    }

    return { success: true, userId, profile };
  } catch (err: any) {
    console.error('Turso login error', err);
    return { success: false, error: err?.message || 'Login failed.' };
  }
}

export async function saveTursoUserSettings(
  userId: string,
  settings: { provider: string; apiKey?: string; workerUrl?: string; tokenSavingMode?: boolean }
): Promise<void> {
  const client = getTursoClient();
  if (!client || !userId) return;

  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO user_settings (
        user_id, ai_provider, api_key, worker_url, token_saving_mode, updated_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
      args: [
        userId,
        settings.provider || 'groq',
        settings.apiKey || '',
        settings.workerUrl || '',
        settings.tokenSavingMode ? 1 : 0,
      ],
    });
  } catch (err) {
    console.warn('Turso user_settings sync error', err);
  }
}

export async function loadTursoUserSettings(userId: string): Promise<any | null> {
  const client = getTursoClient();
  if (!client || !userId) return null;

  try {
    const res = await client.execute({
      sql: 'SELECT ai_provider, api_key, worker_url, token_saving_mode FROM user_settings WHERE user_id = ? LIMIT 1;',
      args: [userId],
    });

    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        provider: row.ai_provider,
        apiKey: row.api_key || '',
        workerUrl: row.worker_url || '',
        tokenSavingMode: Boolean(row.token_saving_mode),
      };
    }
    return null;
  } catch (err) {
    console.warn('Turso load user_settings error', err);
    return null;
  }
}

export async function fetchUserCompleteDataFromTurso(userId: string): Promise<{
  attempts: any[];
  writings: any[];
  speakings: any[];
  scores: any[];
  settings: any | null;
}> {
  const client = getTursoClient();
  if (!client || !userId) {
    return { attempts: [], writings: [], speakings: [], scores: [], settings: null };
  }

  try {
    const [attemptsRes, writingsRes, speakingsRes, scoresRes, settingsRes] = await Promise.all([
      client.execute({ sql: 'SELECT * FROM question_attempts WHERE user_id = ? ORDER BY created_at ASC;', args: [userId] }),
      client.execute({ sql: 'SELECT * FROM writing_submissions WHERE user_id = ? ORDER BY created_at ASC;', args: [userId] }),
      client.execute({ sql: 'SELECT * FROM speaking_sessions WHERE user_id = ? ORDER BY created_at ASC;', args: [userId] }),
      client.execute({ sql: 'SELECT * FROM exam_scores WHERE user_id = ? ORDER BY created_at ASC;', args: [userId] }),
      client.execute({ sql: 'SELECT * FROM user_settings WHERE user_id = ? LIMIT 1;', args: [userId] }),
    ]);

    const attempts = attemptsRes.rows.map(r => ({
      id: String(r.id),
      questionId: String(r.question_id),
      skill: String(r.skill) as any,
      subskill: String(r.subskill),
      userAnswer: String(r.user_answer),
      isCorrect: Boolean(r.is_correct),
      timeSpentSeconds: Number(r.time_spent_seconds) || 45,
      confidenceRating: (r.confidence_rating as any) || 'medium',
      timestamp: String(r.created_at),
    }));

    const writings = writingsRes.rows.map(r => ({
      id: String(r.id),
      taskType: (r.task_type as any) || 'task2',
      promptTitle: String(r.prompt_title || ''),
      promptText: String(r.prompt_text || ''),
      essayText: String(r.essay_text || ''),
      wordCount: Number(r.word_count) || 0,
      timeSpentSeconds: Number(r.time_spent_seconds) || 1200,
      timestamp: String(r.created_at),
      feedback: r.feedback ? (typeof r.feedback === 'string' ? JSON.parse(r.feedback) : r.feedback) : undefined,
    }));

    const speakings = speakingsRes.rows.map(r => ({
      id: String(r.id),
      part: Number(r.part) || 1,
      topic: String(r.topic || ''),
      prompt: String(r.prompt || ''),
      bulletPoints: r.bullet_points ? (typeof r.bullet_points === 'string' ? JSON.parse(r.bullet_points) : r.bullet_points) : undefined,
      transcript: String(r.transcript || ''),
      durationSeconds: Number(r.duration_seconds) || 60,
      timestamp: String(r.created_at),
      feedback: r.feedback ? (typeof r.feedback === 'string' ? JSON.parse(r.feedback) : r.feedback) : undefined,
    }));

    const scores = scoresRes.rows.map(r => ({
      id: String(r.id),
      userId: String(r.user_id),
      examType: (r.exam_type as any) || 'academic',
      overallBand: Number(r.overall_band) || 6.5,
      readingBand: Number(r.reading_band) || 6.5,
      writingBand: Number(r.writing_band) || 6.5,
      listeningBand: Number(r.listening_band) || 6.5,
      speakingBand: Number(r.speaking_band) || 6.5,
      rawScore: Number(r.raw_score) || 0,
      totalQuestions: Number(r.total_questions) || 40,
      timeSpentSeconds: Number(r.time_spent_seconds) || 3600,
      details: r.details ? (typeof r.details === 'string' ? JSON.parse(r.details) : r.details) : undefined,
      createdAt: String(r.created_at),
    }));

    let settings = null;
    if (settingsRes.rows.length > 0) {
      const s = settingsRes.rows[0];
      settings = {
        provider: s.ai_provider,
        apiKey: s.api_key || '',
        workerUrl: s.worker_url || '',
        tokenSavingMode: Boolean(s.token_saving_mode),
      };
    }

    return { attempts, writings, speakings, scores, settings };
  } catch (err) {
    console.error('Failed to fetch user complete data from Turso', err);
    return { attempts: [], writings: [], speakings: [], scores: [], settings: null };
  }
}
