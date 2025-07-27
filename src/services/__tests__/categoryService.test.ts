import { categoryService } from '../categoryService';

// Mock the StorageService
jest.mock('../storageService', () => ({
  storageService: {
    getGenericItem: jest.fn(),
    setGenericItem: jest.fn(),
  }
}));

import { storageService } from '../storageService';

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomCategories', () => {
    it('returns empty array when no categories exist', () => {
      (storageService.getGenericItem as jest.Mock).mockReturnValue(null);

      const result = categoryService.getCustomCategories();

      expect(result).toEqual([]);
      expect(storageService.getGenericItem).toHaveBeenCalledWith('scrypture_custom_categories');
    });

    it('returns existing categories from storage', () => {
      const mockCategories = [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)' },
        { name: 'workout', icon: '💪', color: 'var(--color-body)' },
      ];

      (storageService.getGenericItem as jest.Mock).mockReturnValue(mockCategories);

      const result = categoryService.getCustomCategories();

      expect(result).toEqual(mockCategories);
      expect(storageService.getGenericItem).toHaveBeenCalledWith('scrypture_custom_categories');
    });
  });

  describe('addCustomCategory', () => {
    it('adds new category successfully', () => {
      const existingCategories = [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)' },
      ];

      const newCategory = {
        name: 'workout',
        icon: '💪',
        color: 'var(--color-body)',
      };

      (storageService.getGenericItem as jest.Mock).mockReturnValue(existingCategories);
      (storageService.setGenericItem as jest.Mock).mockReturnValue(true);

      const result = categoryService.addCustomCategory(newCategory);

      expect(result).toBe(true);
      expect((storageService.setGenericItem as jest.Mock)).toHaveBeenCalledWith('scrypture_custom_categories', [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)' },
        { name: 'workout', icon: '💪', color: 'var(--color-body)' },
      ]);
    });

    it('prevents adding duplicate category names (case insensitive)', () => {
      const existingCategories = [
        { name: 'workout', icon: '💪', color: 'var(--color-body)' },
      ];

      const duplicateCategory = {
        name: 'WORKOUT',
        icon: '💪',
        color: 'var(--color-body)',
      };

      (storageService.getGenericItem as jest.Mock).mockReturnValue(existingCategories);

      const result = categoryService.addCustomCategory(duplicateCategory);

      expect(result).toBe(false);
      expect((storageService.setGenericItem as jest.Mock)).not.toHaveBeenCalled();
    });

    it('handles storage errors when adding category', () => {
      const newCategory = {
        name: 'workout',
        icon: '💪',
        color: 'var(--color-body)',
      };

      (storageService.getGenericItem as jest.Mock).mockReturnValue([]);
      (storageService.setGenericItem as jest.Mock).mockReturnValue(false);

      const result = categoryService.addCustomCategory(newCategory);

      expect(result).toBe(false);
    });
  });

  describe('removeCustomCategory', () => {
    it('removes category successfully', () => {
      const existingCategories = [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)' },
        { name: 'workout', icon: '💪', color: 'var(--color-body)' },
      ];

      (storageService.getGenericItem as jest.Mock).mockReturnValue(existingCategories);
      (storageService.setGenericItem as jest.Mock).mockReturnValue(true);

      const result = categoryService.removeCustomCategory('workout');

      expect(result).toBe(true);
      expect((storageService.setGenericItem as jest.Mock)).toHaveBeenCalledWith('scrypture_custom_categories', [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)' },
      ]);
    });

    it('returns false when category not found', () => {
      const existingCategories = [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)' },
      ];

      (storageService.getGenericItem as jest.Mock).mockReturnValue(existingCategories);

      const result = categoryService.removeCustomCategory('nonexistent');

      expect(result).toBe(false);
      expect((storageService.setGenericItem as jest.Mock)).not.toHaveBeenCalled();
    });

    it('handles case insensitive removal', () => {
      const existingCategories = [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)' },
        { name: 'workout', icon: '💪', color: 'var(--color-body)' },
      ];

      (storageService.getGenericItem as jest.Mock).mockReturnValue(existingCategories);
      (storageService.setGenericItem as jest.Mock).mockReturnValue(true);

      const result = categoryService.removeCustomCategory('WORKOUT');

      expect(result).toBe(true);
      expect((storageService.setGenericItem as jest.Mock)).toHaveBeenCalledWith('scrypture_custom_categories', [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)' },
      ]);
    });
  });

  describe('getCategoryByName', () => {
    it('returns category when found', () => {
      const mockCategory = { name: 'workout', icon: '💪', color: 'var(--color-body)' };
      (storageService.getGenericItem as jest.Mock).mockReturnValue([mockCategory]);

      const result = categoryService.getCategoryByName('workout');

      expect(result).toEqual(mockCategory);
    });

    it('returns null when category not found', () => {
      (storageService.getGenericItem as jest.Mock).mockReturnValue([]);

      const result = categoryService.getCategoryByName('nonexistent');

      expect(result).toBeNull();
    });

    it('handles case insensitive search', () => {
      const mockCategory = { name: 'workout', icon: '💪', color: 'var(--color-body)' };
      (storageService.getGenericItem as jest.Mock).mockReturnValue([mockCategory]);

      const result = categoryService.getCategoryByName('WORKOUT');

      expect(result).toEqual(mockCategory);
    });
  });

  describe('clearCustomCategories', () => {
    it('clears all custom categories', () => {
      (storageService.setGenericItem as jest.Mock).mockReturnValue(true);

      const result = categoryService.clearCustomCategories();

      expect(result).toBe(true);
      expect((storageService.setGenericItem as jest.Mock)).toHaveBeenCalledWith('scrypture_custom_categories', []);
    });

    it('returns false when clear fails', () => {
      (storageService.setGenericItem as jest.Mock).mockReturnValue(false);

      const result = categoryService.clearCustomCategories();

      expect(result).toBe(false);
    });
  });
});
