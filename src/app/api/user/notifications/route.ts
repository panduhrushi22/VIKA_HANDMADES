import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { loadCustomizations } from '@/lib/customizations';
import { loadMessages } from '@/lib/messages';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ count: 0 });
    }

    const userId = session.userId;
    
    const allCustomizations = await loadCustomizations();
    const allMessages = await loadMessages();

    const unreadCustomizations = allCustomizations.filter(
      c => c.userId === userId && c.adminReply && c.isReadByUser === false
    ).length;

    const unreadMessages = allMessages.filter(
      m => m.userId === userId && m.adminReply && m.isReadByUser === false
    ).length;

    return NextResponse.json({ 
      count: unreadCustomizations + unreadMessages,
      unreadCustomizations,
      unreadMessages
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ count: 0 });
  }
}
