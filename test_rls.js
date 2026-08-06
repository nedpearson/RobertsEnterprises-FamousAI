import { createClient } from '@supabase/supabase-js';

const prodUrl = 'https://yyexmcaumkzxvhplipkl.supabase.co';
const prodKey = 'sb_publishable_lASIBvmSjXthkgf4D__cLw_OpMrfeyb';
const supabase = createClient(prodUrl, prodKey);

async function test() {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'demo123@gmail.com',
    password: 'password123'
  });
  if (authError) {
    console.error('Auth Error:', authError.message);
    return;
  }
  
  const { data, error } = await supabase.from('customers').select('*');
  if (error) {
    console.error('Data Error:', error);
  } else {
    console.log(`Found ${data.length} customers.`);
  }

  const { data: bData, error: bError } = await supabase.from('business_memberships').select('*');
  if (bError) {
    console.error('Membership Error:', bError);
  } else {
    console.log(`Found ${bData.length} memberships for user.`);
  }
}
test();
