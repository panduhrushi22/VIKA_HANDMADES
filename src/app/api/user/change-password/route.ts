import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findUserById, verifyPassword, updateUserPassword } from '@/lib/users';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Old and new passwords are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (!hasUpperCase || !hasNumber) {
      return NextResponse.json({ 
        error: 'New password must contain at least one uppercase letter and one number' 
      }, { status: 400 });
    }

    const user = await findUserById(session.userId);
    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found or password not set' }, { status: 404 });
    }

    // Verify old password
    const isMatch = await verifyPassword(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Update password
    const success = await updateUserPassword(session.userId, newPassword);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
