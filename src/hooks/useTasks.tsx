import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskContextType } from '../types';
import { taskService } from '../services/taskService';
import { generateUUID } from '../utils';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

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

  useEffect(() => {
    // Load tasks from local storage on mount
    const savedTasks = taskService.getTasks();
    setTasks(savedTasks);
  }, []);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    taskService.saveTasks(updatedTasks);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    );
    
    setTasks(updatedTasks);
    taskService.saveTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    taskService.saveTasks(updatedTasks);
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed, updatedAt: new Date() }
        : task
    );
    
    setTasks(updatedTasks);
    taskService.saveTasks(updatedTasks);
  };

  const value: TaskContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}; 