import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useChat } from "../../contexts/ChatContext";
import config from "../../config";

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { socket } = useSocket();
  const { isChatOpen, currentRecipient, closeChat } = useChat();

  // Join chat room when recipient changes
  useEffect(() => {
    if (socket && currentRecipient?._id) {
      console.log('Joining chat with:', currentRecipient._id);
      socket.emit('join_chat', { recipientId: currentRecipient._id });
      fetchMessages();
    }
  }, [socket, currentRecipient]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      console.log('Received message:', data);
      if (currentRecipient && (data.senderId === currentRecipient._id || data.recipientId === currentRecipient._id)) {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
      }
    };

    socket.on("receive_private_message", handleNewMessage);
    socket.on("message_sent_confirmation", handleNewMessage);

    return () => {
      socket.off("receive_private_message", handleNewMessage);
      socket.off("message_sent_confirmation", handleNewMessage);
    };
  }, [socket, currentRecipient]);

  const fetchMessages = async () => {
    if (!currentRecipient?._id) return;

    try {
      console.log('Fetching messages for recipient:', currentRecipient._id);
      const response = await axios.get(`${config.API_URL}/api/messages/${currentRecipient._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log('Fetched messages:', response.data);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading || !currentRecipient?._id) return;

    setLoading(true);
    try {
      console.log('Sending message to:', currentRecipient._id);
      const response = await axios.post(
        `${config.API_URL}/api/messages`,
        {
          recipientId: currentRecipient._id,
          content: message.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log('Message sent:', response.data);
      setMessages(prev => [...prev, response.data]);
      setMessage("");
      
      // Emit socket event
      socket.emit("send_private_message", {
        recipientId: currentRecipient._id,
        message: response.data,
      });
      
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!isChatOpen || !currentRecipient) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-4 w-80 bg-white rounded-t-lg shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <img
            src={currentRecipient.profilePicture || "https://via.placeholder.com/40"}
            alt={currentRecipient.name}
            className="w-8 h-8 rounded-full mr-2"
          />
          <span className="font-medium">{currentRecipient.name}</span>
        </div>
        <button
          onClick={closeChat}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.senderId === user._id ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  msg.senderId === user._id
                    ? "bg-[#136269] text-white"
                    : "bg-gray-200"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-[#136269]"
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="bg-[#136269] text-white px-4 py-2 rounded-lg hover:bg-[#5DB2B3] transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget;
