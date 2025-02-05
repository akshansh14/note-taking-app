import axios from 'axios';

const API_URL =  process.env.REACT_APP_API_URL

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

export const getNotes = () => api.get('api/notes').then(res => res.data);
export const createNote = (note) => api.post('api/notes', note).then(res => res.data);
export const updateNote = (id, note) => api.put(`api/notes/${id}`, note).then(res => res.data);
export const deleteNote = (id) => api.delete(`api/notes/${id}`).then(res => res.data);

export default api;