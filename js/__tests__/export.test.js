import * as exportModule from '../export.js';

// Mock jsPDF
jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      setFontSize: jest.fn(),
      text: jest.fn(),
      splitTextToSize: jest.fn().mockReturnValue(['line1', 'line2']),
      addPage: jest.fn(),
      save: jest.fn(),
      output: jest.fn().mockReturnValue(new Blob(['pdf content'], { type: 'application/pdf' }))
    }))
  };
});

// Mock note and category modules
jest.mock('../note.js', () => ({
  getAllNotes: jest.fn(),
  createNote: jest.fn(),
  editNote: jest.fn(),
  deleteNote: jest.fn(),
  generateId: jest.fn().mockReturnValue('mock-id-123')
}));

jest.mock('../category.js', () => ({
  getAllCategories: jest.fn(),
  createCategory: jest.fn(),
  deleteCategory: jest.fn()
}));

// Mock File constructor
global.File = jest.fn().mockImplementation((content, filename, options) => ({
  name: filename,
  type: options?.type || 'text/plain',
  content: content,
  size: content.length
}));

// Mock FileReader
global.FileReader = jest.fn().mockImplementation(() => ({
  readAsText: jest.fn(),
  onload: null,
  onerror: null
}));

// Helper function to create a working FileReader mock
function createMockFileReader(result, shouldError = false) {
  const mockReader = {
    readAsText: jest.fn().mockImplementation(() => {
      // Simulate async behavior by triggering event after a short delay
      setTimeout(() => {
        if (shouldError) {
          mockReader.onerror && mockReader.onerror({ target: { error: new Error('File read error') } });
        } else {
          mockReader.onload && mockReader.onload({ target: { result } });
        }
      }, 10);
    }),
    onload: null,
    onerror: null
  };
  return mockReader;
}

describe('Export Module', () => {
  const mockNotes = [
    {
      id: '1',
      title: 'Test Note 1',
      content: 'This is the content of test note 1',
      category: 'work',
      timestamp: '2023-01-01T10:00:00Z',
      lastModified: '2023-01-01T10:00:00Z'
    },
    {
      id: '2',
      title: 'Test Note 2',
      content: 'This is the content of test note 2',
      category: 'personal',
      timestamp: '2023-01-02T10:00:00Z',
      lastModified: '2023-01-02T10:00:00Z'
    },
    {
      id: '3',
      title: 'Untitled Note',
      content: '',
      category: '',
      timestamp: '2023-01-03T10:00:00Z',
      lastModified: '2023-01-03T10:00:00Z'
    }
  ];

  const { getAllNotes } = require('../note.js');

  beforeEach(() => {
    jest.clearAllMocks();
    getAllNotes.mockReturnValue(mockNotes);
  });

  describe('Export Functions', () => {
    describe('exportToJson', () => {
      test('exports all notes to JSON when no notes provided', () => {
        const result = exportModule.exportToJson();
        
        expect(getAllNotes).toHaveBeenCalled();
        expect(typeof result).toBe('string');
        
        const parsed = JSON.parse(result);
        expect(parsed).toEqual(mockNotes);
      });

      test('exports specific notes to JSON when provided', () => {
        const specificNotes = [mockNotes[0]];
        const result = exportModule.exportToJson(specificNotes);
        
        expect(getAllNotes).not.toHaveBeenCalled();
        expect(typeof result).toBe('string');
        
        const parsed = JSON.parse(result);
        expect(parsed).toEqual(specificNotes);
      });

      test('exports with proper JSON formatting', () => {
        const result = exportModule.exportToJson();
        
        // Should be properly formatted with indentation
        expect(result).toContain('\n  ');
        expect(result).toContain('"id": "1"');
        expect(result).toContain('"title": "Test Note 1"');
      });
    });

    describe('exportToMarkdown', () => {
      test('exports all notes to Markdown when no notes provided', () => {
        const result = exportModule.exportToMarkdown();
        
        expect(getAllNotes).toHaveBeenCalled();
        expect(typeof result).toBe('string');
        expect(result).toContain('# Test Note 1');
        expect(result).toContain('# Test Note 2');
      });

      test('exports specific notes to Markdown when provided', () => {
        const specificNotes = [mockNotes[0]];
        const result = exportModule.exportToMarkdown(specificNotes);
        
        expect(getAllNotes).not.toHaveBeenCalled();
        expect(result).toContain('# Test Note 1');
        expect(result).not.toContain('# Test Note 2');
      });

      test('includes frontmatter for each note', () => {
        const result = exportModule.exportToMarkdown();
        
        expect(result).toContain('---');
        expect(result).toContain('title: Test Note 1');
        expect(result).toContain('category: work');
        expect(result).toContain('timestamp: 2023-01-01T10:00:00Z');
      });

      test('handles notes with missing or empty fields', () => {
        const result = exportModule.exportToMarkdown();
        
        expect(result).toContain('title: Untitled Note');
        expect(result).toContain('category: uncategorized');
        expect(result).toContain('# Untitled Note');
      });

      test('separates notes with markdown dividers', () => {
        const result = exportModule.exportToMarkdown();
        
        // Should have separators between notes
        const parts = result.split('\n\n---\n\n');
        expect(parts.length).toBeGreaterThan(1);
      });
    });

    describe('exportToPdf', () => {
      test('exports all notes to PDF when no notes provided', async () => {
        const result = await exportModule.exportToPdf();
        
        expect(getAllNotes).toHaveBeenCalled();
        expect(result).toBeDefined();
      });

      test('exports specific notes to PDF when provided', async () => {
        const specificNotes = [mockNotes[0]];
        const result = await exportModule.exportToPdf(specificNotes);
        
        expect(getAllNotes).not.toHaveBeenCalled();
        expect(result).toBeDefined();
      });

      test('handles notes with missing titles', async () => {
        const notesWithUntitled = [
          { ...mockNotes[0], title: '' },
          { ...mockNotes[1], title: null }
        ];
        
        const result = await exportModule.exportToPdf(notesWithUntitled);
        expect(result).toBeDefined();
      });

      test('handles notes with missing content', async () => {
        const notesWithEmptyContent = [
          { ...mockNotes[0], content: '' },
          { ...mockNotes[1], content: null }
        ];
        
        const result = await exportModule.exportToPdf(notesWithEmptyContent);
        expect(result).toBeDefined();
      });
    });

    describe('exportNote', () => {
      test('exports single note to JSON format', async () => {
        const note = mockNotes[0];
        const result = await exportModule.exportNote(note, 'json');
        
        expect(typeof result).toBe('string');
        const parsed = JSON.parse(result);
        expect(parsed).toEqual([note]);
      });

      test('exports single note to Markdown format', async () => {
        const note = mockNotes[0];
        const result = await exportModule.exportNote(note, 'markdown');
        
        expect(typeof result).toBe('string');
        expect(result).toContain('# Test Note 1');
        expect(result).toContain('This is the content of test note 1');
      });

      test('exports single note to PDF format', async () => {
        const note = mockNotes[0];
        const result = await exportModule.exportNote(note, 'pdf');
        
        expect(result).toBeDefined();
      });

      test('returns null for invalid format', async () => {
        const note = mockNotes[0];
        const result = await exportModule.exportNote(note, 'invalid');
        
        expect(result).toBeNull();
      });

      test('returns null for note without ID', async () => {
        const noteWithoutId = { title: 'Test', content: 'Content' };
        const result = await exportModule.exportNote(noteWithoutId, 'json');
        
        expect(result).toBeNull();
      });
    });
  });

  describe('Utility Functions', () => {
    describe('generateExportFilename', () => {
      test('generates JSON filename with timestamp', () => {
        const filename = exportModule.generateExportFilename('json');
        
        expect(filename).toMatch(/^notes-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.json$/);
      });

      test('generates Markdown filename with timestamp', () => {
        const filename = exportModule.generateExportFilename('markdown');
        
        expect(filename).toMatch(/^notes-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.md$/);
      });

      test('generates PDF filename with timestamp', () => {
        const filename = exportModule.generateExportFilename('pdf');
        
        expect(filename).toMatch(/^notes-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.pdf$/);
      });

      test('uses custom prefix when provided', () => {
        const filename = exportModule.generateExportFilename('json', 'my-notes');
        
        expect(filename).toMatch(/^my-notes-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.json$/);
      });

      test('handles different format types', () => {
        const jsonFilename = exportModule.generateExportFilename('json');
        const mdFilename = exportModule.generateExportFilename('markdown');
        const pdfFilename = exportModule.generateExportFilename('pdf');
        
        expect(jsonFilename).toMatch(/\.json$/);
        expect(mdFilename).toMatch(/\.md$/);
        expect(pdfFilename).toMatch(/\.pdf$/);
      });
    });
  });

  describe('Import Functions', () => {
    describe('importFromJson', () => {
      test('imports notes from JSON file', async () => {
        const mockFile = new File([JSON.stringify(mockNotes)], 'test.json', { type: 'application/json' });
        
        // Mock FileReader success
        const mockFileReader = createMockFileReader(JSON.stringify(mockNotes));
        
        // Mock the FileReader constructor to return our mock
        global.FileReader = jest.fn().mockImplementation(() => mockFileReader);
        
        const result = await exportModule.importFromJson(mockFile);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual(mockNotes);
      });

      test('handles FileReader error', async () => {
        const mockFile = new File(['invalid json'], 'test.json', { type: 'application/json' });
        
        // Mock FileReader error
        const mockFileReader = createMockFileReader(null, true);
        
        // Mock the FileReader constructor to return our mock
        global.FileReader = jest.fn().mockImplementation(() => mockFileReader);
        
        await expect(exportModule.importFromJson(mockFile)).rejects.toThrow('Failed to read file');
      });
    });

    describe('importFromMarkdown', () => {
      test('imports notes from Markdown files', async () => {
        const mockFiles = [
          new File(['# Note 1\n\nContent 1'], 'note1.md', { type: 'text/markdown' }),
          new File(['# Note 2\n\nContent 2'], 'note2.md', { type: 'text/markdown' })
        ];
        
        // Mock FileReader to handle multiple files
        let fileIndex = 0;
        const fileContents = ['# Note 1\n\nContent 1', '# Note 2\n\nContent 2'];
        
        global.FileReader = jest.fn().mockImplementation(() => ({
          readAsText: jest.fn().mockImplementation(() => {
            setTimeout(() => {
              const mockReader = global.FileReader.mock.results[fileIndex].value;
              mockReader.onload && mockReader.onload({ 
                target: { result: fileContents[fileIndex] } 
              });
              fileIndex++;
            }, 10);
          }),
          onload: null,
          onerror: null
        }));
        
        const result = await exportModule.importFromMarkdown(mockFiles);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(result[0].title).toBe('note1');
        expect(result[1].title).toBe('note2');
      });

      test('handles empty files array', async () => {
        const result = await exportModule.importFromMarkdown([]);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      test('handles FileReader error', async () => {
        const mockFiles = [
          new File(['# Note 1'], 'note1.md', { type: 'text/markdown' })
        ];
        
        // Mock FileReader error
        const mockFileReader = createMockFileReader(null, true);
        
        // Mock the FileReader constructor to return our mock
        global.FileReader = jest.fn().mockImplementation(() => mockFileReader);
        
        await expect(exportModule.importFromMarkdown(mockFiles)).rejects.toThrow('Failed to read file');
      });
    });
  });

  describe('Validation and Merging Functions', () => {
    describe('validateImportData', () => {
      test('returns valid for proper note data', () => {
        const validData = [
          { id: '1', title: 'Test Note 1', content: 'Content 1' },
          { id: '2', title: 'Test Note 2', content: 'Content 2' }
        ];
        
        const result = exportModule.validateImportData(validData);
        
        expect(result.valid).toBe(true);
        expect(result.message).toBe('Import data is valid');
      });

      test('returns invalid for non-array data', () => {
        const invalidData = { id: '1', title: 'Test', content: 'Content' };
        
        const result = exportModule.validateImportData(invalidData);
        
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Import data must be an array');
      });

      test('returns invalid for empty array', () => {
        const emptyData = [];
        
        const result = exportModule.validateImportData(emptyData);
        
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Import data must not be empty');
      });

      test('returns invalid for note without title', () => {
        const invalidData = [
          { id: '1', content: 'Content 1' },
          { id: '2', title: 'Test Note 2', content: 'Content 2' }
        ];
        
        const result = exportModule.validateImportData(invalidData);
        
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Note must have a title and content');
      });

      test('returns invalid for note without content', () => {
        const invalidData = [
          { id: '1', title: 'Test Note 1' },
          { id: '2', title: 'Test Note 2', content: 'Content 2' }
        ];
        
        const result = exportModule.validateImportData(invalidData);
        
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Note must have a title and content');
      });

      test('returns invalid for note with empty title', () => {
        const invalidData = [
          { id: '1', title: '', content: 'Content 1' },
          { id: '2', title: 'Test Note 2', content: 'Content 2' }
        ];
        
        const result = exportModule.validateImportData(invalidData);
        
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Note must have a title and content');
      });

      test('returns invalid for note with empty content', () => {
        const invalidData = [
          { id: '1', title: 'Test Note 1', content: '' },
          { id: '2', title: 'Test Note 2', content: 'Content 2' }
        ];
        
        const result = exportModule.validateImportData(invalidData);
        
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Note must have a title and content');
      });
    });

    describe('mergeImportedNotes', () => {
      const existingNotes = [
        { id: '1', title: 'Existing Note 1', content: 'Existing Content 1' },
        { id: '2', title: 'Existing Note 2', content: 'Existing Content 2' }
      ];

      const importedNotes = [
        { id: '3', title: 'New Note 1', content: 'New Content 1' },
        { id: '4', title: 'New Note 2', content: 'New Content 2' }
      ];

      beforeEach(() => {
        getAllNotes.mockReturnValue(existingNotes);
      });

      test('overwrite strategy replaces existing notes with same ID', () => {
        const conflictingImportedNotes = [
          { id: '1', title: 'Updated Note 1', content: 'Updated Content 1' },
          { id: '5', title: 'New Note 3', content: 'New Content 3' }
        ];
        
        const result = exportModule.mergeImportedNotes(conflictingImportedNotes, { 
          duplicateStrategy: 'overwrite' 
        });
        
        expect(result.length).toBe(3); // 1 existing + 2 imported
        expect(result.find(note => note.id === '1').title).toBe('Updated Note 1');
        expect(result.find(note => note.id === '2')).toBeDefined(); // Should still exist
        expect(result.find(note => note.id === '5')).toBeDefined(); // Should be added
      });

      test('overwrite strategy replaces existing notes with same title', () => {
        const conflictingImportedNotes = [
          { id: '6', title: 'Existing Note 1', content: 'Updated Content' },
          { id: '7', title: 'New Note 3', content: 'New Content 3' }
        ];
        
        const result = exportModule.mergeImportedNotes(conflictingImportedNotes, { 
          duplicateStrategy: 'overwrite' 
        });
        
        expect(result.length).toBe(3); // 1 existing + 2 imported (1 replaced)
        expect(result.find(note => note.title === 'Existing Note 1').id).toBe('6');
        expect(result.find(note => note.id === '2')).toBeDefined(); // Should still exist
      });

      test('skip strategy keeps existing notes unchanged', () => {
        const conflictingImportedNotes = [
          { id: '1', title: 'Updated Note 1', content: 'Updated Content 1' },
          { id: '5', title: 'New Note 3', content: 'New Content 3' }
        ];
        
        const result = exportModule.mergeImportedNotes(conflictingImportedNotes, { 
          duplicateStrategy: 'skip' 
        });
        
        expect(result.length).toBe(2); // Only existing notes
        expect(result.find(note => note.id === '1').title).toBe('Existing Note 1'); // Original unchanged
        expect(result.find(note => note.id === '2')).toBeDefined(); // Should still exist
      });

      test('rename strategy adds duplicate suffix to conflicting notes', () => {
        const conflictingImportedNotes = [
          { id: '1', title: 'Existing Note 1', content: 'New Content' }, // ID conflict
          { id: '3', title: 'Existing Note 2', content: 'New Content 3' } // Title conflict
        ];
        
        const result = exportModule.mergeImportedNotes(conflictingImportedNotes, { 
          duplicateStrategy: 'rename' 
        });
        
        expect(result.length).toBe(4); // 2 existing + 2 imported (both renamed)
        
        // Check that we have both the original and renamed versions
        const originalNote1 = result.find(note => note.id === '1' && note.title === 'Existing Note 1');
        const renamedNote1 = result.find(note => note.id === '1' && note.title === 'Existing Note 1 (Duplicate)');
        const originalNote2 = result.find(note => note.id === '2' && note.title === 'Existing Note 2');
        const renamedNote3 = result.find(note => note.id === '3' && note.title === 'Existing Note 2 (Duplicate)');
        
        expect(originalNote1).toBeDefined(); // Original note still exists
        expect(renamedNote1).toBeDefined(); // Renamed note exists
        expect(originalNote2).toBeDefined(); // Original note 2 still exists
        expect(renamedNote3).toBeDefined(); // Renamed note 3 exists
      });

      test('throws error when no duplicate strategy specified', () => {
        const importedNotes = [
          { id: '3', title: 'New Note 1', content: 'New Content 1' }
        ];
        
        expect(() => {
          exportModule.mergeImportedNotes(importedNotes, {});
        }).toThrow('Must specify a duplicate strategy');
      });

      test('handles empty imported notes array', () => {
        const result = exportModule.mergeImportedNotes([], { 
          duplicateStrategy: 'skip' 
        });
        
        expect(result.length).toBe(2); // Only existing notes
        expect(result).toEqual(existingNotes);
      });

      test('handles no existing notes', () => {
        getAllNotes.mockReturnValue([]);
        
        const result = exportModule.mergeImportedNotes(importedNotes, { 
          duplicateStrategy: 'overwrite' 
        });
        
        expect(result.length).toBe(2); // Only imported notes
        expect(result).toEqual(importedNotes);
      });

      test('overwrite strategy with no conflicts adds all notes', () => {
        const newNotes = [
          { id: '5', title: 'New Note 1', content: 'New Content 1' },
          { id: '6', title: 'New Note 2', content: 'New Content 2' }
        ];
        
        const result = exportModule.mergeImportedNotes(newNotes, { 
          duplicateStrategy: 'overwrite' 
        });
        
        expect(result.length).toBe(4); // 2 existing + 2 new
        expect(result.find(note => note.id === '5')).toBeDefined();
        expect(result.find(note => note.id === '6')).toBeDefined();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('exportToJson handles empty notes array', () => {
      getAllNotes.mockReturnValue([]);
      
      const result = exportModule.exportToJson();
      
      expect(result).toBe('[]');
    });

    test('exportToMarkdown handles empty notes array', () => {
      getAllNotes.mockReturnValue([]);
      
      const result = exportModule.exportToMarkdown();
      
      expect(result).toBe('');
    });

    test('exportToPdf handles empty notes array', async () => {
      getAllNotes.mockReturnValue([]);
      
      const result = await exportModule.exportToPdf();
      
      expect(result).toBeDefined();
    });

    test('exportNote handles null note', async () => {
      const result = await exportModule.exportNote(null, 'json');
      
      expect(result).toBeNull();
    });

    test('generateExportFilename handles invalid format', () => {
      const filename = exportModule.generateExportFilename('invalid');
      
      expect(filename).toBeUndefined();
    });

    test('importFromJson handles null file', async () => {
      await expect(exportModule.importFromJson(null)).rejects.toThrow();
    });

    test('importFromMarkdown handles null files array', async () => {
      await expect(exportModule.importFromMarkdown(null)).rejects.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('export and import cycle preserves data', async () => {
      // Export to JSON
      const exportedJson = exportModule.exportToJson(mockNotes);
      
      // Create mock file from exported JSON
      const mockFile = new File([exportedJson], 'test.json', { type: 'application/json' });
      
      // Mock FileReader to return the exported JSON
      const mockFileReader = createMockFileReader(exportedJson);
      
      // Mock the FileReader constructor to return our mock
      global.FileReader = jest.fn().mockImplementation(() => mockFileReader);
      
      // Import the JSON
      const importedNotes = await exportModule.importFromJson(mockFile);
      
      // Data should be preserved
      expect(importedNotes).toEqual(mockNotes);
    });

    test('different export formats produce different outputs', async () => {
      const note = mockNotes[0];
      
      const jsonResult = await exportModule.exportNote(note, 'json');
      const markdownResult = await exportModule.exportNote(note, 'markdown');
      const pdfResult = await exportModule.exportNote(note, 'pdf');
      
      expect(typeof jsonResult).toBe('string');
      expect(typeof markdownResult).toBe('string');
      expect(pdfResult).toBeDefined();
      
      // JSON should contain the note data
      const parsedJson = JSON.parse(jsonResult);
      expect(parsedJson[0]).toEqual(note);
      
      // Markdown should contain the title and content
      expect(markdownResult).toContain(note.title);
      expect(markdownResult).toContain(note.content);
    });
  });
}); 