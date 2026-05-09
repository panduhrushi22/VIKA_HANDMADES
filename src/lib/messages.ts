import { supabase } from './supabase';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  userid?: string;
  message: string;
  adminreply?: string;
  repliedat?: string;
  isreadbyuser?: boolean;
  createdat: string;
}

export const loadMessages = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('createdat', { ascending: false });

  if (error) {
    console.error('Error loading messages from Supabase:', error);
    return [];
  }
  return data;
};

export const saveMessage = async (message: any) => {
  const newMessage: any = {
    id: 'MSG-' + Math.random().toString(36).substring(2, 11).toUpperCase(),
    username: message.name || message.username,
    useremail: message.email || message.useremail,
    userphone: message.phone || message.userphone || null,
    userid: message.userId || message.userid || null,
    message: message.message,
    subject: message.subject || null,
    status: 'unread',
  };

  const { data, error } = await supabase
    .from('messages')
    .insert([newMessage])
    .select()
    .single();

  if (error) {
    console.error('Error saving message to Supabase:', error);
    throw error;
  }
  return data;
};

export const deleteMessage = async (id: string) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting message from Supabase:', error);
    throw error;
  }
  return true;
};

export const updateMessage = async (id: string, updates: any) => {
  const dbUpdates: any = {};
  
  const reply = updates.adminReply || updates.adminreply || updates.admin_reply;
  if (reply) dbUpdates.adminreply = reply;
  
  const repliedAt = updates.repliedAt || updates.repliedat || updates.replied_at;
  if (repliedAt || reply) dbUpdates.repliedat = repliedAt || new Date().toISOString();
  
  if (updates.isReadByUser !== undefined || updates.isreadbyuser !== undefined) {
    dbUpdates.isreadbyuser = updates.isReadByUser || updates.isreadbyuser || false;
  }
  if (updates.status) dbUpdates.status = updates.status;

  const { data, error } = await supabase
    .from('messages')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating message in Supabase:', error);
    throw error;
  }
  return data;
};




