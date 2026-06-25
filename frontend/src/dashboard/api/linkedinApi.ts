// src/dashboard/api/linkedinApi.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const fetchLinkedInPosts = async () => {
  const res = await api.get('/linkedin/posts');
  return res.data;
};

export const fetchLinkedInEvents = async () => {
  const res = await api.get('/linkedin/events');
  return res.data;
};

export const fetchLinkedInLeads = async (start = 0, count = 100) => {
  const res = await api.get('/linkedin/connections', { params: { start, count } });
  return res.data;
};
