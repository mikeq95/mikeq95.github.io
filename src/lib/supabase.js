import { createClient } from '@supabase/supabase-js';

export const supabase = typeof window !== 'undefined'
  ? createClient(
      process.env.DOCUSAURUS_SUPABASE_URL,
      process.env.DOCUSAURUS_SUPABASE_ANON_KEY
    )
  : null;
