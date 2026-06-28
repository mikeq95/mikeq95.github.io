import { createClient } from '@supabase/supabase-js';

// Values come from SUPABASE_URL / SUPABASE_ANON_KEY in .env.local (injected at
// build time via webpack DefinePlugin). The anon key is intentionally public —
// it is safe to expose in client code; Row Level Security is the actual guard.
const url = process.env.SUPABASE_URL || 'https://ckdozgdygfpnbcfwhowj.supabase.co';
const anonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZG96Z2R5Z2ZwbmJjZndob3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NzA0NzIsImV4cCI6MjA5NTM0NjQ3Mn0.mLZkqooj_bjJF8nqnK6Sq6CKnMvF24xZ94pERB1YsJg';

export const supabase = typeof window !== 'undefined'
  ? createClient(url, anonKey)
  : null;
