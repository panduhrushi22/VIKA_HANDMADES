import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findUserById, updateUserProfile } from '@/lib/users';

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email } = await request.json();
    
    // Basic validation
    if (email && !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const updatedUser = await updateUserProfile(session.userId, { name, email });
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: { name: updatedUser.name, email: updatedUser.email } 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
