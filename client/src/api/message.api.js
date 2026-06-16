import axiosInstance from './axiosInstance.js';

export const fetchMessages = async (grievanceId) => {
  const response = await axiosInstance.get(`/messages/${grievanceId}`);
  return response.data;
};

export const sendMessage = async (grievanceId, text, receiverId) => {
  const response = await axiosInstance.post(`/messages/${grievanceId}`, {
    text,
    receiverId,
  });
  return response.data;
};

export const fetchInbox = async () => {
  const response = await axiosInstance.get('/messages/inbox');
  return response.data;
};