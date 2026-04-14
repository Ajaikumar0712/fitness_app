import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sf_token');
      localStorage.removeItem('sf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register    = (data) => API.post('/auth/register', data);
export const login       = (data) => API.post('/auth/login', data);
export const getMe       = ()     => API.get('/auth/me');
export const updateMe    = (data) => API.put('/auth/update', data);
export const deleteMe    = ()     => API.delete('/auth/delete');

// Health
export const logMetric      = (data) => API.post('/health', data);
export const getMetrics     = (params) => API.get('/health', { params });
export const getLatestMetric= ()     => API.get('/health/latest');
export const updateMetric   = (id, data) => API.put(`/health/${id}`, data);
export const deleteMetricAPI= (id)   => API.delete(`/health/${id}`);

// Activity
export const logActivity    = (data) => API.post('/activity', data);
export const getActivities  = (params) => API.get('/activity', { params });
export const getWeeklyActivity = () => API.get('/activity/weekly');
export const deleteActivity = (id)   => API.delete(`/activity/${id}`);

// Diet
export const logFood        = (data) => API.post('/diet', data);
export const getTodayDiet   = ()     => API.get('/diet/today');
export const getDietHistory = ()     => API.get('/diet/history');
export const searchFoods    = (q)    => API.get('/diet/foods', { params: { search: q } });
export const deleteDietEntry= (id)   => API.delete(`/diet/${id}`);

// Goals
export const createGoal     = (data) => API.post('/goals', data);
export const getGoals       = ()     => API.get('/goals');
export const updateGoal     = (id, data) => API.put(`/goals/${id}`, data);
export const updateGoalStatus=(id, status) => API.patch(`/goals/${id}/status`, { status });
export const deleteGoal     = (id)   => API.delete(`/goals/${id}`);

// Alerts
export const getAlerts      = (params) => API.get('/alerts', { params });
export const markAlertRead  = (id)   => API.patch(`/alerts/${id}/read`);
export const markAllRead    = ()     => API.patch('/alerts/readall');
export const deleteAlertAPI = (id)   => API.delete(`/alerts/${id}`);

export default API;
