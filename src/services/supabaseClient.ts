import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Project credentials provided by user / environment
export const SUPABASE_PROJECT_ID = 'eogptoedqpduemcxrupp';
export const SUPABASE_DEFAULT_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_DEFAULT_ANON_KEY =
  'sb_publishable_QHm3jn2bWAaH9Wx-TlSjtA_88HX0Z1h';

// Read from Vite or Node environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch {}
  return defaultValue;
};

export const supabaseUrl: string = getEnvVar('VITE_SUPABASE_URL', SUPABASE_DEFAULT_URL);
export const supabaseAnonKey: string = getEnvVar('VITE_SUPABASE_ANON_KEY', SUPABASE_DEFAULT_ANON_KEY);

/**
 * Initialize and export the Supabase client instance for use across the application.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Helper to get the initialized Supabase client
 */
export function getSupabaseClient(): SupabaseClient {
  return supabase;
}

export interface SupabaseHealthStatus {
  connected: boolean;
  url: string;
  projectId: string;
  latencyMs?: number;
  error?: string;
  tablesAvailable?: {
    profiles: boolean;
    jobs: boolean;
    companies: boolean;
    resumes: boolean;
    matches: boolean;
  };
}

/**
 * Live test connection to Supabase instance
 */
export async function testSupabaseConnection(): Promise<SupabaseHealthStatus> {
  const startTime = Date.now();
  try {
    // Quick test query to verify API gateway responsiveness
    const { error } = await supabase.from('jobs').select('id').limit(1);
    const latency = Date.now() - startTime;

    // Check individual tables availability
    let profilesAvailable = false;
    let jobsAvailable = false;
    let companiesAvailable = false;
    let resumesAvailable = false;
    let matchesAvailable = false;

    try {
      const pCheck = await supabase.from('profiles').select('id').limit(1);
      profilesAvailable = !pCheck.error || pCheck.error.code === 'PGRST116';
    } catch {
      profilesAvailable = false;
    }

    try {
      const jCheck = await supabase.from('jobs').select('id').limit(1);
      jobsAvailable = !jCheck.error || jCheck.error.code === 'PGRST116';
    } catch {
      jobsAvailable = false;
    }

    try {
      const cCheck = await supabase.from('companies').select('id').limit(1);
      companiesAvailable = !cCheck.error || cCheck.error.code === 'PGRST116';
    } catch {
      companiesAvailable = false;
    }

    try {
      const rCheck = await supabase.from('resumes').select('id').limit(1);
      resumesAvailable = !rCheck.error || rCheck.error.code === 'PGRST116';
    } catch {
      resumesAvailable = false;
    }

    try {
      const mCheck = await supabase.from('matches').select('id').limit(1);
      matchesAvailable = !mCheck.error || mCheck.error.code === 'PGRST116';
    } catch {
      matchesAvailable = false;
    }

    // If query returned without network error, we are successfully connected to Supabase
    const isConnected =
      !error ||
      error.code === 'PGRST116' ||
      error.message?.includes('relation') ||
      error.code === '42P01';

    return {
      connected: isConnected,
      url: supabaseUrl,
      projectId: SUPABASE_PROJECT_ID,
      latencyMs: latency,
      error: error && !isConnected ? error.message : undefined,
      tablesAvailable: {
        profiles: profilesAvailable,
        jobs: jobsAvailable,
        companies: companiesAvailable,
        resumes: resumesAvailable,
        matches: matchesAvailable,
      },
    };
  } catch (err: any) {
    return {
      connected: false,
      url: supabaseUrl,
      projectId: SUPABASE_PROJECT_ID,
      error: err.message || 'Connection failed',
      latencyMs: Date.now() - startTime,
    };
  }
}

export default supabase;
