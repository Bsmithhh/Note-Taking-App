import * as search from '../search.js';

describe('Search Module', () => {
  const notes = [
    { id: '1', title: 'First Note', content: 'Hello world', category: 'cat1', timestamp: '2023-01-01T10:00:00Z' },
    { id: '2', title: 'Second Note', content: 'Another content', category: 'cat2', timestamp: '2023-01-02T10:00:00Z' },
    { id: '3', title: 'Third', content: 'Hello again', category: 'cat1', timestamp: '2023-01-03T10:00:00Z' },
  ];

  test('searchNotesByTitle finds notes by title', () => {
    const result = search.searchNotesByTitle('First', notes);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
  });

  test('searchNotesByContent finds notes by content', () => {
    const result = search.searchNotesByContent('again', notes);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('3');
  });

  test('sortByDate sorts notes by date', () => {
    const sorted = search.sortByDate([...notes], 'asc');
    expect(sorted[0].id).toBe('1');
    const sortedDesc = search.sortByDate([...notes], 'desc');
    expect(sortedDesc[0].id).toBe('3');
  });

  test('sortByTitle sorts notes by title', () => {
    const sorted = search.sortByTitle([...notes], 'asc');
    expect(sorted[0].title).toBe('First Note');
    const sortedDesc = search.sortByTitle([...notes], 'desc');
    expect(sortedDesc[0].title).toBe('Third');
  });

  test('getSearchSuggestions returns notes with matching title', () => {
    const result = search.getSearchSuggestions('Sec', notes);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('2');
  });

  test('textMatchesQuery matches text case-insensitively', () => {
    expect(search.textMatchesQuery('Hello World', 'hello')).toBe(true);
    expect(search.textMatchesQuery('Hello World', 'WORLD')).toBe(true);
    expect(search.textMatchesQuery('Hello World', 'nope')).toBe(false);
  });

  test('calculateRelevanceScore gives correct score', () => {
    const note = { title: 'Hello', content: 'World' };
    expect(search.calculateRelevanceScore(note, 'hello')).toBeGreaterThan(0);
    expect(search.calculateRelevanceScore(note, 'world')).toBeGreaterThan(0);
    expect(search.calculateRelevanceScore(note, 'nope')).toBe(0);
  });
}); 