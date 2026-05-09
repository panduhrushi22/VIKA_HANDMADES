import { supabase } from './supabase';

export interface Settings {
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

const DEFAULT_SETTINGS: Settings = {
  deliveryFee: 50,
  freeDeliveryThreshold: 1000
};

export const loadSettings = async (): Promise<Settings> => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'app_settings')
    .single();

  if (error || !data) {
    return DEFAULT_SETTINGS;
  }
  return data.value as Settings;
};

export const saveSettings = async (settings: Settings) => {
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'app_settings', value: settings });

  if (error) {
    console.error('Error saving settings to Supabase:', error);
    throw error;
  }
  return settings;
};

