import { createClient } from '@supabase/supabase-js';

const prodUrl = 'https://yyexmcaumkzxvhplipkl.supabase.co';
const prodKey = 'sb_publishable_lASIBvmSjXthkgf4D__cLw_OpMrfeyb';
const supabase = createClient(prodUrl, prodKey);

async function run() {
  const email = `dummy_${Date.now()}@gmail.com`;
  await supabase.auth.signUp({
    email,
    password: 'password123',
    options: { data: { name: 'Dummy' } }
  });
  console.log('Signed up', email);
  // Now I will run a migration to copy the encrypted_password from dummy to the others!
}
run();
