import React, { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import axios from 'axios';

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const { socket } = useSocket();
  const { openChat } = useChat();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('receive_private_message', (data) => {
        if (!data.isRead) {
          setNotifications(prev => [...prev, data]);
        }
      });

      return () => {
        socket.off('receive_private_message');
      };
    }
  }, [socket]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleNotificationClick = async (notification) => {
    try {
      console.log('Clicked notification:', notification); // Debug log

      // Mark notification as read
      await axios.put(`http://localhost:5000/api/notifications/${notification._id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Remove notification from list
      setNotifications(prev => prev.filter(n => n._id !== notification._id));

      // Always treat it as a message if it has a sender
      if (notification.sender) {
        console.log('Opening chat with sender:', notification.sender); // Debug log
        const chatUser = {
          _id: notification.sender._id,
          name: notification.sender.name,
          profilePicture: notification.sender.profilePicture || 'https://via.placeholder.com/40'
        };
        openChat(chatUser);
        setIsOpen(false); // Close notification dropdown
      } else if (notification.type === 'comment' && notification.postId) {
        navigate(`/post/${notification.postId}`);
      } else if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <BellIcon className="h-6 w-6" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
              {notifications.length}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-[#136269] hover:text-[#5DB2B3]"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No new notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                    >
                      <img
                        src={notification.sender.profilePicture || 'https://via.placeholder.com/40'}
                        alt={notification.sender.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.sender.name}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Notifications; 