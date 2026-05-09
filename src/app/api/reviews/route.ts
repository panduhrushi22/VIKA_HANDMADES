import { NextResponse } from 'next/server';
import { getProducts, updateProduct, Review } from '@/lib/store';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const { productId, userName, rating, comment } = await request.json();

    if (!productId || !userName || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const products = await getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      userName,
      rating: Number(rating),
      comment,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    const updatedReviews = [...(product.reviews || []), newReview];
    
    // Calculate new average rating
    const totalRating = updatedReviews.reduce((acc, rev) => acc + rev.rating, 0);
    const newAverageRating = Math.round(totalRating / updatedReviews.length);

    await updateProduct(productId, {
      reviews: updatedReviews,
      rating: newAverageRating
    });

    revalidatePath(`/product/${productId}`);
    revalidatePath('/api/products');

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const reviewId = searchParams.get('reviewId');

    if (!productId || !reviewId) {
      return NextResponse.json({ error: 'Missing productId or reviewId' }, { status: 400 });
    }

    const products = await getProducts();
    const product = products.find(p => p.id === productId);

    if (!product || !product.reviews) {
      return NextResponse.json({ error: 'Product or reviews not found' }, { status: 404 });
    }

    const updatedReviews = product.reviews.filter(r => r.id !== reviewId);
    
    // Recalculate rating
    let newAverageRating = 5;
    if (updatedReviews.length > 0) {
      const totalRating = updatedReviews.reduce((acc, rev) => acc + rev.rating, 0);
      newAverageRating = Math.round(totalRating / updatedReviews.length);
    }

    await updateProduct(productId, {
      reviews: updatedReviews,
      rating: newAverageRating
    });


    revalidatePath(`/product/${productId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
