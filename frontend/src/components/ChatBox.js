import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import io from "socket.io-client";
import {
  UserCircleIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

const ChatBox = ({ recipient, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const { user, token } = useAuth();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user || !token || !recipient || !recipient._id) return;

    // Initialize socket connection
    socketRef.current = io("http://localhost:5000", {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    // Connect socket and fetch messages
    const initializeChat = async () => {
      try {
        // Join user's room for direct messages
        socketRef.current.emit("join-user", user._id);
        
        await fetchMessages();
        await markMessagesAsRead();
        scrollToBottom();

        // Set up socket listeners
        socketRef.current.on("connect", () => {
          console.log("Socket connected");
        });

        socketRef.current.on("receive-message", (newMessage) => {
          console.log("Received new message:", newMessage);
          if (
            (newMessage.sender?._id === recipient._id && newMessage.recipient?._id === user._id) ||
            (newMessage.sender?._id === user._id && newMessage.recipient?._id === recipient._id)
          ) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            scrollToBottom();
            // Mark message as read if we're the recipient
            if (newMessage.recipient?._id === user._id) {
              markMessagesAsRead();
            }
          }
        });
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-user", user._id);
        socketRef.current.disconnect();
      }
    };
  }, [recipient?._id, user?._id, token]);

  const fetchMessages = async () => {
    if (!token || !recipient || !recipient._id) return;
    
    try {
      console.log("Fetching messages for recipient:", recipient._id);
      const response = await axios.get(
        `http://localhost:5000/api/messages/${recipient._id}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      console.log("Fetched messages:", response.data);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!token || !recipient || !recipient._id) return;

    try {
      await axios.put(
        `http://localhost:5000/api/messages/read/${recipient._id}`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !token || !recipient || !recipient._id || isSending) return;

    try {
      setIsSending(true);
      console.log("Sending message to:", recipient._id);
      
      const response = await axios.post(
        "http://localhost:5000/api/messages",
        {
          recipientId: recipient._id,
          content: message.trim(),
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      console.log("Message sent successfully:", response.data);
      
      // Update local messages state
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setMessage("");
      scrollToBottom();

      // Emit socket event
      if (socketRef.current) {
        socketRef.current.emit("send-message", response.data);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl z-50">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-[#136269] rounded-t-lg">
        <div className="flex items-center space-x-2">
          {recipient?.profilePicture ? (
            <img
              src={recipient.profilePicture.startsWith("http")
                ? recipient.profilePicture
                : `http://localhost:5000${recipient.profilePicture}`}
              alt={recipient?.name}
              className="h-8 w-8 rounded-full object-cover border-2 border-white"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "http://localhost:5000/uploads/profiles/default.png";
              }}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
              <UserCircleIcon className="h-5 w-5 text-[#136269]" />
            </div>
          )}
          <span className="text-sm font-medium text-white">{recipient?.name}</span>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender?._id === user?._id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                msg.sender?._id === user?._id
                  ? "bg-[#136269] text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs mt-1 opacity-75">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#136269] text-sm"
          />
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="px-3 py-2 bg-[#136269] text-white rounded-lg hover:bg-[#0f4a52] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox; 