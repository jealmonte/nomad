// lib/storage.ts
import { supabase } from '@/lib/supabase';

export const getImagePublicUrl = (path: string | null | undefined) => {
  if (!path) return null;
  const { data } = supabase.storage.from('images').getPublicUrl(path);
  // data: { publicUrl: string }
  return data.publicUrl;
};

export function getPublicAvatarUrl(path: string | null): string | null {
  if (!path) return null;

  const { data } = supabase.storage.from('images').getPublicUrl(path);
  // Add cache busting timestamp to force image reload
  const url = data?.publicUrl;
  if (!url) return null;
  
  // Add timestamp as query parameter to bypass cache
  return `${url}?t=${Date.now()}`;
}