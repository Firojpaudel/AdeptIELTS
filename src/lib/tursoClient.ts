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
