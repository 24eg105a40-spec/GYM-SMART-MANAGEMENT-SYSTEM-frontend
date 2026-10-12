import api from './axios';

export const memberApi = {
  getMyProfile: async () => {
    const response = await api.get('/members/me');
    return response.data;
  },
  updateMyProfile: async (data) => {
    const response = await api.put('/members/me', data);
    return response.data;
  },
  getAllMembers: async (role) => {
    const url = role ? `/admin/members?role=${role}` : '/admin/members';
    const response = await api.get(url);
    return response.data;
  },
  getAll: async (role) => {
    const url = role ? `/admin/members?role=${role}` : '/admin/members';
    const response = await api.get(url);
    return response.data;
  },
  getAllUsers: async (role) => {
    const url = role ? `/admin/users?role=${role}` : '/admin/users';
    const response = await api.get(url);
    return response.data;
  },
  getMemberById: async (id) => {
    const response = await api.get(`/admin/members/${id}`);
    return response.data;
  },
  updateMemberStatus: async (id, active) => {
    const response = await api.patch(`/admin/members/${id}/status`, { active });
    return response.data;
  },
  deleteMember: async (id) => {
    const response = await api.delete(`/admin/members/${id}`);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  getMemberHistory: async (id) => {
    const response = await api.get(`/admin/members/${id}/membership-history`);
    return response.data;
  },
};
