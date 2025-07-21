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

  calculateStatRewards(category: string, priority: 'low' | 'medium' | 'high'): { body?: number; mind?: number; soul?: number; xp?: number } {
    const defaultRewards = {
      body: { body: 1, xp: 20 },
      mind: { mind: 1, xp: 20 },
      soul: { soul: 1, xp: 20 }
    };
    const priorityXpBonus = priority === 'high' ? 15 : priority === 'medium' ? 10 : 5;
    if (defaultRewards[category as keyof typeof defaultRewards]) {
      const base = defaultRewards[category as keyof typeof defaultRewards];
      return { ...base, xp: (base.xp || 0) + priorityXpBonus };
    }
    // Custom categories: +0 to all stats, +30 XP (plus priority bonus)
    return { xp: 30 + priorityXpBonus };
  },

  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      statRewards: taskData.category && taskData.priority ? this.calculateStatRewards(taskData.category, taskData.priority) : undefined,
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