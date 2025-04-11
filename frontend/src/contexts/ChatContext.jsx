import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentRecipient, setCurrentRecipient] = useState(null);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const openChat = (recipient) => {
    if (!recipient || !recipient._id) {
      console.error('Invalid recipient:', recipient);
      return;
    }
    
    setCurrentRecipient(recipient);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setCurrentRecipient(null);
  };

  const value = {
    isChatOpen,
    currentRecipient,
    toggleChat,
    openChat,
    closeChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 