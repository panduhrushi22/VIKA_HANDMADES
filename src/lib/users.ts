import bcrypt from 'bcryptjs';
import { supabase } from './supabase';

export type UserRole = 'USER' | 'ADMIN';

export interface Address {
  id: string;
  user_id?: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  password?: string; // Hashed
  role: UserRole;
  name?: string;
  created_at: string;
  cart?: any[];
  wishlist?: any[];
  addresses?: Address[];
}

// Admin Whitelist
const ADMIN_WHITELIST = [
  'vikahandmades@gmail.com',
  '8555936477'
];

export const normalizeIdentifier = (identifier: string) => {
  if (!identifier) return identifier;
  const trimmed = identifier.trim();
  // If it's an email (contains @), lowercase it
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  // If it's a phone number, remove all non-digit characters and take the last 10 digits
  const clean = trimmed.replace(/\D/g, '');
  if (clean.length >= 10) {
    return clean.slice(-10);
  }
  return clean;
};

export const isValidEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidPhone = (phone: string) => {
  // Check for 10 digit Indian phone number
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10;
};

export const formatPhone = (phone: string) => {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  
  // Handle case with +91 already included
  if (phone.startsWith('+91 ')) {
    const suffix = phone.slice(4).replace(/\s/g, '');
    if (suffix.length > 5) {
      return '+91 ' + suffix.slice(0, 5) + ' ' + suffix.slice(5, 10);
    }
    return phone;
  }
  
  if (clean.length === 10) {
    return clean.slice(0, 5) + ' ' + clean.slice(5);
  }
  return phone;
};

export const findUserByIdentifier = async (identifier: string) => {
  const normalized = normalizeIdentifier(identifier);
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`email.eq.${normalized},phone.eq.${normalized}`)
    .single();

  if (error || !data) return null;
  return data as User;
};

export const findUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as User;
};

export const createUser = async (userData: Partial<User>) => {
  // Normalize email and phone if provided
  const email = userData.email ? normalizeIdentifier(userData.email) : undefined;
  const phone = userData.phone ? normalizeIdentifier(userData.phone) : undefined;

  // Determine role based on whitelist
  let role: UserRole = 'USER';
  const identifier = email || phone;
  if (identifier && ADMIN_WHITELIST.includes(identifier)) {
    role = 'ADMIN';
  }

  const newUser: Partial<User> = {
    id: Math.random().toString(36).substr(2, 9),
    role,
    created_at: new Date().toISOString(),
    ...userData,
    email,
    phone,
    cart: userData.cart || [],
    wishlist: userData.wishlist || []
  };

  if (userData.password) {
    newUser.password = await bcrypt.hash(userData.password, 10);
  }

  const { data, error } = await supabase
    .from('users')
    .insert([newUser])
    .select()
    .single();

  if (error) throw error;
  return data as User;
};

export const updateUserPassword = async (userId: string, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const { error } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('id', userId);

  return !error;
};

export const updateUserStore = async (userId: string, cart: any[], wishlist: any[]) => {
  const { error } = await supabase
    .from('users')
    .update({ cart, wishlist })
    .eq('id', userId);

  return !error;
};

export const updateUserProfile = async (userId: string, data: { name?: string; email?: string }) => {
  const updates: any = {};
  if (data.name) updates.name = data.name;
  if (data.email) updates.email = normalizeIdentifier(data.email);

  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) return null;
  return updatedUser as User;
};

export const verifyPassword = async (password: string, hashed: string) => {
  return bcrypt.compare(password, hashed);
};

// Address Management
export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId);

  if (error) return [];
  return data as Address[];
};

export const addAddress = async (userId: string, addressData: Omit<Address, 'id'>) => {
  // If setting as default, unset others first
  if (addressData.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  } else {
    // Check if this is the first address
    const existing = await getUserAddresses(userId);
    if (existing.length === 0) {
      (addressData as any).is_default = true;
    }
  }

  const newAddress = {
    ...addressData,
    id: Math.random().toString(36).substr(2, 9),
    user_id: userId
  };

  const { data, error } = await supabase
    .from('addresses')
    .insert([newAddress])
    .select()
    .single();

  if (error) return null;
  return data as Address;
};

export const updateAddress = async (userId: string, addressId: string, addressData: Partial<Address>) => {
  // If setting as default, unset others first
  if (addressData.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  }
  
  const { data, error } = await supabase
    .from('addresses')
    .update(addressData)
    .eq('id', addressId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return null;
  return data as Address;
};

export const deleteAddress = async (userId: string, addressId: string) => {
  // Check if it was default
  const { data: address } = await supabase
    .from('addresses')
    .select('is_default')
    .eq('id', addressId)
    .single();

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', userId);

  if (error) return false;

  // If we deleted the default, set a new one if available
  if (address?.is_default) {
    const { data: others } = await supabase
      .from('addresses')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (others && others.length > 0) {
      await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', others[0].id);
    }
  }
  
  return true;
};

export const setDefaultAddress = async (userId: string, addressId: string) => {
  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId);

  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('user_id', userId);

  return !error;
};

