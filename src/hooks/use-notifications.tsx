
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: string;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('notifications/list');
      
      if (error) {
        throw new Error(error.message);
      }
      
      setNotifications(data.notifications || []);
      setUnreadCount(
        (data.notifications || []).filter(
          (n: Notification) => !n.is_read
        ).length
      );
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (!user || !notificationIds.length) return;
    
    try {
      const { error } = await supabase.functions.invoke('notifications/mark-read', {
        body: { notification_ids: notificationIds },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) 
            ? { ...n, is_read: true } 
            : n
        )
      );
      
      // Recalculate unread count
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      toast({
        title: 'Error',
        description: 'Failed to update notifications',
        variant: 'destructive',
      });
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase.functions.invoke('notifications/mark-all-read');
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast({
        title: 'Error',
        description: 'Failed to update notifications',
        variant: 'destructive',
      });
    }
  }, [user]);

  // Load notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  // Setup real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Add new notification to state
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast({
            title: 'New Notification',
            description: newNotification.message,
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
