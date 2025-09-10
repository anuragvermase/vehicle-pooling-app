import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: false, // tokens via Authorization header
});

// Inject auth + cache-buster
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if ((config.method || 'get').toLowerCase() === 'get') {
      config.params = { ...(config.params || {}), _t: Date.now() };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize errors + auto-redirect on 401 (BUT NOT for password change)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    const status = error.response.status;
    const msg =
      error.response.data?.message ||
      error.response.data?.error ||
      'Something went wrong';
    if (status === 401) {
      const isPasswordChange = error.config?.url?.includes('/users/me/password');
      if (!isPasswordChange) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(new Error(msg));
  }
);

const get = (url, config={}) => apiClient.get(url, config);
const post = (url, data, config={}) => apiClient.post(url, data, config);
const put = (url, data, config={}) => apiClient.put(url, data, config);
const del = (url, config={}) => apiClient.delete(url, config);

const API = {
  raw: apiClient,

  users: {
    me: (params) => get('/users/me', { params }),
    updateMe: (data) => put('/users/me', data),
    uploadAvatar: (file) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return post('/users/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    // ✅ MAIN METHOD: Canonical change password endpoint used by Settings
    updatePassword: (currentPassword, newPassword) =>
      post('/users/me/password', { currentPassword, newPassword }),
    changePassword: (payload) => post('/users/me/password', payload),
    // Delete account matches backend route
    deleteMe: () => del('/users/me'),
  },

  auth: {
    login: (credentials) => post('/auth/login', credentials),
    register: (userData) => post('/auth/register', userData),
    getCurrentUser: () => get('/auth/me'),
    forgotPassword: (email) => post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => post('/auth/reset-password', { token, password }),
    verifyEmail: (token) => post('/auth/verify-email', { token }),
    refreshToken: () => post('/auth/refresh-token'),
    logout: () => post('/auth/logout'),
    // Added Google login method
    loginWithGoogle: (data) => post('/auth/google', data),
  },

  dashboard: {
    getStats: () => get('/dashboard/stats'),
    getUpcomingRides: () => get('/dashboard/upcoming-rides'),
    getRideHistory: (page = 1, limit = 10, filter = 'all') =>
      get(`/dashboard/ride-history?page=${page}&limit=${limit}&filter=${filter}`),
    getAnalytics: (timeframe = 'last30days') =>
      get(`/dashboard/analytics?timeframe=${timeframe}`),
  },

  rides: {
    create: (rideData) => post('/rides/create', rideData),
    search: (searchParams) =>
      get(`/rides/search?${new URLSearchParams(searchParams).toString()}`),
    book: (rideId, bookingData) => post(`/rides/${rideId}/book`, bookingData),
    updateLocation: (rideId, location) => put(`/rides/${rideId}/location`, location),
    getLocationSuggestions: (input, location = null) => {
      const params = new URLSearchParams({ input });
      if (location) params.append('location', location);
      return get(`/rides/suggestions?${params.toString()}`);
    },
    getRideDetails: (rideId) => get(`/rides/${rideId}`),
    cancelRide: (rideId, reason) => put(`/rides/${rideId}/cancel`, { reason }),
    getRideBookings: (rideId) => get(`/rides/${rideId}/bookings`),
    getUserRides: (status = 'all') => get(`/rides/user?status=${status}`),
  },

  bookings: {
    getUserBookings: (status = 'all', page = 1, limit = 10, type = 'all') =>
      get(`/bookings?status=${status}&page=${page}&limit=${limit}&type=${type}`),
    getBookingDetails: (bookingId) => get(`/bookings/${bookingId}`),
    cancelBooking: (bookingId, reason) =>
      put(`/bookings/${bookingId}/cancel`, { reason }),
    rateRide: (bookingId, rating) => post(`/bookings/${bookingId}/rate`, rating),
    startTrip: (bookingId) => post(`/bookings/${bookingId}/start-trip`),
    completeTrip: (bookingId, tripData) =>
      post(`/bookings/${bookingId}/complete-trip`, tripData),
  },

  chat: {
    getRideMessages: (rideId, page = 1, limit = 50) =>
      get(`/chat/rides/${rideId}/messages?page=${page}&limit=${limit}`),
    sendMessage: (rideId, messageData) =>
      post(`/chat/rides/${rideId}/messages`, messageData),
    markMessageAsRead: (messageId) => put(`/chat/messages/${messageId}/read`),
    deleteMessage: (messageId) => del(`/chat/messages/${messageId}`),
    getConversations: () => get('/chat/conversations'),
  },

  payments: {
    initiatePayment: (bookingId, paymentMethod, amount) =>
      post('/payments/initiate', { bookingId, paymentMethod, amount }),
    verifyPayment: (paymentDetails) =>
      post('/payments/verify', paymentDetails),
    getPaymentHistory: (page = 1, limit = 10) =>
      get(`/payments/history?page=${page}&limit=${limit}`),
    requestRefund: (paymentId, reason) =>
      post(`/payments/${paymentId}/refund`, { reason }),
    getPaymentDetails: (paymentId) => get(`/payments/${paymentId}`),
  },

  profile: {
    updateProfile: (profileData) => put('/profile/update', profileData),
    uploadProfilePicture: (formData) =>
      post('/profile/upload-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    updateVehicle: (vehicleData) => put('/profile/vehicle', vehicleData),
    updatePreferences: (preferences) =>
      put('/profile/preferences', preferences),
    getPublicProfile: (userId) => get(`/profile/public/${userId}`),
    addEmergencyContact: (contactData) =>
      post('/profile/emergency-contacts', contactData),
    removeEmergencyContact: (contactId) =>
      del(`/profile/emergency-contacts/${contactId}`),
  },

  reviews: {
    getUserReviews: (userId, page = 1, limit = 10) =>
      get(`/reviews/user/${userId}?page=${page}&limit=${limit}`),
    reportReview: (reviewId, reason) =>
      post(`/reviews/${reviewId}/report`, { reason }),
    addHelpfulVote: (reviewId) => post(`/reviews/${reviewId}/helpful`),
  },

  emergency: {
    createAlert: (emergencyData) => post('/emergency/alert', emergencyData),
    getAlerts: (page = 1, limit = 10) => get(`/emergency/alerts?page=${page}&limit=${limit}`),
    acknowledgeAlert: (alertId) => put(`/emergency/alerts/${alertId}/acknowledge`),
    resolveAlert: (alertId, resolution) => put(`/emergency/alerts/${alertId}/resolve`, { resolution }),
  },

  notifications: {
    getNotifications: (page = 1, limit = 20) =>
      get(`/notifications?page=${page}&limit=${limit}`),
    markAsRead: (notificationId) => put(`/notifications/${notificationId}/read`),
    markAllAsRead: () => put('/notifications/read-all'),
    updateFCMToken: (token) => post('/notifications/fcm-token', { token }),
  },

  analytics: {
    getUserAnalytics: (period = 'monthly') => get(`/analytics/user?period=${period}`),
    getEarningsReport: (startDate, endDate) =>
      get(`/analytics/earnings?start=${startDate}&end=${endDate}`),
    getRideStats: (timeframe = 'last30days') => get(`/analytics/rides?timeframe=${timeframe}`),
  },

  upload: {
    uploadFile: (file, type = 'general') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    uploadDocument: (file, documentType) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      return post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },

  /* ✅ Admin APIs (new) */
  admin: {
    listUsers: (params) => get('/admin/users', { params }),
    setRole: (id, role) => post(`/admin/users/${id}/role`, { role }),
    ban: (id, reason) => post(`/admin/users/${id}/ban`, { reason }),
    unban: (id, reason) => post(`/admin/users/${id}/unban`, { reason }),

    listKyc: (params) => get('/admin/kyc', { params }),
    reviewKyc: (id, payload) => post(`/admin/kyc/${id}/review`, payload),

    listRides: (params) => get('/admin/rides', { params }),
    cancelRide: (id, reason) => post(`/admin/rides/${id}/cancel`, { reason }),

    listPayouts: (params) => get('/admin/payouts', { params }),
    markPayout: (id, payload) => post(`/admin/payouts/${id}/mark`, payload),
  },

  health: () => get('/health'),
  status: () => get('/status'),
};

export default API;
