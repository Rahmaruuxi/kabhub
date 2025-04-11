import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const ChatBox = ({ recipientId, recipientName, onClose, socket, currentUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket?.current) return;

    // Listen for incoming messages
    const handleReceiveMessage = (data) => {
      console.log('Received message in ChatBox:', data);
      if (data.senderId === recipientId || data.recipientId === recipientId) {
        setMessages(prev => [...prev, {
          content: data.message,
          sender: data.senderId,
          senderName: data.senderName,
          timestamp: data.timestamp,
          read: false
        }]);

        // Mark message as read
        if (data.senderId === recipientId) {
          socket.current.emit('mark_messages_read', {
            senderId: data.senderId,
            recipientId: currentUser._id
          });
        }
      }
    };

    // Listen for typing indicators
    const handleTyping = ({ senderId }) => {
      if (senderId === recipientId) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === recipientId) {
        setIsTyping(false);
      }
    };

    // Join the chat room
    socket.current.emit('join_chat', {
      userId: currentUser._id,
      recipientId: recipientId
    });

    socket.current.on('receive_private_message', handleReceiveMessage);
    socket.current.on('user_typing', handleTyping);
    socket.current.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.current.emit('leave_chat', {
        userId: currentUser._id,
        recipientId: recipientId
      });
      socket.current.off('receive_private_message', handleReceiveMessage);
      socket.current.off('user_typing', handleTyping);
      socket.current.off('user_stop_typing', handleStopTyping);
    };
  }, [recipientId, currentUser._id, socket]);

  const handleTyping = () => {
    if (!socket?.current) return;

    socket.current.emit('typing', {
      senderId: currentUser._id,
      recipientId
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.current.emit('stop_typing', {
        senderId: currentUser._id,
        recipientId
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !socket?.current) return;

    setLoading(true);
    try {
      // Send message through socket
      socket.current.emit('send_private_message', {
        message: message.trim(),
        senderId: currentUser._id,
        senderName: currentUser.name,
        recipientId
      });

      // Add message to local state
      setMessages(prev => [...prev, {
        content: message.trim(),
        sender: currentUser._id,
        senderName: currentUser.name,
        timestamp: new Date(),
        read: false
      }]);

      // Clear input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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
    <div className="w-80 bg-white rounded-lg shadow-xl flex flex-col h-96">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b bg-[#136269] text-white rounded-t-lg">
        <div className="font-semibold">{recipientName}</div>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === currentUser._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-2 ${
                msg.sender === currentUser._id
                  ? 'bg-[#136269] text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="text-sm">{msg.content}</div>
              <div className="text-xs mt-1 opacity-75">
                {new Date(msg.timestamp).toLocaleTimeString()}
                {msg.sender === currentUser._id && (
                  <span className="ml-2">
                    {msg.read ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-gray-500 text-xs">User is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#136269]"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#136269] text-white px-4 py-2 rounded hover:bg-opacity-90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox; 