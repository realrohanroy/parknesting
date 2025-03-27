
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AdminState } from '@/types/admin';

export function useAdminStatus(user: User | null) {
  const [state, setState] = useState<AdminState>({
    isAdmin: false,
    isLoading: false,
    error: null
  });

  const checkAdminStatus = useCallback(async () => {
    if (!user) return false;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      const isAdminUser = data?.role === 'admin';
      setState(prev => ({ ...prev, isAdmin: isAdminUser, isLoading: false }));
      return isAdminUser;
    } catch (err: any) {
      console.error('Error checking admin status:', err);
      setState(prev => ({ 
        ...prev, 
        error: err.message,
        isLoading: false
      }));
      return false;
    }
  }, [user]);

  return {
    ...state,
    checkAdminStatus
  };
}
