import React, { useState } from 'react';
import Modal from './Modal';
import './CreateNoteModal.css';

const CreateNoteModal = ({ isOpen, onClose, onCreate, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create note
    onCreate({
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category
    });

    // Reset form
    setFormData({ title: '', content: '', category: '' });
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h3>Create New Note</h3>
        <button className="close-modal" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <form onSubmit={handleSubmit} className="note-form">
          <div className="form-group">
            <label htmlFor="noteTitle" className="required-field">
              Title
            </label>
            <input
              type="text"
              id="noteTitle"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter note title"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="noteCategory">Category (Optional)</label>
            <select
              id="noteCategory"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">No Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="noteContent" className="required-field">
              Content
            </label>
            <textarea
              id="noteContent"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your note content here..."
              className={errors.content ? 'error' : ''}
              rows={8}
            />
            {errors.content && <div className="form-error">{errors.content}</div>}
            <div className="form-help-text">
              {formData.content.length} characters
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Note
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateNoteModal; 