import { supabase } from './supabase';

export type DiscountType = 'percentage' | 'flat';

export interface Coupon {
  code: string; // Primary Key in DB
  discount_type: DiscountType;
  discount_value: number;
  min_order_value?: number;
  expiry_date?: string;
  // Note: usage_limit and usage_count are NOT in the current SQL schema, 
  // but we can add them to the interface if they exist or skip for now.
  // Based on schema.sql, only 5 columns exist.
}

export const loadCoupons = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('code', { ascending: true });

  if (error) {
    console.error('Error loading coupons from Supabase:', error);
    return [];
  }
  return data;
};

export const addCoupon = async (coupon: any) => {
  const newCoupon = {
    code: coupon.code.toUpperCase(),
    discount_type: coupon.type || coupon.discount_type,
    discount_value: Number(coupon.value || coupon.discount_value),
    min_order_value: Number(coupon.minOrderAmount || coupon.min_order_value || 0),
    expiry_date: coupon.expiryDate || coupon.expiry_date || null
  };
  
  const { data, error } = await supabase
    .from('coupons')
    .insert([newCoupon])
    .select()
    .single();

  if (error) {
    console.error('Error adding coupon to Supabase:', error);
    throw error;
  }
  return data;
};

export const deleteCoupon = async (code: string) => {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('code', code);

  if (error) {
    console.error('Error deleting coupon from Supabase:', error);
  }
};

export const updateCouponExpiry = async (code: string, newExpiry: string) => {
  const { error } = await supabase
    .from('coupons')
    .update({ expiry_date: newExpiry })
    .eq('code', code);

  return !error;
};

export const incrementCouponUsage = async (code: string) => {
  // Since usage_count is missing from the provided SQL schema, 
  // we either skip this or return true to avoid errors.
  return true;
};



