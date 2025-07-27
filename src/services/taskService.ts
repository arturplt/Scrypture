import { Task } from '../types';
import { storageService } from './storageService';

// Migration function to handle old tasks with single category
const migrateTaskCategories = (task: Partial<Task> & { category?: string }): Task => {
  // If task has the old category field but no categories field, migrate it
  if (task.category && !task.categories) {
    return {
      ...task,
      categories: [task.category],
      // Remove the old category field
      category: undefined,
    } as Task;
  }
  
  // If task has no categories at all, provide a default
  if (!task.categories) {
    return {
      ...task,
      categories: ['body'],
    } as Task;
  }
  
  return task as Task;
};

export const taskService = {
  getTasks(): Task[] {
    const tasks = storageService.getTasks();
    // Migrate any old tasks to the new format
    const migratedTasks = tasks.map(migrateTaskCategories);
    
    // Add default stat rewards to tasks that don't have them
    const tasksWithRewards = migratedTasks.map(task => {
      if (!task.statRewards) {
        console.log('🔧 Adding default stat rewards to task:', task.title);
        return {
          ...task,
          statRewards: {
            body: task.categories.includes('body') ? 1 : 0,
            mind: task.categories.includes('mind') ? 1 : 0,
            soul: task.categories.includes('soul') ? 1 : 0,
            xp: 10
          }
        };
      }
      return task;
    });
    
    // Save the updated tasks if any were modified
    if (tasksWithRewards.length !== migratedTasks.length || 
        tasksWithRewards.some((task, index) => task.statRewards !== migratedTasks[index]?.statRewards)) {
      console.log('🔧 Saving tasks with added stat rewards');
      this.saveTasks(tasksWithRewards);
    }
    
    return tasksWithRewards;
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
      // Ensure categories is always an array
      categories: taskData.categories || ['body'],
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
