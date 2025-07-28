// Authentication service - handles user authentication and session management
// Connected to the Node.js backend API

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @param {string} userData.firstName - First name (optional)
 * @param {string} userData.lastName - Last name (optional)
 * @returns {Object} - Registration result
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
      
      return {
        success: true,
        user: data.data.user,
        token: data.data.token
      };
    } else {
      return {
        success: false,
        error: data.message || 'Registration failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Registration failed: ' + error.message
    };
  }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username or email
 * @param {string} credentials.password - Password
 * @returns {Object} - Login result
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
      
      return {
        success: true,
        user: data.data.user,
        token: data.data.token
      };
    } else {
      return {
        success: false,
        error: data.message || 'Login failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Login failed: ' + error.message
    };
  }
};

/**
 * Logout user
 * @returns {Object} - Logout result
 */
export const logoutUser = () => {
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Logout failed: ' + error.message
    };
  }
};

/**
 * Get current user session
 * @returns {Object|null} - Current session or null if not logged in
 */
export const getCurrentSession = () => {
  try {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
      return {
        token,
        user: JSON.parse(user)
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is logged in
 */
export const isAuthenticated = () => {
  return getCurrentSession() !== null;
};

/**
 * Get current user data
 * @returns {Object|null} - Current user data or null if not logged in
 */
export const getCurrentUser = () => {
  const session = getCurrentSession();
  return session ? session.user : null;
};

/**
 * Get authentication token
 * @returns {string|null} - JWT token or null if not authenticated
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Update user profile
 * @param {Object} updates - Profile updates
 * @returns {Object} - Update result
 */
export const updateProfile = async (updates) => {
  try {
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (data.success) {
      // Update stored user data
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
      
      return {
        success: true,
        user: data.data.user
      };
    } else {
      return {
        success: false,
        error: data.message || 'Profile update failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Profile update failed: ' + error.message
    };
  }
};

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Object} - Password change result
 */
export const changePassword = async (passwordData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        message: data.message || 'Password changed successfully'
      };
    } else {
      return {
        success: false,
        error: data.message || 'Password change failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Password change failed: ' + error.message
    };
  }
};

/**
 * Refresh authentication token
 * @returns {Object} - Token refresh result
 */
export const refreshToken = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'No token to refresh'
      };
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (data.success) {
      // Update stored token
      localStorage.setItem('authToken', data.data.token);
      
      return {
        success: true,
        token: data.data.token
      };
    } else {
      // Token refresh failed, logout user
      logoutUser();
      return {
        success: false,
        error: data.message || 'Token refresh failed'
      };
    }
  } catch (error) {
    // Network error, logout user
    logoutUser();
    return {
      success: false,
      error: 'Token refresh failed: ' + error.message
    };
  }
}; 