import * as search from '../search.js';

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock getAllNotes function
jest.mock('../note.js', () => ({
  getAllNotes: jest.fn()
}));

describe('Search Module', () => {
  const mockNotes = [
    { id: '1', title: 'First Note', content: 'Hello world', category: 'cat1', timestamp: '2023-01-01T10:00:00Z' },
    { id: '2', title: 'Second Note', content: 'Another content', category: 'cat2', timestamp: '2023-01-02T10:00:00Z' },
    { id: '3', title: 'Third', content: 'Hello again', category: 'cat1', timestamp: '2023-01-03T10:00:00Z' },
    { id: '4', title: 'Meeting Notes', content: 'Important meeting about project', category: 'work', timestamp: '2023-01-04T10:00:00Z' },
    { id: '5', title: 'Shopping List', content: 'Milk, bread, eggs', category: 'personal', timestamp: '2023-01-05T10:00:00Z' }
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
  });

  describe('Basic Search Functions', () => {
    test('searchNotesByTitle finds notes by title', () => {
      const result = search.searchNotesByTitle('First', mockNotes);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    test('searchNotesByTitle is case insensitive', () => {
      const result = search.searchNotesByTitle('first', mockNotes);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    test('searchNotesByTitle returns empty array for no matches', () => {
      const result = search.searchNotesByTitle('nonexistent', mockNotes);
      expect(result.length).toBe(0);
    });

    test('searchNotesByContent finds notes by content', () => {
      const result = search.searchNotesByContent('again', mockNotes);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('3');
    });

    test('searchNotesByContent is case insensitive', () => {
      const result = search.searchNotesByContent('HELLO', mockNotes);
      expect(result.length).toBe(2); // 'Hello world' and 'Hello again'
    });

    test('searchNotesByContent returns empty array for no matches', () => {
      const result = search.searchNotesByContent('nonexistent', mockNotes);
      expect(result.length).toBe(0);
    });
  });

  describe('Advanced Search', () => {
    test('advancedSearch filters by category', () => {
      const criteria = { query: 'Hello', category: 'cat1' };
      const result = search.advancedSearch(criteria, mockNotes);
      expect(result.length).toBe(2); // Should find notes with 'Hello' in cat1
    });

    test('advancedSearch filters by date range', () => {
      const criteria = { 
        query: 'Hello', 
        dateFrom: '2023-01-02T00:00:00Z',
        dateTo: '2023-01-03T23:59:59Z'
      };
      const result = search.advancedSearch(criteria, mockNotes);
      expect(result.length).toBe(1); // Should find 'Hello again' note
    });

    test('advancedSearch sorts by relevance', () => {
      const criteria = { query: 'Hello', sortBy: 'relevance' };
      const result = search.advancedSearch(criteria, mockNotes);
      expect(result.length).toBeGreaterThan(0);
      // Results should be sorted by relevance score
      expect(result[0].score).toBeGreaterThanOrEqual(result[1]?.score || 0);
    });

    test('advancedSearch sorts by date', () => {
      const criteria = { query: 'Hello', sortBy: 'date', sortOrder: 'asc' };
      const result = search.advancedSearch(criteria, mockNotes);
      expect(result.length).toBeGreaterThan(0);
    });

    test('advancedSearch sorts by title', () => {
      const criteria = { query: 'Hello', sortBy: 'title', sortOrder: 'asc' };
      const result = search.advancedSearch(criteria, mockNotes);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Date Range Search', () => {
    test('searchByDateRange finds notes within date range', () => {
      const startDate = '2023-01-02T00:00:00Z';
      const endDate = '2023-01-04T23:59:59Z';
      const result = search.searchByDateRange(startDate, endDate, mockNotes);
      expect(result.length).toBe(3); // Notes 2, 3, and 4
    });

    test('searchByDateRange returns empty array for no matches', () => {
      const startDate = '2024-01-01T00:00:00Z';
      const endDate = '2024-01-31T23:59:59Z';
      const result = search.searchByDateRange(startDate, endDate, mockNotes);
      expect(result.length).toBe(0);
    });

    test('searchByDateRange handles single date', () => {
      const startDate = '2023-01-01T10:00:00Z';
      const endDate = '2023-01-01T10:00:00Z';
      const result = search.searchByDateRange(startDate, endDate, mockNotes);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('Full Text Search', () => {
    test('fullTextSearch returns notes with relevance scores', () => {
      const result = search.fullTextSearch('Hello', mockNotes);
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('score');
      expect(result[0].score).toBeGreaterThan(0);
    });

    test('fullTextSearch sorts by relevance score', () => {
      const result = search.fullTextSearch('Hello', mockNotes);
      expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
    });

    test('fullTextSearch returns empty array for no matches', () => {
      const result = search.fullTextSearch('nonexistent', mockNotes);
      expect(result.length).toBe(0);
    });

    test('fullTextSearch uses getAllNotes when no notes provided', () => {
      const { getAllNotes } = require('../note.js');
      getAllNotes.mockReturnValue(mockNotes);
      
      search.fullTextSearch('Hello');
      
      expect(getAllNotes).toHaveBeenCalled();
    });
  });

  describe('Sorting Functions', () => {
    test('sortByDate sorts notes by date ascending', () => {
      const sorted = search.sortByDate([...mockNotes], 'asc');
      expect(sorted[0].id).toBe('1');
      expect(sorted[sorted.length - 1].id).toBe('5');
    });

    test('sortByDate sorts notes by date descending', () => {
      const sorted = search.sortByDate([...mockNotes], 'desc');
      expect(sorted[0].id).toBe('5');
      expect(sorted[sorted.length - 1].id).toBe('1');
    });

    test('sortByDate defaults to descending order', () => {
      const sorted = search.sortByDate([...mockNotes]);
      expect(sorted[0].id).toBe('5');
    });

    test('sortByTitle sorts notes by title ascending', () => {
      const sorted = search.sortByTitle([...mockNotes], 'asc');
      expect(sorted[0].title).toBe('First Note');
      expect(sorted[sorted.length - 1].title).toBe('Third');
    });

    test('sortByTitle sorts notes by title descending', () => {
      const sorted = search.sortByTitle([...mockNotes], 'desc');
      expect(sorted[0].title).toBe('Third');
      expect(sorted[sorted.length - 1].title).toBe('First Note');
    });

    test('sortByTitle defaults to ascending order', () => {
      const sorted = search.sortByTitle([...mockNotes]);
      expect(sorted[0].title).toBe('First Note');
    });

    test('sortByTitle is case insensitive', () => {
      const notesWithCase = [
        { title: 'apple', content: 'test' },
        { title: 'Banana', content: 'test' },
        { title: 'cherry', content: 'test' }
      ];
      const sorted = search.sortByTitle(notesWithCase, 'asc');
      expect(sorted[0].title).toBe('apple');
      expect(sorted[1].title).toBe('Banana');
      expect(sorted[2].title).toBe('cherry');
    });
  });

  describe('Search Suggestions', () => {
    test('getSearchSuggestions returns notes with matching title', () => {
      const result = search.getSearchSuggestions('Sec', mockNotes);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('2');
    });

    test('getSearchSuggestions is case insensitive', () => {
      const result = search.getSearchSuggestions('sec', mockNotes);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('2');
    });

    test('getSearchSuggestions returns empty array for no matches', () => {
      const result = search.getSearchSuggestions('nonexistent', mockNotes);
      expect(result.length).toBe(0);
    });

    test('getSearchSuggestions handles empty query', () => {
      const result = search.getSearchSuggestions('', mockNotes);
      expect(result.length).toBe(mockNotes.length);
    });
  });

  describe('Search History', () => {
    test('saveSearchHistory saves search to localStorage', () => {
      const query = 'test query';
      const criteria = { category: 'work' };
      
      search.saveSearchHistory(query, criteria);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'searchHistory',
        expect.any(String)
      );
    });

    test('getSearchHistory returns recent searches', () => {
      const mockHistory = [
        { query: 'test1', criteria: {}, timestamp: '2023-01-01T10:00:00Z' },
        { query: 'test2', criteria: {}, timestamp: '2023-01-02T10:00:00Z' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));
      
      const result = search.getSearchHistory();
      
      expect(result).toEqual(mockHistory);
    });

    test('getSearchHistory respects limit parameter', () => {
      const mockHistory = [
        { query: 'test1', criteria: {}, timestamp: '2023-01-01T10:00:00Z' },
        { query: 'test2', criteria: {}, timestamp: '2023-01-02T10:00:00Z' },
        { query: 'test3', criteria: {}, timestamp: '2023-01-03T10:00:00Z' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));
      
      const result = search.getSearchHistory(2);
      
      expect(result.length).toBe(2);
      expect(result[0].query).toBe('test1');
      expect(result[1].query).toBe('test2');
    });

    test('getSearchHistory returns empty array when no history', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = search.getSearchHistory();
      
      expect(result).toEqual([]);
    });

    test('clearSearchHistory clears search history', () => {
      search.clearSearchHistory();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'searchHistory',
        '[]'
      );
    });
  });

  describe('Saved Searches', () => {
    test('saveSearch saves search to localStorage', () => {
      const name = 'My Search';
      const criteria = { query: 'test', category: 'work' };
      
      search.saveSearch(name, criteria);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'savedSearches',
        expect.any(String)
      );
    });

    test('getSavedSearches returns saved searches', () => {
      const mockSavedSearches = [
        { name: 'Search 1', criteria: {}, timestamp: '2023-01-01T10:00:00Z' },
        { name: 'Search 2', criteria: {}, timestamp: '2023-01-02T10:00:00Z' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSavedSearches));
      
      const result = search.getSavedSearches();
      
      expect(result).toEqual(mockSavedSearches);
    });

    test('getSavedSearches returns empty array when no saved searches', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = search.getSavedSearches();
      
      expect(result).toEqual([]);
    });

    test('deleteSavedSearch removes search from localStorage', () => {
      const mockSavedSearches = [
        { name: 'Search 1', criteria: {}, timestamp: '2023-01-01T10:00:00Z' },
        { name: 'Search 2', criteria: {}, timestamp: '2023-01-02T10:00:00Z' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSavedSearches));
      
      search.deleteSavedSearch('Search 1');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'savedSearches',
        JSON.stringify([mockSavedSearches[1]])
      );
    });
  });

  describe('Utility Functions', () => {
    test('textMatchesQuery matches text case-insensitively', () => {
      expect(search.textMatchesQuery('Hello World', 'hello')).toBe(true);
      expect(search.textMatchesQuery('Hello World', 'WORLD')).toBe(true);
      expect(search.textMatchesQuery('Hello World', 'nope')).toBe(false);
    });

    test('textMatchesQuery handles empty query', () => {
      expect(search.textMatchesQuery('Hello World', '')).toBe(true);
    });

    test('textMatchesQuery handles empty text', () => {
      expect(search.textMatchesQuery('', 'hello')).toBe(false);
    });

    test('calculateRelevanceScore gives correct score for title match', () => {
      const note = { title: 'Hello World', content: 'Some content' };
      const score = search.calculateRelevanceScore(note, 'hello');
      expect(score).toBe(0.5);
    });

    test('calculateRelevanceScore gives correct score for content match', () => {
      const note = { title: 'Some title', content: 'Hello World' };
      const score = search.calculateRelevanceScore(note, 'world');
      expect(score).toBe(0.5);
    });

    test('calculateRelevanceScore gives correct score for both matches', () => {
      const note = { title: 'Hello', content: 'Hello World' };
      const score = search.calculateRelevanceScore(note, 'hello');
      expect(score).toBe(1.0);
    });

    test('calculateRelevanceScore gives zero for no matches', () => {
      const note = { title: 'Some title', content: 'Some content' };
      const score = search.calculateRelevanceScore(note, 'nonexistent');
      expect(score).toBe(0);
    });

    test('calculateRelevanceScore handles multiple words', () => {
      const note = { title: 'Hello World', content: 'Some content' };
      const score = search.calculateRelevanceScore(note, 'hello world');
      expect(score).toBe(0.5);
    });

    test('calculateRelevanceScore handles partial word matches', () => {
      const note = { title: 'Hello World', content: 'Some content' };
      const score = search.calculateRelevanceScore(note, 'hell');
      expect(score).toBe(0.5);
    });
  });

  describe('Highlight Search Terms', () => {
    test('highlightSearchTerms highlights single word', () => {
      const text = 'Hello world';
      const query = 'hello';
      const result = search.highlightSearchTerms(text, query);
      expect(result).toBe('<mark>Hello</mark> world');
    });

    test('highlightSearchTerms highlights multiple words', () => {
      const text = 'Hello world test';
      const query = 'hello test';
      const result = search.highlightSearchTerms(text, query);
      expect(result).toBe('<mark>Hello</mark> world <mark>test</mark>');
    });

    test('highlightSearchTerms is case insensitive', () => {
      const text = 'Hello WORLD';
      const query = 'world';
      const result = search.highlightSearchTerms(text, query);
      expect(result).toBe('Hello <mark>WORLD</mark>');
    });

    test('highlightSearchTerms handles empty query', () => {
      const text = 'Hello world';
      const query = '';
      const result = search.highlightSearchTerms(text, query);
      expect(result).toBe('Hello world');
    });

    test('highlightSearchTerms handles empty text', () => {
      const text = '';
      const query = 'hello';
      const result = search.highlightSearchTerms(text, query);
      expect(result).toBe('');
    });

    test('highlightSearchTerms handles special characters', () => {
      const text = 'Hello-world test';
      const query = 'hello-world';
      const result = search.highlightSearchTerms(text, query);
      expect(result).toBe('<mark>Hello-world</mark> test');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('functions handle null or undefined notes array', () => {
      expect(() => search.searchNotesByTitle('test', null)).not.toThrow();
      expect(() => search.searchNotesByContent('test', undefined)).not.toThrow();
    });

    test('functions handle empty notes array', () => {
      const result = search.searchNotesByTitle('test', []);
      expect(result).toEqual([]);
    });

    test('sorting functions handle notes with missing properties', () => {
      const notesWithMissingProps = [
        { title: 'A', content: 'test' },
        { content: 'test' }, // missing title
        { title: 'C', content: 'test' }
      ];
      
      expect(() => search.sortByTitle(notesWithMissingProps)).not.toThrow();
    });

    test('date functions handle invalid dates', () => {
      const notesWithInvalidDates = [
        { title: 'A', content: 'test', timestamp: 'invalid-date' },
        { title: 'B', content: 'test', timestamp: '2023-01-01T10:00:00Z' }
      ];
      
      expect(() => search.sortByDate(notesWithInvalidDates)).not.toThrow();
    });
  });
}); 