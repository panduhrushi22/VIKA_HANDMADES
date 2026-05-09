import { NextResponse } from 'next/server';
import { findUserByIdentifier, updateUserPassword } from '@/lib/users';
import { verifyOTP } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { identifier, otp, newPassword } = await request.json();

    if (!identifier || !otp || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Password complexity check
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (!hasUpperCase || !hasNumber) {
      return NextResponse.json({ 
        error: 'Password must contain at least one uppercase letter and one number' 
      }, { status: 400 });
    }

    const verification = await verifyOTP(identifier, otp);
    if (!verification.success) {
      return NextResponse.json({ error: verification.message || 'Invalid or expired OTP' }, { status: 400 });
    }

    const user = findUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await updateUserPassword(user.id, newPassword);

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
