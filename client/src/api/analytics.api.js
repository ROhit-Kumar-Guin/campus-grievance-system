import axiosInstance from './axiosInstance.js';

export const fetchSummary = async () => {
  const response = await axiosInstance.get('/analytics/summary');
  return response.data;
};

export const fetchMonthlyTrends = async () => {
  const response = await axiosInstance.get('/analytics/trends');
  return response.data;
};

export const fetchCategoryBreakdown = async () => {
  const response = await axiosInstance.get('/analytics/categories');
  return response.data;
};

export const fetchStatusDistribution = async () => {
  const response = await axiosInstance.get('/analytics/status');
  return response.data;
};