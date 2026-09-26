import { Server } from 'socket.io';

let ioInstance = null;

export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.io: ${socket.id}`);

    // Join room for specific user if authenticated
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

export function emitIncidentCreated(incident) {
  if (ioInstance) {
    ioInstance.emit('incident_created', incident);
  }
}

export function emitIncidentUpdated(incident) {
  if (ioInstance) {
    ioInstance.emit('incident_updated', incident);
  }
}

export function emitQueueUpdated(data) {
  if (ioInstance) {
    ioInstance.emit('queue_updated', data);
  }
}

export function emitCampusBroadcast(broadcast) {
  if (ioInstance) {
    ioInstance.emit('campus_broadcast', broadcast);
  }
}

export function emitNotificationCreated(notification) {
  if (ioInstance) {
    if (notification.userId && notification.userId !== 'all') {
      ioInstance.to(`user_${notification.userId}`).emit('notification_created', notification);
    } else {
      ioInstance.emit('notification_created', notification);
    }
  }
}
