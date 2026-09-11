import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys for runtime cloud database setup
export const SUPABASE_URL_KEY = 'adept_supabase_url';
export const SUPABASE_ANON_KEY = 'adept_supabase_anon_key';

export function getStoredSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof localStorage !== 'undefined' ? (localStorage.getItem(SUPABASE_URL_KEY) || '') : '';
  const storedKey = typeof localStorage !== 'undefined' ? (localStorage.getItem(SUPABASE_ANON_KEY) || '') : '';

  return {
    url: storedUrl || envUrl,
    anonKey: storedKey || envKey,
  };
}

let activeClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (activeClient) return activeClient;

  const { url, anonKey } = getStoredSupabaseCredentials();
  if (url && anonKey) {
    try {
      activeClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return activeClient;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  try {
    localStorage.setItem(SUPABASE_URL_KEY, url.trim());
    localStorage.setItem(SUPABASE_ANON_KEY, anonKey.trim());
    activeClient = null; // reset to re-instantiate on next get
  } catch (e) {
    console.error('Failed to save Supabase credentials', e);
  }
}

export function clearSupabaseCredentials(): void {
  try {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_ANON_KEY);
    activeClient = null;
  } catch (e) {
    console.error('Failed to clear Supabase credentials', e);
  }
}

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getStoredSupabaseCredentials();
  return Boolean(url && anonKey);
};

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase URL or Anon Key is missing.' };
  }
  try {
    const { error } = await client.from('learner_profiles').select('id').limit(1);
    if (error && !error.message.includes('permission denied')) {
      // If table doesn't exist yet or bad credentials
      return { success: false, message: `Connected to Supabase, but schema check noted: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected to online Supabase PostgreSQL database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}

export const supabase = getSupabaseClient();
