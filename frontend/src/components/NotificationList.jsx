import React, { useState } from 'react';
import ChatBox from './Chat/ChatBox';

const NotificationList = ({ notifications, onNotificationClick, onReply, socket, currentUser }) => {
  const [openChats, setOpenChats] = useState(new Set());

  const handleOpenChat = (notification) => {
    console.log('Opening chat for notification:', notification);
    // Add to open chats
    setOpenChats(prev => {
      const newSet = new Set(prev);
      newSet.add(notification.senderId);
      return newSet;
    });
    // Notify parent component
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleCloseChat = (senderId) => {
    console.log('Closing chat:', senderId);
    setOpenChats(prev => {
      const newSet = new Set(prev);
      newSet.delete(senderId);
      return newSet;
    });
  };

  console.log('Current open chats:', Array.from(openChats));
  console.log('Current notifications:', notifications);

  return (
    <>
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-[#136269] cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleOpenChat(notification)}
          >
            <div className="font-semibold">{notification.senderName}</div>
            <div className="text-sm text-gray-600">{notification.message}</div>
            <div className="text-xs text-[#136269] mt-2">Click to reply</div>
          </div>
        ))}
      </div>

      {/* Chat Boxes */}
      {Array.from(openChats).map((senderId, index) => {
        const notification = notifications.find(n => n.senderId === senderId) || {
          senderName: 'User', // Fallback name if notification is not found
          senderId: senderId
        };

        // Calculate position for each chat box
        const bottomPosition = 16; // 4rem
        const rightPosition = index * 336 + 16; // 320px width + 16px gap

        return (
          <div 
            key={senderId} 
            style={{ 
              position: 'fixed', 
              bottom: `${bottomPosition}px`, 
              right: `${rightPosition}px`, 
              zIndex: 50 + index 
            }}
          >
            <ChatBox
              recipientId={senderId}
              recipientName={notification.senderName}
              onClose={() => handleCloseChat(senderId)}
              socket={socket}
              currentUser={currentUser}
            />
          </div>
        );
      })}
    </>
  );
};

export default NotificationList; 