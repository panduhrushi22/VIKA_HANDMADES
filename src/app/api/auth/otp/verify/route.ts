import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { identifier, code } = await request.json();

    if (!identifier || !code) {
      return NextResponse.json({ error: 'Identifier and OTP are required' }, { status: 400 });
    }

    const result = await verifyOTP(identifier, code);
    
    if (!result.success) {
      return NextResponse.json({ error: result.message || 'Invalid or expired OTP' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
