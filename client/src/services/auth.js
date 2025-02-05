import api from './api';

export const login = (email, password) => api.post('api/auth/login', { email, password }).then(res => res.data);
export const signup = (email, password,name) => api.post('api/auth/signup', { email, password,name }).then(res => res.data);