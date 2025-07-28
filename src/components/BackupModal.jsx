import React, { useState } from 'react';
import Modal from './Modal';
import './CreateNoteModal.css';

const BackupModal = ({ isOpen, onClose, onRestore }) => {
  const [backupType, setBackupType] = useState('full');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState(null);
  const [error, setError] = useState('');

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setError('');

    try {
      // Get current data from localStorage
      const notes = JSON.parse(localStorage.getItem('notes') || '[]');
      const categories = JSON.parse(localStorage.getItem('categories') || '[]');
      const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

      let backupData = {};

      if (backupType === 'full') {
        backupData = {
          notes,
          categories,
          searchHistory,
          backupType: 'full',
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
      } else if (backupType === 'notes') {
        backupData = {
          notes,
          backupType: 'notes',
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
      } else if (backupType === 'categories') {
        backupData = {
          categories,
          backupType: 'categories',
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
      }

      // Create and download backup file
      const content = JSON.stringify(backupData, null, 2);
      const filename = `bearnotes_backup_${backupType}_${new Date().toISOString().split('T')[0]}.json`;
      
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`Backup created successfully: ${filename}`);
      
    } catch (error) {
      console.error('Backup failed:', error);
      setError('Backup failed. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedBackupFile(file);
      setError('');
    }
  };

  const handleRestore = async () => {
    if (!selectedBackupFile) {
      setError('Please select a backup file to restore');
      return;
    }

    setIsRestoring(true);
    setError('');

    try {
      const text = await selectedBackupFile.text();
      const backupData = JSON.parse(text);

      // Validate backup data
      if (!backupData.backupType || !backupData.timestamp) {
        throw new Error('Invalid backup file format');
      }

      // Confirm restore
      const confirmMessage = `This will restore your ${backupData.backupType} data from ${new Date(backupData.timestamp).toLocaleDateString()}. This action cannot be undone. Continue?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }

      // Call parent's restore function
      onRestore(backupData);
      
      // Reset form
      setSelectedBackupFile(null);
      setError('');
      
      alert('Restore completed successfully');
      onClose();

    } catch (error) {
      console.error('Restore failed:', error);
      setError(error.message || 'Restore failed. Please check your backup file.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h3>Backup & Restore</h3>
        <button className="close-modal" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <div className="backup-container">
          {/* Create Backup Section */}
          <div className="backup-section">
            <h4>Create Backup</h4>
            <div className="note-form">
              <div className="form-group">
                <label>Backup Type</label>
                <select 
                  value={backupType} 
                  onChange={(e) => setBackupType(e.target.value)}
                >
                  <option value="full">Full Backup (Notes + Categories + Search History)</option>
                  <option value="notes">Notes Only</option>
                  <option value="categories">Categories Only</option>
                </select>
                <div className="form-help-text">
                  {backupType === 'full' && 'Complete backup of all your data'}
                  {backupType === 'notes' && 'Backup only your notes'}
                  {backupType === 'categories' && 'Backup only your categories'}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleCreateBackup}
                  disabled={isBackingUp}
                >
                  {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
                </button>
              </div>
            </div>
          </div>

          {/* Restore Section */}
          <div className="backup-section">
            <h4>Restore from Backup</h4>
            <div className="note-form">
              <div className="form-group">
                <label>Select Backup File</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className={error ? 'error' : ''}
                />
                {selectedBackupFile && (
                  <div className="form-help-text">
                    Selected: {selectedBackupFile.name} ({(selectedBackupFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleRestore}
                  disabled={isRestoring || !selectedBackupFile}
                >
                  {isRestoring ? 'Restoring...' : 'Restore from Backup'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BackupModal; 