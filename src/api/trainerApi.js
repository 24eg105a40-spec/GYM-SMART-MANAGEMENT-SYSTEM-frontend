import api from './axios';

export const trainerApi = {
  getAllTrainers: async (activeOnly = false) => {
    const response = await api.get(`/trainers?activeOnly=${activeOnly}`);
    return response.data;
  },
  getAll: async (activeOnly = false) => {
    const response = await api.get(`/trainers?activeOnly=${activeOnly}`);
    return response.data;
  },
  getTrainerById: async (id) => {
    const response = await api.get(`/trainers/${id}`);
    return response.data;
  },
  createTrainer: async (trainerData) => {
    const response = await api.post('/trainers', trainerData);
    return response.data;
  },
  updateTrainer: async (id, trainerData) => {
    const response = await api.put(`/trainers/${id}`, trainerData);
    return response.data;
  },
  updateTrainerStatus: async (id, active) => {
    const response = await api.patch(`/trainers/${id}/status`, { active });
    return response.data;
  },
  getMyAssignedMembers: async () => {
    const response = await api.get('/trainers/me/members');
    return response.data;
  },
  getMyTrainerProfile: async () => {
    const response = await api.get('/trainers/me/profile');
    return response.data;
  },
  updateMyTrainerProfile: async (profileData) => {
    const response = await api.put('/trainers/me/profile', profileData);
    return response.data;
  },
};
