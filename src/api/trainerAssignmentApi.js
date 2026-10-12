import api from './axios';

export const trainerAssignmentApi = {
  assignTrainer: async (data) => {
    const response = await api.post('/admin/trainer-assignments', data);
    return response.data;
  },
  assign: async (data) => {
    const response = await api.post('/admin/trainer-assignments', data);
    return response.data;
  },
  getMyAssignedTrainer: async () => {
    const response = await api.get('/members/me/trainer');
    return response.data;
  },
  getAllAssignments: async () => {
    const response = await api.get('/admin/trainer-assignments');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/admin/trainer-assignments');
    return response.data;
  },
  updateAssignmentStatus: async (id, active) => {
    const response = await api.patch(`/admin/trainer-assignments/${id}/status`, { active });
    return response.data;
  },
  updateStatus: async (id, active) => {
    const response = await api.patch(`/admin/trainer-assignments/${id}/status`, { active });
    return response.data;
  },
};
