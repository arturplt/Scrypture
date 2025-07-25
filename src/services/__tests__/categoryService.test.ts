// Move these lines to the very top of the file, before any jest.mock or imports that use them
const mockGetGenericItem = jest.fn();
const mockSetGenericItem = jest.fn();

const mockStorageService = {
  getGenericItem: mockGetGenericItem,
  setGenericItem: mockSetGenericItem,
};

// Mock the StorageService before importing categoryService
jest.mock('../storageService', () => ({
  StorageService: {
    getInstance: jest.fn(() => mockStorageService),
  },
}));

import { categoryService } from '../categoryService';

describe('categoryService', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getCustomCategories', () => {
    it('returns empty array when no categories exist', () => {
      mockGetGenericItem.mockReturnValue(null);

      const result = categoryService.getCustomCategories();

      expect(result).toEqual([]);
      expect(mockGetGenericItem).toHaveBeenCalledWith(
        'scrypture_custom_categories'
      );
    });

    it('returns existing categories from storage', () => {
      const mockCategories = [
        { name: 'test', icon: '🧪', color: 'var(--color-skills)' },
        { name: 'workout', icon: '💪', color: 'var(--color-body)' },
      ];
      mockGetGenericItem.mockReturnValue(mockCategories);

      const result = categoryService.getCustomCategories();

      expect(result).toEqual(mockCategories);
    });

    it('handles storage errors gracefully', () => {
      mockGetGenericItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = categoryService.getCustomCategories();

      expect(result).toEqual([]);
    });
  });

  describe('saveCustomCategories', () => {
    it('saves categories successfully', () => {
      const categories = [
        { name: 'test', icon: '🧪', color: 'var(--color-skills)' },
      ];
      mockSetGenericItem.mockReturnValue(true);

      const result = categoryService.saveCustomCategories(categories);

      expect(result).toBe(true);
      expect(mockSetGenericItem).toHaveBeenCalledWith(
        'scrypture_custom_categories',
        categories
      );
    });

    it('returns false when save fails', () => {
      const categories = [
        { name: 'test', icon: '🧪', color: 'var(--color-skills)' },
      ];
      mockSetGenericItem.mockReturnValue(false);

      const result = categoryService.saveCustomCategories(categories);

      expect(result).toBe(false);
    });
  });

  describe('addCustomCategory', () => {
    it('adds new category successfully', () => {
      const existingCategories = [
        { name: 'workout', icon: '💪', color: 'var(--color-body)' },
      ];
      const newCategory = {
        name: 'test',
        icon: '🧪',
        color: 'var(--color-skills)',
      };

      // Mock the getGenericItem calls - first for existing categories, second for verification
      mockGetGenericItem
        .mockReturnValueOnce(existingCategories)
        .mockReturnValueOnce([...existingCategories, newCategory]);
      mockSetGenericItem.mockReturnValue(true);

      const result = categoryService.addCustomCategory(newCategory);

      expect(result).toBe(true);
      // Verify that setGenericItem was called with the correct parameters
      expect(mockSetGenericItem).toHaveBeenCalledWith(
        'scrypture_custom_categories',
        [...existingCategories, newCategory]
      );
    });

    it('prevents adding duplicate category names (case insensitive)', () => {
      const existingCategories = [
        { name: 'Test', icon: '🧪', color: 'var(--color-skills)' },
      ];
      const duplicateCategory = {
        name: 'test',
        icon: '🧪',
        color: 'var(--color-skills)',
      };

      mockGetGenericItem.mockReturnValue(existingCategories);

      const result = categoryService.addCustomCategory(duplicateCategory);

      expect(result).toBe(false);
      expect(mockSetGenericItem).not.toHaveBeenCalled();
    });

    it('handles storage errors when adding category', () => {
      // Mock the first call to succeed, second call to fail (verification step)
      mockGetGenericItem
        .mockReturnValueOnce([]) // First call returns empty array
        .mockImplementation(() => {
          throw new Error('Storage error');
        }); // Second call throws error
      mockSetGenericItem.mockReturnValue(true);

      const newCategory = {
        name: 'test',
        icon: '🧪',
        color: 'var(--color-skills)',
      };

      const result = categoryService.addCustomCategory(newCategory);

      expect(result).toBe(false);
    });
  });

  describe('removeCustomCategory', () => {
    it('removes category successfully', () => {
      const existingCategories = [
        { name: 'test', icon: '🧪', color: 'var(--color-skills)' },
        { name: 'workout', icon: '💪', color: 'var(--color-body)' },
      ];

      mockGetGenericItem.mockReturnValue(existingCategories);
      mockSetGenericItem.mockReturnValue(true);

      const result = categoryService.removeCustomCategory('test');

      expect(result).toBe(true);
      expect(mockSetGenericItem).toHaveBeenCalledWith(
        'scrypture_custom_categories',
        [{ name: 'workout', icon: '💪', color: 'var(--color-body)' }]
      );
    });

    it('returns false when category not found', () => {
      const existingCategories = [
        { name: 'workout', icon: '💪', color: 'var(--color-body)' },
      ];

      mockGetGenericItem.mockReturnValue(existingCategories);

      const result = categoryService.removeCustomCategory('nonexistent');

      expect(result).toBe(false);
      expect(mockSetGenericItem).not.toHaveBeenCalled();
    });

    it('handles case insensitive removal', () => {
      const existingCategories = [
        { name: 'Test', icon: '🧪', color: 'var(--color-skills)' },
      ];

      mockGetGenericItem.mockReturnValue(existingCategories);
      mockSetGenericItem.mockReturnValue(true);

      const result = categoryService.removeCustomCategory('test'); // Lowercase
      expect(result).toBe(true);
      expect(mockSetGenericItem).toHaveBeenCalledWith(
        'scrypture_custom_categories',
        []
      );
    });
  });

  describe('getAllCategories', () => {
    it('combines default and custom categories', () => {
      const customCategories = [
        { name: 'test', icon: '🧪', color: 'var(--color-skills)' },
      ];
      mockGetGenericItem.mockReturnValue(customCategories);

      const result = categoryService.getAllCategories();

      expect(result).toHaveLength(7); // 6 default (home, free time, garden, body, mind, soul) + 1 custom
      expect(result[0].name).toBe('home');
      expect(result[1].name).toBe('free time');
      expect(result[2].name).toBe('garden');
      expect(result[3].name).toBe('mind');
      expect(result[4].name).toBe('body');
      expect(result[5].name).toBe('soul');
      expect(result[6].name).toBe('test');
    });

    it('returns only default categories when no custom categories exist', () => {
      mockGetGenericItem.mockReturnValue(null);

      const result = categoryService.getAllCategories();

      expect(result).toHaveLength(6); // 6 default categories (home, free time, garden, body, mind, soul)
      expect(result[0].name).toBe('home');
      expect(result[1].name).toBe('free time');
      expect(result[2].name).toBe('garden');
      expect(result[3].name).toBe('mind');
      expect(result[4].name).toBe('body');
      expect(result[5].name).toBe('soul');
    });
  });

  describe('getCategoryByName', () => {
    it('finds custom category by name', () => {
      const customCategories = [
        { name: 'test', icon: '🧪', color: 'var(--color-skills)' },
      ];
      mockGetGenericItem.mockReturnValue(customCategories);

      const result = categoryService.getCategoryByName('test');

      expect(result).toBeDefined();
      expect(result?.name).toBe('test');
    });

    it('finds default category by name', () => {
      mockGetGenericItem.mockReturnValue([]);

      const result = categoryService.getCategoryByName('home');

      expect(result).toBeDefined();
      expect(result?.name).toBe('home');
    });

    it('handles case insensitive search', () => {
      const customCategories = [
        { name: 'Test', icon: '🧪', color: 'var(--color-skills)' },
      ];
      mockGetGenericItem.mockReturnValue(customCategories);

      const result = categoryService.getCategoryByName('test'); // Lowercase search

      expect(result).toBeDefined();
      expect(result?.name).toBe('Test');
    });

    it('returns null for non-existent category', () => {
      mockGetGenericItem.mockReturnValue([]);

      const result = categoryService.getCategoryByName('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('clearCustomCategories', () => {
    it('clears all custom categories', () => {
      mockSetGenericItem.mockReturnValue(true);

      const result = categoryService.clearCustomCategories();

      expect(result).toBe(true);
      expect(mockSetGenericItem).toHaveBeenCalledWith(
        'scrypture_custom_categories',
        []
      );
    });

    it('returns false when clear fails', () => {
      mockSetGenericItem.mockReturnValue(false);

      const result = categoryService.clearCustomCategories();

      expect(result).toBe(false);
    });
  });
});
