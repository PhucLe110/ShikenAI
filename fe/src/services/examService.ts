import api from './api';

export const getExams = async () => {
  const response = await api.get('/exams');
  return response.data;
};

export const getExamById = async (id: string) => {
  const response = await api.get(`/exams/${id}`);
  return response.data;
};
