import { NextResponse } from 'next/server';
import { updateCustomization } from '@/lib/customizations';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { adminReply } = await request.json();

    if (!adminReply) {
      return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
    }

    const updated = await updateCustomization(id, {
      adminReply,
      repliedAt: new Date().toISOString(),
      isReadByUser: false
    });


    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating customization reply:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
