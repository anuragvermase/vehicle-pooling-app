import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add token to requests automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // If token is invalid, clear local storage and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(new Error(message));
  }
);

const API = {
  /* ---------------- NEW: expose client & users endpoints ---------------- */
  // Access to the raw axios instance (useful for custom calls if needed)
  raw: apiClient,

  // Users module used by Profile page
  users: {
    // { success, user }
    me: () => apiClient.get('/users/me'),

    // { success, user }  body can contain { name, avatarUrl } (avatarUrl mapped server-side)
    updateMe: (data) => apiClient.patch('/users/me', data),

    // { success, url, avatarUrl }
    uploadAvatar: (file) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return apiClient.post('/users/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    // { success: true } or { success:false, message }
    updatePassword: (currentPassword, newPassword) =>
      apiClient.post('/users/me/password', { currentPassword, newPassword }),

    // ✅ ADDED: wrapper so your SecurityPanel's changePassword call works
    changePassword: (payload) => apiClient.post('/users/me/password', payload),
  },
  /* --------------------------------------------------------------------- */

  // Authentication APIs
  auth: {
    login: async (credentials) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response;
    },
    
    register: async (userData) => {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    },
    
    getCurrentUser: async () => {
      const response = await apiClient.get('/auth/me');
      return response;
    },
    
    forgotPassword: async (email) => {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response;
    },
    
    resetPassword: async (token, password) => {
      const response = await apiClient.post('/auth/reset-password', { token, password });
      return response;
    },
    
    verifyEmail: async (token) => {
      const response = await apiClient.post('/auth/verify-email', { token });
      return response;
    },
    
    refreshToken: async () => {
      const response = await apiClient.post('/auth/refresh-token');
      return response;
    }
  },

  // Dashboard APIs
  dashboard: {
    getStats: async () => {
      const response = await apiClient.get('/dashboard/stats');
      return response;
    },
    
    getUpcomingRides: async () => {
      const response = await apiClient.get('/dashboard/upcoming-rides');
      return response;
    },
    
    getRideHistory: async (page = 1, limit = 10, filter = 'all') => {
      const response = await apiClient.get(`/dashboard/ride-history?page=${page}&limit=${limit}&filter=${filter}`);
      return response;
    },
    
    getAnalytics: async (timeframe = 'last30days') => {
      const response = await apiClient.get(`/dashboard/analytics?timeframe=${timeframe}`);
      return response;
    }
  },

  // Rides APIs
  rides: {
    create: async (rideData) => {
      const response = await apiClient.post('/rides/create', rideData);
      return response;
    },
    
    search: async (searchParams) => {
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await apiClient.get(`/rides/search?${queryString}`);
      return response;
    },
    
    book: async (rideId, bookingData) => {
      const response = await apiClient.post(`/rides/${rideId}/book`, bookingData);
      return response;
    },
    
    updateLocation: async (rideId, location) => {
      const response = await apiClient.put(`/rides/${rideId}/location`, location);
      return response;
    },
    
    getLocationSuggestions: async (input, location = null) => {
      const params = new URLSearchParams({ input });
      if (location) {
        params.append('location', location);
      }
      const response = await apiClient.get(`/rides/suggestions?${params.toString()}`);
      return response;
    },
    
    getRideDetails: async (rideId) => {
      const response = await apiClient.get(`/rides/${rideId}`);
      return response;
    },
    
    cancelRide: async (rideId, reason) => {
      const response = await apiClient.put(`/rides/${rideId}/cancel`, { reason });
      return response;
    },
    
    getRideBookings: async (rideId) => {
      const response = await apiClient.get(`/rides/${rideId}/bookings`);
      return response;
    },
    
    getUserRides: async (status = 'all') => {
      const response = await apiClient.get(`/rides/user?status=${status}`);
      return response;
    }
  },

  // Bookings APIs
  bookings: {
    getUserBookings: async (status = 'all', page = 1, limit = 10, type = 'all') => {
      const response = await apiClient.get(`/bookings?status=${status}&page=${page}&limit=${limit}&type=${type}`);
      return response;
    },
    
    getBookingDetails: async (bookingId) => {
      const response = await apiClient.get(`/bookings/${bookingId}`);
      return response;
    },
    
    cancelBooking: async (bookingId, reason) => {
      const response = await apiClient.put(`/bookings/${bookingId}/cancel`, { reason });
      return response;
    },
    
    rateRide: async (bookingId, rating) => {
      const response = await apiClient.post(`/bookings/${bookingId}/rate`, rating);
      return response;
    },
    
    startTrip: async (bookingId) => {
      const response = await apiClient.post(`/bookings/${bookingId}/start-trip`);
      return response;
    },
    
    completeTrip: async (bookingId, tripData) => {
      const response = await apiClient.post(`/bookings/${bookingId}/complete-trip`, tripData);
      return response;
    }
  },

  // Chat APIs
  chat: {
    getRideMessages: async (rideId, page = 1, limit = 50) => {
      const response = await apiClient.get(`/chat/rides/${rideId}/messages?page=${page}&limit=${limit}`);
      return response;
    },
    
    sendMessage: async (rideId, messageData) => {
      const response = await apiClient.post(`/chat/rides/${rideId}/messages`, messageData);
      return response;
    },
    
    markMessageAsRead: async (messageId) => {
      const response = await apiClient.put(`/chat/messages/${messageId}/read`);
      return response;
    },
    
    deleteMessage: async (messageId) => {
      const response = await apiClient.delete(`/chat/messages/${messageId}`);
      return response;
    },
    
    getConversations: async () => {
      const response = await apiClient.get('/chat/conversations');
      return response;
    }
  },

  // Payment APIs
  payments: {
    initiatePayment: async (bookingId, paymentMethod, amount) => {
      const response = await apiClient.post('/payments/initiate', { 
        bookingId, 
        paymentMethod, 
        amount 
      });
      return response;
    },
    
    verifyPayment: async (paymentDetails) => {
      const response = await apiClient.post('/payments/verify', paymentDetails);
      return response;
    },
    
    getPaymentHistory: async (page = 1, limit = 10) => {
      const response = await apiClient.get(`/payments/history?page=${page}&limit=${limit}`);
      return response;
    },
    
    requestRefund: async (paymentId, reason) => {
      const response = await apiClient.post(`/payments/${paymentId}/refund`, { reason });
      return response;
    },
    
    getPaymentDetails: async (paymentId) => {
      const response = await apiClient.get(`/payments/${paymentId}`);
      return response;
    }
  },

  // User Profile APIs
  profile: {
    updateProfile: async (profileData) => {
      const response = await apiClient.put('/profile/update', profileData);
      return response;
    },
    
    uploadProfilePicture: async (formData) => {
      const response = await apiClient.post('/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    },
    
    updateVehicle: async (vehicleData) => {
      const response = await apiClient.put('/profile/vehicle', vehicleData);
      return response;
    },
    
    updatePreferences: async (preferences) => {
      const response = await apiClient.put('/profile/preferences', preferences);
      return response;
    },
    
    getPublicProfile: async (userId) => {
      const response = await apiClient.get(`/profile/public/${userId}`);
      return response;
    },
    
    addEmergencyContact: async (contactData) => {
      const response = await apiClient.post('/profile/emergency-contacts', contactData);
      return response;
    },
    
    removeEmergencyContact: async (contactId) => {
      const response = await apiClient.delete(`/profile/emergency-contacts/${contactId}`);
      return response;
    }
  },

  // Reviews APIs
  reviews: {
    getUserReviews: async (userId, page = 1, limit = 10) => {
      const response = await apiClient.get(`/reviews/user/${userId}?page=${page}&limit=${limit}`);
      return response;
    },
    
    reportReview: async (reviewId, reason) => {
      const response = await apiClient.post(`/reviews/${reviewId}/report`, { reason });
      return response;
    },
    
    addHelpfulVote: async (reviewId) => {
      const response = await apiClient.post(`/reviews/${reviewId}/helpful`);
      return response;
    }
  },

  // Emergency APIs
  emergency: {
    createAlert: async (emergencyData) => {
      const response = await apiClient.post('/emergency/alert', emergencyData);
      return response;
    },
    
    getAlerts: async (page = 1, limit = 10) => {
      const response = await apiClient.get(`/emergency/alerts?page=${page}&limit=${limit}`);
      return response;
    },
    
    acknowledgeAlert: async (alertId) => {
      const response = await apiClient.put(`/emergency/alerts/${alertId}/acknowledge`);
      return response;
    },
    
    resolveAlert: async (alertId, resolution) => {
      const response = await apiClient.put(`/emergency/alerts/${alertId}/resolve`, { resolution });
      return response;
    }
  },

  // Notifications APIs
  notifications: {
    getNotifications: async (page = 1, limit = 20) => {
      const response = await apiClient.get(`/notifications?page=${page}&limit=${limit}`);
      return response;
    },
    
    markAsRead: async (notificationId) => {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response;
    },
    
    markAllAsRead: async () => {
      const response = await apiClient.put('/notifications/read-all');
      return response;
    },
    
    updateFCMToken: async (token) => {
      const response = await apiClient.post('/notifications/fcm-token', { token });
      return response;
    }
  },

  // Analytics APIs
  analytics: {
    getUserAnalytics: async (period = 'monthly') => {
      const response = await apiClient.get(`/analytics/user?period=${period}`);
      return response;
    },
    
    getEarningsReport: async (startDate, endDate) => {
      const response = await apiClient.get(`/analytics/earnings?start=${startDate}&end=${endDate}`);
      return response;
    },
    
    getRideStats: async (timeframe = 'last30days') => {
      const response = await apiClient.get(`/analytics/rides?timeframe=${timeframe}`);
      return response;
    }
  },

  // File Upload APIs
  upload: {
    uploadFile: async (file, type = 'general') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    },
    
    uploadDocument: async (file, documentType) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      
      const response = await apiClient.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    }
  },

  // ✅ NEW: SECURITY APIs (for 2FA + Sessions + Identity)
  security: {
    get2FA: () => apiClient.get('/security/2fa'),
    provision2FA: () => apiClient.post('/security/2fa/provision'),
    // flexible: accept string or {code}
    verify2FA: (payload) => {
      const body = typeof payload === 'string' ? { code: payload } : { code: payload?.code };
      return apiClient.post('/security/2fa/verify', body);
    },
    toggle2FA: (enabled) => apiClient.post('/security/2fa', { enabled }),
    // alias for backward compatibility (your panel sometimes calls set2FA)
    set2FA: (body) => apiClient.post('/security/2fa', body),

    // return array so UI can map directly
    getSessions: () => apiClient.get('/security/sessions').then(r => r.sessions || []),
    revokeSession: (sessionId) => apiClient.post(`/security/sessions/${sessionId}/revoke`),

    getIdentity: () => apiClient.get('/security/identity'),
    uploadIdentity: (field, formData, onProgress) =>
      apiClient.post(`/security/identity/${field}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: p => {
          if (onProgress && p.total) onProgress(Math.round((p.loaded / p.total) * 100));
        }
      }),
  },

  // Health check
  health: async () => {
    const response = await apiClient.get('/health');
    return response;
  },

  // Status check
  status: async () => {
    const response = await apiClient.get('/status');
    return response;
  }
};

export default API;