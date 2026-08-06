import { createClient } from '@supabase/supabase-js';

const prodUrl = 'https://yyexmcaumkzxvhplipkl.supabase.co';
// Need the service role key to bypass RLS!
const prodKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_lASIBvmSjXthkgf4D__cLw_OpMrfeyb';
// Oh wait, I don't have the service role key! I only have the anon key.
