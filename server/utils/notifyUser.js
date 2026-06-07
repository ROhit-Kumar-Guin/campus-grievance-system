import Notification from '../models/Notification.js';

// ── Send a notification to a user ───────────────────────────
// Creates it in the database AND emits it via Socket.io
// so if the user is online, they get it instantly
const notifyUser = async ({ io, recipientId, senderId, type, title, message, grievanceId }) => {
  try {
    // 1. Save to database so they see it even if offline
    const notification = await Notification.create({
      recipient:  recipientId,
      sender:     senderId || null,
      type,
      title,
      message,
      grievance:  grievanceId || null,
    });

    // 2. Emit via Socket.io if they're currently online
    // The user joined room `user:${userId}` when they logged in
    if (io) {
      io.to(`user:${recipientId}`).emit('notification', {
        _id:       notification._id,
        type,
        title,
        message,
        grievance: grievanceId,
        createdAt: notification.createdAt,
        isRead:    false,
      });
    }

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error.message);
  }
};

export default notifyUser;