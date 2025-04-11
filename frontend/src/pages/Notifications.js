import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const Notifications = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: "/notifications" } });
      return;
    }

    fetchNotifications();
  }, [token, navigate]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Sort notifications by date, newest first
      const sortedNotifications = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(sortedNotifications);
      setError(null);
    } catch (err) {
      // Only set error if it's not a case of no notifications
      if (err.response?.status !== 404) {
        console.error("Error fetching notifications:", err);
        setError(
          err.response?.data?.message || "Failed to fetch notifications"
        );
      } else {
        // If 404 (no notifications), just set empty array
        setNotifications([]);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add auto-refresh for notifications
  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(
        notifications.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to mark notification as read"
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch(
        "http://localhost:5000/api/notifications/read-all",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(
        notifications.map((notification) => ({ ...notification, read: true }))
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to mark all notifications as read"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?"))
      return;

    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(
        notifications.filter((notification) => notification._id !== id)
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete notification");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "answer":
        return <DocumentTextIcon className="h-5 w-5 text-[#136269]" />;
      case "comment":
        return <ChatBubbleLeftIcon className="h-5 w-5 text-[#136269]" />;
      case "mentorship_request":
      case "mentorship_accepted":
        return <UserGroupIcon className="h-5 w-5 text-[#136269]" />;
      default:
        return <BellIcon className="h-5 w-5 text-[#136269]" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-start bg-gray-50">
        <div className="w-full max-w-2xl px-4 py-8 mt-20">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#136269]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-start bg-gray-50">
        <div className="w-full max-w-2xl px-4 py-8 mt-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50">
      <div className="w-full max-w-2xl px-4 py-8 mt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#136269]">Notifications</h1>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <CheckIcon className="h-5 w-5 mr-1" />
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No notifications
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white shadow rounded-lg p-4 ${
                  !notification.read ? "border-l-4 border-[#136269]" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">
                            {notification.sender.name}
                          </span>{" "}
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="p-1 text-gray-400 hover:text-[#136269] transition-colors duration-200"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <Link
                  to={notification.link}
                  className="mt-2 inline-flex items-center text-sm text-[#136269] hover:text-[#0f4a52]"
                >
                  View details
                  <ArrowPathIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
