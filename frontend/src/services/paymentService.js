import api from './api';

const recordPayment = async (paymentData) => {
  const response = await api.post('/payments/record', paymentData);
  return response.data;
};

const getPaymentsByStudent = async (studentId) => {
  const response = await api.get(`/payments/student/${studentId}`);
  return response.data;
};

const getDailyCollection = async (date) => {
  const response = await api.get(`/payments/collection/daily?date=${date}`);
  return response.data;
};

const getMonthlyCollection = async (year, month) => {
  const response = await api.get(`/payments/collection/monthly?year=${year}&month=${month}`);
  return response.data;
};

const getDefaulters = async () => {
  const response = await api.get('/payments/defaulters');
  return response.data;
};

export default {
  recordPayment,
  getPaymentsByStudent,
  getDailyCollection,
  getMonthlyCollection,
  getDefaulters,
};