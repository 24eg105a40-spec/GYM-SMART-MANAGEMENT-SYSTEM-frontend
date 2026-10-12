import api from './axios';

export const trainerAvailabilityApi = {
  createAvailability: async (data) => {
    const response = await api.post('/trainers/availability', data);
    return response.data;
  },
  getTrainerAvailability: async (trainerId) => {
    const response = await api.get(`/trainers/${trainerId}/availability`);
    return response.data;
  },
  getMyAvailability: async () => {
    const response = await api.get('/trainers/me/availability');
    return response.data;
  },
  updateAvailability: async (id, data) => {
    const response = await api.put(`/trainers/availability/${id}`, data);
    return response.data;
  },
  deleteAvailability: async (id) => {
    const response = await api.delete(`/trainers/availability/${id}`);
    return response.data;
  },
};
