import { createClient } from '@supabase/supabase-js';
export const SUPABASE_URL = 'https://wlsrmnqcergxytefcmgv.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc3JtbnFjZXJneHl0ZWZjbWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDIwMzksImV4cCI6MjA3NjU3ODAzOX0.Lmt85wOORITcbc5_k71YhychT849eerofM1GHLOp7tk';
// ---------------------------------------------
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
