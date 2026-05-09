import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { loadMessages } from '@/lib/messages';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await loadMessages();
    const userMessages = messages.filter(m => (m.userid || (m as any).userId) === session.userId);

    return NextResponse.json(userMessages);

  } catch (error) {

    console.error('Fetch user messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
