import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL 

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getNotes = () => api.get('/notes').then(res => res.data);
export const createNote = (note) => api.post('/notes', note).then(res => res.data);
export const updateNote = (id, note) => api.put(`/notes/${id}`, note).then(res => res.data);
export const deleteNote = (id) => api.delete(`/notes/${id}`).then(res => res.data);

export default api;