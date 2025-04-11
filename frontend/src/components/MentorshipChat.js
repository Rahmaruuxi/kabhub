import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FaPaperPlane, FaCheck, FaCheckDouble } from 'react-icons/fa';
import io from 'socket.io-client';

const MentorshipChat = ({ mentorshipId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const { user } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/mentorship-messages/mentorship/${mentorshipId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/mentorship-messages/unread/${mentorshipId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Mark messages as read
  const markAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/mentorship-messages/read`, 
        { mentorshipId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/mentorship-messages`,
        {
          mentorshipId,
          content: newMessage
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setMessages([...messages, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  // Setup socket connection
  useEffect(() => {
    socketRef.current = io(API_URL);
    
    // Join mentorship room
    socketRef.current.emit('join-mentorship', mentorshipId);
    
    // Listen for new messages
    socketRef.current.on('new-message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
      scrollToBottom();
      
      // If message is from other user, increment unread count
      if (message.sender._id !== user._id) {
        setUnreadCount(prev => prev + 1);
      }
    });
    
    return () => {
      // Leave mentorship room and disconnect
      socketRef.current.emit('leave-mentorship', mentorshipId);
      socketRef.current.disconnect();
    };
  }, [mentorshipId, API_URL, user._id]);

  // Fetch messages and unread count on component mount
  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
  }, [mentorshipId]);

  // Mark messages as read when component is visible
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages]);

  return (
    <div className="mentorship-chat-container">
      <div className="mentorship-chat-header">
        <h3>Mentorship Chat</h3>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount} new messages</span>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message) => (
            <div 
              key={message._id} 
              className={`message ${message.sender._id === user._id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{message.content}</p>
                <div className="message-meta">
                  <span className="message-time">
                    {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                  </span>
                  {message.sender._id === user._id && (
                    <span className="message-status">
                      {message.read ? <FaCheckDouble /> : <FaCheck />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default MentorshipChat; 