import { createClient } from '@supabase/supabase-js';

export const supabase = typeof window !== 'undefined'
  ? createClient(
      'https://ckdozgdygfpnbcfwhowj.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZG96Z2R5Z2ZwbmJjZndob3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NzA0NzIsImV4cCI6MjA5NTM0NjQ3Mn0.mLZkqooj_bjJF8nqnK6Sq6CKnMvF24xZ94pERB1YsJg'
    )
  : null;
