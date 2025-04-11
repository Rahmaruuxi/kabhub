import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const UserChat = ({ recipientId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { user, token } = useAuth();

  useEffect(() => {
    if (recipientId && token) {
      console.log('Initializing chat with recipient:', recipientId); // Debug log
      fetchMessages();
      fetchRecipientDetails();

      // Initialize socket connection
      if (socket) {
        socket.emit('join_chat', { userId: user._id, recipientId });
      }
    }
  }, [recipientId, token]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (data) => {
        console.log('Received new message:', data);
        if (data.senderId === recipientId || data.recipientId === recipientId) {
          const newMsg = {
            _id: Date.now(),
            content: data.message || data.content,
            senderId: data.senderId,
            recipientId: data.recipientId,
            createdAt: data.timestamp || new Date()
          };
          setMessages(prev => [...prev, newMsg]);
          scrollToBottom();
        }
      };

      socket.on('receive_private_message', handleNewMessage);
      socket.on('message_sent_confirmation', handleNewMessage);

      // Join the chat room
      socket.emit('join_chat', { userId: user._id, recipientId });

      return () => {
        socket.off('receive_private_message', handleNewMessage);
        socket.off('message_sent_confirmation', handleNewMessage);
        // Leave the chat room
        socket.emit('leave_chat', { userId: user._id, recipientId });
      };
    }
  }, [socket, recipientId, user._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRecipientDetails = async () => {
    try {
      console.log('Fetching recipient details for:', recipientId); // Debug log
      const response = await axios.get(`http://localhost:5000/api/users/${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Recipient details:', response.data); // Debug log
      setRecipient(response.data);
    } catch (error) {
      console.error('Error fetching recipient details:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for chat with:', recipientId); // Debug log
      const response = await axios.get(`http://localhost:5000/api/messages/chat/${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched messages:', response.data); // Debug log
      
      if (Array.isArray(response.data)) {
        setMessages(response.data);
      } else if (response.data.messages && Array.isArray(response.data.messages)) {
        setMessages(response.data.messages);
      } else {
        console.error('Expected array of messages but got:', response.data);
        setMessages([]);
      }
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      console.log('Sending message to:', recipientId);
      
      // Add message to local state immediately for better UX
      const tempMessage = {
        _id: Date.now(),
        content: newMessage,
        senderId: user._id,
        recipientId: recipientId,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      scrollToBottom();

      // Save message to database
      const response = await axios.post('http://localhost:5000/api/messages/send', {
        recipientId,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Emit socket event for real-time messaging
      socket.emit('send_private_message', {
        recipientId,
        message: newMessage,
        senderId: user._id,
        senderName: user.name,
        messageId: response.data._id
      });

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!recipientId) return null;

  return (
    <div className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50">
      <div className="flex flex-col h-[500px]">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 bg-[#136269] text-white">
          <div className="flex items-center space-x-2">
            <img
              src={recipient?.profilePicture || 'https://via.placeholder.com/40'}
              alt={recipient?.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium">{recipient?.name}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message._id || index}
                className={`flex ${message.senderId === user._id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.senderId === user._id
                      ? 'bg-[#136269] text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#136269]"
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-[#136269] text-white px-4 py-2 rounded-lg hover:bg-[#5DB2B3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserChat; 