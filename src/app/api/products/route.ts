import { NextResponse } from 'next/server';
import { getProducts, addProduct } from '@/lib/store';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const stock = parseInt(formData.get('stock') as string);
    const imageFiles = formData.getAll('images') as File[];
    let fallbackImage = formData.get('fallbackImage') as string | null;

    let imageUrls: string[] = [];
    const uploadDir = path.join(process.cwd(), 'public', 'images');
    
    // Ensure directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    for (const file of imageFiles) {
      if (file && file.name) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.name) || '.jpg';
        const filename = `upload-${uniqueSuffix}${ext}`;
        
        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);
        
        imageUrls.push(`/images/${filename}`);
      }
    }

    // If no files uploaded, use fallback
    if (imageUrls.length === 0 && fallbackImage) {
      imageUrls.push(fallbackImage);
    } else if (imageUrls.length === 0) {
      imageUrls.push('/images/hero-bg.jpg');
    }

    const newProduct = await addProduct({
      name,
      price,
      category,
      stock,
      image: imageUrls[0], // First image is the primary one
      images: imageUrls,
      rating: 5,
      sales: 0
    });

    revalidatePath('/products');
    revalidatePath('/api/products');

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
