import { NextResponse } from 'next/server';
import { deleteProduct, updateProduct, getProducts } from '@/lib/store';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';
    let updates: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      if (formData.has('price')) updates.price = parseFloat(formData.get('price') as string);
      if (formData.has('stock')) updates.stock = parseInt(formData.get('stock') as string);
      if (formData.has('name')) updates.name = formData.get('name') as string;
      if (formData.has('category')) updates.category = formData.get('category') as string;

      const newImageFiles = formData.getAll('images') as File[];
      if (newImageFiles.length > 0) {
        const uploadDir = path.join(process.cwd(), 'public', 'images');
        try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }

        const imageUrls: string[] = [];
        for (const file of newImageFiles) {
          if (file && file.name) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name) || '.jpg'}`;
            await fs.writeFile(path.join(uploadDir, filename), buffer);
            imageUrls.push(`/images/${filename}`);
          }
        }

        const products = await getProducts();
        const product = products.find(p => p.id === id);
        if (product) {
          updates.images = [...(product.images || []), ...imageUrls];
          if (!product.image) updates.image = imageUrls[0];
        }
      }
    } else {
      updates = await request.json();
    }

    const updated = await updateProduct(id, updates);
    if (updated) return NextResponse.json(updated);
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
