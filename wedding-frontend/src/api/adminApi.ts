import axiosClient from './axiosClient';

export const adminApi = {
  getStats: async () => {
    const response = await axiosClient.get('/admin/stats/dashboard');
    return response.data;
  },
};
