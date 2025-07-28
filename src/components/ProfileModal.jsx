import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { getCurrentUser, updateProfile, changePassword, logoutUser } from '../services/authService';
import './AuthModal.css';

const ProfileModal = ({ isOpen, onClose, onLogout }) => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'

  useEffect(() => {
    if (isOpen) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setFormData({
          username: currentUser.username,
          email: currentUser.email
        });
      }
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setUser(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Profile update failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Password change failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    onLogout();
    onClose();
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="auth-modal profile-modal">
        <div className="auth-header">
          <h2>Profile Settings</h2>
          <p>Manage your account information</p>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Password
          </button>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter username"
                required
                disabled={isLoading}
                minLength={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="user-info">
              <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              {user.lastLogin && (
                <p><strong>Last login:</strong> {new Date(user.lastLogin).toLocaleDateString()}</p>
              )}
            </div>

            <button 
              type="submit" 
              className="auth-button primary"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordUpdate} className="auth-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="auth-button primary"
              disabled={isLoading}
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <button 
            type="button" 
            className="auth-button secondary"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal; 