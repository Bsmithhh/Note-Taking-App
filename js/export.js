// Export module - handles data export, import, backup, and statistics
import { jsPDF } from "jspdf";
// This file will contain functions for managing note data persistence

import { getAllNotes, createNote, editNote, deleteNote, generateId } from './note.js';
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
                const importedNotes = JSON.parse(e.target.result);
                
                // Normalize imported notes to ensure they have all required fields
                const normalizedNotes = importedNotes.map(note => {
                    const now = new Date().toISOString();
                    return {
                        id: note.id || generateId(),
                        title: note.title || 'Untitled',
                        content: note.content || '',
                        category: note.category || '',
                        timestamp: note.timestamp || now,
                        lastModified: note.lastModified || now
                    };
                });
                
                resolve(normalizedNotes);
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

        // Create a properly formatted note object with all required fields
        const now = new Date().toISOString();
        notes.push({
            id: generateId(),
            title: file.name.replace(/\.md$/i, ''),
            content: content.trim(),
            category: '',
            timestamp: now,
            lastModified: now
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
    if(!Array.isArray(data)){
        return {
            valid: false,
            message: 'Import data must be an array'
        }
    }
    if(data.length === 0){
        return {
            valid: false,
            message: 'Import data must not be empty'
        }
    }
    for(let note of data){
        if(!note.title || !note.content){
            return {
                valid: false,
                message: 'Note must have a title and content'
            }
        }
        // Check for required fields that will be added if missing
        if(!note.id || !note.timestamp || !note.lastModified){
            // These will be normalized during import, so just log a warning
            console.warn('Note missing required fields, will be normalized:', note.title);
        }
    }
    return {
        valid: true,
        message: 'Import data is valid'
    }
}

/**
 * P3 - Merge imported notes with existing notes
 * @param {Array} importedNotes - Imported notes
 * @param {Object} options - Merge options
 * @returns {Array} - Merged notes
 */
function mergeImportedNotes(importedNotes, options = {}) {
    // Ensure importedNotes is an array
    if (!Array.isArray(importedNotes)) {
        console.error('mergeImportedNotes: importedNotes is not an array:', importedNotes);
        throw new Error('Imported notes must be an array');
    }
    
    const mergedNotes = []
    let existingNotes = getAllNotes()
      if(options.duplicateStrategy === 'overwrite'){
        const importedNotesId = importedNotes.map(function(importedNotes){
            return importedNotes.id
        })
        const importedNotesTitle = importedNotes.map(function(importedNotes){
            return importedNotes.title
        })
        existingNotes =  existingNotes.filter(function(existingNote){
           return !importedNotesId.includes(existingNote.id) && !importedNotesTitle.includes(existingNote.title)
        })
        mergedNotes.push( ...existingNotes ,...importedNotes)
      } else if(options.duplicateStrategy === 'skip'){
        mergedNotes.push(...existingNotes)
      }else if (options.duplicateStrategy === 'rename') {
        const existingNotesId = existingNotes.map(note => note.id);
        const existingNotesTitle = existingNotes.map(note => note.title);
    
        importedNotes.forEach(importedNote => {
            if (existingNotesId.includes(importedNote.id) || existingNotesTitle.includes(importedNote.title)) {
                importedNote.title = `${importedNote.title} (Duplicate)`;
            }
        });
        mergedNotes.push(...existingNotes, ...importedNotes);
    }else{
        throw new Error('Must specify a duplicate strategy')
    }
    
    return mergedNotes;
}

/**
 * P3 - Create automatic backup
 * @param {Object} options - Backup options
 * @returns {Promise<Object>} - Backup result
 */
async function createBackup(options = {}) {
    try {
        const notes = getAllNotes();
        const categories = getAllCategories();
        const timestamp = new Date().toISOString();
        const version = '1.0.0';
        
        const backup = {
            metadata: {
                timestamp,
                version,
                noteCount: notes.length,
                categoryCount: categories.length,
                createdBy: 'BearNotesApp'
            },
            data: {
                notes,
                categories
            }
        };
        
        // Store backup in localStorage
        const backupHistory = getBackupHistory();
        backupHistory.unshift(backup);
        
        // Keep only the last 10 backups
        const maxBackups = options.maxBackups || 10;
        if (backupHistory.length > maxBackups) {
            backupHistory.splice(maxBackups);
        }
        
        localStorage.setItem('backupHistory', JSON.stringify(backupHistory));
        
        return {
            success: true,
            backup,
            message: `Backup created successfully with ${notes.length} notes and ${categories.length} categories`
        };
    } catch (error) {
        console.error('Backup creation failed:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to create backup'
        };
    }
}

/**
 * P3 - Restore from backup
 * @param {Object} backup - Backup data
 * @param {Object} options - Restore options
 * @returns {Promise<boolean>} - Success status
 */
async function restoreFromBackup(backup, options = {}) {
    try {
        // Validate backup data
        if (!backup || !backup.data || !backup.metadata) {
            throw new Error('Invalid backup data structure');
        }
        
        if (!backup.data.notes || !Array.isArray(backup.data.notes)) {
            throw new Error('Backup must contain notes array');
        }
        
        if (!backup.data.categories || !Array.isArray(backup.data.categories)) {
            throw new Error('Backup must contain categories array');
        }
        
        // Clear existing data if requested
        if (options.clearExisting) {
            localStorage.removeItem('notes');
            localStorage.removeItem('categories');
        }
        
        // Restore notes and categories
        localStorage.setItem('notes', JSON.stringify(backup.data.notes));
        localStorage.setItem('categories', JSON.stringify(backup.data.categories));
        
        return true;
    } catch (error) {
        console.error('Backup restoration failed:', error);
        return false;
    }
}

/**
 * P3 - Get backup history
 * @returns {Array} - Backup history
 */
function getBackupHistory() {
    try {
        const backupHistory = JSON.parse(localStorage.getItem('backupHistory') || '[]');
        return Array.isArray(backupHistory) ? backupHistory : [];
    } catch (error) {
        console.error('Failed to parse backup history:', error);
        return [];
    }
}

/**
 * P3 - Clean old backups
 * @param {number} maxBackups - Maximum number of backups to keep
 * @returns {boolean} - Success status
 */
function cleanOldBackups(maxBackups = 10) {
    try {
        const backupHistory = getBackupHistory();
        const originalCount = backupHistory.length;
        
        // Keep only the most recent backups
        const cleanedHistory = backupHistory.slice(0, maxBackups);
        
        localStorage.setItem('backupHistory', JSON.stringify(cleanedHistory));
        
        const removedCount = originalCount - cleanedHistory.length;
        console.log(`Cleaned ${removedCount} old backups, kept ${cleanedHistory.length}`);
        
        return true;
    } catch (error) {
        console.error('Failed to clean old backups:', error);
        return false;
    }
}

/**
 * P3 - Export backup to file
 * @param {Object} backup - Backup data
 * @returns {Promise<Blob>} - Backup file blob
 */
async function exportBackup(backup) {
    try {
        if (!backup) {
            throw new Error('Backup data is required');
        }
        
        const backupJson = JSON.stringify(backup, null, 2);
        const blob = new Blob([backupJson], { type: 'application/json' });
        
        return blob;
    } catch (error) {
        console.error('Failed to export backup:', error);
        throw error;
    }
}

/**
 * P3 - Generate note statistics
 * @param {Array} notes - Notes to analyze (optional, defaults to all)
 * @returns {Object} - Statistics object
 */
function generateNoteStatistics(notes = null) {
    const notesToAnalyze = notes || getAllNotes();
    const categories = getAllCategories();
    
    // Basic counts
    const totalNotes = notesToAnalyze.length;
    const totalCategories = categories.length;
    
    // Word count statistics
    const wordCountStats = getWordCount(notesToAnalyze);
    
    // Date analysis
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const notesThisWeek = notesToAnalyze.filter(note => 
        new Date(note.timestamp) >= oneWeekAgo
    ).length;
    
    const notesThisMonth = notesToAnalyze.filter(note => 
        new Date(note.timestamp) >= oneMonthAgo
    ).length;
    
    // Category usage
    const categoryUsage = {};
    notesToAnalyze.forEach(note => {
        const category = note.category || 'uncategorized';
        categoryUsage[category] = (categoryUsage[category] || 0) + 1;
    });
    
    // Most active categories
    const sortedCategories = Object.entries(categoryUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    return {
        overview: {
            totalNotes,
            totalCategories,
            notesThisWeek,
            notesThisMonth,
            averageWordsPerNote: wordCountStats.averageWordsPerNote
        },
        wordCount: wordCountStats,
        categoryUsage,
        topCategories: sortedCategories,
        recentActivity: {
            lastCreated: notesToAnalyze.length > 0 ? 
                Math.max(...notesToAnalyze.map(n => new Date(n.timestamp))) : null,
            lastModified: notesToAnalyze.length > 0 ? 
                Math.max(...notesToAnalyze.map(n => new Date(n.lastModified))) : null
        }
    };
}

/**
 * P3 - Get word count for notes
 * @param {Array} notes - Notes to count (optional, defaults to all)
 * @returns {Object} - Word count statistics
 */
function getWordCount(notes = null) {
    const notesToCount = notes || getAllNotes();
    
    let totalWords = 0;
    let totalTitleWords = 0;
    let totalContentWords = 0;
    const wordCounts = [];
    
    notesToCount.forEach(note => {
        const titleWords = (note.title || '').split(/\s+/).filter(word => word.length > 0).length;
        const contentWords = (note.content || '').split(/\s+/).filter(word => word.length > 0).length;
        const noteTotalWords = titleWords + contentWords;
        
        totalTitleWords += titleWords;
        totalContentWords += contentWords;
        totalWords += noteTotalWords;
        wordCounts.push(noteTotalWords);
    });
    
    const averageWordsPerNote = notesToCount.length > 0 ? Math.round(totalWords / notesToCount.length) : 0;
    const averageTitleWords = notesToCount.length > 0 ? Math.round(totalTitleWords / notesToCount.length) : 0;
    const averageContentWords = notesToCount.length > 0 ? Math.round(totalContentWords / notesToCount.length) : 0;
    
    // Find min and max word counts
    const minWords = wordCounts.length > 0 ? Math.min(...wordCounts) : 0;
    const maxWords = wordCounts.length > 0 ? Math.max(...wordCounts) : 0;
    
    return {
        totalWords,
        totalTitleWords,
        totalContentWords,
        averageWordsPerNote,
        averageTitleWords,
        averageContentWords,
        minWords,
        maxWords,
        noteCount: notesToCount.length
    };
}

/**
 * P3 - Get note trends over time
 * @param {string} period - Time period ('week', 'month', 'year')
 * @returns {Array} - Trend data
 */
function getNoteTrends(period = 'month') {
    const notes = getAllNotes();
    const now = new Date();
    const trends = [];
    
    let periods = 12; // Default to 12 periods
    let periodMs = 30 * 24 * 60 * 60 * 1000; // Default to 30 days
    
    switch (period) {
        case 'week':
            periods = 7;
            periodMs = 24 * 60 * 60 * 1000; // 1 day
            break;
        case 'month':
            periods = 12;
            periodMs = 30 * 24 * 60 * 60 * 1000; // 30 days
            break;
        case 'year':
            periods = 12;
            periodMs = 30 * 24 * 60 * 60 * 1000; // 30 days (12 periods = 1 year)
            break;
    }
    
    for (let i = periods - 1; i >= 0; i--) {
        const periodStart = new Date(now.getTime() - (i + 1) * periodMs);
        const periodEnd = new Date(now.getTime() - i * periodMs);
        
        const notesInPeriod = notes.filter(note => {
            const noteDate = new Date(note.timestamp);
            return noteDate >= periodStart && noteDate < periodEnd;
        });
        
        const modificationsInPeriod = notes.filter(note => {
            const noteDate = new Date(note.lastModified);
            return noteDate >= periodStart && noteDate < periodEnd;
        });
        
        trends.push({
            period: periodStart.toISOString().split('T')[0],
            startDate: periodStart,
            endDate: periodEnd,
            notesCreated: notesInPeriod.length,
            notesModified: modificationsInPeriod.length,
            totalNotes: notes.length
        });
    }
    
    return trends;
}

/**
 * P3 - Get category statistics
 * @returns {Object} - Category statistics
 */
function getCategoryStatistics() {
    const notes = getAllNotes();
    const categories = getAllCategories();
    
    // Count notes per category
    const categoryCounts = {};
    let uncategorizedCount = 0;
    
    notes.forEach(note => {
        if (note.category && note.category.trim()) {
            categoryCounts[note.category] = (categoryCounts[note.category] || 0) + 1;
        } else {
            uncategorizedCount++;
        }
    });
    
    // Calculate percentages
    const totalNotes = notes.length;
    const categoryPercentages = {};
    
    Object.keys(categoryCounts).forEach(category => {
        categoryPercentages[category] = Math.round((categoryCounts[category] / totalNotes) * 100);
    });
    
    // Sort categories by usage
    const sortedCategories = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([name, count]) => ({
            name,
            count,
            percentage: categoryPercentages[name]
        }));
    
    // Find most and least used categories
    const mostUsed = sortedCategories.length > 0 ? sortedCategories[0] : null;
    const leastUsed = sortedCategories.length > 0 ? sortedCategories[sortedCategories.length - 1] : null;
    
    return {
        totalCategories: categories.length,
        totalNotes,
        uncategorizedCount,
        uncategorizedPercentage: totalNotes > 0 ? Math.round((uncategorizedCount / totalNotes) * 100) : 0,
        categoryCounts,
        categoryPercentages,
        sortedCategories,
        mostUsed,
        leastUsed,
        averageNotesPerCategory: categories.length > 0 ? Math.round(totalNotes / categories.length) : 0
    };
}

/**
 * P3 - Generate activity report
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} - Activity report
 */
function generateActivityReport(startDate, endDate) {
    const notes = getAllNotes();
    
    // Filter notes by date range
    const notesInRange = notes.filter(note => {
        const noteDate = new Date(note.timestamp);
        return noteDate >= startDate && noteDate <= endDate;
    });
    
    const modificationsInRange = notes.filter(note => {
        const noteDate = new Date(note.lastModified);
        return noteDate >= startDate && noteDate <= endDate;
    });
    
    // Calculate activity metrics
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const notesPerDay = totalDays > 0 ? Math.round(notesInRange.length / totalDays * 10) / 10 : 0;
    const modificationsPerDay = totalDays > 0 ? Math.round(modificationsInRange.length / totalDays * 10) / 10 : 0;
    
    // Word count for the period
    const wordCountStats = getWordCount(notesInRange);
    
    // Category breakdown for the period
    const categoryBreakdown = {};
    notesInRange.forEach(note => {
        const category = note.category || 'uncategorized';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    });
    
    // Most active day
    const dailyActivity = {};
    notesInRange.forEach(note => {
        const date = note.timestamp.split('T')[0];
        dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });
    
    const mostActiveDay = Object.entries(dailyActivity)
        .sort(([,a], [,b]) => b - a)[0] || null;
    
    return {
        period: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            totalDays
        },
        activity: {
            notesCreated: notesInRange.length,
            notesModified: modificationsInRange.length,
            notesPerDay,
            modificationsPerDay,
            mostActiveDay: mostActiveDay ? {
                date: mostActiveDay[0],
                notesCreated: mostActiveDay[1]
            } : null
        },
        content: {
            totalWords: wordCountStats.totalWords,
            averageWordsPerNote: wordCountStats.averageWordsPerNote,
            totalTitleWords: wordCountStats.totalTitleWords,
            totalContentWords: wordCountStats.totalContentWords
        },
        categories: {
            breakdown: categoryBreakdown,
            topCategory: Object.entries(categoryBreakdown)
                .sort(([,a], [,b]) => b - a)[0] || null
        },
        summary: {
            totalNotes: notes.length,
            notesInPeriod: notesInRange.length,
            percentageOfTotal: notes.length > 0 ? Math.round((notesInRange.length / notes.length) * 100) : 0
        }
    };
}

/**
 * P3 - Download file with proper filename
 * @param {Blob|string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 * @returns {void}
 */
function downloadFile(content, filename, mimeType = 'application/octet-stream') {
    let blob;
    if (typeof content === 'string') {
        blob = new Blob([content], { type: mimeType });
    } else {
        blob = content;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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