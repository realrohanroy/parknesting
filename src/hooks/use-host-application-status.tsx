
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
      // First check if user is already a host in their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      if (profile && profile.role === 'host') {
        setApplicationStatus('approved');
        return 'approved';
      }
      
      // Check for application status
      const { data: application, error: appError } = await supabase
        .from('host_applications')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (appError) throw appError;
      
      if (!application) {
        setApplicationStatus('none');
        return 'none';
      }
      
      setApplicationStatus(application.status as ApplicationStatus);
      return application.status as ApplicationStatus;
    } catch (err: any) {
      console.error("Error checking application status:", err);
      setError(err.message);
      return 'none';
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Check status when component mounts
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Set up real-time subscription for status changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('host-application-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'host_applications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
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

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return { applicationStatus, isLoading, error, checkStatus };
}
