const socketIo = require('socket.io');

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Keep track of online users and their socket IDs
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
      // Remove user from online users when they disconnect
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('user_status_change', { userId, status: 'offline' });
          break;
        }
      }
      console.log("Client disconnected");
    });

    // User comes online
    socket.on("user_connected", (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.join(userId.toString());
        io.emit('user_status_change', { userId, status: 'online' });
        console.log(`User ${userId} is now online`);
      }
    });

    // Handle private messages
    socket.on("send_private_message", (data) => {
      const { recipientId, message } = data;
      
      console.log('Received private message:', data);
      
      if (recipientId && message) {
        // Send to recipient
        io.to(recipientId.toString()).emit("receive_private_message", message);
        
        // Send confirmation back to sender
        socket.emit("message_sent_confirmation", message);
      }
    });

    // Join chat
    socket.on("join_chat", (data) => {
      const { recipientId } = data;
      if (recipientId) {
        socket.join(recipientId.toString());
        console.log(`Socket joined chat with recipient ${recipientId}`);
      }
    });

    // Mark messages as read
    socket.on("mark_messages_read", (data) => {
      const { senderId, recipientId } = data;
      io.to(senderId.toString()).emit("messages_marked_read", {
        readBy: recipientId,
        timestamp: new Date()
      });
    });
  });

  return io;
};

module.exports = initializeSocket; 