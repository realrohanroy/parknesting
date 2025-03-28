
import React, { useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { HostApplication } from '@/types/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
    console.log('Number of applications:', hostApplications.length);
    console.log('Pending applications:', getPendingApplications().length);
    console.log('Processed applications:', getProcessedApplications().length);
  }, [hostApplications]);

  const updateStatus = useMutation({
    mutationFn: async ({ applicationId, status, userId }: { applicationId: string, status: 'approved' | 'rejected', userId: string }) => {
      console.log(`Mutation: updating application ${applicationId} to ${status}`);
      return await updateApplicationStatus(applicationId, status, userId);
    },
    onSuccess: () => {
      console.log('Mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['hostApplications'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      
      // Immediately refetch to update the UI
      console.log('Refetching applications after mutation');
      refetchApplications();
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
    return hostApplications.filter((app: HostApplication) => app.status === 'pending');
  };

  const getProcessedApplications = () => {
    return hostApplications.filter((app: HostApplication) => app.status === 'approved' || app.status === 'rejected');
  };

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
            applications={getPendingApplications()}
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
            applications={getProcessedApplications()}
            isLoading={isLoadingApplications}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HostApplicationsManager;
