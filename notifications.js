import express from 'express';
import { verifyToken } from './auth.js';
import { memoryStore } from './database.js';
import { emitNotificationCreated } from './socket.js';

export const notificationsRouter = express.Router();

export function createNotification(userId, type, title, message) {
  const notif = {
    _id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    type: type || 'General',
    title,
    message,
    read: false,
    createdAt: new Date()
  };
  memoryStore.notifications.unshift(notif);
  emitNotificationCreated(notif);
  return notif;
}

// GET: Current user's notifications
notificationsRouter.get('/', verifyToken, (req, res) => {
  const userNotifs = memoryStore.notifications.filter(
    n => !n.userId || n.userId === req.user.id || n.userId === 'all'
  );

  const unreadCount = userNotifs.filter(n => !n.read).length;
  res.json({ success: true, count: userNotifs.length, unreadCount, notifications: userNotifs });
});

// PUT: Mark single notification as read
notificationsRouter.put('/:id/read', verifyToken, (req, res) => {
  const notif = memoryStore.notifications.find(n => n._id === req.params.id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true, message: 'Notification marked as read.' });
});

// PUT: Mark all notifications as read
notificationsRouter.put('/read-all', verifyToken, (req, res) => {
  memoryStore.notifications.forEach(n => {
    if (!n.userId || n.userId === req.user.id || n.userId === 'all') {
      n.read = true;
    }
  });
  res.json({ success: true, message: 'All notifications marked as read.' });
});
