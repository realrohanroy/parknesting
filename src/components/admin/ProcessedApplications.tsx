
import React, { useEffect } from 'react';
import { HostApplication } from '@/types/admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Loader2, AlertCircle } from 'lucide-react';

interface ProcessedApplicationsProps {
  applications: HostApplication[];
  isLoading: boolean;
}

const ProcessedApplications = ({
  applications,
  isLoading
}: ProcessedApplicationsProps) => {
  // Add debug log to track when this component renders and what data it receives
  useEffect(() => {
    console.log('ProcessedApplications rendered with:', applications);
    console.log('ProcessedApplications count:', applications?.length || 0);
  }, [applications]);

  if (isLoading) {
    return (
      <div className="text-center py-4 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-parkongo-600" />
      </div>
    );
  }

  // Check for valid applications array
  if (!Array.isArray(applications)) {
    console.error('ProcessedApplications received invalid data:', applications);
    return (
      <div className="text-center py-8 text-red-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-2" />
        <h3 className="text-lg font-medium mb-1">Data Error</h3>
        <p>Invalid processed applications data received. Please refresh the page.</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <h3 className="text-lg font-medium mb-1">No processed applications</h3>
        <p className="text-gray-500">There are no processed host applications yet.</p>
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application: HostApplication) => {
          if (!application || !application.id) {
            console.warn('Invalid application object in processed applications', application);
            return null;
          }

          return (
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
                      {application.profiles?.first_name || 'Unknown'} {application.profiles?.last_name || 'User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {application.profiles?.email || 'Email not available'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {application.created_at ? new Date(application.created_at).toLocaleDateString() : 'Unknown date'}
              </TableCell>
              <TableCell>
                <Badge variant={
                  application.status === 'approved' ? 'default' : 'destructive'
                }>
                  {application.status || 'unknown'}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ProcessedApplications;
