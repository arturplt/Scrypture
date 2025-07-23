import { Task } from '../types';
import { storageService } from './storageService';

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

  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      // statRewards should be provided explicitly in taskData, or default to undefined
      statRewards: taskData.statRewards,
    };

    const tasks = this.getTasks();
    const updatedTasks = [...tasks, newTask]; // Create new array instead of pushing
    this.saveTasks(updatedTasks);

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
