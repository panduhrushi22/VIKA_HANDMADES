import { NextResponse } from 'next/server';
import { loadCoupons } from '@/lib/coupons';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, cartTotal } = body;
    
    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }
    
    const coupons = await loadCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

    
    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
    }
    
    // Check expiry
    const expiry = coupon.expiry_date || coupon.expirydate || coupon.expiryDate;
    if (expiry && new Date(expiry) < new Date()) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
    }
    
    // Check min order amount
    const minAmount = coupon.min_order_value || coupon.minorderamount || coupon.minOrderAmount;
    if (minAmount && cartTotal < minAmount) {
      return NextResponse.json({ 
        error: `Minimum order amount for this coupon is ₹${minAmount}` 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      coupon: {
        code: coupon.code,
        type: coupon.discount_type || coupon.type,
        value: coupon.discount_value || coupon.value
      }
    });


  } catch (error) {
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
