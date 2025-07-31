import React, { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useHabits } from '../hooks/useHabits';
import { useUser } from '../hooks/useUser';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import styles from './StartHereSection.module.css';

interface StartHereSectionProps {
  isVisible: boolean;
  onClose: () => void;
}

interface TaskTemplate {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  categories: string[];
  statRewards: { mind?: number; body?: number; soul?: number; xp: number };
  difficulty: number;
}

interface HabitTemplate {
  name: string;
  description: string;
  targetFrequency: 'daily' | 'weekly' | 'monthly';
  categories: string[];
  statRewards: { mind?: number; body?: number; soul?: number; xp: number };
}

export const StartHereSection: React.FC<StartHereSectionProps> = ({ isVisible, onClose }) => {
  const { addTask, tasks, isSaving: tasksSaving } = useTasks();
  const { addHabit, isSaving: habitsSaving } = useHabits();
  const { user } = useUser();
  const [givenTasks, setGivenTasks] = useState<Set<string>>(new Set());
  const [givenHabits, setGivenHabits] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [collapsedCompletedSections, setCollapsedCompletedSections] = useState<Set<string>>(new Set());
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isSavingUI, setIsSavingUI] = useState(false);

  // Load saved given tasks and habits from localStorage on mount
  useEffect(() => {
    try {
      // Load given tasks
      const savedGivenTasks = localStorage.getItem('startHereGivenTasks');
      if (savedGivenTasks) {
        const parsedTasks = JSON.parse(savedGivenTasks);
        setGivenTasks(new Set(parsedTasks));
        console.log('📋 Loaded given tasks from localStorage:', parsedTasks);
      }

      // Load given habits
      const savedGivenHabits = localStorage.getItem('startHereGivenHabits');
      if (savedGivenHabits) {
        const parsedHabits = JSON.parse(savedGivenHabits);
        setGivenHabits(new Set(parsedHabits));
        console.log('🔄 Loaded given habits from localStorage:', parsedHabits);
      }
    } catch (error) {
      console.error('Error loading saved given tasks/habits:', error);
    }
  }, []);

  // Helper function to calculate XP based on priority and difficulty
  const calculateXp = (priority: 'low' | 'medium' | 'high', difficulty: number): number => {
    const priorityXp = priority === 'high' ? 15 : priority === 'medium' ? 10 : 5;
    const fibonacciXp = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
    const difficultyXp = fibonacciXp[difficulty] || 0;
    return 5 + priorityXp + difficultyXp; // Base 5xp + priority + difficulty
  };

  const taskTemplates: Record<string, TaskTemplate[]> = {
    mind: [
      // Difficulty 0 - Easiest
      {
        title: 'Read 1 page',
        description: 'Read exactly 1 page of any book or article',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('low', 0) },
        difficulty: 0,
      },
      {
        title: 'Write 1 sentence',
        description: 'Write exactly 1 sentence about anything',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('low', 0) },
        difficulty: 0,
      },
      // Difficulty 1 - Very Easy
      {
        title: 'Write 1 idea',
        description: 'Write down 1 new idea or thought',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('low', 1) },
        difficulty: 1,
      },
      {
        title: 'Learn 1 new word',
        description: 'Look up and learn the meaning of 1 new word',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('low', 1) },
        difficulty: 1,
      },
      {
        title: 'Count to 100',
        description: 'Count slowly from 1 to 100',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('low', 1) },
        difficulty: 1,
      },
      // Difficulty 2 - Easy
      {
        title: 'Learn 3 new words',
        description: 'Look up and learn the meaning of 3 new words',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('low', 2) },
        difficulty: 2,
      },
      {
        title: 'Write 3 sentences',
        description: 'Write exactly 3 sentences on any topic',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('low', 2) },
        difficulty: 2,
      },
      {
        title: 'Solve 1 puzzle',
        description: 'Complete 1 crossword clue, sudoku cell, or brain teaser',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('low', 2) },
        difficulty: 2,
      },
      // Difficulty 3 - Moderate
      {
        title: 'Learn 10 new words',
        description: 'Look up and learn the meaning of 10 new words',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('medium', 3) },
        difficulty: 3,
      },
      {
        title: 'Write 100 words',
        description: 'Write exactly 100 words on any topic',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('medium', 3) },
        difficulty: 3,
      },
      {
        title: 'Solve 5 puzzles',
        description: 'Complete 5 crossword clues, sudoku cells, or brain teasers',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('medium', 3) },
        difficulty: 3,
      },
      // Difficulty 4 - Medium
      {
        title: 'Study for 15 minutes',
        description: 'Dedicated study session for exactly 15 minutes',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('medium', 4) },
        difficulty: 4,
      },
      {
        title: 'Read for 30 minutes',
        description: 'Read any book or article for exactly 30 minutes',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('medium', 4) },
        difficulty: 4,
      },
      // Difficulty 5 - Hard
      {
        title: 'Study for 1 hour',
        description: 'Dedicated study session for exactly 1 hour',
        priority: 'high',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('high', 5) },
        difficulty: 5,
      },
      {
        title: 'Write 500 words',
        description: 'Write exactly 500 words on any topic',
        priority: 'high',
        categories: ['mind'],
        statRewards: { mind: 1, xp: calculateXp('high', 5) },
        difficulty: 5,
      },
    ],
    body: [
      // Difficulty 0 - Easiest
      {
        title: 'Take 3 deep breaths',
        description: 'Sit and take 3 slow, deep breaths',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: calculateXp('low', 0) },
        difficulty: 0,
      },
      {
        title: 'Drink a glass of water',
        description: 'Drink one full glass of water',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: calculateXp('low', 0) },
        difficulty: 0,
      },
      // Difficulty 1 - Very Easy
      {
        title: 'Stretch for 2 minutes',
        description: 'Do gentle stretching for exactly 2 minutes',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: calculateXp('low', 1) },
        difficulty: 1,
      },
      {
        title: 'Walk for 5 minutes',
        description: 'Walk around for exactly 5 minutes',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: calculateXp('low', 1) },
        difficulty: 1,
      },
      // Difficulty 2 - Easy
      {
        title: 'Do 10 jumping jacks',
        description: 'Complete exactly 10 jumping jacks',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: calculateXp('low', 2) },
        difficulty: 2,
      },
      {
        title: 'Walk for 15 minutes',
        description: 'Walk around for exactly 15 minutes',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: calculateXp('low', 2) },
        difficulty: 2,
      },
      // Difficulty 3 - Moderate
      {
        title: 'Do 20 push-ups',
        description: 'Complete exactly 20 push-ups (modified if needed)',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: calculateXp('medium', 3) },
        difficulty: 3,
      },
      {
        title: 'Exercise for 30 minutes',
        description: 'Any form of exercise for exactly 30 minutes',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: calculateXp('medium', 3) },
        difficulty: 3,
      },
      // Difficulty 4 - Medium
      {
        title: 'Run for 20 minutes',
        description: 'Run or jog for exactly 20 minutes',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: calculateXp('medium', 4) },
        difficulty: 4,
      },
      {
        title: 'Do 50 push-ups',
        description: 'Complete exactly 50 push-ups (modified if needed)',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: calculateXp('medium', 4) },
        difficulty: 4,
      },
      // Difficulty 5 - Hard
      {
        title: 'Exercise for 1 hour',
        description: 'Any form of exercise for exactly 1 hour',
        priority: 'high',
        categories: ['body'],
        statRewards: { body: 1, xp: calculateXp('high', 5) },
        difficulty: 5,
      },
      {
        title: 'Run for 45 minutes',
        description: 'Run or jog for exactly 45 minutes',
        priority: 'high',
        categories: ['body'],
        statRewards: { body: 1, xp: calculateXp('high', 5) },
        difficulty: 5,
      },
    ],
    soul: [
      // Difficulty 0 - Easiest
      {
        title: 'Smile at someone',
        description: 'Give a genuine smile to someone today',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: calculateXp('low', 0) },
        difficulty: 0,
      },
      {
        title: 'Say thank you',
        description: 'Say thank you to someone who helped you',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: calculateXp('low', 0) },
        difficulty: 0,
      },
      // Difficulty 1 - Very Easy
      {
        title: 'Draw a simple shape',
        description: 'Draw a circle, square, or triangle',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: calculateXp('low', 1) },
        difficulty: 1,
      },
      {
        title: 'Listen to 1 song',
        description: 'Listen to one complete song you enjoy',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: calculateXp('low', 1) },
        difficulty: 1,
      },
      // Difficulty 2 - Easy
      {
        title: 'Draw a simple picture',
        description: 'Draw a simple picture of anything',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: calculateXp('low', 2) },
        difficulty: 2,
      },
      {
        title: 'Write a short poem',
        description: 'Write a 4-line poem about anything',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: calculateXp('low', 2) },
        difficulty: 2,
      },
      // Difficulty 3 - Moderate
      {
        title: 'Create something for 30 minutes',
        description: 'Spend 30 minutes creating anything (art, music, writing)',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: calculateXp('medium', 3) },
        difficulty: 3,
      },
      {
        title: 'Meditate for 10 minutes',
        description: 'Sit quietly and meditate for exactly 10 minutes',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: calculateXp('medium', 3) },
        difficulty: 3,
      },
      // Difficulty 4 - Medium
      {
        title: 'Create something for 1 hour',
        description: 'Spend 1 hour creating anything (art, music, writing)',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: calculateXp('medium', 4) },
        difficulty: 4,
      },
      {
        title: 'Meditate for 30 minutes',
        description: 'Sit quietly and meditate for exactly 30 minutes',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: calculateXp('medium', 4) },
        difficulty: 4,
      },
      // Difficulty 5 - Hard
      {
        title: 'Create a complete project',
        description: 'Start and finish a creative project in one session',
        priority: 'high',
        categories: ['soul'],
        statRewards: { soul: 1, xp: calculateXp('high', 5) },
        difficulty: 5,
      },
      {
        title: 'Meditate for 1 hour',
        description: 'Sit quietly and meditate for exactly 1 hour',
        priority: 'high',
        categories: ['soul'],
        statRewards: { soul: 1, xp: calculateXp('high', 5) },
        difficulty: 5,
      },
    ],
    home: [
      {
        title: 'Clean 1 surface',
        description: 'Clean exactly 1 surface in your home',
        priority: 'low',
        categories: ['home'],
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Organize 1 drawer',
        description: 'Organize exactly 1 drawer in your home',
        priority: 'low',
        categories: ['home'],
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Clean 1 room',
        description: 'Clean exactly 1 room in your home',
        priority: 'medium',
        categories: ['home'],
        statRewards: { body: 1, xp: 40 },
        difficulty: 3,
      },
      {
        title: 'Organize 1 closet',
        description: 'Organize exactly 1 closet in your home',
        priority: 'medium',
        categories: ['home'],
        statRewards: { body: 1, xp: 45 },
        difficulty: 4,
      },
      {
        title: 'Deep clean 1 room',
        description: 'Deep clean exactly 1 room in your home',
        priority: 'medium',
        categories: ['home'],
        statRewards: { body: 1, xp: 50 },
        difficulty: 5,
      },
    ],
    'free time': [
      {
        title: 'Try 1 new hobby',
        description: 'Try exactly 1 new hobby or activity',
        priority: 'low',
        categories: ['free time'],
        statRewards: { soul: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Learn 1 new skill',
        description: 'Learn exactly 1 new skill or technique',
        priority: 'medium',
        categories: ['free time'],
        statRewards: { soul: 1, xp: 40 },
        difficulty: 3,
      },
      {
        title: 'Master 1 new skill',
        description: 'Master exactly 1 new skill or technique',
        priority: 'medium',
        categories: ['free time'],
        statRewards: { soul: 1, xp: 60 },
        difficulty: 5,
      },
    ],
    garden: [
      {
        title: 'Plant 1 seed',
        description: 'Plant exactly 1 seed or small plant',
        priority: 'low',
        categories: ['garden'],
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Water 1 plant',
        description: 'Water exactly 1 plant in your garden',
        priority: 'low',
        categories: ['garden'],
        statRewards: { body: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Plant 3 seeds',
        description: 'Plant exactly 3 seeds or small plants',
        priority: 'medium',
        categories: ['garden'],
        statRewards: { body: 1, xp: 30 },
        difficulty: 2,
      },
      {
        title: 'Maintain 1 garden bed',
        description: 'Maintain exactly 1 garden bed or area',
        priority: 'medium',
        categories: ['garden'],
        statRewards: { body: 1, xp: 45 },
        difficulty: 4,
      },
    ],
  };

  const habitTemplates: Record<string, HabitTemplate[]> = {
    mind: [
      {
        name: 'Read Daily',
        description: 'Read for at least 15 minutes every day',
        targetFrequency: 'daily',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 20 },
      },
      {
        name: 'Learn New Words',
        description: 'Learn 5 new words every day',
        targetFrequency: 'daily',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 25 },
      },
      {
        name: 'Write Journal',
        description: 'Write in your journal for 10 minutes daily',
        targetFrequency: 'daily',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 30 },
      },
    ],
    body: [
      {
        name: 'Exercise Daily',
        description: 'Do at least 20 minutes of exercise every day',
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 25 },
      },
      {
        name: 'Stretch Routine',
        description: 'Do a 10-minute stretching routine daily',
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 20 },
      },
      {
        name: 'Walk Daily',
        description: 'Take a 30-minute walk every day',
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 30 },
      },
    ],
    soul: [
      {
        name: 'Meditate Daily',
        description: 'Meditate for 10 minutes every day',
        targetFrequency: 'daily',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 25 },
      },
      {
        name: 'Practice Gratitude',
        description: 'Write down 3 things you\'re grateful for daily',
        targetFrequency: 'daily',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 20 },
      },
      {
        name: 'Connect with Friends',
        description: 'Reach out to one friend or family member daily',
        targetFrequency: 'daily',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 30 },
      },
    ],
  };

  const getNextTask = (category: string): TaskTemplate | null => {
    const taskTemplatesForCategory = taskTemplates[category];
    if (!taskTemplatesForCategory) return null;
    
    const categoryKey = `${category}_`;
    
    for (const templateTask of taskTemplatesForCategory) {
      const taskKey = `${categoryKey}${templateTask.difficulty}`;
      
      // Check if this task was given
      const wasGiven = givenTasks.has(taskKey);
      
      if (wasGiven) {
        // Check if the task was actually completed in the main task list
        const matchingTask = tasks.find(t => 
          t.title === templateTask.title && 
          t.difficulty === templateTask.difficulty
        );
        
        // If the task was given but not completed, don't allow next task
        if (matchingTask && !matchingTask.completed) {
          return null; // Block progression until current task is completed
        }
      }
      
      // Return the task if it wasn't given
      if (!wasGiven) {
        return templateTask;
      }
    }
    
    return null;
  };

  const handleAddTask = (category: string) => {
    const task = getNextTask(category);
    if (task) {
      addTask({
        title: task.title,
        description: task.description,
        completed: false,
        priority: task.priority,
        categories: task.categories,
        statRewards: { ...task.statRewards },
        difficulty: task.difficulty,
      });
      
      // Mark this task as given
      const taskKey = `${category}_${task.difficulty}`;
      setGivenTasks(prev => new Set([...prev, taskKey]));
      
      // Auto-save given tasks
      setIsSavingProgress(true);
      localStorage.setItem('startHereGivenTasks', JSON.stringify(Array.from([...givenTasks, taskKey])));
      setTimeout(() => setIsSavingProgress(false), 300);
    }
  };

  const getProgressForCategory = (category: string): number => {
    const taskTemplatesForCategory = taskTemplates[category];
    if (!taskTemplatesForCategory) return 0;
    
    const categoryKey = `${category}_`;
    let completedCount = 0;
    
    for (const templateTask of taskTemplatesForCategory) {
      const taskKey = `${categoryKey}${templateTask.difficulty}`;
      
      // Check if this task was given
      if (givenTasks.has(taskKey)) {
        // Check if the task was actually completed in the main task list
        const matchingTask = tasks.find(t => 
          t.title === templateTask.title && 
          t.difficulty === templateTask.difficulty
        );
        
        if (matchingTask && matchingTask.completed) {
          completedCount++;
        }
      }
    }
    
    return Math.round((completedCount / taskTemplatesForCategory.length) * 100);
  };

  const getNextTaskForCategory = (category: string): TaskTemplate | null => {
    return getNextTask(category);
  };

  const getCompletedTasksForCategory = (category: string): TaskTemplate[] => {
    const taskTemplatesForCategory = taskTemplates[category];
    if (!taskTemplatesForCategory) return [];
    
    const categoryKey = `${category}_`;
    const completedTasks: TaskTemplate[] = [];
    
    for (const templateTask of taskTemplatesForCategory) {
      const taskKey = `${categoryKey}${templateTask.difficulty}`;
      
      // Check if this task was given
      if (givenTasks.has(taskKey)) {
        // Check if the task was actually completed in the main task list
        const matchingTask = tasks.find(t => 
          t.title === templateTask.title && 
          t.difficulty === templateTask.difficulty
        );
        
        if (matchingTask && matchingTask.completed) {
          completedTasks.push(templateTask);
        }
      }
    }
    
    return completedTasks;
  };

  const getIncompleteTask = (category: string): TaskTemplate | null => {
    const taskTemplatesForCategory = taskTemplates[category];
    if (!taskTemplatesForCategory) return null;
    
    const categoryKey = `${category}_`;
    
    for (const templateTask of taskTemplatesForCategory) {
      const taskKey = `${categoryKey}${templateTask.difficulty}`;
      
      // Check if this task was given
      if (givenTasks.has(taskKey)) {
        // Check if the task was actually completed in the main task list
        const matchingTask = tasks.find(t => 
          t.title === templateTask.title && 
          t.difficulty === templateTask.difficulty
        );
        
        // If the task was given but not completed, return it
        if (matchingTask && !matchingTask.completed) {
          return templateTask;
        }
      }
    }
    
    return null;
  };

  const getNextHabit = (category: string): HabitTemplate | null => {
    const habitTemplatesForCategory = habitTemplates[category];
    if (!habitTemplatesForCategory) return null;
    
    for (const templateHabit of habitTemplatesForCategory) {
      // Check if this habit was given
      const wasGiven = givenHabits.has(templateHabit.name);
      
      if (!wasGiven) {
        return templateHabit;
      }
    }
    
    return null;
  };

  const handleAddHabit = (category: string) => {
    const habit = getNextHabit(category);
    if (habit) {
      addHabit({
        name: habit.name,
        description: habit.description,
        targetFrequency: habit.targetFrequency,
        categories: habit.categories,
        statRewards: { ...habit.statRewards },
      });
      
      // Mark this habit as given
      setGivenHabits(prev => new Set([...prev, habit.name]));
      
      // Auto-save given habits
      setIsSavingProgress(true);
      localStorage.setItem('startHereGivenHabits', JSON.stringify(Array.from([...givenHabits, habit.name])));
      setTimeout(() => setIsSavingProgress(false), 300);
    }
  };

  const getProgressForHabitCategory = (category: string): number => {
    const habitTemplatesForCategory = habitTemplates[category];
    if (!habitTemplatesForCategory) return 0;
    
    let completedCount = 0;
    
    for (const templateHabit of habitTemplatesForCategory) {
      if (givenHabits.has(templateHabit.name)) {
        completedCount++;
      }
    }
    
    return Math.round((completedCount / habitTemplatesForCategory.length) * 100);
  };

  const getCompletedHabitsForCategory = (category: string): HabitTemplate[] => {
    const habitTemplatesForCategory = habitTemplates[category];
    if (!habitTemplatesForCategory) return [];
    
    const completedHabits: HabitTemplate[] = [];
    
    for (const templateHabit of habitTemplatesForCategory) {
      if (givenHabits.has(templateHabit.name)) {
        completedHabits.push(templateHabit);
      }
    }
    
    return completedHabits;
  };

  const handleCategoryExpand = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleCompletedSectionToggle = (sectionKey: string) => {
    setCollapsedCompletedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const availableCategories = ['mind', 'body', 'soul', 'home', 'free time', 'garden'];
  const availableHabitCategories = ['mind', 'body', 'soul'];

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Start Here</h2>
        <AutoSaveIndicator isSaving={tasksSaving || habitsSaving || isSavingProgress || isSavingUI} />
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
      
      <div className={styles.content}>
        <p className={styles.description}>
          Choose categories to get started with progressively challenging tasks and habits:
        </p>
        
        <div className={styles.categories}>
          {availableCategories.map((category) => {
            const nextTask = getNextTaskForCategory(category);
            const incompleteTask = getIncompleteTask(category);
            const progress = getProgressForCategory(category);
            const completedTasks = getCompletedTasksForCategory(category);
            
            return (
              <div 
                key={category} 
                className={`${styles.categoryCard} ${expandedCategories.has(category) ? styles.expanded : ''}`}
                onClick={() => handleCategoryExpand(category)}
              >
                <div className={styles.categoryHeader}>
                  <h3 className={styles.categoryTitle}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h3>
                  <div className={styles.progress}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>{progress}%</span>
                  </div>
                </div>
                
                {expandedCategories.has(category) && (
                  <>
                    {completedTasks.length > 0 && (
                      <div className={styles.completedTasksSection}>
                        <div 
                          className={styles.completedTasksHeader}
                          onClick={() => handleCompletedSectionToggle(`tasks-${category}`)}
                        >
                          <h4 className={styles.completedTasksTitle}>
                            Completed Tasks ({completedTasks.length})
                          </h4>
                          <span className={styles.collapseIcon}>
                            {collapsedCompletedSections.has(`tasks-${category}`) ? '▼' : '▲'}
                          </span>
                        </div>
                        {!collapsedCompletedSections.has(`tasks-${category}`) && (
                          <div className={styles.completedTasksList}>
                            {completedTasks.map((task, index) => (
                              <div key={index} className={styles.completedTaskItem}>
                                <span className={styles.completedTaskTitle}>✅ {task.title}</span>
                                <span className={styles.completedTaskDifficulty}>(Difficulty {task.difficulty})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {incompleteTask ? (
                      <div className={styles.taskPreview}>
                        <h4>Complete This Task First (Difficulty {incompleteTask.difficulty})</h4>
                        <p className={styles.taskTitle}>{incompleteTask.title}</p>
                        <p className={styles.taskDescription}>{incompleteTask.description}</p>
                        <p className={styles.incompleteMessage}>
                          ⚠️ Complete this task before taking the next one
                        </p>
                      </div>
                    ) : nextTask ? (
                      <div className={styles.taskPreview}>
                        <h4>Next Task (Difficulty {nextTask.difficulty})</h4>
                        <p className={styles.taskTitle}>{nextTask.title}</p>
                        <p className={styles.taskDescription}>{nextTask.description}</p>
                        <button 
                          className={styles.addButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTask(category);
                          }}
                        >
                          Add This Task
                        </button>
                      </div>
                    ) : (
                      <div className={styles.completedMessage}>
                        <p>✅ All tasks completed for this category!</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
          
          {availableHabitCategories.map((category) => {
            const nextHabit = getNextHabit(category);
            const progress = getProgressForHabitCategory(category);
            const completedHabits = getCompletedHabitsForCategory(category);
            
            return (
              <div 
                key={`habit-${category}`} 
                className={`${styles.categoryCard} ${expandedCategories.has(`habit-${category}`) ? styles.expanded : ''}`}
                onClick={() => handleCategoryExpand(`habit-${category}`)}
              >
                <div className={styles.categoryHeader}>
                  <h3 className={styles.categoryTitle}>
                    {category.charAt(0).toUpperCase() + category.slice(1)} Habits
                  </h3>
                  <div className={styles.progress}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>{progress}%</span>
                  </div>
                </div>
                
                {expandedCategories.has(`habit-${category}`) && (
                  <>
                    {completedHabits.length > 0 && (
                      <div className={styles.completedTasksSection}>
                        <div 
                          className={styles.completedTasksHeader}
                          onClick={() => handleCompletedSectionToggle(`habits-${category}`)}
                        >
                          <h4 className={styles.completedTasksTitle}>
                            Completed Habits ({completedHabits.length})
                          </h4>
                          <span className={styles.collapseIcon}>
                            {collapsedCompletedSections.has(`habits-${category}`) ? '▼' : '▲'}
                          </span>
                        </div>
                        {!collapsedCompletedSections.has(`habits-${category}`) && (
                          <div className={styles.completedTasksList}>
                            {completedHabits.map((habit, index) => (
                              <div key={index} className={styles.completedTaskItem}>
                                <span className={styles.completedTaskTitle}>✅ {habit.name}</span>
                                <span className={styles.completedTaskDifficulty}>({habit.targetFrequency})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {nextHabit ? (
                      <div className={styles.taskPreview}>
                        <h4>Next Habit ({nextHabit.targetFrequency})</h4>
                        <p className={styles.taskTitle}>{nextHabit.name}</p>
                        <p className={styles.taskDescription}>{nextHabit.description}</p>
                        <button 
                          className={styles.addButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddHabit(category);
                          }}
                        >
                          Add This Habit
                        </button>
                      </div>
                    ) : (
                      <div className={styles.completedMessage}>
                        <p>✅ All habits completed for this category!</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 