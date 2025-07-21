import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskContextType } from '../types';
import { taskService } from '../services/taskService';
import { useUser } from './useUser';

interface ExtendedTaskContextType extends TaskContextType {
  isSaving: boolean;
  lastSaved: Date | null;
  refreshTasks: () => void;
}

const TaskContext = createContext<ExtendedTaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: React.ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { addExperience, addStatRewards } = useUser();

  useEffect(() => {
    // Load tasks from local storage on mount
    const savedTasks = taskService.getTasks();
    setTasks(savedTasks);
  }, []);

  const saveTasksWithFeedback = async (updatedTasks: Task[]) => {
    setIsSaving(true);
    try {
      const success = taskService.saveTasks(updatedTasks);
      if (success) {
        setLastSaved(new Date());
        console.log('Tasks auto-saved successfully');
      } else {
        console.error('Failed to auto-save tasks');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Use taskService.createTask to ensure statRewards are calculated
    const newTask = taskService.createTask(taskData);
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasksWithFeedback(updatedTasks);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    );
    
    setTasks(updatedTasks);
    saveTasksWithFeedback(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasksWithFeedback(updatedTasks);
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const isCompleting = !task.completed;
    
    const updatedTasks = tasks.map(t =>
      t.id === id
        ? { ...t, completed: !t.completed, updatedAt: new Date() }
        : t
    );
    
    setTasks(updatedTasks);
    saveTasksWithFeedback(updatedTasks);

    // Award experience and stat rewards when completing a task
    if (isCompleting) {
      // Fetch the latest task from storage to ensure up-to-date statRewards
      const latestTasks = taskService.getTasks();
      const updatedTask = latestTasks.find(t => t.id === id);
      if (updatedTask && updatedTask.statRewards) {
        addStatRewards(updatedTask.statRewards);
      } else {
        addExperience(10);
      }
    }
  };

  const refreshTasks = () => {
    const savedTasks = taskService.getTasks();
    setTasks(savedTasks);
  };

  const value: ExtendedTaskContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    isSaving,
    lastSaved,
    refreshTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}; 