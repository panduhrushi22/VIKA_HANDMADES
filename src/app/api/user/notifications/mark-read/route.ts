import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { loadCustomizations, updateCustomization } from '@/lib/customizations';
import { loadMessages, updateMessage } from '@/lib/messages';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;
    const { type } = await request.json(); // 'customization' or 'message'

    if (type === 'customization') {
      const { markAllAsRead } = require('@/lib/customizations');
      markAllAsRead(userId);
    } else if (type === 'message') {
      const { markAllAsRead } = require('@/lib/messages');
      markAllAsRead(userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
