import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { saveOrder, generateOrderId, Order } from '@/lib/orders';
import { incrementCouponUsage } from '@/lib/coupons';
import { getProducts, updateProduct } from '@/lib/store';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      items, 
      subtotal, 
      deliveryFee, 
      discount, 
      couponCode, 
      total, 
      shippingDetails, 
      paymentMethod, 
      paymentStatus, 
      paymentScreenshot 
    } = body;

    // Backend Validation
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!shippingDetails || 
        !shippingDetails.name || 
        !shippingDetails.phone || 
        !shippingDetails.address || 
        !shippingDetails.area ||
        !shippingDetails.city || 
        !shippingDetails.state || 
        !shippingDetails.pincode) {
      return NextResponse.json({ error: 'Missing shipping details' }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 });
    }

    if (total === undefined || total < 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    const session = await getSession();
    const newOrder: any = {
      id: generateOrderId(),
      user_id: session?.userId || null,
      items,
      subtotal,
      delivery_fee: deliveryFee,
      discount,
      coupon_code: couponCode,
      total,
      shipping_details: shippingDetails,
      payment_method: paymentMethod,
      payment_status: paymentStatus || 'pending',
      payment_screenshot: paymentScreenshot || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };


    // Save the order
    await saveOrder(newOrder);

    // DECREASE STOCK AND INCREASE SALES
    try {
      const allProducts = await getProducts();
      for (const item of items) {
        const product = allProducts.find(p => p.id === item.id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          const newSales = (product.sales || 0) + item.quantity;
          await updateProduct(product.id, { 
            stock: newStock,
            sales: newSales
          });
          console.log(`[Inventory] Updated product ${product.id}: Stock ${product.stock} -> ${newStock}, Sales ${product.sales} -> ${newSales}`);
        }
      }
    } catch (invError) {
      console.error('Error updating inventory:', invError);
      // We don't want to fail the entire order if stock update fails, but we should log it
    }

    // If a coupon was used, increment its usage count
    if (couponCode) {
      await incrementCouponUsage(couponCode);
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error('Error in orders API:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { loadOrders } = require('@/lib/orders');
  const allOrders = await loadOrders();
  
  // Normalize DB column names so the frontend can read them
  const normalize = (o: any) => ({
    ...o,
    // Map concatenated lowercase DB names to what the UI expects
    created_at: o.created_at || o.createdat || o.createdAt,
    shipping_details: o.shipping_details || o.shippingdetails || o.shippingDetails,
    delivery_fee: o.delivery_fee || o.deliveryfee || o.deliveryFee || 0,
    payment_method: o.payment_method || o.paymentmethod || o.paymentMethod,
    payment_status: o.payment_status || o.paymentstatus || o.paymentStatus,
    payment_screenshot: o.payment_screenshot || o.paymentscreenshot || o.paymentScreenshot,
    coupon_code: o.coupon_code || o.couponcode || o.couponCode,
  });

  const normalized = allOrders.map(normalize);

  // If admin, show all orders
  if (session.role === 'ADMIN') {
    return NextResponse.json(normalized);
  }

  // Otherwise, filter by userId
  const userOrders = normalized.filter((o: any) => o.user_id === session.userId);
  return NextResponse.json(userOrders);
}



