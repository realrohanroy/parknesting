
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'none';

interface HostApplicationStatusHook {
  applicationStatus: ApplicationStatus;
  isLoading: boolean;
  error: string | null;
  checkStatus: () => Promise<ApplicationStatus>;
  refreshStatus: () => Promise<void>;
}

export function useHostApplicationStatus(): HostApplicationStatusHook {
  const { user } = useAuth();
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('none');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return 'none';
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Checking host application status for user:", user.id);
      
      // First check if user is already a host in their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error("Error checking profile:", profileError);
        throw profileError;
      }
      
      if (profile && profile.role === 'host') {
        console.log("User is already a host");
        setApplicationStatus('approved');
        setIsLoading(false);
        return 'approved';
      }
      
      // Check for application status
      console.log("Checking for host applications");
      const { data: application, error: appError } = await supabase
        .from('host_applications')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (appError) {
        console.error("Error checking application:", appError);
        throw appError;
      }
      
      if (!application) {
        console.log("No application found");
        setApplicationStatus('none');
        setIsLoading(false);
        return 'none';
      }
      
      console.log("Application status:", application.status);
      const status = application.status as ApplicationStatus;
      setApplicationStatus(status);
      setIsLoading(false);
      return status;
    } catch (err: any) {
      console.error("Error checking application status:", err);
      setError(err.message);
      setIsLoading(false);
      return 'none';
    }
  }, [user]);

  // Function to manually refresh the status
  const refreshStatus = useCallback(async () => {
    await checkStatus();
  }, [checkStatus]);

  // Check status when component mounts
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Set up real-time subscription for status changes
  useEffect(() => {
    if (!user) return;

    console.log("Setting up real-time subscription for host application changes");
    const subscription = supabase
      .channel('host-application-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'host_applications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log("Received update for host application:", payload);
        const newStatus = payload.new.status as ApplicationStatus;
        setApplicationStatus(newStatus);
        
        // Show notification when status changes
        if (newStatus === 'approved') {
          toast({
            title: "Application Approved!",
            description: "Your host application has been approved. You can now add parking spaces.",
          });
        } else if (newStatus === 'rejected') {
          toast({
            title: "Application Rejected",
            description: "Your host application has been rejected. Please contact support for more information.",
            variant: "destructive",
          });
        }
      })
      .subscribe();

    // Also subscribe to profile changes (for role updates)
    const profileSubscription = supabase
      .channel('profile-role-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        console.log("Received update for profile:", payload);
        if (payload.new.role === 'host') {
          setApplicationStatus('approved');
        }
      })
      .subscribe();

    return () => {
      console.log("Cleaning up subscriptions");
      supabase.removeChannel(subscription);
      supabase.removeChannel(profileSubscription);
    };
  }, [user]);

  return { applicationStatus, isLoading, error, checkStatus, refreshStatus };
}
