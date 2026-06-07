import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:5000';

// Single shared socket instance across the app
let socket = null;
let isConnected = false;

const useSocket = (onNotification, showToast = false) => {
  const { user, isAuthenticated } = useAuth();
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    // Only create one socket connection
    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
      });
    }

    socket.on('connect', () => {
      if (!isConnected) {
        socket.emit('join', user._id);
        isConnected = true;
      }
    });

    const handleNotification = (data) => {
      // Only show toast if this instance is the designated toast shower
      if (showToast) {
        const icon =
          data.type === 'grievance_resolved' ? '✅' :
          data.type === 'comment_added'      ? '💬' :
          data.type === 'grievance_assigned' ? '📌' : '📋';

        toast(data.title, {
          icon,
          duration: 4000,
          style: {
            fontSize: '13px',
            borderRadius: '10px',
            background: '#4F46E5',
            color: '#fff',
          },
        });
      }

      // Always call the callback regardless
      if (onNotificationRef.current) {
        onNotificationRef.current(data);
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket?.off('notification', handleNotification);
    };
  }, [isAuthenticated, user?._id, showToast]);

  return socket;
};

export default useSocket;