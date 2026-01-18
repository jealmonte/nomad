// lib/storage.ts
import { supabase } from '@/lib/supabase';

export const getImagePublicUrl = (path: string | null | undefined) => {
  if (!path) return null;
  const { data } = supabase.storage.from('images').getPublicUrl(path);
  // data: { publicUrl: string }
  return data.publicUrl;
};
