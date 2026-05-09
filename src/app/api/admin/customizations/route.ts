import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { loadCustomizations } from '@/lib/customizations';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allCustomizations = await loadCustomizations();
    const { findUserById } = await import('@/lib/users');
    
    // Fetch users for each customization to show names/emails
    const enriched = await Promise.all(allCustomizations.map(async (c) => {
      const userId = c.userid || c.user_id || c.userId;
      const user = userId ? await findUserById(userId) : null;
      
      return {
        ...c,
        userId,
        user: {
          name: user?.name || 'Guest User',
          email: user?.email || user?.phone || 'No contact'
        },
        // Normalize column names for the UI
        customInput: c.custominput || c.customInput || c.custom_input,
        createdAt: c.createdat || c.created_at || c.createdAt,
        adminReply: c.adminreply || c.adminReply || c.admin_reply,
        repliedAt: c.repliedat || c.repliedAt || c.replied_at,
      };
    }));

    return NextResponse.json(enriched);

  } catch (error: any) {
    console.error('Error fetching admin customizations:', error);
    return NextResponse.json({ error: 'Failed to fetch customizations' }, { status: 500 });
  }
}


