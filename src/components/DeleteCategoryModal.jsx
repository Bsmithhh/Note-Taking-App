import React, { useState } from 'react';
import Modal from './Modal';
import './CreateNoteModal.css';

const DeleteCategoryModal = ({ isOpen, onClose, onConfirm, category }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!category) return;

    setIsDeleting(true);
    
    try {
      // Call parent's delete function
      await onConfirm();
      
      // Close modal after successful deletion
      onClose();
      
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete category. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!category) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h3>Delete Category</h3>
        <button className="close-modal" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <div className="delete-warning">
          <div className="warning-icon">⚠️</div>
          <h4>Are you sure you want to delete this category?</h4>
          
          <div className="category-info">
            <div className="category-preview">
              <span 
                className="tag-indicator" 
                style={{ backgroundColor: category.color || '#f0f0f0' }}
              />
              <span className="category-name">{category.name}</span>
            </div>
          </div>

          <div className="warning-message">
            <p><strong>This action cannot be undone.</strong></p>
            <p>All notes in this category will become uncategorized.</p>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn-danger" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Category'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteCategoryModal; 