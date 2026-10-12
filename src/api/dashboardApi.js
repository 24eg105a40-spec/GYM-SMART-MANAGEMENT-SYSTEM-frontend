import api from './axios';

export const dashboardApi = {
  getAdminDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  getMemberDashboard: async () => {
    const response = await api.get('/members/me/dashboard');
    return response.data;
  },
  getTrainerDashboard: async () => {
    const response = await api.get('/trainers/me/dashboard');
    return response.data;
  },
};
