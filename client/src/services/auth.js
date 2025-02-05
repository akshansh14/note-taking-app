import api from './api';

export const login = (email, password) => api.post('/auth/login', { email, password }).then(res => res.data);
export const signup = (email, password,name) => api.post('/auth/signup', { email, password,name }).then(res => res.data);