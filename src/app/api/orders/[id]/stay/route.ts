import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { formatPhone } from '@/lib/users';
import { sendEmail } from '@/lib/email';
import { loadOrders } from '@/lib/orders';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = await params;
    const orders = await loadOrders();
    const order = orders.find(o => o.id === orderId);


    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Notify Admin via Email
    try {
      const adminEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.GMAIL_USER || 'vikahandmades@gmail.com';
      const customerName = order.shipping_details?.name || 'Customer';
      const customerPhone = order.shipping_details?.phone || 'N/A';
      const orderTotal = order.total || 0;

      await sendEmail(
        adminEmail,
        `ℹ️ Order Stayed: ${orderId}`,
        `Customer ${customerName} considered cancelling order ${orderId} but decided to keep it.`,
        `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #EEE; border-radius: 12px; max-width: 500px;">
          <h2 style="color: #2e7d32; margin-top: 0;">ℹ️ Order Stayed</h2>
          <p>A customer considered cancelling their order but decided to stay/keep it.</p>
          <hr style="border: 0; border-top: 1px solid #EEE; margin: 20px 0;" />
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Phone:</strong> ${formatPhone(customerPhone)}</p>
          <p><strong>Total Amount:</strong> ₹${orderTotal.toLocaleString('en-IN')}</p>
          <div style="margin-top: 25px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/orders" 
               style="background: #2e7d32; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View in Admin Panel
            </a>
          </div>
        </div>`
      );
      console.log(`[AUTH] Admin notified that order ${orderId} was stayed`);
    } catch (emailError) {
      console.error('[AUTH] Failed to notify admin of stayed order:', emailError);
    }

    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Stay Order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process stay order' }, { status: 500 });
  }
}
