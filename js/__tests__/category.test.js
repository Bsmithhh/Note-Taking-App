import * as category from '../category.js';
import * as note from '../note.js';

describe('Category Module', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('createCategory creates and returns a new category', () => {
    const cat = category.createCategory('Work', '#ff0000', 'icon');
    expect(cat.name).toBe('Work');
    expect(cat.color).toBe('#ff0000');
    expect(cat.icon).toBe('icon');
    expect(typeof cat.id).toBe('string');
    const all = category.getAllCategories();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe('Work');
  });

  test('getCategoryById returns correct category', () => {
    const cat = category.createCategory('Personal', '#00ff00', 'icon2');
    const found = category.getCategoryById(cat.id);
    expect(found).not.toBeNull();
    expect(found.name).toBe('Personal');
  });

  test('getCategoryByName returns correct category', () => {
    category.createCategory('Test', '#0000ff', 'icon3');
    const found = category.getCategoryByName('Test');
    expect(found).not.toBeNull();
    expect(found.color).toBe('#0000ff');
  });

  test('validateCategoryName enforces rules', () => {
    expect(category.validateCategoryName('')).toMatchObject({ isValid: false });
    expect(category.validateCategoryName('a')).toMatchObject({ isValid: false });
    expect(category.validateCategoryName('ab')).toMatchObject({ isValid: true });
    category.createCategory('Unique', '#fff', 'icon');
    expect(category.validateCategoryName('Unique')).toMatchObject({ isValid: false });
  });

  test('categoryNameExists returns true if name exists', () => {
    category.createCategory('Exists', '#fff', 'icon');
    expect(category.categoryNameExists('Exists')).toBe(true);
    expect(category.categoryNameExists('NotExists')).toBe(false);
  });

  test('updateCategory updates category properties', () => {
    const cat = category.createCategory('Old', '#111', 'icon');
    const result = category.updateCategory(cat.id, { name: 'New', color: '#222', icon: 'icon2' });
    expect(result).toBe(true);
    const updated = category.getCategoryById(cat.id);
    expect(updated.name).toBe('New');
    expect(updated.color).toBe('#222');
    expect(updated.icon).toBe('icon2');
  });

  test('deleteCategory removes category', () => {
    const cat = category.createCategory('DeleteMe', '#333', 'icon');
    const result = category.deleteCategory(cat.id);
    expect(result).toBe(true);
    expect(category.getCategoryById(cat.id)).toBeNull();
  });
}); 