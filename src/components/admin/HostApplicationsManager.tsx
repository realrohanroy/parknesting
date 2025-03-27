
import React from 'react';
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

  // Log the host applications data received from props
  React.useEffect(() => {
    console.log('HostApplicationsManager received applications:', hostApplications);
  }, [hostApplications]);

  const updateStatus = useMutation({
    mutationFn: async ({ applicationId, status, userId }: { applicationId: string, status: 'approved' | 'rejected', userId: string }) => {
      return await updateApplicationStatus(applicationId, status, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostApplications'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      
      // Immediately refetch to update the UI
      refetchApplications();
    },
  });

  const handleApprove = (applicationId: string, userId: string) => {
    updateStatus.mutate({ applicationId, status: 'approved', userId });
  };

  const handleReject = (applicationId: string, userId: string) => {
    updateStatus.mutate({ applicationId, status: 'rejected', userId });
  };

  const getPendingApplications = () => {
    return hostApplications.filter((app: HostApplication) => app.status === 'pending');
  };

  const getProcessedApplications = () => {
    return hostApplications.filter((app: HostApplication) => app.status === 'approved' || app.status === 'rejected');
  };

  // Log the filtered applications
  React.useEffect(() => {
    console.log('Pending applications:', getPendingApplications());
    console.log('Processed applications:', getProcessedApplications());
  }, [hostApplications]);

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
