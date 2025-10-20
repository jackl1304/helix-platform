import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await fetch('/api/notifications');
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
};

const markAsRead = async (notificationId: string) => {
  const response = await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to mark as read.');
  }
  return response.json();
};

const markAllAsRead = async () => {
  const response = await fetch(`/api/notifications/read-all`, { method: 'POST' });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to mark all as read.');
  }
  return response.json();
};

export default function Header() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 60000, // Refetch every minute
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const mutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  return (
    <header className="flex items-center justify-end h-16 px-4 border-b bg-background">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0 text-xs" variant="destructive">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h4 className="font-medium leading-none">Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  You have {unreadCount} unread messages.
                </p>
              </div>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
            </div>
            <div className="grid gap-2">
              {notifications.slice(0, 5).map((notification) => (
                <Link key={notification.id} href={notification.link} onClick={() => mutation.mutate(notification.id)}>
                  <a className={`block p-2 rounded-md hover:bg-muted ${!notification.isRead ? 'font-semibold' : ''}`}>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</p>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </header>
  );
}
