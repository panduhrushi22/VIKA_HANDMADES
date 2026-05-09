import { supabase } from './supabase';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  description?: string;
  rating: number;
  stock: number;
  sales: number;
  reviews?: Review[];
}

export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products from Supabase:', error);
    return [];
  }
  return data as Product[];
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const newProduct = {
    ...product,
    id: Math.random().toString(36).substr(2, 9),
    images: product.images || [],
    reviews: product.reviews || []
  };
  
  const { data, error } = await supabase
    .from('products')
    .insert([newProduct])
    .select()
    .single();

  if (error) {
    console.error('Error adding product to Supabase:', error);
    throw error;
  }
  
  return data as Product;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product from Supabase:', error);
    return false;
  }
  return true;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product in Supabase:', error);
    return null;
  }
  return data as Product;
};

