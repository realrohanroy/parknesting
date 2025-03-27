
import React from 'react';
import { Shield, Users, Clock } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, setActiveTab }: AdminSidebarProps) => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Shield className="h-6 w-6 text-parkongo-600" />
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Users</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activeTab === 'hostApplications'}
              onClick={() => setActiveTab('hostApplications')}
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>Host Applications</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-3 py-2">
          <Badge variant="outline" className="w-full justify-center">
            Admin Mode
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
