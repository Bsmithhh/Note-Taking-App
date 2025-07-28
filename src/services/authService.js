// Authentication service - handles user authentication and session management
// Connected to the Node.js backend API

// Get API URL from environment variable or use default
const getApiBaseUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // In browser, check for environment variable or use default
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3001/api'
      : 'https://note-taking-app-production-7468.up.railway.app/api'; // Production Railway backend
  }
  // In Node.js environment (build time) - only access process.env if it exists
  if (typeof process !== 'undefined' && process.env) {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Check if we're in production (Vercel) and backend is not available
const isProduction = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

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
  // Try backend API first (both development and production)
  if (API_BASE_URL) {
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
      // If backend fails, fall back to localStorage (for offline functionality)
      console.warn('Backend registration failed, using localStorage fallback:', error.message);
    }
  }

  // Fallback to localStorage if backend is not available
  try {
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = existingUsers.find(u => 
      u.username === userData.username || u.email === userData.email
    );
    
    if (existingUser) {
      return {
        success: false,
        error: 'User already exists'
      };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      createdAt: new Date().toISOString()
    };

    // Store user
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    // Auto-login the user
    localStorage.setItem('authToken', 'demo-token-' + Date.now());
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return {
      success: true,
      user: newUser,
      token: 'demo-token-' + Date.now()
    };
  } catch (error) {
    return {
      success: false,
      error: 'Registration failed: ' + error.message
    };
  }

  // Try backend API if available
  if (API_BASE_URL) {
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
      // If backend fails, fall back to localStorage (for offline functionality)
      console.warn('Backend registration failed, using localStorage fallback:', error.message);
    }
  }

  // Fallback to localStorage if backend is not available
  try {
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = existingUsers.find(u => 
      u.username === userData.username || u.email === userData.email
    );
    
    if (existingUser) {
      return {
        success: false,
        error: 'User already exists'
      };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      createdAt: new Date().toISOString()
    };

    // Store user
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    // Auto-login the user
    localStorage.setItem('authToken', 'demo-token-' + Date.now());
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return {
      success: true,
      user: newUser,
      token: 'demo-token-' + Date.now()
    };
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
  // Try backend API first (both development and production)
  if (API_BASE_URL) {
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
      // If backend fails, fall back to localStorage (for offline functionality)
      console.warn('Backend login failed, using localStorage fallback:', error.message);
    }
  }

  // Fallback to localStorage if backend is not available
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => 
      u.username === credentials.username || u.email === credentials.username
    );
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // In demo mode, accept any password
    localStorage.setItem('authToken', 'demo-token-' + Date.now());
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return {
      success: true,
      user: user,
      token: 'demo-token-' + Date.now()
    };
  } catch (error) {
    return {
      success: false,
      error: 'Login failed: ' + error.message
    };
  }

  // Try backend API if available
  if (API_BASE_URL) {
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
  }
  
  // If no API available, return error
  return {
    success: false,
    error: 'Backend not available'
  };
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