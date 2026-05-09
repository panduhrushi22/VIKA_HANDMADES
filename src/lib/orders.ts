import { supabase } from './supabase';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingDetails {
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  user_id?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  coupon_code?: string;
  total: number;
  shipping_details: ShippingDetails;
  payment_method: string;
  payment_status?: string;
  payment_screenshot?: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  created_at: string;
  estimated_delivery?: string;
}

// Helper to load orders from Supabase
export const loadOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('createdat', { ascending: false });

  if (error) {
    console.error('Error loading orders from Supabase:', error);
    return [];
  }
  return data as any[];
};


// Helper to save order to Supabase
export const saveOrder = async (order: any) => {
  // The live DB uses concatenated lowercase column names (NOT snake_case)
  // e.g., "shippingdetails" not "shipping_details"
  const dbOrder: any = {
    id: order.id,
    user_id: order.user_id || order.userId,
    items: order.items,
    subtotal: order.subtotal,
    deliveryfee: order.delivery_fee || order.deliveryFee || order.deliveryfee || 0,
    discount: order.discount || 0,
    couponcode: order.coupon_code || order.couponCode || order.couponcode || null,
    total: order.total,
    shippingdetails: order.shipping_details || order.shippingDetails || order.shippingdetails,
    paymentmethod: order.payment_method || order.paymentMethod || order.paymentmethod,
    paymentstatus: order.payment_status || order.paymentStatus || order.paymentstatus || 'pending',
    paymentscreenshot: order.payment_screenshot || order.paymentScreenshot || order.paymentscreenshot || null,
    status: order.status || 'pending',
    createdat: order.created_at || order.createdAt || order.createdat || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([dbOrder])
    .select()
    .single();

  if (error) {
    console.error('Error saving order to Supabase:', error);
    throw error;
  }
  return data;
};





export const generateOrderId = () => {
  return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const updateOrder = async (orderId: string, updates: any) => {
  // Map updates to concatenated lowercase for the live DB
  const dbUpdates: any = {};
  if (updates.status) dbUpdates.status = updates.status;
  
  const estDelivery = updates.estimated_delivery || updates.estimatedDelivery || updates.estimateddelivery;
  if (estDelivery) dbUpdates.estimateddelivery = estDelivery;
  
  const pStatus = updates.payment_status || updates.paymentStatus || updates.paymentstatus;
  if (pStatus) dbUpdates.paymentstatus = pStatus;

  const { data, error } = await supabase
    .from('orders')
    .update(dbUpdates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('[Orders Lib] Error in updateOrder:', error);
    throw error;
  }
  return data;
};




export const deleteOrder = async (orderId: string) => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) {
    console.error('[Orders Lib] Error in deleteOrder:', error);
    throw error;
  }
  return true;
};

