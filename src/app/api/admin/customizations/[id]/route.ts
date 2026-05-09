import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { deleteCustomization } from '@/lib/customizations';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await deleteCustomization(id);


    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Customization Delete Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
