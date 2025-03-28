
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
      
      // Modified query to use join instead of the foreign key reference 
      const response = await supabase
        .from('host_applications')
        .select(`
          *,
          profiles:profiles(id, first_name, last_name, avatar_url, email)
        `)
        .eq('profiles.id', 'user_id')
        .order('created_at', { ascending: false });
      
      // Detailed error logging
      if (response.error) {
        console.error('Supabase error fetching applications:', response.error);
        throw response.error;
      }
      
      const applications = response.data || [];
      
      console.log('Raw host applications data:', applications);
      console.log('Number of applications fetched:', applications.length);
      
      if (applications.length === 0) {
        console.log('No host applications were found in the database');
      } else {
        console.log('First application:', applications[0]);
      }
      
      // Map applications to ensure consistent format
      const processedApplications = applications.map(application => {
        if (!application) {
          console.warn('Found null/undefined application in response');
          return null;
        }
        
        // Create default profile data
        const defaultProfile = { 
          id: application.user_id,
          first_name: 'Unknown', 
          last_name: 'User', 
          avatar_url: null,
          email: `user-${application.user_id.substring(0, 8)}@example.com`
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
            id: application.user_id,
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
      }).filter(Boolean) as HostApplication[];
      
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
      // Perform the updates in a transaction-like manner
      const updates = [];
      
      // 1. Update application status
      const applicationUpdate = supabase
        .from('host_applications')
        .update({
          status,
          processed_by: user.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);
      
      updates.push(applicationUpdate);
      
      // 2. If approved, update user role
      if (status === 'approved') {
        const userRoleUpdate = supabase
          .from('profiles')
          .update({ role: 'host' })
          .eq('id', userId);
        
        updates.push(userRoleUpdate);
      }
      
      // Execute all updates
      const results = await Promise.all(updates);
      
      // Check for errors
      const errors = results.filter(result => result.error !== null);
      if (errors.length > 0) {
        console.error('Update errors:', errors);
        throw new Error(errors[0].error?.message || 'Unknown error');
      }
      
      console.log('Application updated successfully');
      
      toast({
        title: 'Success',
        description: `Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });
      
      return true;
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
