import React, { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import styles from './StartHereModal.module.css';

interface StartHereModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TaskTemplate {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'mind' | 'body' | 'soul';
  statRewards: { mind?: number; body?: number; soul?: number; xp: number };
  difficulty: number;
}

export const StartHereModal: React.FC<StartHereModalProps> = ({ isOpen, onClose }) => {
  const { addTask, tasks } = useTasks();
  const [selectedCategory, setSelectedCategory] = useState<'mind' | 'body' | 'soul' | null>(null);
  const [givenTasks, setGivenTasks] = useState<Set<string>>(new Set());

  // Load given tasks from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('startHereGivenTasks');
    if (saved) {
      setGivenTasks(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save given tasks to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('startHereGivenTasks', JSON.stringify(Array.from(givenTasks)));
  }, [givenTasks]);

  const taskTemplates: Record<'mind' | 'body' | 'soul', TaskTemplate[]> = {
    mind: [
      // Difficulty 0 - Easiest
      {
        title: 'Read 1 page',
        description: 'Read exactly 1 page of any book or article',
        priority: 'low',
        category: 'mind',
        statRewards: { mind: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Write 1 sentence',
        description: 'Write exactly 1 sentence about anything',
        priority: 'low',
        category: 'mind',
        statRewards: { mind: 1, xp: 10 },
        difficulty: 0,
      },
      // Difficulty 1 - Very Easy
      {
        title: 'Write 1 idea',
        description: 'Write down 1 new idea or thought',
        priority: 'low',
        category: 'mind',
        statRewards: { mind: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Learn 1 new word',
        description: 'Look up and learn the meaning of 1 new word',
        priority: 'low',
        category: 'mind',
        statRewards: { mind: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Count to 100',
        description: 'Count slowly from 1 to 100',
        priority: 'low',
        category: 'mind',
        statRewards: { mind: 1, xp: 15 },
        difficulty: 1,
      },
      // Difficulty 2 - Easy
      {
        title: 'Learn 3 new words',
        description: 'Look up and learn the meaning of 3 new words',
        priority: 'low',
        category: 'mind',
        statRewards: { mind: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Write 3 sentences',
        description: 'Write exactly 3 sentences on any topic',
        priority: 'low',
        category: 'mind',
        statRewards: { mind: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Solve 1 puzzle',
        description: 'Complete 1 crossword clue, sudoku cell, or brain teaser',
        priority: 'low',
        category: 'mind',
        statRewards: { mind: 1, xp: 20 },
        difficulty: 2,
      },
      // Difficulty 3 - Moderate
      {
        title: 'Study for 10 minutes',
        description: 'Dedicated study session for exactly 10 minutes',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 25 },
        difficulty: 3,
      },
      {
        title: 'Write 50 words',
        description: 'Write exactly 50 words on any topic',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 25 },
        difficulty: 3,
      },
      {
        title: 'Learn 5 new words',
        description: 'Look up and learn the meaning of 5 new words',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 25 },
        difficulty: 3,
      },
      // Difficulty 4 - Medium
      {
        title: 'Write 100 words',
        description: 'Write exactly 100 words on any topic',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 30 },
        difficulty: 4,
      },
      {
        title: 'Study for 20 minutes',
        description: 'Dedicated study session for exactly 20 minutes',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 30 },
        difficulty: 4,
      },
      {
        title: 'Solve 3 puzzles',
        description: 'Complete 3 crossword clues, sudoku cells, or brain teasers',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 30 },
        difficulty: 4,
      },
      // Difficulty 5 - Challenging
      {
        title: 'Solve 5 puzzles',
        description: 'Complete 5 crossword clues, sudoku cells, or brain teasers',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 35 },
        difficulty: 5,
      },
      {
        title: 'Write 200 words',
        description: 'Write exactly 200 words on any topic',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 35 },
        difficulty: 5,
      },
      {
        title: 'Learn 10 new words',
        description: 'Look up and learn the meaning of 10 new words',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 35 },
        difficulty: 5,
      },
      // Difficulty 6 - Hard
      {
        title: 'Study for 30 minutes',
        description: 'Dedicated study session for exactly 30 minutes',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 40 },
        difficulty: 6,
      },
      {
        title: 'Write 300 words',
        description: 'Write exactly 300 words on any topic',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 40 },
        difficulty: 6,
      },
      {
        title: 'Solve 10 puzzles',
        description: 'Complete 10 crossword clues, sudoku cells, or brain teasers',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 40 },
        difficulty: 6,
      },
      // Difficulty 7 - Very Hard
      {
        title: 'Study for 45 minutes',
        description: 'Dedicated study session for exactly 45 minutes',
        priority: 'high',
        category: 'mind',
        statRewards: { mind: 1, xp: 50 },
        difficulty: 7,
      },
      {
        title: 'Write 500 words',
        description: 'Write exactly 500 words on any topic',
        priority: 'high',
        category: 'mind',
        statRewards: { mind: 1, xp: 50 },
        difficulty: 7,
      },
      {
        title: 'Learn 20 new words',
        description: 'Look up and learn the meaning of 20 new words',
        priority: 'high',
        category: 'mind',
        statRewards: { mind: 1, xp: 50 },
        difficulty: 7,
      },
      // Difficulty 8 - Expert
      {
        title: 'Study for 60 minutes',
        description: 'Dedicated study session for exactly 60 minutes',
        priority: 'high',
        category: 'mind',
        statRewards: { mind: 1, xp: 60 },
        difficulty: 8,
      },
      {
        title: 'Write 1000 words',
        description: 'Write exactly 1000 words on any topic',
        priority: 'high',
        category: 'mind',
        statRewards: { mind: 1, xp: 60 },
        difficulty: 8,
      },
      {
        title: 'Solve 20 puzzles',
        description: 'Complete 20 crossword clues, sudoku cells, or brain teasers',
        priority: 'high',
        category: 'mind',
        statRewards: { mind: 1, xp: 60 },
        difficulty: 8,
      },
      // Difficulty 9 - Master
      {
        title: 'Study for 90 minutes',
        description: 'Dedicated study session for exactly 90 minutes',
        priority: 'high',
        category: 'mind',
        statRewards: { mind: 1, xp: 80 },
        difficulty: 9,
      },
      {
        title: 'Write 2000 words',
        description: 'Write exactly 2000 words on any topic',
        priority: 'high',
        category: 'mind',
        statRewards: { mind: 1, xp: 80 },
        difficulty: 9,
      },
      {
        title: 'Learn 50 new words',
        description: 'Look up and learn the meaning of 50 new words',
        priority: 'high',
        category: 'mind',
        statRewards: { mind: 1, xp: 80 },
        difficulty: 9,
      },
    ],
    body: [
      // Difficulty 0 - Easiest
      {
        title: 'Drink 1 glass of water',
        description: 'Stay hydrated with 1 full glass of water',
        priority: 'low',
        category: 'body',
        statRewards: { body: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Stand up and stretch',
        description: 'Stand up and do a simple stretch',
        priority: 'low',
        category: 'body',
        statRewards: { body: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Take 3 deep breaths',
        description: 'Take exactly 3 slow, deep breaths',
        priority: 'low',
        category: 'body',
        statRewards: { body: 1, xp: 10 },
        difficulty: 0,
      },
      // Difficulty 1 - Very Easy
      {
        title: 'Take 5 deep breaths',
        description: 'Pause and take exactly 5 slow, deep breaths',
        priority: 'low',
        category: 'body',
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Do 3 jumping jacks',
        description: 'Complete exactly 3 jumping jacks',
        priority: 'low',
        category: 'body',
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Walk around the room',
        description: 'Walk around your room or space for 1 minute',
        priority: 'low',
        category: 'body',
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      // Difficulty 2 - Easy
      {
        title: 'Do 5 push-ups',
        description: 'Complete exactly 5 push-ups (modify form as needed)',
        priority: 'low',
        category: 'body',
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Do 10 jumping jacks',
        description: 'Complete exactly 10 jumping jacks',
        priority: 'low',
        category: 'body',
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Stretch for 3 minutes',
        description: 'Do a focused stretching routine for exactly 3 minutes',
        priority: 'low',
        category: 'body',
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
      // Difficulty 3 - Moderate
      {
        title: 'Take a 15-min walk',
        description: 'Go for a brisk walk for exactly 15 minutes',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 25 },
        difficulty: 3,
      },
      {
        title: 'Do 10 push-ups',
        description: 'Complete exactly 10 push-ups in sets of 5',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 25 },
        difficulty: 3,
      },
      {
        title: 'Do 20 jumping jacks',
        description: 'Complete exactly 20 jumping jacks in sets of 10',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 25 },
        difficulty: 3,
      },
      // Difficulty 4 - Medium
      {
        title: 'Do 20 sit-ups',
        description: 'Complete exactly 20 sit-ups or crunches',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 30 },
        difficulty: 4,
      },
      {
        title: 'Do 15 push-ups',
        description: 'Complete exactly 15 push-ups in sets of 5',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 30 },
        difficulty: 4,
      },
      {
        title: 'Stretch for 10 minutes',
        description: 'Do a focused stretching routine for exactly 10 minutes',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 30 },
        difficulty: 4,
      },
      // Difficulty 5 - Challenging
      {
        title: 'Do 50 jumping jacks',
        description: 'Complete exactly 50 jumping jacks in sets of 10',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 35 },
        difficulty: 5,
      },
      {
        title: 'Do 25 push-ups',
        description: 'Complete exactly 25 push-ups in sets of 5',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 35 },
        difficulty: 5,
      },
      {
        title: 'Do 30 sit-ups',
        description: 'Complete exactly 30 sit-ups or crunches',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 35 },
        difficulty: 5,
      },
      // Difficulty 6 - Hard
      {
        title: 'Do 100 jumping jacks',
        description: 'Complete exactly 100 jumping jacks in sets of 25',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 40 },
        difficulty: 6,
      },
      {
        title: 'Do 40 push-ups',
        description: 'Complete exactly 40 push-ups in sets of 10',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 40 },
        difficulty: 6,
      },
      {
        title: 'Do 50 sit-ups',
        description: 'Complete exactly 50 sit-ups or crunches',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 40 },
        difficulty: 6,
      },
      // Difficulty 7 - Very Hard
      {
        title: 'Do 20 burpees',
        description: 'Complete exactly 20 burpees (modify as needed)',
        priority: 'high',
        category: 'body',
        statRewards: { body: 1, xp: 50 },
        difficulty: 7,
      },
      {
        title: 'Do 60 push-ups',
        description: 'Complete exactly 60 push-ups in sets of 15',
        priority: 'high',
        category: 'body',
        statRewards: { body: 1, xp: 50 },
        difficulty: 7,
      },
      {
        title: 'Do 100 sit-ups',
        description: 'Complete exactly 100 sit-ups in sets of 25',
        priority: 'high',
        category: 'body',
        statRewards: { body: 1, xp: 50 },
        difficulty: 7,
      },
      // Difficulty 8 - Expert
      {
        title: 'Do 100 push-ups',
        description: 'Complete exactly 100 push-ups in sets of 20',
        priority: 'high',
        category: 'body',
        statRewards: { body: 1, xp: 60 },
        difficulty: 8,
      },
      {
        title: 'Do 30 burpees',
        description: 'Complete exactly 30 burpees',
        priority: 'high',
        category: 'body',
        statRewards: { body: 1, xp: 60 },
        difficulty: 8,
      },
      {
        title: 'Run 2 kilometers',
        description: 'Run exactly 2 kilometers at your own pace',
        priority: 'high',
        category: 'body',
        statRewards: { body: 1, xp: 60 },
        difficulty: 8,
      },
      // Difficulty 9 - Master
      {
        title: 'Run 5 kilometers',
        description: 'Run exactly 5 kilometers at your own pace',
        priority: 'high',
        category: 'body',
        statRewards: { body: 1, xp: 80 },
        difficulty: 9,
      },
      {
        title: 'Do 50 burpees',
        description: 'Complete exactly 50 burpees',
        priority: 'high',
        category: 'body',
        statRewards: { body: 1, xp: 80 },
        difficulty: 9,
      },
      {
        title: 'Do 200 push-ups',
        description: 'Complete exactly 200 push-ups in sets of 25',
        priority: 'high',
        category: 'body',
        statRewards: { body: 1, xp: 80 },
        difficulty: 9,
      },
    ],
    soul: [
      // Difficulty 0 - Easiest
      {
        title: 'Light 1 candle',
        description: 'Create a peaceful atmosphere with 1 candle',
        priority: 'low',
        category: 'soul',
        statRewards: { soul: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Smile at yourself',
        description: 'Look in the mirror and smile at yourself',
        priority: 'low',
        category: 'soul',
        statRewards: { soul: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Say thank you',
        description: 'Say thank you to someone or something',
        priority: 'low',
        category: 'soul',
        statRewards: { soul: 1, xp: 10 },
        difficulty: 0,
      },
      // Difficulty 1 - Very Easy
      {
        title: 'Express 1 gratitude',
        description: 'Write down or say 1 thing you\'re grateful for',
        priority: 'low',
        category: 'soul',
        statRewards: { soul: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Take 3 deep breaths',
        description: 'Take exactly 3 slow, deep breaths',
        priority: 'low',
        category: 'soul',
        statRewards: { soul: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Look at the sky',
        description: 'Go outside and look at the sky for 1 minute',
        priority: 'low',
        category: 'soul',
        statRewards: { soul: 1, xp: 15 },
        difficulty: 1,
      },
      // Difficulty 2 - Easy
      {
        title: 'Listen to 1 song mindfully',
        description: 'Listen to 1 song with full attention and presence',
        priority: 'low',
        category: 'soul',
        statRewards: { soul: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Express 3 gratitudes',
        description: 'Write down or say 3 things you\'re grateful for',
        priority: 'low',
        category: 'soul',
        statRewards: { soul: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Hug someone',
        description: 'Give a genuine hug to someone you care about',
        priority: 'low',
        category: 'soul',
        statRewards: { soul: 1, xp: 20 },
        difficulty: 2,
      },
      // Difficulty 3 - Moderate
      {
        title: 'Reflect for 5 minutes',
        description: 'Spend exactly 5 minutes in quiet reflection',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 25 },
        difficulty: 3,
      },
      {
        title: 'Listen to 3 songs mindfully',
        description: 'Listen to 3 songs with full attention and presence',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 25 },
        difficulty: 3,
      },
      {
        title: 'Express 5 gratitudes',
        description: 'Write down or say 5 things you\'re grateful for',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 25 },
        difficulty: 3,
      },
      // Difficulty 4 - Medium
      {
        title: 'Journal for 10 minutes',
        description: 'Write in your journal for exactly 10 minutes',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 30 },
        difficulty: 4,
      },
      {
        title: 'Meditate for 5 minutes',
        description: 'Sit in meditation for exactly 5 minutes',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 30 },
        difficulty: 4,
      },
      {
        title: 'Connect with 1 friend',
        description: 'Reach out to 1 person you care about',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 30 },
        difficulty: 4,
      },
      // Difficulty 5 - Challenging
      {
        title: 'Meditate for 10 minutes',
        description: 'Sit in meditation for exactly 10 minutes',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 35 },
        difficulty: 5,
      },
      {
        title: 'Journal for 20 minutes',
        description: 'Write in your journal for exactly 20 minutes',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 35 },
        difficulty: 5,
      },
      {
        title: 'Connect with 3 friends',
        description: 'Reach out to 3 people you care about',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 35 },
        difficulty: 5,
      },
      // Difficulty 6 - Hard
      {
        title: 'Meditate for 20 minutes',
        description: 'Sit in meditation for exactly 20 minutes',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 40 },
        difficulty: 6,
      },
      {
        title: 'Journal for 30 minutes',
        description: 'Write in your journal for exactly 30 minutes',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 40 },
        difficulty: 6,
      },
      {
        title: 'Practice forgiveness',
        description: 'Spend 15 minutes practicing forgiveness meditation',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 40 },
        difficulty: 6,
      },
      // Difficulty 7 - Very Hard
      {
        title: 'Meditate for 30 minutes',
        description: 'Sit in meditation for exactly 30 minutes',
        priority: 'high',
        category: 'soul',
        statRewards: { soul: 1, xp: 50 },
        difficulty: 7,
      },
      {
        title: 'Journal for 45 minutes',
        description: 'Write in your journal for exactly 45 minutes',
        priority: 'high',
        category: 'soul',
        statRewards: { soul: 1, xp: 50 },
        difficulty: 7,
      },
      {
        title: 'Practice forgiveness for 30 minutes',
        description: 'Spend 30 minutes practicing forgiveness meditation',
        priority: 'high',
        category: 'soul',
        statRewards: { soul: 1, xp: 50 },
        difficulty: 7,
      },
      // Difficulty 8 - Expert
      {
        title: 'Meditate for 45 minutes',
        description: 'Sit in meditation for exactly 45 minutes',
        priority: 'high',
        category: 'soul',
        statRewards: { soul: 1, xp: 60 },
        difficulty: 8,
      },
      {
        title: 'Journal for 60 minutes',
        description: 'Write in your journal for exactly 60 minutes',
        priority: 'high',
        category: 'soul',
        statRewards: { soul: 1, xp: 60 },
        difficulty: 8,
      },
      {
        title: 'Face 1 inner truth',
        description: 'Confront 1 difficult truth about yourself',
        priority: 'high',
        category: 'soul',
        statRewards: { soul: 1, xp: 60 },
        difficulty: 8,
      },
      // Difficulty 9 - Master
      {
        title: 'Meditate for 60 minutes',
        description: 'Sit in meditation for exactly 60 minutes',
        priority: 'high',
        category: 'soul',
        statRewards: { soul: 1, xp: 80 },
        difficulty: 9,
      },
      {
        title: 'Face 3 inner truths',
        description: 'Confront 3 difficult truths about yourself',
        priority: 'high',
        category: 'soul',
        statRewards: { soul: 1, xp: 80 },
        difficulty: 9,
      },
      {
        title: 'Practice forgiveness for 60 minutes',
        description: 'Spend 60 minutes practicing forgiveness meditation',
        priority: 'high',
        category: 'soul',
        statRewards: { soul: 1, xp: 80 },
        difficulty: 9,
      },
    ],
  };

  const getNextTask = (category: 'mind' | 'body' | 'soul'): TaskTemplate | null => {
    const tasks = taskTemplates[category];
    const categoryKey = `${category}_`;
    
    // Find the next task that hasn't been given yet
    for (const task of tasks) {
      const taskKey = `${categoryKey}${task.difficulty}`;
      if (!givenTasks.has(taskKey)) {
        return task;
      }
    }
    
    return null; // All tasks for this category have been given
  };

  const handleAddTask = (category: 'mind' | 'body' | 'soul') => {
    const task = getNextTask(category);
    if (task) {
      addTask({
        title: task.title,
        description: task.description,
        completed: false,
        priority: task.priority,
        category: task.category,
        statRewards: { ...task.statRewards },
        difficulty: task.difficulty,
      });
      
      // Mark this task as given
      const taskKey = `${category}_${task.difficulty}`;
      setGivenTasks(prev => new Set([...prev, taskKey]));
    }
  };

  const getProgressForCategory = (category: 'mind' | 'body' | 'soul'): number => {
    const tasks = taskTemplates[category];
    const categoryKey = `${category}_`;
    let givenCount = 0;
    
    for (const task of tasks) {
      const taskKey = `${categoryKey}${task.difficulty}`;
      if (givenTasks.has(taskKey)) {
        givenCount++;
      }
    }
    
    return Math.round((givenCount / tasks.length) * 100);
  };

  const getNextTaskForCategory = (category: 'mind' | 'body' | 'soul'): TaskTemplate | null => {
    return getNextTask(category);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} data-testid="modal-overlay">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} data-testid="modal-content">
        <div className={styles.header}>
          <h2>Start Here</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <p className={styles.description}>
            Choose a category to get started with progressively challenging tasks:
          </p>
          
          <div className={styles.categories}>
            {(['mind', 'body', 'soul'] as const).map((category) => {
              const nextTask = getNextTaskForCategory(category);
              const progress = getProgressForCategory(category);
              const isCompleted = progress === 100;
              
              return (
                <div key={category} className={styles.categoryCard}>
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
                  
                  {nextTask ? (
                    <div className={styles.taskPreview}>
                      <h4>Next Task (Difficulty {nextTask.difficulty})</h4>
                      <p className={styles.taskTitle}>{nextTask.title}</p>
                      <p className={styles.taskDescription}>{nextTask.description}</p>
                      <button 
                        className={styles.addButton}
                        onClick={() => handleAddTask(category)}
                      >
                        Add This Task
                      </button>
                    </div>
                  ) : (
                    <div className={styles.completedMessage}>
                      <p>✅ All tasks completed for this category!</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}; 