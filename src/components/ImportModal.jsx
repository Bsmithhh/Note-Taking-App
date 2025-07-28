import React, { useState } from 'react';
import Modal from './Modal';
import './CreateNoteModal.css';

const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importType, setImportType] = useState('auto');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      
      // Auto-detect file type
      if (importType === 'auto') {
        if (file.name.endsWith('.json')) {
          setImportType('json');
        } else if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
          setImportType('markdown');
        } else if (file.name.endsWith('.txt')) {
          setImportType('txt');
        }
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setError('');

    try {
      const text = await selectedFile.text();
      let importedNotes = [];

      switch (importType) {
        case 'json':
          try {
            const data = JSON.parse(text);
            importedNotes = Array.isArray(data) ? data : [data];
          } catch (e) {
            throw new Error('Invalid JSON format');
          }
          break;

        case 'markdown':
          // Simple markdown parsing - split by headers
          const sections = text.split(/(?=^# )/m);
          importedNotes = sections
            .filter(section => section.trim())
            .map(section => {
              const lines = section.trim().split('\n');
              const title = lines[0].replace(/^#\s+/, '');
              const content = lines.slice(1).join('\n').trim();
              return { title, content };
            });
          break;

        case 'txt':
          // Simple text parsing - split by separator lines
          const parts = text.split(/={10,}/);
          importedNotes = parts
            .filter(part => part.trim())
            .map(part => {
              const lines = part.trim().split('\n');
              const title = lines[0];
              const content = lines.slice(1).join('\n').trim();
              return { title, content };
            });
          break;

        default:
          throw new Error('Unsupported import type');
      }

      if (importedNotes.length === 0) {
        throw new Error('No valid notes found in file');
      }

      // Call the parent's import function
      onImport(importedNotes);
      
      // Reset form
      setSelectedFile(null);
      setImportType('auto');
      setError('');
      
      alert(`Successfully imported ${importedNotes.length} note(s)`);
      onClose();

    } catch (error) {
      console.error('Import failed:', error);
      setError(error.message || 'Import failed. Please check your file format.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h3>Import Notes</h3>
        <button className="close-modal" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <div className="note-form">
          <div className="form-group">
            <label>Select File</label>
            <input
              type="file"
              accept=".json,.md,.markdown,.txt"
              onChange={handleFileSelect}
              className={error ? 'error' : ''}
            />
            {selectedFile && (
              <div className="form-help-text">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Import Format</label>
            <select 
              value={importType} 
              onChange={(e) => setImportType(e.target.value)}
            >
              <option value="auto">Auto-detect</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
              <option value="txt">Plain Text</option>
            </select>
            <div className="form-help-text">
              {importType === 'json' && 'Structured data format from previous exports'}
              {importType === 'markdown' && 'Text with # headers for titles'}
              {importType === 'txt' && 'Plain text separated by === lines'}
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleImport}
              disabled={isImporting || !selectedFile}
            >
              {isImporting ? 'Importing...' : 'Import Notes'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ImportModal; 