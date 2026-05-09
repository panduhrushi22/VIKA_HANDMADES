import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { loadMessages } from '@/lib/messages';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await loadMessages();
    
    // Map DB column names to what the UI expects
    const mappedMessages = messages.map(m => ({
      ...m,
      name: m.name || m.username,
      email: m.email || m.useremail,
      phone: m.phone || m.userphone,
      createdAt: m.created_at || m.createdat || m.createdAt,
      userId: m.user_id || m.userid || m.userId,
      adminReply: m.admin_reply || m.adminreply || m.adminReply,
      repliedAt: m.replied_at || m.repliedat || m.repliedAt
    }));

    return NextResponse.json(mappedMessages);
  } catch (error: any) {
    console.error('Error fetching admin messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }

}
