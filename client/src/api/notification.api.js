import axiosInstance from './axiosInstance.js';

export const fetchNotifications = async () => {
  const response = await axiosInstance.get('/notifications');
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axiosInstance.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axiosInstance.patch('/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await axiosInstance.delete(`/notifications/${id}`);
  return response.data;
};