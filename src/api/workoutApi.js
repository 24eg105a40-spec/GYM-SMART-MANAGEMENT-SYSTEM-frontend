import api from './axios';

export const workoutApi = {
  createWorkoutPlan: async (planData) => {
    const response = await api.post('/trainers/workout-plans', planData);
    return response.data;
  },
  getMyWorkoutPlans: async () => {
    const response = await api.get('/members/me/workout-plans');
    return response.data;
  },
  getTrainerWorkoutPlans: async () => {
    const response = await api.get('/trainers/me/workout-plans');
    return response.data;
  },
  getWorkoutPlanById: async (id) => {
    const response = await api.get(`/trainers/workout-plans/${id}`);
    return response.data;
  },
  updateWorkoutPlan: async (id, planData) => {
    const response = await api.put(`/trainers/workout-plans/${id}`, planData);
    return response.data;
  },
  updateWorkoutPlanStatus: async (id, active) => {
    const response = await api.patch(`/trainers/workout-plans/${id}/status`, { active });
    return response.data;
  },
  addExercise: async (planId, exerciseData) => {
    const response = await api.post(`/trainers/workout-plans/${planId}/exercises`, exerciseData);
    return response.data;
  },
  updateExercise: async (planId, exerciseId, exerciseData) => {
    const response = await api.put(`/trainers/workout-plans/${planId}/exercises/${exerciseId}`, exerciseData);
    return response.data;
  },
  deleteExercise: async (planId, exerciseId) => {
    const response = await api.delete(`/trainers/workout-plans/${planId}/exercises/${exerciseId}`);
    return response.data;
  },
};
