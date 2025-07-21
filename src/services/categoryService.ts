import { StorageService } from './storageService';

export interface CustomCategory {
  name: string;
  icon: string;
  color: string;
}

const STORAGE_KEY = 'scrypture_custom_categories';

const storageService = StorageService.getInstance();

export const categoryService = {
  getCustomCategories(): CustomCategory[] {
    try {
      console.log('Attempting to get custom categories from storage...');
      const categories = storageService.getGenericItem<CustomCategory[]>(STORAGE_KEY);
      console.log('Retrieved custom categories from storage:', categories);
      const result = categories || [];
      console.log('Returning categories:', result);
      return result;
    } catch (error) {
      console.error('Error in getCustomCategories:', error);
      return [];
    }
  },

  saveCustomCategories(categories: CustomCategory[]): boolean {
    try {
      console.log('Attempting to save categories:', categories);
      const result = storageService.setGenericItem(STORAGE_KEY, categories);
      console.log('Storage service result:', result);
      return result;
    } catch (error) {
      console.error('Error in saveCustomCategories:', error);
      return false;
    }
  },

  addCustomCategory(category: CustomCategory): boolean {
    try {
      const categories = this.getCustomCategories();
      console.log('Current custom categories:', categories);
      
      // Check if category already exists
      if (categories.some(cat => cat.name.toLowerCase() === category.name.toLowerCase())) {
        console.log('Category already exists:', category.name);
        return false;
      }
      
      categories.push(category);
      console.log('Saving categories:', categories);
      const success = this.saveCustomCategories(categories);
      console.log('Save successful:', success);
      
      // Verify the save worked by reading back
      const verifyCategories = this.getCustomCategories();
      console.log('Verification - categories after save:', verifyCategories);
      
      return success;
    } catch (error) {
      console.error('Error in addCustomCategory:', error);
      return false;
    }
  },

  removeCustomCategory(categoryName: string): boolean {
    const categories = this.getCustomCategories();
    const filteredCategories = categories.filter(cat => cat.name.toLowerCase() !== categoryName.toLowerCase());
    
    if (filteredCategories.length === categories.length) {
      return false; // Category not found
    }
    
    return this.saveCustomCategories(filteredCategories);
  },

  getAllCategories(): (CustomCategory | { name: string; icon: string; color: string })[] {
    const defaultCategories = [
      { name: 'body', icon: '💪', color: 'var(--color-body)' },
      { name: 'mind', icon: '🧠', color: 'var(--color-mind)' },
      { name: 'soul', icon: '✨', color: 'var(--color-soul)' }
    ];
    
    const customCategories = this.getCustomCategories();
    return [...defaultCategories, ...customCategories];
  },

  getCategoryByName(name: string): CustomCategory | { name: string; icon: string; color: string } | null {
    const allCategories = this.getAllCategories();
    return allCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase()) || null;
  },

  clearCustomCategories(): boolean {
    return this.saveCustomCategories([]);
  }
}; 