import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://klzzdgqxahglnifuwgke.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQxNTgzN2FjLWZkM2QtNGJhZS04YTE4LWM1OWVkZTViMzgxZSJ9.eyJwcm9qZWN0SWQiOiJrbHp6ZGdxeGFoZ2xuaWZ1d2drZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg0NTAzNzgzLCJleHAiOjIwOTk4NjM3ODMsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.-E5LJCHH9pneroAOuCwd5B-iZFGyJDqS56Bk_fggF-k';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };