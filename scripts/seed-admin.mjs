import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  },
  realtime: {
    transport: ws
  }
});


async function seedAdmin() {
  console.log('Seeding admin user...');
  const { error } = await supabase
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
    console.error('Error seeding admin:', error);
  } else {
    console.log('Admin user seeded successfully!');
  }
}

seedAdmin();
