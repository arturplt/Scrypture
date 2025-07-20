import { categoryService } from '../categoryService';
import { StorageService } from '../storageService';

// Mock the storage service
jest.mock('../storageService', () => ({
  StorageService: {
    getInstance: jest.fn(() => ({
      getGenericItem: jest.fn(),
      setGenericItem: jest.fn(),
    })),
  },
}));

const mockGetGenericItem = jest.fn();
const mockSetGenericItem = jest.fn();

const mockStorageService = StorageService.getInstance() as jest.Mocked<StorageService>;

// Override the mock functions
Object.assign(mockStorageService, {
  getGenericItem: mockGetGenericItem,
  setGenericItem: mockSetGenericItem,
});

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomCategories', () => {
    it('returns empty array when no categories exist', () => {
      mockGetGenericItem.mockReturnValue(null);
      
      const result = categoryService.getCustomCategories();
      
      expect(result).toEqual([]);
      expect(mockGetGenericItem).toHaveBeenCalledWith('scrypture_custom_categories');
    });

    it('returns existing categories from storage', () => {
      const mockCategories = [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)', points: { body: 1, mind: 1, soul: 1 } },
        { name: 'workout', icon: '💪', color: 'var(--color-body)', points: { body: 2, mind: 0, soul: 1 } }
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
        { name: 'test', icon: '🎯', color: 'var(--color-skills)', points: { body: 1, mind: 1, soul: 1 } }
      ];
      
      mockSetGenericItem.mockReturnValue(true);
      
      const result = categoryService.saveCustomCategories(categories);
      
      expect(result).toBe(true);
      expect(mockSetGenericItem).toHaveBeenCalledWith('scrypture_custom_categories', categories);
    });

    it('returns false when save fails', () => {
      const categories = [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)', points: { body: 1, mind: 1, soul: 1 } }
      ];
      
      mockSetGenericItem.mockReturnValue(false);
      
      const result = categoryService.saveCustomCategories(categories);
      
      expect(result).toBe(false);
    });
  });

  describe('addCustomCategory', () => {
    it('adds new category successfully', () => {
      const existingCategories = [
        { name: 'existing', icon: '🌟', color: 'var(--color-accent-gold)', points: { body: 1, mind: 1, soul: 1 } }
      ];
      
      const newCategory = {
        name: 'new-category',
        icon: '💪',
        color: 'var(--color-body)',
        points: { body: 2, mind: 0, soul: 1 }
      };
      
      mockGetGenericItem.mockReturnValue(existingCategories);
      mockSetGenericItem.mockReturnValue(true);
      
      const result = categoryService.addCustomCategory(newCategory);
      
      expect(result).toBe(true);
      expect(mockSetGenericItem).toHaveBeenCalledWith('scrypture_custom_categories', [
        ...existingCategories,
        newCategory
      ]);
    });

    it('prevents adding duplicate category names (case insensitive)', () => {
      const existingCategories = [
        { name: 'existing', icon: '🌟', color: 'var(--color-accent-gold)', points: { body: 1, mind: 1, soul: 1 } }
      ];
      
      const duplicateCategory = {
        name: 'EXISTING', // Different case
        icon: '💪',
        color: 'var(--color-body)',
        points: { body: 2, mind: 0, soul: 1 }
      };
      
      mockGetGenericItem.mockReturnValue(existingCategories);
      
      const result = categoryService.addCustomCategory(duplicateCategory);
      
      expect(result).toBe(false);
      expect(mockSetGenericItem).not.toHaveBeenCalled();
    });

    it('handles storage errors when adding category', () => {
      mockGetGenericItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const newCategory = {
        name: 'new-category',
        icon: '💪',
        color: 'var(--color-body)',
        points: { body: 2, mind: 0, soul: 1 }
      };
      
      const result = categoryService.addCustomCategory(newCategory);
      
      expect(result).toBe(false);
    });
  });

  describe('removeCustomCategory', () => {
    it('removes category successfully', () => {
      const existingCategories = [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)', points: { body: 1, mind: 1, soul: 1 } },
        { name: 'workout', icon: '💪', color: 'var(--color-body)', points: { body: 2, mind: 0, soul: 1 } }
      ];
      
      mockGetGenericItem.mockReturnValue(existingCategories);
      mockSetGenericItem.mockReturnValue(true);
      
      const result = categoryService.removeCustomCategory('test');
      
      expect(result).toBe(true);
      expect(mockSetGenericItem).toHaveBeenCalledWith('scrypture_custom_categories', [
        { name: 'workout', icon: '💪', color: 'var(--color-body)', points: { body: 2, mind: 0, soul: 1 } }
      ]);
    });

    it('returns false when category does not exist', () => {
      const existingCategories = [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)', points: { body: 1, mind: 1, soul: 1 } }
      ];
      
      mockGetGenericItem.mockReturnValue(existingCategories);
      
      const result = categoryService.removeCustomCategory('nonexistent');
      
      expect(result).toBe(false);
      expect(mockSetGenericItem).not.toHaveBeenCalled();
    });

    it('handles case insensitive removal', () => {
      const existingCategories = [
        { name: 'Test', icon: '🎯', color: 'var(--color-skills)', points: { body: 1, mind: 1, soul: 1 } }
      ];
      
      mockGetGenericItem.mockReturnValue(existingCategories);
      mockSetGenericItem.mockReturnValue(true);
      
      const result = categoryService.removeCustomCategory('test'); // Lowercase
      
      expect(result).toBe(true);
      expect(mockSetGenericItem).toHaveBeenCalledWith('scrypture_custom_categories', []);
    });
  });

  describe('getAllCategories', () => {
    it('returns default categories when no custom categories exist', () => {
      mockGetGenericItem.mockReturnValue([]);
      
      const result = categoryService.getAllCategories();
      
      expect(result).toHaveLength(3); // Only BODY, MIND, SOUL
      expect(result[0].name).toBe('body');
      expect(result[1].name).toBe('mind');
      expect(result[2].name).toBe('soul');
    });

    it('combines default and custom categories', () => {
      const customCategories = [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)', points: { body: 1, mind: 1, soul: 1 } }
      ];
      
      mockGetGenericItem.mockReturnValue(customCategories);
      
      const result = categoryService.getAllCategories();
      
      expect(result).toHaveLength(4); // 3 default + 1 custom
      expect(result[0].name).toBe('body');
      expect(result[1].name).toBe('mind');
      expect(result[2].name).toBe('soul');
      expect(result[3].name).toBe('test');
    });
  });

  describe('getCategoryByName', () => {
    it('finds default category by name', () => {
      mockGetGenericItem.mockReturnValue([]);
      
      const result = categoryService.getCategoryByName('body');
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('body');
    });

    it('finds custom category by name', () => {
      const customCategories = [
        { name: 'test', icon: '🎯', color: 'var(--color-skills)', points: { body: 1, mind: 1, soul: 1 } }
      ];
      
      mockGetGenericItem.mockReturnValue(customCategories);
      
      const result = categoryService.getCategoryByName('test');
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('test');
    });

    it('returns null for non-existent category', () => {
      mockGetGenericItem.mockReturnValue([]);
      
      const result = categoryService.getCategoryByName('nonexistent');
      
      expect(result).toBeNull();
    });

    it('handles case insensitive search', () => {
      const customCategories = [
        { name: 'Test', icon: '🎯', color: 'var(--color-skills)', points: { body: 1, mind: 1, soul: 1 } }
      ];
      
      mockGetGenericItem.mockReturnValue(customCategories);
      
      const result = categoryService.getCategoryByName('test'); // Lowercase search
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('Test');
    });
  });

  describe('clearCustomCategories', () => {
    it('clears all custom categories', () => {
      mockSetGenericItem.mockReturnValue(true);
      
      const result = categoryService.clearCustomCategories();
      
      expect(result).toBe(true);
      expect(mockSetGenericItem).toHaveBeenCalledWith('scrypture_custom_categories', []);
    });

    it('returns false when clear fails', () => {
      mockSetGenericItem.mockReturnValue(false);
      
      const result = categoryService.clearCustomCategories();
      
      expect(result).toBe(false);
    });
  });
}); 
