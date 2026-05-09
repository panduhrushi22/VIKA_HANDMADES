import { NextResponse } from 'next/server';
import { loadSettings, saveSettings } from '@/lib/settings';

export async function GET() {
  const settings = await loadSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deliveryFee, freeDeliveryThreshold } = body;
    
    const updatedSettings = await saveSettings({
      deliveryFee: Number(deliveryFee),
      freeDeliveryThreshold: Number(freeDeliveryThreshold)
    });
    
    return NextResponse.json(updatedSettings);
  } catch (error) {

    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
