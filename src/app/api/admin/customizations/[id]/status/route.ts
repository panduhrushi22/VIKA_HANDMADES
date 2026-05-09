import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateCustomization } from '@/lib/customizations';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'reviewed', 'completed', 'rejected', 'approved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await updateCustomization(id, { status });


    return NextResponse.json({ success: true, customization: updated });
  } catch (error: any) {
    console.error('Customization Status Update Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
