
"use client";

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getUnreadNotificationCount } from "@/utils/db/forum";

type NotificationBellIconProps = {
  className?: string;
  size?: number;
};

export default function NotificationBellIcon({ className, size = 20 }: NotificationBellIconProps) {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount(user.id);
        setUnreadCount(count);
      } catch (err) {
        console.error("Error loading unread count:", err);
      }
    };

    loadUnreadCount();

    // Optional: poll every 30s for updates
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  return (
    <div className={`relative ${className}`}>
      <Bell style={{ width: size, height: size }} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
}
