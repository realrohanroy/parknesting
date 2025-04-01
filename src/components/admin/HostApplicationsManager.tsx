
import React, { useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { HostApplication } from '@/types/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import PendingApplications from './PendingApplications';
import ProcessedApplications from './ProcessedApplications';

interface HostApplicationsManagerProps {
  hostApplications: HostApplication[];
  isLoadingApplications: boolean;
  processingIds: string[];
  updateApplicationStatus: (applicationId: string, status: 'approved' | 'rejected', userId: string) => Promise<boolean>;
  refetchApplications: () => void;
}

const HostApplicationsManager = ({
  hostApplications,
  isLoadingApplications,
  processingIds,
  updateApplicationStatus,
  refetchApplications
}: HostApplicationsManagerProps) => {
  const queryClient = useQueryClient();

  // Log the host applications data whenever it changes
  useEffect(() => {
    console.log('HostApplicationsManager received applications:', hostApplications);
    console.log('Applications array is array?', Array.isArray(hostApplications));
    console.log('Number of applications:', hostApplications?.length || 0);
  }, [hostApplications]);

  const updateStatus = useMutation({
    mutationFn: async ({ applicationId, status, userId }: { applicationId: string, status: 'approved' | 'rejected', userId: string }) => {
      console.log(`Mutation: updating application ${applicationId} to ${status}`);
      try {
        const result = await updateApplicationStatus(applicationId, status, userId);
        
        if (!result) {
          throw new Error(`Failed to update application status to ${status}`);
        }
        
        return result;
      } catch (error) {
        console.error('Error in updateStatus mutation:', error);
        toast({
          title: 'Error',
          description: `Failed to ${status} the application. Please try again.`,
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Mutation succeeded, invalidating queries');
      // Invalidate both queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['hostApplications'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      
      // Immediately refetch to update the UI
      console.log('Refetching applications after mutation');
      setTimeout(() => {
        refetchApplications();
      }, 300);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
    onSettled: () => {
      // Always refetch when mutation settles (success or error)
      console.log('Mutation settled, ensuring data is refreshed');
      setTimeout(() => {
        refetchApplications();
      }, 1000);
    },
  });

  const handleApprove = (applicationId: string, userId: string) => {
    console.log(`Approving application: ${applicationId} for user: ${userId}`);
    updateStatus.mutate({ applicationId, status: 'approved', userId });
  };

  const handleReject = (applicationId: string, userId: string) => {
    console.log(`Rejecting application: ${applicationId} for user: ${userId}`);
    updateStatus.mutate({ applicationId, status: 'rejected', userId });
  };

  const getPendingApplications = () => {
    if (!Array.isArray(hostApplications)) {
      console.error('hostApplications is not an array:', hostApplications);
      return [];
    }
    return hostApplications.filter((app: HostApplication) => app.status === 'pending');
  };

  const getProcessedApplications = () => {
    if (!Array.isArray(hostApplications)) {
      console.error('hostApplications is not an array:', hostApplications);
      return [];
    }
    return hostApplications.filter((app: HostApplication) => app.status === 'approved' || app.status === 'rejected');
  };

  const pendingApplications = getPendingApplications();
  const processedApplications = getProcessedApplications();

  console.log('Pending applications:', pendingApplications.length);
  console.log('Processed applications:', processedApplications.length);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Host Applications</CardTitle>
          <CardDescription>
            Review and manage user applications to become hosts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendingApplications 
            applications={pendingApplications}
            isLoading={isLoadingApplications}
            processingIds={processingIds}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Processed Applications</CardTitle>
          <CardDescription>
            History of approved and rejected host applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProcessedApplications 
            applications={processedApplications}
            isLoading={isLoadingApplications}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HostApplicationsManager;
