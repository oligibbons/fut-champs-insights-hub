import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get the Supabase URL and anonymous key from environment variables for Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Throw an error during development if the environment variables are not set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anonymous key are required. Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

// Create and export the Supabase client
// import { supabase } from "@/integrations/supabase/client";
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
