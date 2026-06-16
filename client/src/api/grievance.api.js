import axiosInstance from './axiosInstance.js';

export const fetchGrievances = async (params = {}) => {
  const response = await axiosInstance.get('/grievances', { params });
  return response.data;
};

// Fetch only the logged-in student's own grievances
export const fetchMyGrievances = async (params = {}) => {
  const response = await axiosInstance.get('/grievances', {
    params: { ...params, mine: 'true' },
  });
  return response.data;
};

export const fetchGrievanceById = async (id) => {
  const response = await axiosInstance.get(`/grievances/${id}`);
  return response.data;
};

export const createGrievance = async (data) => {
  const response = await axiosInstance.post('/grievances', data);
  return response.data;
};

export const updateGrievanceStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/grievances/${id}/status`, { status });
  return response.data;
};

export const assignGrievance = async (id, data) => {
  const response = await axiosInstance.patch(`/grievances/${id}/assign`, data);
  return response.data;
};

export const addComment = async (id, text) => {
  const response = await axiosInstance.post(`/grievances/${id}/comments`, { text });
  return response.data;
};

export const deleteGrievance = async (id) => {
  const response = await axiosInstance.delete(`/grievances/${id}`);
  return response.data;
};