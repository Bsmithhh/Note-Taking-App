import React, { useState } from 'react';
import Modal from './Modal';
import './CreateNoteModal.css';

const CreateCategoryModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#007bff',
    icon: '📁'
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create category
    onCreate({
      name: formData.name.trim(),
      color: formData.color,
      icon: formData.icon
    });

    // Reset form
    setFormData({ name: '', color: '#007bff', icon: '📁' });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const iconOptions = [
    { value: '📁', label: '📁 Folder' },
    { value: '📝', label: '📝 Note' },
    { value: '💼', label: '💼 Work' },
    { value: '🎯', label: '🎯 Goal' },
    { value: '⭐', label: '⭐ Star' },
    { value: '🔥', label: '🔥 Hot' },
    { value: '💡', label: '💡 Idea' },
    { value: '📚', label: '📚 Study' },
    { value: '🏠', label: '🏠 Home' },
    { value: '🎨', label: '🎨 Creative' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h3>Create Category</h3>
        <button className="close-modal" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <form onSubmit={handleSubmit} className="note-form">
          <div className="form-group">
            <label htmlFor="categoryName" className="required-field">
              Category Name
            </label>
            <input
              type="text"
              id="categoryName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categoryColor">Color</label>
              <input
                type="color"
                id="categoryColor"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="categoryIcon">Icon</label>
              <select
                id="categoryIcon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
              >
                {iconOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Category
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateCategoryModal; 