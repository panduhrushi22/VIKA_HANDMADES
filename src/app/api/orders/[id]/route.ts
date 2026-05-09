import { NextResponse } from 'next/server';
import { updateOrder } from '@/lib/orders';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log(`[API] Updating order: ${id}`, body);
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID is missing from URL' }, { status: 400 });
    }

    const updatedOrder = await updateOrder(id, body);
    
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('[API] Error updating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { deleteOrder } = await import('@/lib/orders');
    await deleteOrder(id);
    return NextResponse.json({ success: true, message: 'Order deleted successfully' });

  } catch (error: any) {
    console.error('[API] Error deleting order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}
