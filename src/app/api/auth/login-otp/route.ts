import { NextResponse } from 'next/server';
import { findUserByIdentifier } from '@/lib/users';
import { signToken, setSessionCookie } from '@/lib/auth';
import { verifyOTP } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { identifier, code } = await request.json();

    if (!identifier || !code) {
      return NextResponse.json({ error: 'Identifier and OTP are required' }, { status: 400 });
    }

    // 1. Verify OTP
    const verification = await verifyOTP(identifier, code);
    if (!verification.success) {
      return NextResponse.json({ error: verification.message }, { status: 400 });
    }

    // 2. Find User
    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please sign up first.' }, { status: 404 });
    }

    // 3. Generate session
    const token = await signToken({ userId: user.id, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, role: user.role } 
    });
  } catch (error) {
    console.error('OTP Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
