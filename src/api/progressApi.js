import api from './axios';

export const progressApi = {
  recordProgress: async (data) => {
    const response = await api.post('/progress', data);
    return response.data;
  },
  getMyProgress: async () => {
    const response = await api.get('/progress/my');
    return response.data;
  },
  updateProgress: async (id, data) => {
    const response = await api.put(`/progress/${id}`, data);
    return response.data;
  },
  deleteProgress: async (id) => {
    const response = await api.delete(`/progress/${id}`);
    return response.data;
  },
  getMemberProgressForTrainer: async (memberId) => {
    const response = await api.get(`/trainers/members/${memberId}/progress`);
    return response.data;
  },
};
