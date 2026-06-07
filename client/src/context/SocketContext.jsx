import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    // Create ONE socket connection for the entire app
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', user._id);
    });

    // ONE listener for the entire app
    socketRef.current.on('notification', (data) => {
      // Add to notifications list
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show ONE toast
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
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?._id]);

  const resetUnreadCount = () => setUnreadCount(0);

  const addNotifications = (notifs) => {
    setNotifications(notifs);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const markAllReadLocally = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markOneReadLocally = (id) => {
    setNotifications((prev) =>
      prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      notifications,
      unreadCount,
      resetUnreadCount,
      addNotifications,
      removeNotification,
      markAllReadLocally,
      markOneReadLocally,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used inside SocketProvider');
  return context;
};