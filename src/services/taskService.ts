import { Task } from '../types';
import { storageService } from './storageService';
import { categoryService } from './categoryService';

export const taskService = {
  getTasks(): Task[] {
    return storageService.getTasks();
  },

  saveTasks(tasks: Task[]): boolean {
    return storageService.saveTasks(tasks);
  },

  clearTasks(): boolean {
    return storageService.saveTasks([]);
  },

  calculateStatRewards(category: string): { body?: number; mind?: number; soul?: number; xp?: number } {
    const rewards = {
      body: { body: 1, xp: 20 },
      mind: { mind: 1, xp: 20 },
      soul: { soul: 1, xp: 20 },
      career: { mind: 1, body: 1, xp: 10 },
      home: { body: 1, soul: 1, xp: 10 },
      skills: { mind: 1, soul: 1, xp: 10 }
    };
    
    // For custom categories, get the category data and calculate rewards based on points
    if (!rewards[category as keyof typeof rewards]) {
      const customCategories = categoryService.getCustomCategories();
      const customCategory = customCategories.find(cat => cat.name === category);
      
      if (customCategory) {
        const totalPoints = customCategory.points.body + customCategory.points.mind + customCategory.points.soul;
        return {
          body: customCategory.points.body > 0 ? customCategory.points.body : undefined,
          mind: customCategory.points.mind > 0 ? customCategory.points.mind : undefined,
          soul: customCategory.points.soul > 0 ? customCategory.points.soul : undefined,
          xp: 30 - (totalPoints * 10)
        };
      }
      
      // Fallback for unknown categories
      return { body: 1, mind: 1, soul: 1, xp: 10 };
    }
    
    return rewards[category as keyof typeof rewards];
  },

  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      statRewards: taskData.category ? this.calculateStatRewards(taskData.category) : undefined,
    };
    
    const tasks = this.getTasks();
    tasks.push(newTask);
    this.saveTasks(tasks);
    
    return newTask;
  },

  generateId(): string {
    // Use crypto.randomUUID if available, otherwise fallback to a simple UUID generation
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for test environments
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
}; 