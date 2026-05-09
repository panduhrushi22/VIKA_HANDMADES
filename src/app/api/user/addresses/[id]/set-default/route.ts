import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { setDefaultAddress } from '@/lib/users';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const success = await setDefaultAddress(session.userId, id);
    if (success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Failed to set default address' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
