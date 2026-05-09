import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function fixDatabase() {
  console.log('Inserting admin user...');
  const { data, error } = await supabase
    .from('users')
    .upsert([
      {
        id: 'h10j1dd7n',
        role: 'ADMIN',
        phone: '8555936477',
        password: '$2b$10$C8Bb4PLatLj3bipkHWP7.OF9Z0MdRuZ0ebQ4hD3cSjAhGNmNpgGFW',
        name: 'Hrushi',
        email: 'vikahandmades@gmail.com',
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error('Final attempt failed:', error);
    if (error.code === 'PGRST204' || error.code === 'PGRST205') {
       console.log('CRITICAL: The users table is still missing. Please run the SQL in your dashboard.');
    }
  } else {
    console.log('SUCCESS! Admin account is now live in your database.');
  }
}


fixDatabase();
