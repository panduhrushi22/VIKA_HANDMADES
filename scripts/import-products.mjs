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

async function importProducts() {
  console.log('Reading local products.json...');
  const productsData = await fs.readFile(path.join(__dirname, '..', 'data', 'products.json'), 'utf8');
  const products = JSON.parse(productsData);

  console.log(`Found ${products.length} products. Importing to Supabase...`);
  
  // Format products for Supabase schema
  const formattedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    stock: p.stock || 0,
    image: p.image,
    images: p.images || [],
    rating: p.rating || 5,
    sales: p.sales || 0,
    description: p.description || ''
  }));

  const { error } = await supabase
    .from('products')
    .upsert(formattedProducts);

  if (error) {
    console.error('Error importing products:', error);
  } else {
    console.log('SUCCESS! All products have been imported to Supabase.');
  }
}

importProducts();
