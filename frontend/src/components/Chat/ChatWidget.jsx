import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useChat } from "../../contexts/ChatContext";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import PredefinedQuestions from "./PredefinedQuestions";
import config from "../../config";

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { socket } = useSocket();
  const { isChatOpen, currentRecipient, closeChat, toggleChat } = useChat();

  // If user is not logged in, don't show anything
  if (!user) return null;

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    
    const messageToSend = message.trim();
    if (!messageToSend || loading) return;

    setLoading(true);
    try {
      // Add user message
      const userMessage = {
        senderId: user._id,
        content: messageToSend,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setMessage("");
      scrollToBottom();

      // Get AI response
      const response = await axios.post(
        `${config.API_URL}/api/chat/ai`,
        { message: messageToSend },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Add AI response
      setMessages(prev => [...prev, {
        senderId: 'ai',
        content: response.data.message,
        createdAt: new Date()
      }]);
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSelect = (question) => {
    setMessage(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  if (!isChatOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-[#136269] text-white p-3 rounded-full shadow-lg hover:bg-[#5DB2B3] transition-colors z-50"
      >
        <ChatBubbleLeftIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-4 w-80 bg-white rounded-t-lg shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#136269] text-white flex items-center justify-center mr-2">
            AI
          </div>
          <span className="font-medium">AI Assistant</span>
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
          {messages.length === 0 && (
            <PredefinedQuestions onQuestionSelect={handleQuestionSelect} />
          )}
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
                <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content }} />
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
