import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Hint browsers not to cache API reads
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
  },
  timeout: 30000,
});

// Add token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // token only; we no longer read/write any "user" object
    if (token) config.headers.Authorization = `Bearer ${token}`;
    // add a tiny cache-buster to GETs
    if (config.method?.toLowerCase() === 'get') {
      const url = new URL(config.url || '', window.location.origin);
      url.searchParams.set('_t', Date.now().toString());
      config.url = url.pathname + url.search;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');     // only token
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(new Error(message));
  }
);

const API = {
  raw: apiClient,

  users: {
    me: (params) => apiClient.get('/users/me', { params }),                      // { success, user }
    updateMe: (data) => apiClient.patch('/users/me', data),                      // { success, user }
    uploadAvatar: (file) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return apiClient.post('/users/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    updatePassword: (currentPassword, newPassword) =>
      apiClient.post('/users/me/password', { currentPassword, newPassword }),
    changePassword: (payload) => apiClient.post('/users/me/password', payload),
  },

  auth: {
    login: async (credentials) => apiClient.post('/auth/login', credentials),
    register: async (userData) => apiClient.post('/auth/register', userData),
    getCurrentUser: async () => apiClient.get('/auth/me'),
    forgotPassword: async (email) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: async (token, password) => apiClient.post('/auth/reset-password', { token, password }),
    verifyEmail: async (token) => apiClient.post('/auth/verify-email', { token }),
    refreshToken: async () => apiClient.post('/auth/refresh-token'),
  },

  // (unchanged) … keep the rest of your modules as-is:
  dashboard: {
    getStats: () => apiClient.get('/dashboard/stats'),
    getUpcomingRides: () => apiClient.get('/dashboard/upcoming-rides'),
    getRideHistory: (page = 1, limit = 10, filter = 'all') =>
      apiClient.get(`/dashboard/ride-history?page=${page}&limit=${limit}&filter=${filter}`),
    getAnalytics: (timeframe = 'last30days') => apiClient.get(`/dashboard/analytics?timeframe=${timeframe}`),
  },

  rides: {
    create: (rideData) => apiClient.post('/rides/create', rideData),
    search: (searchParams) => apiClient.get(`/rides/search?${new URLSearchParams(searchParams).toString()}`),
    book: (rideId, bookingData) => apiClient.post(`/rides/${rideId}/book`, bookingData),
    updateLocation: (rideId, location) => apiClient.put(`/rides/${rideId}/location`, location),
    getLocationSuggestions: (input, location = null) => {
      const params = new URLSearchParams({ input });
      if (location) params.append('location', location);
      return apiClient.get(`/rides/suggestions?${params.toString()}`);
    },
    getRideDetails: (rideId) => apiClient.get(`/rides/${rideId}`),
    cancelRide: (rideId, reason) => apiClient.put(`/rides/${rideId}/cancel`, { reason }),
    getRideBookings: (rideId) => apiClient.get(`/rides/${rideId}/bookings`),
    getUserRides: (status = 'all') => apiClient.get(`/rides/user?status=${status}`),
  },

  bookings: {
    getUserBookings: (status = 'all', page = 1, limit = 10, type = 'all') =>
      apiClient.get(`/bookings?status=${status}&page=${page}&limit=${limit}&type=${type}`),
    getBookingDetails: (bookingId) => apiClient.get(`/bookings/${bookingId}`),
    cancelBooking: (bookingId, reason) => apiClient.put(`/bookings/${bookingId}/cancel`, { reason }),
    rateRide: (bookingId, rating) => apiClient.post(`/bookings/${bookingId}/rate`, rating),
    startTrip: (bookingId) => apiClient.post(`/bookings/${bookingId}/start-trip`),
    completeTrip: (bookingId, tripData) => apiClient.post(`/bookings/${bookingId}/complete-trip`, tripData),
  },

  chat: {
    getRideMessages: (rideId, page = 1, limit = 50) =>
      apiClient.get(`/chat/rides/${rideId}/messages?page=${page}&limit=${limit}`),
    sendMessage: (rideId, messageData) => apiClient.post(`/chat/rides/${rideId}/messages`, messageData),
    markMessageAsRead: (messageId) => apiClient.put(`/chat/messages/${messageId}/read`),
    deleteMessage: (messageId) => apiClient.delete(`/chat/messages/${messageId}`),
    getConversations: () => apiClient.get('/chat/conversations'),
  },

  payments: {
    initiatePayment: (bookingId, paymentMethod, amount) =>
      apiClient.post('/payments/initiate', { bookingId, paymentMethod, amount }),
    verifyPayment: (paymentDetails) => apiClient.post('/payments/verify', paymentDetails),
    getPaymentHistory: (page = 1, limit = 10) => apiClient.get(`/payments/history?page=${page}&limit=${limit}`),
    requestRefund: (paymentId, reason) => apiClient.post(`/payments/${paymentId}/refund`, { reason }),
    getPaymentDetails: (paymentId) => apiClient.get(`/payments/${paymentId}`),
  },

  profile: {
    updateProfile: (profileData) => apiClient.put('/profile/update', profileData),
    uploadProfilePicture: (formData) =>
      apiClient.post('/profile/upload-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    updateVehicle: (vehicleData) => apiClient.put('/profile/vehicle', vehicleData),
    updatePreferences: (preferences) => apiClient.put('/profile/preferences', preferences),
    getPublicProfile: (userId) => apiClient.get(`/profile/public/${userId}`),
    addEmergencyContact: (contactData) => apiClient.post('/profile/emergency-contacts', contactData),
    removeEmergencyContact: (contactId) => apiClient.delete(`/profile/emergency-contacts/${contactId}`),
  },

  reviews: {
    getUserReviews: (userId, page = 1, limit = 10) =>
      apiClient.get(`/reviews/user/${userId}?page=${page}&limit=${limit}`),
    reportReview: (reviewId, reason) => apiClient.post(`/reviews/${reviewId}/report`, { reason }),
    addHelpfulVote: (reviewId) => apiClient.post(`/reviews/${reviewId}/helpful`),
  },

  emergency: {
    createAlert: (emergencyData) => apiClient.post('/emergency/alert', emergencyData),
    getAlerts: (page = 1, limit = 10) => apiClient.get(`/emergency/alerts?page=${page}&limit=${limit}`),
    acknowledgeAlert: (alertId) => apiClient.put(`/emergency/alerts/${alertId}/acknowledge`),
    resolveAlert: (alertId, resolution) => apiClient.put(`/emergency/alerts/${alertId}/resolve`, { resolution }),
  },

  notifications: {
    getNotifications: (page = 1, limit = 20) => apiClient.get(`/notifications?page=${page}&limit=${limit}`),
    markAsRead: (notificationId) => apiClient.put(`/notifications/${notificationId}/read`),
    markAllAsRead: () => apiClient.put('/notifications/read-all'),
    updateFCMToken: (token) => apiClient.post('/notifications/fcm-token', { token }),
  },

  analytics: {
    getUserAnalytics: (period = 'monthly') => apiClient.get(`/analytics/user?period=${period}`),
    getEarningsReport: (startDate, endDate) => apiClient.get(`/analytics/earnings?start=${startDate}&end=${endDate}`),
    getRideStats: (timeframe = 'last30days') => apiClient.get(`/analytics/rides?timeframe=${timeframe}`),
  },

  upload: {
    uploadFile: (file, type = 'general') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return apiClient.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    uploadDocument: (file, documentType) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      return apiClient.post('/upload/document', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
  },

  health: () => apiClient.get('/health'),
  status: () => apiClient.get('/status'),
};

export default API;