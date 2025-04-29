import { createClient } from '@supabase/supabase-js';

// These environment variables are available at build time
const supabaseUrl = 'https://ukttvscxyrvqbxcjkmbe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdHR2c3hjeXJ2cWJ4Y2prbWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NTI2NzEsImV4cCI6MjA2MTUyODY3MX0.olTcLPvMZJotq7Jkw5yKQsScK2hvWPKbJ0kQ3oe2axQ';

// Create a single supabase client for browser-side interactivity
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
