import api from './api';

export const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const lockUser = async (userId: string, reason: string) => {
  const response = await api.post('/admin/users/lock', { userId, reason });
  return response.data;
};

export const unlockUser = async (userId: string) => {
  const response = await api.post(`/admin/users/unlock/${userId}`);
  return response.data;
};

export const handleUnlockRequest = async (userId: string, status: 'approved' | 'rejected') => {
  const response = await api.post('/admin/users/unlock-request', { userId, status });
  return response.data;
};

export const getPendingResources = async () => {
  const response = await api.get('/admin/resources/pending');
  return response.data;
};

export const updateResourceStatus = async (resourceId: string, status: 'approved' | 'rejected') => {
  const response = await api.post('/admin/resources/status', { resourceId, status });
  return response.data;
};

export const deleteResource = async (resourceId: string) => {
  const response = await api.delete(`/admin/resources/${resourceId}`);
  return response.data;
};

export const getExamDetail = async (examId: string) => {
  const response = await api.get(`/admin/exams/${examId}`);
  return response.data;
};

export const updateExam = async (examId: string, data: any) => {
  const response = await api.put(`/admin/exams/${examId}`, data);
  return response.data;
};

export const deleteExam = async (examId: string) => {
  const response = await api.delete(`/admin/exams/${examId}`);
  return response.data;
};

export const toggleExamVisibility = async (examId: string) => {
  const response = await api.post(`/admin/exams/toggle-visibility/${examId}`);
  return response.data;
};
