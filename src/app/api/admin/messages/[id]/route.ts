import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { deleteMessage, updateMessage } from '@/lib/messages';

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
    await deleteMessage(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Message Delete Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

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
    const { adminReply } = await request.json();

    if (!adminReply) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
    }

    const updated = await updateMessage(id, { 
      adminReply, 
      repliedAt: new Date().toISOString(),
      isReadByUser: false
    });

    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: updated });
  } catch (error: any) {
    console.error('Message Reply Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
