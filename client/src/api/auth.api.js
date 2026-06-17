import axiosInstance from './axiosInstance.js';

export const registerUser = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const loginWithGoogle = async (idToken) => {
  const response = await axiosInstance.post('/auth/google-login', { idToken });
  return response.data;
};

export const getMyProfile = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};