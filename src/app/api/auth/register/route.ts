import { NextResponse } from 'next/server';
import { createUser, findUserByIdentifier } from '@/lib/users';
import { signToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, phone, password, name } = await request.json();

    const identifier = email || phone;
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    // Password complexity check: At least one uppercase and one number
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpperCase || !hasNumber) {
      return NextResponse.json({ 
        error: 'Password must contain at least one uppercase letter and one number' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await findUserByIdentifier(identifier);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create user
    const user = await createUser({
      email,
      phone,
      password,
      name,
      role: 'USER' // Default role, whitelist check happens in createUser
    });

    // Generate session
    const token = await signToken({ userId: user.id, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, role: user.role } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
