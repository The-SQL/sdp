"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Bell } from "lucide-react";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/utils/db/forum";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Notification } from "@/utils/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    hasMore: true,
  });
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async (page = 1) => {
    try {
      setIsLoading(true);
      if (!user) {
        setIsLoading(false);
        return;
      }
      const { notifications: notifs, pagination: paginationInfo } =
        await getUserNotifications(user.id, 20, page);

      if (page === 1) {
        setNotifications(notifs);
      } else {
        setNotifications((prev) => [...prev, ...notifs]);
      }

      setPagination(paginationInfo);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasMore) {
      loadNotifications(pagination.currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {notifications.some((n) => !n.is_read) && (
            <Button
              onClick={handleMarkAllAsRead}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500">
                When you get notifications, they&apos;ll appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    notification.is_read ? "" : "border-blue-500 bg-blue-50"
                  }`}
                  onClick={() => {
                    handleMarkAsRead(notification.id);
                    if (notification.metadata?.post_id) {
                      window.location.href = `/forums/${notification.metadata.post_id}`;
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{notification.message}</p>
                        {notification.metadata?.reply_excerpt && (
                          <p className="text-sm text-gray-600 mt-1">
                            &ldquo;{notification.metadata.reply_excerpt}...&rdquo;
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pagination.hasMore && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
