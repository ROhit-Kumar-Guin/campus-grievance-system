import axiosInstance from './axiosInstance.js';

export const fetchStories = async (params = {}) => {
  const response = await axiosInstance.get('/stories', { params });
  return response.data;
};

export const createStory = async (formData) => {
  const response = await axiosInstance.post('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const toggleLike = async (id) => {
  const response = await axiosInstance.post(`/stories/${id}/like`);
  return response.data;
};

export const addComment = async (id, text) => {
  const response = await axiosInstance.post(`/stories/${id}/comments`, { text });
  return response.data;
};

export const deleteStory = async (id) => {
  const response = await axiosInstance.delete(`/stories/${id}`);
  return response.data;
};