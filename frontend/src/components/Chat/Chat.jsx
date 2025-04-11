import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import NotificationList from '../NotificationList';
import { useSocket } from '../../context/SocketContext';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipientId, setRecipientId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [openChats, setOpenChats] = useState(new Set());
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { user } = useAuth();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket || !user?._id) return;

    // Listen for incoming messages
    socket.on('receive_private_message', (data) => {
      console.log('Received message:', data);
      const newMessage = {
        content: data.message,
        sender: data.senderId,
        senderName: data.senderName,
        timestamp: data.timestamp,
        read: false
      };

      // Add message to messages if chat is open with sender
      if (data.senderId === recipientId) {
        setMessages(prev => [...prev, newMessage]);
        // Mark as read
        socket.emit('mark_messages_read', {
          senderId: data.senderId,
          recipientId: user._id
        });
      } else {
        // Add to notifications if chat is not open
        setNotifications(prev => [...prev, {
          senderId: data.senderId,
          senderName: data.senderName,
          message: data.message,
          timestamp: data.timestamp
        }]);
      }
    });

    // Listen for typing indicators
    socket.on('user_typing', ({ senderId }) => {
      if (senderId === recipientId) {
        setIsTyping(true);
      }
    });

    socket.on('user_stop_typing', ({ senderId }) => {
      if (senderId === recipientId) {
        setIsTyping(false);
      }
    });

    // Listen for online status changes
    socket.on('user_status_change', ({ userId, status }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status === 'online') {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (socket) {
        socket.off('receive_private_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
        socket.off('user_status_change');
      }
    };
  }, [socket, user, recipientId]);

  // Handle notification click
  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    setRecipientId(notification.senderId);
    setOpenChats(prev => {
      const newSet = new Set(prev);
      newSet.add(notification.senderId);
      return newSet;
    });
    // Remove the notification
    setNotifications(prev => prev.filter(n => n.senderId !== notification.senderId));
  };

  // Handle quick reply from notification
  const handleQuickReply = async (recipientId, replyMessage) => {
    const success = await sendMessage(recipientId, replyMessage);
    if (success) {
      setNotifications(prev => prev.filter(n => n.senderId !== recipientId));
    }
  };

  const handleTyping = () => {
    if (recipientId) {
      socket.emit('typing', {
        senderId: user._id,
        recipientId
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', {
          senderId: user._id,
          recipientId
        });
      }, 1000);
    }
  };

  const sendMessage = async (recipientId, content) => {
    if (!content.trim() || !recipientId) return;

    try {
      // Send message through socket
      socket.emit('send_private_message', {
        message: content.trim(),
        senderId: user._id,
        senderName: user.name,
        recipientId
      });

      // Add message to local state if chat is open
      if (recipientId === recipientId) {
        setMessages(prev => [...prev, {
          content: content.trim(),
          sender: user._id,
          senderName: user.name,
          timestamp: new Date(),
          read: false
        }]);
      }

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendMessage(recipientId, message);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Notifications */}
      <NotificationList
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onReply={handleQuickReply}
        socket={socket}
        currentUser={user}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {recipientId ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === user._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender === user._id
                        ? 'bg-[#136269] text-white'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    <div>{msg.content}</div>
                    <div className="text-xs mt-1 opacity-75">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                      {msg.sender === user._id && (
                        <span className="ml-2">
                          {msg.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="text-gray-500 text-sm">User is typing...</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5DB2B3]"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#136269] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 