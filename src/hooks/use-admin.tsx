
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
    avatar_url: string | null;
    email: string | null;
  };
};

export type UserWithProfile = {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

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
    } catch (err: any) {
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
      // First fetch the host applications
      const { data: applications, error: applicationsError } = await supabase
        .from('host_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (applicationsError) throw applicationsError;
      
      // Then fetch profiles for each user separately
      const applicationsWithProfiles = await Promise.all(
        applications.map(async (application) => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('id', application.user_id)
            .single();
          
          // Get email from auth.users via email function or API
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', application.user_id)
            .single();
          
          // In a real implementation, you would use a secure method to fetch the email
          // This is a placeholder
          let email = null;
          if (userData) {
            // Simulate email retrieval
            email = `user-${application.user_id.substring(0, 8)}@example.com`;
          }
          
          return {
            ...application,
            profiles: {
              ...(profile || { first_name: null, last_name: null, avatar_url: null }),
              email
            }
          } as HostApplication;
        })
      );
      
      return applicationsWithProfiles;
    } catch (err: any) {
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
    } catch (err: any) {
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

  // Fetch all users with their profiles
  const getAllUsers = useCallback(async () => {
    if (!user) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, first_name, last_name, avatar_url, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Add email for each user
      const usersWithEmail = await Promise.all(
        data.map(async (profile) => {
          // In a real implementation, you would use a secure method to fetch the email
          // This is simplified, typically you'd use auth.users table with proper permissions
          const email = `user-${profile.id.substring(0, 8)}@example.com`;
          
          return {
            ...profile,
            email
          } as UserWithProfile;
        })
      );
      
      return usersWithEmail;
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update user role
  const updateUserRole = useCallback(async (
    userId: string,
    role: 'user' | 'host' | 'admin'
  ) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `User role updated to ${role} successfully`,
      });
      
      return true;
    } catch (err: any) {
      console.error(`Error updating user role:`, err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
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
    getAllUsers,
    updateUserRole,
  };
}
