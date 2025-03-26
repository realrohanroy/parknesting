
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type HostApplication = {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
};

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is an admin
  const checkAdminStatus = useCallback(async () => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      const isAdminUser = data?.role === 'admin';
      setIsAdmin(isAdminUser);
      return isAdminUser;
    } catch (err) {
      console.error('Error checking admin status:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch all host applications
  const getHostApplications = useCallback(async () => {
    if (!user) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('host_applications')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url,
            email:auth.users!id(email)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as HostApplication[];
    } catch (err) {
      console.error('Error fetching host applications:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load host applications',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update host application status
  const updateApplicationStatus = useCallback(async (
    applicationId: string,
    status: 'approved' | 'rejected',
    userId: string
  ) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Start a transaction
      const { error: statusError } = await supabase
        .from('host_applications')
        .update({
          status,
          processed_by: user.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);
      
      if (statusError) throw statusError;
      
      // If approved, update the user's role to 'host'
      if (status === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'host' })
          .eq('id', userId);
        
        if (profileError) throw profileError;
      }
      
      toast({
        title: 'Success',
        description: `Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });
      
      return true;
    } catch (err) {
      console.error(`Error updating application:`, err);
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to ${status} application`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isAdmin,
    isLoading,
    error,
    checkAdminStatus,
    getHostApplications,
    updateApplicationStatus,
  };
}
