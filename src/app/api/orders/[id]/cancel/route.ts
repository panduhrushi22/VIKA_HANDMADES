import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { updateOrder } from '@/lib/orders';
import { getSession } from '@/lib/auth';
import { formatPhone } from '@/lib/users';
import { sendEmail } from '@/lib/email';

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
    const updatedOrder = await updateOrder(orderId, { status: 'cancelled' });

    // Notify Admin via Email
    try {
      const adminEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.GMAIL_USER || 'vikahandmades@gmail.com';
      const customerName = updatedOrder.shipping_details?.name || updatedOrder.shippingdetails?.name || updatedOrder.shippingDetails?.name || 'Customer';
      const customerPhone = updatedOrder.shipping_details?.phone || updatedOrder.shippingdetails?.phone || updatedOrder.shippingDetails?.phone || 'N/A';
      const orderTotal = updatedOrder.total || 0;

      await sendEmail(
        adminEmail,
        `⚠️ Order Cancelled: ${orderId}`,
        `Order ${orderId} has been cancelled by the user (${customerName}).`,
        `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #EEE; border-radius: 12px; max-width: 500px;">
          <h2 style="color: #c53030; margin-top: 0;">⚠️ Order Cancelled</h2>
          <p>An order has been cancelled by the customer.</p>
          <hr style="border: 0; border-top: 1px solid #EEE; margin: 20px 0;" />
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Phone:</strong> ${formatPhone(customerPhone)}</p>
          <p><strong>Total Amount:</strong> ₹${orderTotal.toLocaleString('en-IN')}</p>
          <div style="margin-top: 25px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/orders" 
               style="background: #FF9A9E; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View in Admin Panel
            </a>
          </div>
        </div>`
      );
      console.log(`[AUTH] Admin notified of cancellation for order ${orderId}`);

    } catch (emailError) {
      console.error('[AUTH] Failed to notify admin of cancellation:', emailError);
      // We don't fail the request if email fails, as the order is already cancelled in DB
    }
    
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Cancel Order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel order' }, { status: 500 });
  }
}
