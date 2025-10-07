"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  Check,
  Clock,
  Mail,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
}

interface NotificationEntity {
  type: string;
  wholesaler?: {
    _id: string;
    wholesalerName: string;
    email: string;
  };
  agency?: {
    _id: string;
    agencyName: string;
    email: string;
  };
  name: string;
}

interface Notification {
  _id: string;
  from: NotificationEntity;
  to: NotificationEntity;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface NotificationDropdownProps {
  classes?: string;
  theme?: "light" | "dark";
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  classes,
  theme = "light",
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byCategory: {},
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isDark = theme === "dark";

  // Format notification time like social media (e.g., "2 hours ago", "1 day ago")
  const formatNotificationTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  };

  // --- Get authentication token ---
  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) return tokenFromUrl;
    
    // Check cookies
    const tokenFromCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('authToken='))
      ?.split('=')[1];
    if (tokenFromCookie) return tokenFromCookie;
    
    // Check localStorage
    return localStorage.getItem('authToken');
  }, []);

  // --- Get wholesaler ID ---
  const getWholesalerId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('wholesalerId');
  }, []);

  // --- Fetch notification stats ---
  const fetchNotificationStats = useCallback(async () => {
    const token = getAuthToken();
    const wholesalerId = getWholesalerId();
    
    if (!token || !wholesalerId) {
      // Use mock data if no authentication
      const mockStats = {
        total: 12,
        unread: 3,
        byCategory: {
          bookings: 5,
          payments: 3,
          alerts: 2,
          updates: 2,
        },
      };
      setStats(mockStats);
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.jetixia.com/api/v1";
      
      const response = await fetch(`${baseUrl}/notifications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const res = await response.json();
        const data = res?.data || {};
        
        // Parse the new API response structure
        const notificationsList: Notification[] = data.notifications || [];
        const pagination = data.pagination || {};
        
        // Store notifications
        setNotifications(notificationsList);
        
        // Calculate unread count
        const unreadCount = notificationsList.filter((n) => !n.isRead).length;
        
        // Calculate by category
        const byCategory: Record<string, number> = {};
        notificationsList.forEach((n) => {
          const category = n.category || "UNCATEGORIZED";
          byCategory[category] = (byCategory[category] || 0) + 1;
        });
        
        setStats({
          total: pagination.total || 0,
          unread: unreadCount,
          byCategory: byCategory,
        });
      } else {
        // Fallback to mock data on API error
        const mockStats = {
          total: 8,
          unread: 2,
          byCategory: {
            bookings: 3,
            payments: 2,
            alerts: 2,
            updates: 1,
          },
        };
        setStats(mockStats);
      }
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      // Fallback to mock data on error
      const mockStats = {
        total: 5,
        unread: 1,
        byCategory: {
          bookings: 2,
          payments: 1,
          alerts: 1,
          updates: 1,
        },
      };
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, getWholesalerId]);

  // --- Mark all notifications as read ---
  const markAllAsRead = useCallback(async () => {
    const token = getAuthToken();
    const wholesalerId = getWholesalerId();
    
    if (!token || !wholesalerId) {
      // Update local state if no authentication
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setStats((prev) => ({ ...prev, unread: 0 }));
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.jetixia.com/api/v1";
      
      const response = await fetch(`${baseUrl}/notifications/mark-all-read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update all notifications to read in local state
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setStats((prev) => ({ ...prev, unread: 0 }));
      } else {
        // Still update local state even if API fails
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setStats((prev) => ({ ...prev, unread: 0 }));
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      // Still update local state even if API fails
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setStats((prev) => ({ ...prev, unread: 0 }));
    }
  }, [getAuthToken, getWholesalerId]);

  // --- Mark single notification as read ---
  const markAsRead = useCallback(
    async (notificationId: string) => {
      const token = getAuthToken();
      const wholesalerId = getWholesalerId();

      if (!token || !wholesalerId) return;

      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setStats((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));

      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.jetixia.com/api/v1";
        
        await fetch(`${baseUrl}/notifications/${notificationId}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
        // Revert on error
        fetchNotificationStats();
      }
    },
    [getAuthToken, getWholesalerId, fetchNotificationStats]
  );

  // --- Calculate button position for portal ---
  const updateButtonPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap
        right: window.innerWidth - rect.right - window.scrollX,
      });
    }
  }, []);

  // --- Handle dropdown toggle ---
  const handleDropdownToggle = useCallback(() => {
    if (!showDropdown) {
      updateButtonPosition();
    }
    setShowDropdown(!showDropdown);
  }, [showDropdown, updateButtonPosition]);

  // --- Close dropdown on outside click ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-notification-dropdown]')
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Update position on scroll/resize ---
  useEffect(() => {
    if (showDropdown) {
      const handleUpdatePosition = () => {
        updateButtonPosition();
      };

      window.addEventListener('scroll', handleUpdatePosition, true);
      window.addEventListener('resize', handleUpdatePosition);

      return () => {
        window.removeEventListener('scroll', handleUpdatePosition, true);
        window.removeEventListener('resize', handleUpdatePosition);
      };
    }
  }, [showDropdown, updateButtonPosition]);

  // --- Fetch on mount ---
  useEffect(() => {
    fetchNotificationStats();
  }, [fetchNotificationStats]);

  const bgColor = isDark ? "bg-gray-900 text-white" : "bg-white text-gray-800";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleDropdownToggle}
        className={`relative flex items-center gap-2 cursor-pointer shrink-0 transition-all duration-300 hover:scale-105 group ${classes}`}
      >
        <div className="relative">
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            isDark 
              ? "bg-gray-800/50 group-hover:bg-blue-900/30" 
              : "bg-gray-100 group-hover:bg-blue-100"
          }`}>
            <Bell className={`w-5 h-5 transition-colors duration-300 ${
              isDark ? "text-gray-300 group-hover:text-blue-300" : "text-gray-600 group-hover:text-blue-600"
            }`} />
          </div>
          {stats.unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
              {stats.unread > 99 ? "99+" : stats.unread}
            </span>
          )}
        </div>
        {/* <ChevronDown
          className={`w-3 h-3 transition-all duration-300 ${
            showDropdown ? "rotate-180" : ""
          } ${isDark ? "text-gray-400" : "text-gray-500"}`}
        /> */}
      </button>

      {/* Dropdown Portal */}
      {showDropdown && typeof window !== 'undefined' && createPortal(
        <div
          data-notification-dropdown
          className={`fixed z-[999999] w-96 rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border-white/20 dark:border-gray-700/50 animate-fade-scale`}
          style={{
            top: `${buttonPosition.top}px`,
            right: `${buttonPosition.right}px`,
          }}
        >
          {/* Header */}
          <div
            className={`flex justify-between items-center px-4 py-3 border-b border-white/10 dark:border-gray-700/50 bg-white/10 dark:bg-gray-800/50`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                isDark ? "bg-blue-900/50" : "bg-blue-100/50"
              }`}>
                <Mail
                  className={`w-4 h-4 ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>
              <span className="font-semibold text-sm text-gray-800 dark:text-white">Notifications Center</span>
            </div>
            <button
              onClick={markAllAsRead}
              disabled={stats.unread === 0}
              className={`text-xs flex items-center gap-1 transition font-medium px-3 py-1 rounded-lg ${
                stats.unread === 0
                  ? "text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                  : isDark
                  ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                  : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              }`}
            >
              <Check className="w-3 h-3" />
              Mark all read
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3 sidebar-scroll">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 animate-pulse">
                <Bell className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-sm font-medium">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle
                  className={`w-10 h-10 mb-3 ${
                    isDark ? "text-gray-500" : "text-gray-300"
                  }`}
                />
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  You don't have any notifications yet.
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Stay tuned — updates will appear here.
                </p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification._id);
                      }
                    }}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition border-b ${
                      isDark ? "border-gray-700" : "border-gray-100"
                    } ${
                      !notification.isRead
                        ? isDark
                          ? "bg-blue-900/20 hover:bg-blue-900/30"
                          : "bg-blue-50/50 hover:bg-blue-50"
                        : isDark
                        ? "hover:bg-gray-800"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Blue dot for unread */}
                    <div className="flex-shrink-0 mt-1">
                      {!notification.isRead ? (
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                      ) : (
                        <div className="w-2.5 h-2.5"></div>
                      )}
                    </div>

                    {/* Notification content */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-sm font-semibold mb-1 ${
                          !notification.isRead
                            ? isDark
                              ? "text-white"
                              : "text-gray-900"
                            : isDark
                            ? "text-gray-300"
                            : "text-gray-700"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <p
                        className={`text-xs leading-relaxed mb-2 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p
                        className={`text-xs flex items-center gap-1 ${
                          isDark ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          {/* <div
            className={`border-t border-white/10 dark:border-gray-700/50 py-3 px-4 text-center ${
              isDark ? "bg-gray-800/50" : "bg-gray-50/50"
            }`}
          >
            <button
              onClick={() => {
                // You can add navigation to full notifications page here
                console.log("Navigate to full notifications page");
              }}
              className={`text-sm transition-all duration-300 font-medium px-4 py-2 rounded-lg ${
                isDark
                  ? "text-blue-300 hover:text-blue-200 hover:bg-blue-900/30"
                  : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              }`}
            >
              View All Notifications →
            </button>
          </div> */}
        </div>,
        document.body
      )}
    </div>
  );
};
