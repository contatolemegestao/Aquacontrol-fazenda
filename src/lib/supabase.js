import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kntefppevhvbvsjwrhte.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudGVmcHBldmh2YnZzandyaHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDkwMDYsImV4cCI6MjEwMjQ4NTAwNn0.hOZXMht9dQnsxVof8okC8yGfdxmmtLOwn2vlfsJ9T4Y';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
