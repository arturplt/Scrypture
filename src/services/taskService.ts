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

  calculateStatRewards(category: string): { body?: number; mind?: number; soul?: number } {
    const rewards = {
      body: { body: 10 },
      mind: { mind: 10 },
      soul: { soul: 10 },
      career: { mind: 5, body: 5 },
      home: { body: 5, soul: 5 },
      skills: { mind: 8, soul: 2 }
    };
    return rewards[category as keyof typeof rewards] || { soul: 5, mind: 3, body: 2 };
  },

  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      statRewards: taskData.category ? this.calculateStatRewards(taskData.category) : undefined,
    };
    
    const tasks = this.getTasks();
    tasks.push(newTask);
    this.saveTasks(tasks);
    
    return newTask;
  },
}; 