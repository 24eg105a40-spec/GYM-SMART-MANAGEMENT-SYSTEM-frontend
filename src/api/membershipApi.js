import api from './axios';

export const membershipApi = {
  // Membership Plans
  getPlans: async (activeOnly = false) => {
    const response = await api.get(`/membership-plans?activeOnly=${activeOnly}`);
    return response.data;
  },
  getPlanById: async (id) => {
    const response = await api.get(`/membership-plans/${id}`);
    return response.data;
  },
  createPlan: async (planData) => {
    const response = await api.post('/membership-plans', planData);
    return response.data;
  },
  updatePlan: async (id, planData) => {
    const response = await api.put(`/membership-plans/${id}`, planData);
    return response.data;
  },
  updatePlanStatus: async (id, active) => {
    const response = await api.patch(`/membership-plans/${id}/status`, { active });
    return response.data;
  },

  // Memberships
  requestMembership: async (data) => {
    const response = await api.post('/memberships', data);
    return response.data;
  },
  getMyMemberships: async () => {
    const response = await api.get('/memberships/my');
    return response.data;
  },
  getMembershipById: async (id) => {
    const response = await api.get(`/memberships/${id}`);
    return response.data;
  },
  renewMembership: async (id) => {
    const response = await api.post(`/memberships/${id}/renew`);
    return response.data;
  },
  cancelMembership: async (id) => {
    const response = await api.patch(`/memberships/${id}/cancel`);
    return response.data;
  },
  getAllMemberships: async () => {
    const response = await api.get('/admin/memberships');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/admin/memberships');
    return response.data;
  },
  activateMembership: async (id) => {
    const response = await api.patch(`/admin/memberships/${id}/activate`);
    return response.data;
  },
  activate: async (id) => {
    const response = await api.patch(`/admin/memberships/${id}/activate`);
    return response.data;
  },
  updateMembershipStatus: async (id, status) => {
    const response = await api.patch(`/admin/memberships/${id}/status`, { status });
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/admin/memberships/${id}/status`, { status });
    return response.data;
  },
};
