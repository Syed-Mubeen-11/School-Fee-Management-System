import api from './api';

const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
};

const isAccountant = () => {
  const user = getCurrentUser();
  return user?.role === 'ACCOUNTANT';
};

const isParent = () => {
  const user = getCurrentUser();
  return user?.role === 'PARENT';
};

export default {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  isAccountant,
  isParent,
};