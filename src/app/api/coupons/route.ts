import { NextResponse } from 'next/server';
import { loadCoupons, addCoupon, deleteCoupon } from '@/lib/coupons';

export async function GET() {
  const coupons = await loadCoupons();
  return NextResponse.json(coupons);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, type, value, minOrderAmount, expiryDate, usageLimit } = body;
    
    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if coupon already exists
    const coupons = await loadCoupons();
    if (coupons.some(c => c.code.toUpperCase() === code.toUpperCase())) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const newCoupon = await addCoupon({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
      expiryDate,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
    });
    
    return NextResponse.json(newCoupon);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('code');
    if (!id) return NextResponse.json({ error: 'ID or Code required' }, { status: 400 });
    
    await deleteCoupon(id);
    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, expiryDate } = body;
    
    if (!id || !expiryDate) {
      return NextResponse.json({ error: 'ID and expiry date are required' }, { status: 400 });
    }
    
    const { updateCouponExpiry } = await import('@/lib/coupons');
    const success = await updateCouponExpiry(id, expiryDate);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}
