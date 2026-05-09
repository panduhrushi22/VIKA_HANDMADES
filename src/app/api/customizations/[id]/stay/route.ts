import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: true, message: 'Customization stay recorded' });
  } catch (error: any) {
    console.error('Stay Customization error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record stay' }, { status: 500 });
  }
}
