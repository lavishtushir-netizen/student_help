import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token automatically to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campuscare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth APIs
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  demoLogin: (role) => api.post('/auth/demo-login', { role }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  getMe: () => api.get('/auth/me')
};

// User Profile APIs
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data)
};

// Safety & Incident APIs
export const incidentApi = {
  getAll: (params) => api.get('/incidents', { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  create: (formData) => api.post('/incidents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, data) => api.put(`/incidents/${id}/status`, data),
  getSafeRoute: (routeParams) => api.post('/incidents/safe-route', routeParams),
  triggerSOS: (sosData) => api.post('/incidents/sos', sosData)
};

// QueueLess APIs
export const queueApi = {
  getAll: () => api.get('/queues'),
  getMyTokens: () => api.get('/queues/my-tokens'),
  bookToken: (bookingData) => api.post('/queues/book', bookingData),
  checkIn: (tokenCode) => api.post('/queues/check-in', { tokenCode }),
  callNext: (serviceId) => api.post('/queues/call-next', { serviceId }),
  getAnalytics: () => api.get('/queues/analytics')
};

// StudyPulse AI APIs
export const studyApi = {
  getDashboard: () => api.get('/study/dashboard'),
  toggleTask: (taskId) => api.post(`/study/tasks/${taskId}/toggle`),
  uploadSyllabus: (formData) => api.post('/study/upload-syllabus', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadDatesheet: (formData) => api.post('/study/upload-datesheet', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  scheduleFromDatesheet: (data) => api.post('/study/schedule-from-datesheet', data),
  logStudySession: (data) => api.post('/study/sessions', data),
  getStudySessions: () => api.get('/study/sessions'),
  addExam: (examData) => api.post('/study/exams', examData),
  getWeakSubjectPrediction: () => api.get('/study/weak-subject-prediction')
};

// Expense Tracker APIs
export const expenseApi = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (expenseData) => api.post('/expenses', expenseData),
  update: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
  delete: (id) => api.delete(`/expenses/${id}`)
};

// Notification APIs
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

// Admin APIs
export const adminApi = {
  getMetrics: () => api.get('/admin/metrics'),
  getAllStudents: (params) => api.get('/admin/students', { params }),
  broadcast: (broadcastData) => api.post('/admin/broadcast', broadcastData),
  exportIncidentsCsvUrl: '/api/admin/export-incidents-csv',
  exportQueuesCsvUrl: '/api/admin/export-queues-csv',
  exportStudentsCsvUrl: '/api/admin/export-students-csv'
};

// AI Assistant API
export const aiApi = {
  askAssistant: (message, context) => api.post('/ai/chat', { message, context })
};

export default api;
