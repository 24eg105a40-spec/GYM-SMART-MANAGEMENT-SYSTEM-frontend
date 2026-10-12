import api from './axios';

export const trainingSessionApi = {
  bookSession: async (sessionData) => {
    const response = await api.post('/training-sessions', sessionData);
    return response.data;
  },
  getMySessions: async () => {
    const response = await api.get('/training-sessions/my');
    return response.data;
  },
  getTrainerSessions: async () => {
    const response = await api.get('/trainers/me/sessions');
    return response.data;
  },
  getAllSessions: async () => {
    const response = await api.get('/admin/training-sessions');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/admin/training-sessions');
    return response.data;
  },
  getAdminSessions: async () => {
    const response = await api.get('/admin/training-sessions');
    return response.data;
  },
  getSessionById: async (id) => {
    const response = await api.get(`/training-sessions/${id}`);
    return response.data;
  },
  updateSessionStatus: async (id, status, cancellationReason = null) => {
    const response = await api.patch(`/trainers/sessions/${id}/status`, { status, cancellationReason });
    return response.data;
  },
  cancelSession: async (id, reason = null) => {
    const response = await api.patch(`/training-sessions/${id}/cancel`, { reason });
    return response.data;
  },
};
