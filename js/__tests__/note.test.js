import * as note from '../note.js';

describe('Note Module', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('createNote creates and returns a new note', () => {
    const n = note.createNote('Title', 'Content', 'cat1');
    expect(n.title).toBe('Title');
    expect(n.content).toBe('Content');
    expect(n.category).toBe('cat1');
    expect(typeof n.id).toBe('string');
    const all = note.getAllNotes();
    expect(all.length).toBe(1);
    expect(all[0].title).toBe('Title');
  });

  test('getNoteById returns correct note', () => {
    const n = note.createNote('FindMe', 'Body', 'cat2');
    const found = note.getNoteById(n.id);
    expect(found).not.toBeNull();
    expect(found.title).toBe('FindMe');
  });

  test('editNote updates note properties', () => {
    const n = note.createNote('EditMe', 'Body', 'cat3');
    const result = note.editNote(n.id, 'Edited', 'NewBody', 'cat4');
    expect(result).toBe(true);
    const updated = note.getNoteById(n.id);
    expect(updated.title).toBe('Edited');
    expect(updated.content).toBe('NewBody');
    expect(updated.category).toBe('cat4');
  });

  test('deleteNote removes note', () => {
    const n = note.createNote('DeleteMe', 'Body', 'cat5');
    const result = note.deleteNote(n.id);
    expect(result).toBe(true);
    expect(note.getNoteById(n.id)).toBeNull();
  });

  test('getNotesByCategory filters notes', () => {
    note.createNote('A', 'B', 'catA');
    note.createNote('C', 'D', 'catB');
    const filtered = note.getNotesByCategory('catA');
    expect(filtered.length).toBe(1);
    expect(filtered[0].category).toBe('catA');
  });

  test('assignCategory assigns category to note', () => {
    const n = note.createNote('Assign', 'Body', '');
    const result = note.assignCategory(n.id, 'catX');
    expect(result).toBe(true);
    const updated = note.getNoteById(n.id);
    expect(updated.category).toBe('catX');
  });
}); 