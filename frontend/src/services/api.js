// API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Auth API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Login user
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  }
};

// Rides API calls
export const ridesAPI = {
  // Create new ride
  createRide: async (rideData) => {
    const response = await fetch(`${API_BASE_URL}/rides`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(rideData),
    });
    return handleResponse(response);
  },

  // Get all available rides
  getAllRides: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/rides?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Search rides
  searchRides: async (searchData) => {
    const response = await fetch(`${API_BASE_URL}/rides/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(searchData),
    });
    return handleResponse(response);
  },

  // Get user's rides (as driver)
  getMyRides: async () => {
    const response = await fetch(`${API_BASE_URL}/rides/my-rides`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get user's bookings (as passenger)
  getMyBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/rides/my-bookings`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Book a ride
  bookRide: async (rideId, passengerData) => {
    const response = await fetch(`${API_BASE_URL}/rides/${rideId}/book`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(passengerData),
    });
    return handleResponse(response);
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/rides/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update ride status
  updateRideStatus: async (rideId, status) => {
    const response = await fetch(`${API_BASE_URL}/rides/${rideId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  }
};

// Notifications API
export const notificationsAPI = {
  // Get user notifications
  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

// Reviews API
export const reviewsAPI = {
  // Create review
  createReview: async (reviewData) => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  // Get user reviews
  getUserReviews: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/user/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

// Export default API object
const API = {
  auth: authAPI,
  rides: ridesAPI,
  notifications: notificationsAPI,
  reviews: reviewsAPI
};

export default API;