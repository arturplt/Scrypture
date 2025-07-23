// Debug script to test category storage
import { categoryService } from './services/categoryService';

console.log('=== Category Storage Debug ===');

// Test 1: Check if categories exist
console.log('1. Checking existing categories...');
const existingCategories = categoryService.getCustomCategories();
console.log('Existing categories:', existingCategories);

// Test 2: Add a test category
console.log('\n2. Adding test category...');
const testCategory = {
  name: 'test-category',
  icon: '🎯',
  color: 'var(--color-skills)',
  points: { body: 1, mind: 1, soul: 1 },
};

const addResult = categoryService.addCustomCategory(testCategory);
console.log('Add result:', addResult);

// Test 3: Check if category was added
console.log('\n3. Checking categories after adding...');
const updatedCategories = categoryService.getCustomCategories();
console.log('Updated categories:', updatedCategories);

// Test 4: Check localStorage directly
console.log('\n4. Checking localStorage directly...');
if (typeof window !== 'undefined') {
  const raw = localStorage.getItem('scrypture_custom_categories');
  console.log('Raw localStorage data:', raw);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      console.log('Parsed localStorage data:', parsed);
    } catch (e) {
      console.log('Error parsing localStorage data:', e);
    }
  }
}

// Test 5: Check all categories
console.log('\n5. Checking all categories...');
const allCategories = categoryService.getAllCategories();
console.log('All categories:', allCategories);

console.log('\n=== Debug Complete ===');
