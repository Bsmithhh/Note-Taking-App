import React, { useState } from 'react';
import Modal from './Modal';
import './CreateNoteModal.css';

const ExportModal = ({ isOpen, onClose, notes, currentNote }) => {
  const [exportType, setExportType] = useState('json');
  const [exportSelection, setExportSelection] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let notesToExport = [];
      
      if (exportSelection === 'current' && currentNote) {
        notesToExport = [currentNote];
      } else if (exportSelection === 'all') {
        notesToExport = notes;
      }

      if (notesToExport.length === 0) {
        alert('No notes to export');
        return;
      }

      let content = '';
      let filename = '';
      let mimeType = '';

      switch (exportType) {
        case 'json':
          content = JSON.stringify(notesToExport, null, 2);
          filename = `notes_export_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
          
        case 'markdown':
          content = notesToExport.map(note => 
            `# ${note.title}\n\n${note.content}\n\n---\n`
          ).join('\n');
          filename = `notes_export_${new Date().toISOString().split('T')[0]}.md`;
          mimeType = 'text/markdown';
          break;
          
        case 'txt':
          content = notesToExport.map(note => 
            `${note.title}\n\n${note.content}\n\n${'='.repeat(50)}\n`
          ).join('\n');
          filename = `notes_export_${new Date().toISOString().split('T')[0]}.txt`;
          mimeType = 'text/plain';
          break;
          
        default:
          throw new Error('Unsupported export type');
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`Successfully exported ${notesToExport.length} note(s) as ${exportType.toUpperCase()}`);
      onClose();
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h3>Export Notes</h3>
        <button className="close-modal" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <div className="note-form">
          <div className="form-group">
            <label>Export Format</label>
            <select 
              value={exportType} 
              onChange={(e) => setExportType(e.target.value)}
            >
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
              <option value="txt">Plain Text</option>
            </select>
            <div className="form-help-text">
              {exportType === 'json' && 'Structured data format, best for backup'}
              {exportType === 'markdown' && 'Formatted text with headers and structure'}
              {exportType === 'txt' && 'Simple text format, compatible with any editor'}
            </div>
          </div>

          <div className="form-group">
            <label>What to Export</label>
            <select 
              value={exportSelection} 
              onChange={(e) => setExportSelection(e.target.value)}
            >
              <option value="all">All Notes ({notes.length})</option>
              {currentNote && (
                <option value="current">Current Note Only</option>
              )}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export Notes'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal; 