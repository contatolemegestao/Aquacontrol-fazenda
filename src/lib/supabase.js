import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kntefppevhvbvsjwrhte.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudGVmcHBldmh2YnZzandyaHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDkwMDYsImV4cCI6MjEwMjQ4NTAwNn0.hOZXMht9dQnsxVof8okC8yGfdxmmtLOwn2vlfsJ9T4Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
