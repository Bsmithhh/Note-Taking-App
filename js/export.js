// Export module - handles data export, import, backup, and statistics
import { jsPDF } from "jspdf";
// This file will contain functions for managing note data persistence

import { getAllNotes, createNote, editNote, deleteNote } from './note.js';
import { getAllCategories, createCategory, deleteCategory } from './category.js';

/**
 * P3 - Export notes to JSON format
 * @param {Array} notes - Notes to export (optional, defaults to all)
 * @param {Object} options - Export options
 * @returns {string} - JSON string
 */
function exportToJson(notes = null, options = {}) {
    let notesToExport = notes || getAllNotes();
    let json = JSON.stringify(notesToExport, null, 2);
    return json;
}

/**
 * P3 - Export notes to Markdown format
 * @param {Array} notes - Notes to export (optional, defaults to all)
 * @param {Object} options - Export options
 * @returns {string} - Markdown string
 */
function exportToMarkdown(notes = null, options = {}) {
    let notesToExport = notes || getAllNotes();

    let markdown = notesToExport.map(note => {
        let frontmatter = [
            '---',
            `title: ${note.title || ''}`,
            `category: ${note.category || 'uncategorized'}`,
            `timestamp: ${note.timestamp || new Date().toISOString()}`,
            '---'
        ].join('\n');

        return `${frontmatter}\n\n# ${note.title}\n\n${note.content}`;
    }).join('\n\n---\n\n'); 

    return markdown;
}


async function exportToPdf(notes = null, options = {}) {
    let notesToExport = notes || getAllNotes();
    const doc = new jsPDF();
    let y = 10;
  
    notesToExport.forEach((note, index) => {
      doc.setFontSize(16);
      doc.text(note.title || "Untitled", 10, y);
      y += 10;
  
      doc.setFontSize(12);
      const contentLines = doc.splitTextToSize(note.content || "", 180);
      doc.text(contentLines, 10, y);
      y += contentLines.length * 7 + 10;
  
      if (y > 270 && index < notesToExport.length - 1) {
        doc.addPage();
        y = 10;
      }
    });
  
    // Return the PDF as a Blob for caller to handle
    return doc.output('blob');
  }
  


/**
 * P3 - Export single note to various formats
 * @param {Object} note - Note object
 * @param {string} format - Export format ('json', 'markdown', 'pdf')
 * @param {Object} options - Export options
 * @returns {Promise<string|Blob>} - Exported content
 */
async function exportNote(note, format, options = {}) {
    if (!note || note.id === undefined) {
        console.error('Note ID is required for export');
        return null;
    }

    if (format === 'json') {
        return exportToJson([note], options);
    } else if (format === 'markdown') {
        return exportToMarkdown([note], options);
    } else if (format === 'pdf') {
        return exportToPdf([note], options);
    } else {
        console.error('Invalid export format:', format);
        return null;
    }
}

/**
 * P3 - Generate export filename
 * @param {string} format - Export format
 * @param {string} prefix - Filename prefix
 * @returns {string} - Generated filename
 */
function generateExportFilename(format, prefix = 'notes') {
    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 16);
    if(format === 'json') {
        return `${prefix}-${timestamp}.json`;
    } else if (format === 'markdown') {
        return `${prefix}-${timestamp}.md`;
    } else if (format === 'pdf') {
        return `${prefix}-${timestamp}.pdf`;
    }
}

/**
 * P3 - Import notes from JSON file
 * @param {File} file - JSON file
 * @returns {Promise<Array>} - Imported notes
 */
async function importFromJson(file) {
    if (!file) {
        throw new Error('File is required for import');
    }
    
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = (e) => {
            try {
                resolve(JSON.parse(e.target.result));
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        }
        reader.onerror = (e) => {
            reject(new Error('Failed to read file'));
        }
        reader.readAsText(file);
    });
}

/**
 * P3 - Import notes from Markdown files
 * @param {Array} files - Markdown files
 * @returns {Promise<Array>} - Imported notes
 */
async function importFromMarkdown(files) {
    if (!files || !Array.isArray(files)) {
        throw new Error('Files array is required for import');
    }
    
    let notes = [];
    for(let file of files){
        const reader = new FileReader();
        const content = await new Promise((resolve, reject) => {
            reader.onload = (e) => {
                resolve(e.target.result);
            }
            reader.onerror = (e) => {
                reject(new Error('Failed to read file'));
            }
            reader.readAsText(file);
        });

        notes.push({
            title: file.name.replace(/\.md$/i, ''),
            content: content.trim(),
        });
    }
    
    return notes;
}

/**
 * P3 - Validate import data
 * @param {Object} data - Import data
 * @returns {Object} - Validation result
 */
function validateImportData(data) {
    // TODO: Implement import validation
    // - Check data structure
    // - Validate required fields
    // - Check for duplicate IDs
    // - Return validation result object
}

/**
 * P3 - Merge imported notes with existing notes
 * @param {Array} importedNotes - Imported notes
 * @param {Object} options - Merge options
 * @returns {Array} - Merged notes
 */
function mergeImportedNotes(importedNotes, options = {}) {
    // TODO: Implement note merging
    // - Handle duplicate notes based on options
    // - Preserve or overwrite existing notes
    // - Update categories and relationships
    // - Return merged notes array
}

/**
 * P3 - Create automatic backup
 * @param {Object} options - Backup options
 * @returns {Promise<Object>} - Backup result
 */
async function createBackup(options = {}) {
    // TODO: Implement automatic backup
    // - Export all notes and categories
    // - Add backup metadata (timestamp, version)
    // - Store in localStorage or IndexedDB
    // - Return backup result object
}

/**
 * P3 - Restore from backup
 * @param {Object} backup - Backup data
 * @param {Object} options - Restore options
 * @returns {Promise<boolean>} - Success status
 */
async function restoreFromBackup(backup, options = {}) {
    // TODO: Implement backup restoration
    // - Validate backup data
    // - Clear existing data if requested
    // - Import notes and categories
    // - Return success status
}

/**
 * P3 - Get backup history
 * @returns {Array} - Backup history
 */
function getBackupHistory() {
    // TODO: Implement backup history
    // - Retrieve backup metadata from storage
    // - Sort by creation date
    // - Return backup history array
}

/**
 * P3 - Clean old backups
 * @param {number} maxBackups - Maximum number of backups to keep
 * @returns {boolean} - Success status
 */
function cleanOldBackups(maxBackups = 10) {
    // TODO: Implement backup cleanup
    // - Get backup history
    // - Remove old backups beyond maxBackups
    // - Update backup history
    // - Return success status
}

/**
 * P3 - Export backup to file
 * @param {Object} backup - Backup data
 * @returns {Promise<Blob>} - Backup file blob
 */
async function exportBackup(backup) {
    // TODO: Implement backup export
    // - Convert backup to JSON
    // - Create downloadable blob
    // - Return backup file blob
}

/**
 * P3 - Generate note statistics
 * @param {Array} notes - Notes to analyze (optional, defaults to all)
 * @returns {Object} - Statistics object
 */
function generateNoteStatistics(notes = null) {
    // TODO: Implement note statistics
    // - Get all notes if none provided
    // - Calculate total notes, categories, word count
    // - Analyze creation and modification patterns
    // - Return statistics object
}

/**
 * P3 - Get word count for notes
 * @param {Array} notes - Notes to count (optional, defaults to all)
 * @returns {Object} - Word count statistics
 */
function getWordCount(notes = null) {
    // TODO: Implement word counting
    // - Get all notes if none provided
    // - Count words in titles and content
    // - Calculate averages and totals
    // - Return word count statistics
}

/**
 * P3 - Get note trends over time
 * @param {string} period - Time period ('week', 'month', 'year')
 * @returns {Array} - Trend data
 */
function getNoteTrends(period = 'month') {
    // TODO: Implement trend analysis
    // - Group notes by time period
    // - Calculate creation and modification rates
    // - Identify patterns and trends
    // - Return trend data array
}

/**
 * P3 - Get category statistics
 * @returns {Object} - Category statistics
 */
function getCategoryStatistics() {
    // TODO: Implement category statistics
    // - Count notes per category
    // - Calculate category usage percentages
    // - Identify most/least used categories
    // - Return category statistics object
}

/**
 * P3 - Generate activity report
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} - Activity report
 */
function generateActivityReport(startDate, endDate) {
    // TODO: Implement activity reporting
    // - Filter notes by date range
    // - Calculate activity metrics
    // - Generate summary statistics
    // - Return activity report object
}

/**
 * P3 - Download file with proper filename
 * @param {Blob|string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 * @returns {void}
 */
function downloadFile(content, filename, mimeType = 'application/octet-stream') {
    // TODO: Implement file download
    // - Create blob from content
    // - Create download link
    // - Trigger download with proper filename
    // - Clean up temporary elements
}

export {
    exportToJson,
    exportToMarkdown,
    exportToPdf,
    exportNote,
    generateExportFilename,
    importFromJson,
    importFromMarkdown,
    validateImportData,
    mergeImportedNotes,
    createBackup,
    restoreFromBackup,
    getBackupHistory,
    cleanOldBackups,
    exportBackup,
    generateNoteStatistics,
    getWordCount,
    getNoteTrends,
    getCategoryStatistics,
    generateActivityReport,
    downloadFile
}; 