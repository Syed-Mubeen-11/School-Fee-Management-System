import api from './api';

const getAllStudents = async () => {
  const response = await api.get('/students');
  return response.data;
};

const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

const addStudent = async (studentData, parentId = null) => {
  const url = parentId ? `/students?parentId=${parentId}` : '/students';
  const response = await api.post(url, studentData);
  return response.data;
};

const updateStudent = async (id, studentData) => {
  const response = await api.put(`/students/${id}`, studentData);
  return response.data;
};

const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

const getPendingFee = async (studentId) => {
  const response = await api.get(`/students/${studentId}/pending-fee`);
  return response.data;
};

export default {
  getAllStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
  getPendingFee,
};