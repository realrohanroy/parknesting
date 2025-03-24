
import React, { useEffect } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'booking_created':
    case 'new_booking':
      return '🚗';
    case 'booking_confirmed':
      return '✅';
    case 'booking_cancelled':
    case 'booking_rejected':
      return '❌';
    case 'booking_completed':
      return '🏁';
    case 'leave_review':
      return '⭐';
    default:
      return '📣';
  }
};

export function NotificationsPanel() {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    fetchNotifications, 
    markAsRead,
    markAllAsRead 
  } = useNotifications();

  // Fetch notifications when the component mounts
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const handleOpenChange = (open: boolean) => {
    if (open && user) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = (event: React.MouseEvent) => {
    event.preventDefault();
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead([notification.id]);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Sheet onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="flex-row justify-between items-center mb-4">
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          )}
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BellOff className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={notification.is_read ? "bg-background" : "bg-muted/50 border-l-4 border-l-primary"}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl" role="img" aria-label="notification type">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <CardTitle className="text-sm font-medium">
                          {notification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0">
                    <p className="text-sm">{notification.message}</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <SheetFooter className="mt-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
