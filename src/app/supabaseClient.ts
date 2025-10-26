import { createClient } from '@supabase/supabase-js';
export const SUPABASE_URL = 'https://cuybrwexufiktrxivptc.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eWJyd2V4dWZpa3RyeGl2cHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NjU1OTgsImV4cCI6MjA3NjQ0MTU5OH0.heg5J0OMSUS68rIVivTg7tEk3Jpu89A_J799enr6ZD0';
// ---------------------------------------------
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
