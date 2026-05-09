import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { updateCustomization } from '@/lib/customizations';
import { getSession } from '@/lib/auth';
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

    const { id: customizationId } = await params;
    const updated = await updateCustomization(customizationId, { status: 'cancelled' });


    // Notify Admin via Email
    try {
      const adminEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.GMAIL_USER || 'vikahandmades@gmail.com';
      await sendEmail(
        adminEmail,
        `⚠️ Customization Cancelled: ${customizationId}`,
        `Customization ${customizationId} has been cancelled by the user.`,
        `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #EEE; border-radius: 12px; max-width: 500px;">
          <h2 style="color: #c53030; margin-top: 0;">⚠️ Customization Cancelled</h2>
          <p>A customization request has been cancelled by the customer.</p>
          <hr style="border: 0; border-top: 1px solid #EEE; margin: 20px 0;" />
          <p><strong>Request ID:</strong> ${customizationId}</p>
          <div style="margin-top: 25px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/customizations" 
               style="background: #FF9A9E; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View in Admin Panel
            </a>
          </div>
        </div>`
      );
    } catch (emailError) {
      console.error('[AUTH] Failed to notify admin of cancellation:', emailError);
    }
    
    return NextResponse.json({ success: true, customization: updated });
  } catch (error: any) {
    console.error('Cancel Customization error:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel customization' }, { status: 500 });
  }
}
