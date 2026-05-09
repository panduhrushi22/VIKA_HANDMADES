import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserAddresses, addAddress } from '@/lib/users';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const addresses = await getUserAddresses(session.userId);
  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const addressData = await request.json();
    
    // Map isDefault to is_default for the library
    const mappedData = { ...addressData };
    if (mappedData.isDefault !== undefined) {
      mappedData.is_default = mappedData.isDefault;
      delete mappedData.isDefault;
    }

    const newAddress = await addAddress(session.userId, mappedData);
    if (newAddress) {
      return NextResponse.json(newAddress);
    }

    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

}
