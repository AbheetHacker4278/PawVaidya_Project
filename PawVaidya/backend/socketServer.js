import { Server } from 'socket.io';
import http from 'http';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('offer', (data) => {
      socket.to(data.appointmentId).emit('offer', {
        offer: data.offer,
        from: socket.id,
      });
    });

    socket.on('answer', (data) => {
      socket.to(data.appointmentId).emit('answer', {
        answer: data.answer,
        from: socket.id,
      });
    });

    socket.on('ice-candidate', (data) => {
      socket.to(data.appointmentId).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.id,
      });
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', socket.id);
      console.log(`User ${socket.id} left room: ${roomId}`);
    });

    socket.on('chat-message', (data) => {
      console.log(`Chat message in room ${data.appointmentId}:`, data.message);
      // Broadcast message to all other users in the room
      socket.to(data.appointmentId).emit('chat-message', {
        message: data.message,
        sender: data.sender,
        senderType: data.senderType,
        timestamp: data.timestamp,
        isEmoji: data.isEmoji,
      });
    });

    // New chat message event for appointment chat
    socket.on('send-chat-message', (data) => {
      console.log(`New chat message in appointment ${data.appointmentId}`, data);
      // Broadcast to OTHER users in the appointment room (not sender)
      socket.to(data.appointmentId).emit('receive-chat-message', {
        senderId: data.senderId,
        senderType: data.senderType,
        message: data.message,
        messageType: data.messageType,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        timestamp: data.timestamp,
      });
    });

    socket.on('typing-start', (data) => {
      console.log(`User typing in room ${data.appointmentId}`);
      socket.to(data.appointmentId).emit('typing-start');
    });

    socket.on('typing-stop', (data) => {
      console.log(`User stopped typing in room ${data.appointmentId}`);
      socket.to(data.appointmentId).emit('typing-stop');
    });

    socket.on('screen-share-start', (data) => {
      console.log(`Screen sharing started in room ${data.appointmentId}`);
      socket.to(data.appointmentId).emit('screen-share-start');
    });

    socket.on('screen-share-stop', (data) => {
      console.log(`Screen sharing stopped in room ${data.appointmentId}`);
      socket.to(data.appointmentId).emit('screen-share-stop');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    // Direct Chat Events
    socket.on('join-direct-chat', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined direct chat room`);
    });

    socket.on('send-direct-message', (data) => {
      // This event is for client-to-server, but we handle message saving in controller
      // and server-to-client emission there. 
      // This listener might be redundant if we only use API for sending, 
      // but useful if we want pure socket communication later.
      console.log('Direct message received via socket:', data);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
