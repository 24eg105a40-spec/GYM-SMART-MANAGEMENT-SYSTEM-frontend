import api from './axios';

export const paymentApi = {
  recordPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },
  getMyPayments: async () => {
    const response = await api.get('/payments/my');
    return response.data;
  },
  getAllPayments: async () => {
    const response = await api.get('/admin/payments');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/admin/payments');
    return response.data;
  },
  getPaymentById: async (id) => {
    const response = await api.get(`/admin/payments/${id}`);
    return response.data;
  },
  verifyPayment: async (id) => {
    const response = await api.patch(`/admin/payments/${id}/verify`);
    return response.data;
  },
  verify: async (id) => {
    const response = await api.patch(`/admin/payments/${id}/verify`);
    return response.data;
  },
  updatePaymentStatus: async (id, status) => {
    const response = await api.patch(`/admin/payments/${id}/status`, { status });
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/admin/payments/${id}/status`, { status });
    return response.data;
  },
};
