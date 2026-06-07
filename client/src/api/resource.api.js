import axiosInstance from './axiosInstance.js';

export const fetchResources = async (params = {}) => {
  const response = await axiosInstance.get('/resources', { params });
  return response.data;
};

export const uploadResource = async (formData) => {
  // Must use multipart/form-data for file uploads
  const response = await axiosInstance.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const trackDownload = async (id) => {
  const response = await axiosInstance.patch(`/resources/${id}/download`);
  return response.data;
};

export const deleteResource = async (id) => {
  const response = await axiosInstance.delete(`/resources/${id}`);
  return response.data;
};