import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findUserById, updateUserStore } from '@/lib/users';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ cart: [], wishlist: [] });
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ cart: [], wishlist: [] });
    }

    return NextResponse.json({ 
      cart: user.cart || [], 
      wishlist: user.wishlist || [] 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { cart, wishlist } = await request.json();
    
    await updateUserStore(session.userId, cart, wishlist);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
