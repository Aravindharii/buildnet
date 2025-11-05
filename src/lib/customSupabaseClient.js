import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ykivhkrlphmkxncgaaew.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraXZoa3JscGhta3huY2dhYWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzUwMDIsImV4cCI6MjA3NTc1MTAwMn0.5h7G09d30JJoNtgVVsdttKXQ0JhGidpHdsvN8ndbg0E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);