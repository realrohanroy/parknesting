
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

  // Fetch all host applications with optimized query
  const getHostApplications = useCallback(async () => {
    if (!user) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch applications with profiles in a single query
      const { data: applications, error: applicationsError } = await supabase
        .from('host_applications')
        .select(`
          *,
          profiles:user_id (
            first_name, 
            last_name, 
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (applicationsError) throw applicationsError;
      
      // Process the applications to match the expected format
      const processedApplications = applications.map(application => {
        // Create default profile data
        const defaultProfile = { 
          first_name: null, 
          last_name: null, 
          avatar_url: null 
        };
        
        // Check if profiles exists and is not an error
        // Added null check to handle the case when profiles is null
        const profileData = application.profiles != null && 
          typeof application.profiles === 'object' && 
          !('error' in application.profiles) 
            ? application.profiles 
            : defaultProfile;
        
        // Simulate email (in a real app, you'd use a secure method)
        const email = `user-${application.user_id.substring(0, 8)}@example.com`;
        
        return {
          ...application,
          profiles: {
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            avatar_url: profileData.avatar_url,
            email
          }
        } as HostApplication;
      });
      
      return processedApplications;
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

  // Update host application status with optimistic updates
  const updateApplicationStatus = useCallback(async (
    applicationId: string,
    status: 'approved' | 'rejected',
    userId: string
  ) => {
    if (!user) return false;
    
    setError(null);
    
    try {
      // Perform the updates in a transaction-like manner
      const updates = [];
      
      // 1. Update application status
      updates.push(
        supabase
          .from('host_applications')
          .update({
            status,
            processed_by: user.id,
            processed_at: new Date().toISOString(),
          })
          .eq('id', applicationId)
      );
      
      // 2. If approved, update user role
      if (status === 'approved') {
        updates.push(
          supabase
            .from('profiles')
            .update({ role: 'host' })
            .eq('id', userId)
        );
      }
      
      // Execute all updates
      const results = await Promise.all(updates);
      
      // Check for errors
      const errors = results.filter(result => result.error !== null);
      if (errors.length > 0) {
        throw new Error(errors[0].error.message);
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
    }
  }, [user]);

  // Fetch all users with their profiles using a single optimized query
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
      
      // Add email for each user (simulated)
      const usersWithEmail = data.map(profile => {
        // In a real implementation, you would use a secure method to fetch the email
        const email = `user-${profile.id.substring(0, 8)}@example.com`;
        
        return {
          ...profile,
          email
        } as UserWithProfile;
      });
      
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

  // Update user role with immediate UI feedback
  const updateUserRole = useCallback(async (
    userId: string,
    role: 'user' | 'host' | 'admin'
  ) => {
    if (!user) return false;
    
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
