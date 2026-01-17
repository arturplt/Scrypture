import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskContextType } from '../types';
import { taskService } from '../services/taskService';
import { tutorialService } from '../services/tutorialService';
import { useUser } from './useUser';
import { logger } from '../utils/logger';

interface ExtendedTaskContextType extends TaskContextType {
  isSaving: boolean;
  lastSaved: Date | null;
  refreshTasks: () => void;
  bringTaskToTop: (id: string) => void;
}

const TaskContext = createContext<ExtendedTaskContextType | undefined>(
  undefined
);

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
  const { addExperienceWithBobr, addStatRewards, removeStatRewards } = useUser();

  useEffect(() => {
    // Load tasks from local storage on mount
    const savedTasks = taskService.getTasks();
    logger.info('📋 Loaded tasks:', savedTasks);
    logger.info('📋 Tasks with stat rewards:', savedTasks.filter(t => t.statRewards));
    logger.info('📋 Tasks without stat rewards:', savedTasks.filter(t => !t.statRewards));
    setTasks(savedTasks);
  }, []);

  const saveTasksWithFeedback = async (updatedTasks: Task[]) => {
    setIsSaving(true);
    try {
      const success = taskService.saveTasks(updatedTasks);
      if (success) {
        setLastSaved(new Date());
        logger.info('Tasks auto-saved successfully');
      } else {
        logger.error('Failed to auto-save tasks');
      }
    } catch (error) {
      logger.error('Auto-save error:', error);
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
    
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
    );

    setTasks(updatedTasks);
    saveTasksWithFeedback(updatedTasks);
  };

  const deleteTask = (id: string) => {
    // Find the task before deleting it to check if it was completed
    const taskToDelete = tasks.find((task) => task.id === id);

    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveTasksWithFeedback(updatedTasks);

    // If the task was completed, remove the rewards that were given
    if (taskToDelete && taskToDelete.completed && taskToDelete.statRewards) {
      removeStatRewards(taskToDelete.statRewards);
    }
  };

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const isCompleting = !task.completed;
    const now = new Date();

    const updatedTasks = tasks.map((t) =>
      t.id === id ? { 
        ...t, 
        completed: !t.completed, 
        updatedAt: now,
        completedAt: isCompleting ? now : undefined
      } : t
    );

    setTasks(updatedTasks);
    saveTasksWithFeedback(updatedTasks);

    // Award experience and stat rewards when completing a task
    if (isCompleting) {
      logger.info('🎯 Task completion triggered for task:', task);
      logger.info('🎯 Task statRewards:', task.statRewards);
      
      // Use the task we already have in state - no need to fetch from storage
      if (task && task.statRewards) {
        logger.info('🎯 Applying stat rewards:', task.statRewards);
        
        // Use addExperienceWithBobr to handle XP + Bóbr evolution
        const xpAmount = task.statRewards.xp || 10;
        logger.info('🎯 Adding XP:', xpAmount);
        addExperienceWithBobr(xpAmount);
        
        // Add the specific stat rewards (body, mind, soul)
        if (task.statRewards.body || task.statRewards.mind || task.statRewards.soul) {
          logger.info('🎯 Adding stat rewards:', {
            body: task.statRewards.body,
            mind: task.statRewards.mind,
            soul: task.statRewards.soul,
          });
          addStatRewards({
            body: task.statRewards.body,
            mind: task.statRewards.mind,
            soul: task.statRewards.soul,
          });
        }
      } else {
        logger.warn('⚠️  No stat rewards found, applying default XP');
        // Fallback to base XP if no stat rewards
        addExperienceWithBobr(10);
      }

      // Check if this is the first task completion for tutorial
      if (tutorialService.shouldShowStep('taskCompletion')) {
        logger.info('First task completed! Marking tutorial step complete.');
        tutorialService.markStepComplete('taskCompletion');
        // Also mark hatchling evolution step as complete
        tutorialService.markStepComplete('hatchlingEvolution');
        // Mark completion step to finish tutorial
        tutorialService.markStepComplete('completion');
      }
    }
  };

  const refreshTasks = () => {
    const savedTasks = taskService.getTasks();
    setTasks(savedTasks);
  };

  const bringTaskToTop = (id: string) => {
    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) return;

    const [taskToMove] = tasks.splice(taskIndex, 1);
    tasks.unshift(taskToMove);
    setTasks([...tasks]);
    saveTasksWithFeedback(tasks);
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
    bringTaskToTop,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
