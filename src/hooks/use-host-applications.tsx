
import { useCallback, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { HostApplication } from '@/types/admin';

export function useHostApplications(user: User | null) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all host applications with optimized query
  const getHostApplications = useCallback(async () => {
    if (!user) {
      console.log('No user provided to getHostApplications');
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching host applications for user:', user.id);
      
      // Fixed query to use proper join syntax with profiles table
      const { data: applications, error: fetchError } = await supabase
        .from('host_applications')
        .select(`
          *,
          profiles:profiles!host_applications_user_id_fkey(
            id, 
            first_name, 
            last_name, 
            avatar_url, 
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      // Detailed error logging
      if (fetchError) {
        console.error('Supabase error fetching applications:', fetchError);
        throw fetchError;
      }
      
      console.log('Raw host applications data:', applications);
      console.log('Number of applications fetched:', applications?.length || 0);
      
      if (!applications || applications.length === 0) {
        console.log('No host applications were found in the database');
        return [];
      }
      
      // Map applications to ensure consistent format
      const processedApplications = applications
        .filter(application => application !== null)
        .map(application => {
          // Create default profile data
          const defaultProfile = { 
            id: application.user_id,
            first_name: 'Unknown', 
            last_name: 'User', 
            avatar_url: null,
            email: null
          };
          
          // Create profiles object with safe properties
          let profileData = defaultProfile;
          
          // Check if profiles exists and is not null
          if (application.profiles && typeof application.profiles === 'object') {
            const profiles = application.profiles as { 
              id?: string;
              first_name?: string | null; 
              last_name?: string | null; 
              avatar_url?: string | null;
              email?: string | null;
            };
            
            profileData = {
              id: profiles.id || application.user_id,
              first_name: profiles.first_name || defaultProfile.first_name,
              last_name: profiles.last_name || defaultProfile.last_name,
              avatar_url: profiles.avatar_url || defaultProfile.avatar_url,
              email: profiles.email || defaultProfile.email
            };
          }
          
          return {
            ...application,
            profiles: profileData
          } as HostApplication;
        });
      
      console.log('Processed host applications:', processedApplications);
      
      return processedApplications;
    } catch (err: any) {
      console.error('Error fetching host applications:', err);
      setError(err.message || 'Failed to fetch host applications');
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
    if (!user) {
      console.log('No user provided to updateApplicationStatus');
      return false;
    }
    
    setError(null);
    console.log(`Updating application ${applicationId} to status ${status} for user ${userId}`);
    
    try {
      // Begin transaction-like sequence
      let transactionSuccess = true;
      
      // 1. Update application status
      const { error: applicationError } = await supabase
        .from('host_applications')
        .update({
          status,
          processed_by: user.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);
      
      if (applicationError) {
        console.error('Error updating application status:', applicationError);
        transactionSuccess = false;
        throw applicationError;
      }
      
      // 2. If approved, update user role
      if (status === 'approved') {
        const { error: userRoleError } = await supabase
          .from('profiles')
          .update({ role: 'host' })
          .eq('id', userId);
        
        if (userRoleError) {
          console.error('Error updating user role:', userRoleError);
          transactionSuccess = false;
          throw userRoleError;
        }
      }
      
      // Check overall transaction success
      if (transactionSuccess) {
        console.log('Application updated successfully');
        
        toast({
          title: 'Success',
          description: `Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
        });
        
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error(`Error updating application:`, err);
      setError(err.message || 'Failed to update application');
      toast({
        title: 'Error',
        description: `Failed to ${status} application`,
        variant: 'destructive',
      });
      return false;
    }
  }, [user]);

  return {
    isLoading,
    error,
    getHostApplications,
    updateApplicationStatus
  };
}
