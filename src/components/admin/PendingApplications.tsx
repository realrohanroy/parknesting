
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HostApplication } from '@/types/admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface PendingApplicationsProps {
  applications: HostApplication[];
  isLoading: boolean;
  processingIds: string[];
  onApprove: (applicationId: string, userId: string) => void;
  onReject: (applicationId: string, userId: string) => void;
}

const PendingApplications = ({
  applications,
  isLoading,
  processingIds,
  onApprove,
  onReject
}: PendingApplicationsProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-4 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-parkongo-600" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
        <h3 className="text-lg font-medium mb-1">No pending applications</h3>
        <p className="text-gray-500">All host applications have been processed or no applications have been submitted.</p>
      </div>
    );
  }

  return (
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
        {applications.map((application: HostApplication) => (
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
                  onClick={() => onApprove(application.id, application.user_id)}
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
                  onClick={() => onReject(application.id, application.user_id)}
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
  );
};

export default PendingApplications;
