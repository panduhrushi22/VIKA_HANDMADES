import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
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

async function importData() {
  const dataFiles = [
    { name: 'orders', table: 'orders' },
    { name: 'coupons', table: 'coupons' },
    { name: 'messages', table: 'messages' },
    { name: 'customizations', table: 'customizations' },
    { name: 'settings', table: 'settings', single: true }
  ];

  for (const file of dataFiles) {
    try {
      console.log(`Reading local ${file.name}.json...`);
      const rawData = await fs.readFile(path.join(__dirname, '..', 'data', `${file.name}.json`), 'utf8');
      const data = JSON.parse(rawData);

      if (file.single) {
         // Settings is usually an object, not an array
         const { error } = await supabase.from(file.table).upsert([{ id: 'default', ...data }]);
         if (error) console.error(`Error importing ${file.name}:`, error);
      } else {
         console.log(`Found ${data.length} items. Importing to ${file.table}...`);
         const { error } = await supabase.from(file.table).upsert(data);
         if (error) console.error(`Error importing ${file.name}:`, error);
      }
    } catch (err) {
      console.log(`No local ${file.name}.json found or error reading it. Skipping.`);
    }
  }
  
  console.log('FINAL SYNC COMPLETE.');
}

importData();
