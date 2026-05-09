import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateAddress, deleteAddress } from '@/lib/users';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const addressData = await request.json();
    
    // Map isDefault to is_default for the library
    const mappedData = { ...addressData };
    if (mappedData.isDefault !== undefined) {
      mappedData.is_default = mappedData.isDefault;
      delete mappedData.isDefault;
    }

    const updated = await updateAddress(session.userId, id, mappedData);
    if (updated) {
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const success = await deleteAddress(session.userId, id);
    if (success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
