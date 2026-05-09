import { supabase } from './supabase';

export interface CustomizationRequest {
  id: string;
  userid: string;
  category: string;
  options: Record<string, string>;
  custominput?: string;
  feedback?: 'like' | 'dislike';
  image?: string;
  status: 'pending' | 'reviewed' | 'completed' | 'cancelled';
  adminreply?: string;
  repliedat?: string;
  isreadbyuser?: boolean;
  createdat: string;
}

export const loadCustomizations = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('customizations')
    .select('*')
    .order('createdat', { ascending: false });

  if (error) {
    console.error('Error loading customizations from Supabase:', error);
    return [];
  }
  return data;
};

export const saveCustomization = async (customization: any) => {
  // Actual DB columns: id, userid, category, options, custominput, image, status, createdat, feedback, feedbackdate
  const dbCustomization: any = {
    id: customization.id || generateCustomizationId(),
    userid: customization.user_id || customization.userId || customization.userid,
    category: customization.category,
    options: customization.options || null,
    custominput: customization.customInput || customization.custominput || customization.custom_input || null,
    image: customization.image || null,
    status: customization.status || 'pending',
  };

  const { data, error } = await supabase
    .from('customizations')
    .insert([dbCustomization])
    .select()
    .single();

  if (error) {
    console.error('Error saving customization to Supabase:', error);
    throw error;
  }
  return data;
};

export const updateCustomization = async (id: string, updates: any) => {
  const dbUpdates: any = {};
  
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.feedback) dbUpdates.feedback = updates.feedback;
  if (updates.feedbackdate || updates.feedbackDate) dbUpdates.feedbackdate = updates.feedbackdate || updates.feedbackDate;
  
  // Admin reply fields — these may or may not exist as columns
  const reply = updates.adminReply || updates.adminreply || updates.admin_reply;
  if (reply) dbUpdates.adminreply = reply;
  
  const repliedAt = updates.repliedAt || updates.repliedat || updates.replied_at;
  if (repliedAt || reply) dbUpdates.repliedat = repliedAt || new Date().toISOString();

  const { data, error } = await supabase
    .from('customizations')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating customization in Supabase:', error);
    throw error;
  }
  return data;
};



export const deleteCustomization = async (id: string) => {
  const { error } = await supabase
    .from('customizations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting customization from Supabase:', error);
    throw error;
  }
  return true;
};

export const markAllAsRead = async (userId: string) => {
  // This might be complex with JSONB, skipping for now or keeping as is if user added columns
  return true;
};


export const generateCustomizationId = () => {
  return 'CUST-' + Math.random().toString(36).substring(2, 11).toUpperCase();
};


