// Authentication service - handles user authentication and session management
// This will eventually connect to the backend API

// For now, we'll use localStorage to simulate user sessions
// Later, these will be replaced with API calls to the Node.js backend

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @returns {Object} - Registration result
 */
export const registerUser = (userData) => {
  try {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    const existingUser = users.find(user => 
      user.email === userData.email || user.username === userData.username
    );
    
    if (existingUser) {
      return {
        success: false,
        error: existingUser.email === userData.email 
          ? 'Email already registered' 
          : 'Username already taken'
      };
    }
    
    // Create new user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: userData.username,
      email: userData.email,
      password: userData.password, // In production, this should be hashed
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    // Add user to storage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
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
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Object} - Login result
 */
export const loginUser = (credentials) => {
  try {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user by email
    const user = users.find(u => u.email === credentials.email);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    // Check password
    if (user.password !== credentials.password) {
      return {
        success: false,
        error: 'Invalid password'
      };
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    localStorage.setItem('users', JSON.stringify(users));
    
    // Create session
    const session = {
      userId: user.id,
      username: user.username,
      email: user.email,
      loginTime: new Date().toISOString(),
      token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    localStorage.setItem('currentSession', JSON.stringify(session));
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        lastLogin: user.lastLogin
      },
      session
    };
  } catch (error) {
    return {
      success: false,
      error: 'Login failed: ' + error.message
    };
  }
};

/**
 * Logout current user
 * @returns {Object} - Logout result
 */
export const logoutUser = () => {
  try {
    localStorage.removeItem('currentSession');
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
    const session = localStorage.getItem('currentSession');
    return session ? JSON.parse(session) : null;
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
  if (!session) return null;
  
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === session.userId);
    
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };
  } catch (error) {
    return null;
  }
};

/**
 * Update user profile
 * @param {Object} updates - Profile updates
 * @returns {Object} - Update result
 */
export const updateProfile = (updates) => {
  try {
    const session = getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === session.userId);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update session
    const newSession = {
      ...session,
      username: updates.username || session.username,
      email: updates.email || session.email
    };
    localStorage.setItem('currentSession', JSON.stringify(newSession));
    
    return {
      success: true,
      user: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        email: users[userIndex].email,
        createdAt: users[userIndex].createdAt,
        lastLogin: users[userIndex].lastLogin
      }
    };
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
export const changePassword = (passwordData) => {
  try {
    const session = getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === session.userId);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    // Verify current password
    if (users[userIndex].password !== passwordData.currentPassword) {
      return {
        success: false,
        error: 'Current password is incorrect'
      };
    }
    
    // Update password
    users[userIndex].password = passwordData.newPassword;
    users[userIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem('users', JSON.stringify(users));
    
    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Password change failed: ' + error.message
    };
  }
}; 