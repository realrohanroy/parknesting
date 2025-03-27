
import React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { HostApplication } from '@/types/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

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
          {isLoadingApplications ? (
            <div className="text-center py-4 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-parkongo-600" />
            </div>
          ) : getPendingApplications().length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <h3 className="text-lg font-medium mb-1">No pending applications</h3>
              <p className="text-gray-500">All host applications have been processed or no applications have been submitted.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getPendingApplications().map((application: HostApplication) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={application.profiles?.avatar_url || ''} />
                          <AvatarFallback>
                            {application.profiles?.first_name?.[0] || ''}{application.profiles?.last_name?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {application.profiles?.first_name} {application.profiles?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.profiles?.email || 'Email not available'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(application.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => handleApprove(application.id, application.user_id)}
                          disabled={processingIds.includes(application.id)}
                        >
                          {processingIds.includes(application.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(application.id, application.user_id)}
                          disabled={processingIds.includes(application.id)}
                        >
                          {processingIds.includes(application.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <XCircle className="mr-1 h-4 w-4" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
          {isLoadingApplications ? (
            <div className="text-center py-4 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-parkongo-600" />
            </div>
          ) : getProcessedApplications().length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium mb-1">No processed applications</h3>
              <p className="text-gray-500">There are no processed host applications yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getProcessedApplications().map((application: HostApplication) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={application.profiles?.avatar_url || ''} />
                          <AvatarFallback>
                            {application.profiles?.first_name?.[0] || ''}{application.profiles?.last_name?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {application.profiles?.first_name} {application.profiles?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.profiles?.email || 'Email not available'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(application.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        application.status === 'approved' ? 'default' : 'destructive'
                      }>
                        {application.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HostApplicationsManager;
