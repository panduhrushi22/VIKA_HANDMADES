import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateCustomization, loadCustomizations } from '@/lib/customizations';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { feedback } = body;

    if (feedback !== 'like' && feedback !== 'dislike') {
      return NextResponse.json({ error: 'Invalid feedback value' }, { status: 400 });
    }

    // Verify ownership
    const customizations = await loadCustomizations();
    const item = customizations.find(c => c.id === id);
    
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    if (item.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = updateCustomization(id, { feedback });

    return NextResponse.json({ success: true, customization: updated });
  } catch (error: any) {
    console.error('Customization Feedback API Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
