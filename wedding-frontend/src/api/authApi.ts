import axiosClient from './axiosClient';

export const authApi = {
  forgotPassword: async (email: string) => {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: any) => {
    const response = await axiosClient.post('/auth/reset-password', data);
    return response.data;
  },
};
