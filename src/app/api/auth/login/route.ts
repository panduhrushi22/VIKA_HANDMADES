import { NextResponse } from 'next/server';
import { findUserByIdentifier, verifyPassword } from '@/lib/users';
import { signToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate session
    const token = await signToken({ userId: user.id, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, role: user.role } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
