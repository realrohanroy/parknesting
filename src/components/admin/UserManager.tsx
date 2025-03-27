
import React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { UserWithProfile } from '@/types/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Users, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserManagerProps {
  users: UserWithProfile[];
  isLoadingUsers: boolean;
  processingIds: string[];
  updateUserRole: (userId: string, role: 'user' | 'host' | 'admin') => Promise<boolean>;
  refetchUsers: () => void;
}

const UserManager = ({
  users,
  isLoadingUsers,
  processingIds,
  updateUserRole,
  refetchUsers
}: UserManagerProps) => {
  const queryClient = useQueryClient();

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: 'user' | 'host' | 'admin' }) => {
      return await updateUserRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      refetchUsers();
    },
  });

  const handleRoleChange = (userId: string, role: 'user' | 'host' | 'admin') => {
    updateRole.mutate({ userId, role });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingUsers ? (
          <div className="text-center py-4 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-parkongo-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <h3 className="text-lg font-medium mb-1">No users found</h3>
            <p className="text-gray-500">There are no users in the system.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userData: UserWithProfile) => (
                <TableRow key={userData.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={userData.avatar_url || ''} />
                        <AvatarFallback>
                          {userData.first_name?.[0] || ''}{userData.last_name?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {userData.first_name} {userData.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {userData.email || 'Email not available'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(userData.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      userData.role === 'admin' ? 'destructive' : 
                      userData.role === 'host' ? 'default' : 'outline'
                    }>
                      {userData.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Select
                        defaultValue={userData.role}
                        onValueChange={(value) => handleRoleChange(userData.id, value as 'user' | 'host' | 'admin')}
                        disabled={processingIds.includes(userData.id)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="host">Host</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRoleChange(userData.id, 'admin')}
                        disabled={userData.role === 'admin' || processingIds.includes(userData.id)}
                        className="border-red-500 text-red-600 hover:bg-red-50"
                      >
                        {processingIds.includes(userData.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Shield className="mr-1 h-4 w-4" />
                        )}
                        Make Admin
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">
          Total users: {users.length}
        </p>
      </CardFooter>
    </Card>
  );
};

export default UserManager;
