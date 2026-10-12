import api from './axios';

export const attendanceApi = {
  checkIn: async () => {
    const response = await api.post('/attendance/check-in');
    return response.data;
  },
  getMyAttendance: async () => {
    const response = await api.get('/attendance/my');
    return response.data;
  },
  getMySummary: async () => {
    const response = await api.get('/attendance/my/summary');
    return response.data;
  },
  getAllAttendance: async (date = null) => {
    const url = date ? `/admin/attendance?date=${date}` : '/admin/attendance';
    const response = await api.get(url);
    return response.data;
  },
  getAll: async (params = null) => {
    const date = typeof params === 'string' ? params : params?.date;
    const url = date ? `/admin/attendance?date=${date}` : '/admin/attendance';
    const response = await api.get(url);
    return response.data;
  },
  getAdminSummary: async (params = null) => {
    const date = typeof params === 'string' ? params : params?.date;
    const url = date ? `/admin/attendance/summary?date=${date}` : '/admin/attendance/summary';
    const response = await api.get(url);
    return response.data;
  },
  correctAttendance: async (id, data) => {
    const response = await api.patch(`/admin/attendance/${id}`, data);
    return response.data;
  },
  correct: async (id, data) => {
    const response = await api.patch(`/admin/attendance/${id}`, data);
    return response.data;
  },
};
