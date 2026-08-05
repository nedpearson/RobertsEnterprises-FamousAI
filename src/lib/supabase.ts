import { createClient } from '@supabase/supabase-js';

// Initialize database clients
const prodUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yyexmcaumkzxvhplipkl.supabase.co';
const prodKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQxNTgzN2FjLWZkM2QtNGJhZS04YTE4LWM1OWVkZTViMzgxZSJ9.eyJwcm9qZWN0SWQiOiJrbHp6ZGdxeGFoZ2xuaWZ1d2drZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg0NTAzNzgzLCJleHAiOjIwOTk4NjM3ODMsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.-E5LJCHH9pneroAOuCwd5B-iZFGyJDqS56Bk_fggF-k';

const demoUrl = import.meta.env.VITE_DEMO_SUPABASE_URL || 'https://demo-klzzdgqxahglnifuwgke.databasepad.com';
const demoKey = import.meta.env.VITE_DEMO_SUPABASE_ANON_KEY || 'dummy_demo_key';

export const productionSupabase = createClient(prodUrl, prodKey);
export const demoSupabase = createClient(demoUrl, demoKey);

let activeDataPlane: 'production' | 'demo' = (localStorage.getItem('vowos_data_plane') as 'production' | 'demo') || 'production';

export function setActiveDataPlane(plane: 'production' | 'demo') {
  activeDataPlane = plane;
  localStorage.setItem('vowos_data_plane', plane);
}

export function getActiveDataPlane() {
  return activeDataPlane;
}

// Create a Proxy so existing imports of `supabase` automatically route to the correct client
const supabase = new Proxy(productionSupabase, {
  get(target, prop, receiver) {
    const activeClient = activeDataPlane === 'demo' ? demoSupabase : productionSupabase;
    const value = Reflect.get(activeClient, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(activeClient);
    }
    return value;
  }
});

export { supabase };