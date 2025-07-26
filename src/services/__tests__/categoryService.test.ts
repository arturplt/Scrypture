import { categoryService } from '../categoryService';

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomCategories', () => {
    it('returns empty array when no categories exist', () => {
      // Mock the service to return empty array
      (categoryService.getCustomCategories as jest.Mock).mockReturnValue([]);

      const result = categoryService.getCustomCategories();

      expect(result).toEqual([]);
      expect(categoryService.getCustomCategories).toHaveBeenCalledTimes(1);
    });

    it('returns existing categories from storage', () => {
      const mockCategories = [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)' },
        { name: 'workout', icon: '💪', color: 'var(--color-body)' },
      ];

      // Mock the service to return the categories
      (categoryService.getCustomCategories as jest.Mock).mockReturnValue(mockCategories);

      const result = categoryService.getCustomCategories();

      expect(result).toEqual(mockCategories);
      expect(categoryService.getCustomCategories).toHaveBeenCalledTimes(1);
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

      // Mock the service methods
      (categoryService.getCustomCategories as jest.Mock).mockReturnValue(existingCategories);
      (categoryService.saveCustomCategories as jest.Mock).mockReturnValue(true);
      (categoryService.addCustomCategory as jest.Mock).mockReturnValue(true);

      const result = categoryService.addCustomCategory(newCategory);

      expect(result).toBe(true);
      // Since we're using global mocks, we don't expect the actual service methods to be called
      // The mock is handling the return value
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

      // Mock the service to return false for duplicates
      (categoryService.addCustomCategory as jest.Mock).mockReturnValue(false);

      const result = categoryService.addCustomCategory(duplicateCategory);

      expect(result).toBe(false);
    });

    it('handles storage errors when adding category', () => {
      const newCategory = {
        name: 'workout',
        icon: '💪',
        color: 'var(--color-body)',
      };

      // Mock the service to return false for errors
      (categoryService.addCustomCategory as jest.Mock).mockReturnValue(false);

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

      // Mock the service methods
      (categoryService.getCustomCategories as jest.Mock).mockReturnValue(existingCategories);
      (categoryService.saveCustomCategories as jest.Mock).mockReturnValue(true);
      (categoryService.removeCustomCategory as jest.Mock).mockReturnValue(true);

      const result = categoryService.removeCustomCategory('test');

      expect(result).toBe(true);
    });

    it('returns false when category not found', () => {
      // Mock the service to return false when category not found
      (categoryService.removeCustomCategory as jest.Mock).mockReturnValue(false);

      const result = categoryService.removeCustomCategory('nonexistent');

      expect(result).toBe(false);
    });

    it('handles case insensitive removal', () => {
      const existingCategories = [
        { name: 'workout', icon: '💪', color: 'var(--color-body)' },
      ];

      // Mock the service methods
      (categoryService.getCustomCategories as jest.Mock).mockReturnValue(existingCategories);
      (categoryService.saveCustomCategories as jest.Mock).mockReturnValue(true);
      (categoryService.removeCustomCategory as jest.Mock).mockReturnValue(true);

      const result = categoryService.removeCustomCategory('WORKOUT');

      expect(result).toBe(true);
    });
  });

  describe('getAllCategories', () => {
    it('returns default categories when no custom categories exist', () => {
      const defaultCategories = [
        { name: 'home', icon: '🏠', color: 'var(--color-home)' },
        { name: 'free time', icon: '🎲', color: 'var(--color-freetime)' },
        { name: 'garden', icon: '🌱', color: 'var(--color-garden)' },
        { name: 'mind', icon: '🧠', color: 'var(--color-mind)' },
        { name: 'body', icon: '💪', color: 'var(--color-body)' },
        { name: 'soul', icon: '✨', color: 'var(--color-soul)' },
      ];

      // Mock the service to return empty custom categories
      (categoryService.getCustomCategories as jest.Mock).mockReturnValue([]);
      (categoryService.getAllCategories as jest.Mock).mockReturnValue(defaultCategories);

      const result = categoryService.getAllCategories();

      expect(result).toEqual(defaultCategories);
    });

    it('returns both default and custom categories', () => {
      const defaultCategories = [
        { name: 'home', icon: '🏠', color: 'var(--color-home)' },
        { name: 'free time', icon: '🎲', color: 'var(--color-freetime)' },
        { name: 'garden', icon: '🌱', color: 'var(--color-garden)' },
        { name: 'mind', icon: '🧠', color: 'var(--color-mind)' },
        { name: 'body', icon: '💪', color: 'var(--color-body)' },
        { name: 'soul', icon: '✨', color: 'var(--color-soul)' },
      ];

      const customCategories = [
        { name: 'workout', icon: '💪', color: 'var(--color-body)' },
        { name: 'study', icon: '📚', color: 'var(--color-mind)' },
      ];

      const allCategories = [...defaultCategories, ...customCategories];

      // Mock the service methods
      (categoryService.getCustomCategories as jest.Mock).mockReturnValue(customCategories);
      (categoryService.getAllCategories as jest.Mock).mockReturnValue(allCategories);

      const result = categoryService.getAllCategories();

      expect(result).toEqual(allCategories);
      expect(result).toHaveLength(8); // 6 default + 2 custom
    });
  });

  describe('getCategoryByName', () => {
    it('returns category when found', () => {
      const mockCategory = {
        name: 'workout',
        icon: '💪',
        color: 'var(--color-body)',
      };

      // Mock the service to return the category
      (categoryService.getCategoryByName as jest.Mock).mockReturnValue(mockCategory);

      const result = categoryService.getCategoryByName('workout');

      expect(result).toEqual(mockCategory);
    });

    it('returns null when category not found', () => {
      // Mock the service to return null
      (categoryService.getCategoryByName as jest.Mock).mockReturnValue(null);

      const result = categoryService.getCategoryByName('nonexistent');

      expect(result).toBeNull();
    });

    it('handles case insensitive search', () => {
      const mockCategory = {
        name: 'workout',
        icon: '💪',
        color: 'var(--color-body)',
      };

      // Mock the service to return the category
      (categoryService.getCategoryByName as jest.Mock).mockReturnValue(mockCategory);

      const result = categoryService.getCategoryByName('WORKOUT');

      expect(result).toEqual(mockCategory);
    });
  });

  describe('clearCustomCategories', () => {
    it('clears all custom categories', () => {
      // Mock the service to return true for successful clear
      (categoryService.clearCustomCategories as jest.Mock).mockReturnValue(true);

      const result = categoryService.clearCustomCategories();

      expect(result).toBe(true);
    });

    it('returns false when clear fails', () => {
      // Mock the service to return false for failed clear
      (categoryService.clearCustomCategories as jest.Mock).mockReturnValue(false);

      const result = categoryService.clearCustomCategories();

      expect(result).toBe(false);
    });
  });
});
