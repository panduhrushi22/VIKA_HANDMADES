import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { saveCustomization, loadCustomizations, generateCustomizationId } from '@/lib/customizations';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, options, customInput, image } = body;

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const customization = await saveCustomization({
      id: generateCustomizationId(),
      userId: session.userId,
      category,
      options: options || {},
      customInput,
      image,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, customization });
  } catch (error: any) {
    console.error('Customization API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allCustomizations = await loadCustomizations();
    const userCustomizations = allCustomizations.filter(c => (c.userid || (c as any).userId) === session.userId);

    return NextResponse.json(userCustomizations);

  } catch (error: any) {

    return NextResponse.json({ error: 'Failed to fetch customizations' }, { status: 500 });
  }
}
