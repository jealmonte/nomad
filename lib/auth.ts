import { supabase } from '@/lib/supabase';

export async function getCurrentUserId() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
  
    if (error || !user) {
      return null;
    }
  
    return user.id;
  }
  