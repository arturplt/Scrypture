import React, { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useHabits } from '../hooks/useHabits';

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
  const { addTask, tasks } = useTasks();
  const { addHabit } = useHabits();
  const [givenTasks, setGivenTasks] = useState<Set<string>>(new Set());
  const [givenHabits, setGivenHabits] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [collapsedCompletedSections, setCollapsedCompletedSections] = useState<Set<string>>(new Set());

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

  const taskTemplates: Record<string, TaskTemplate[]> = {
    mind: [
      // Difficulty 0 - Easiest
      {
        title: 'Read 1 page',
        description: 'Read exactly 1 page of any book or article',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Write 1 sentence',
        description: 'Write exactly 1 sentence about anything',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 10 },
        difficulty: 0,
      },
      // Difficulty 1 - Very Easy
      {
        title: 'Write 1 idea',
        description: 'Write down 1 new idea or thought',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Learn 1 new word',
        description: 'Look up and learn the meaning of 1 new word',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Count to 100',
        description: 'Count slowly from 1 to 100',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 15 },
        difficulty: 1,
      },
      // Difficulty 2 - Easy
      {
        title: 'Learn 3 new words',
        description: 'Look up and learn the meaning of 3 new words',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Write 3 sentences',
        description: 'Write exactly 3 sentences on any topic',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Solve 1 puzzle',
        description: 'Complete 1 crossword clue, sudoku cell, or brain teaser',
        priority: 'low',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 20 },
        difficulty: 2,
      },
      // Difficulty 3 - Moderate
      {
        title: 'Learn 10 new words',
        description: 'Look up and learn the meaning of 10 new words',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 40 },
        difficulty: 3,
      },
      {
        title: 'Write 100 words',
        description: 'Write exactly 100 words on any topic',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 40 },
        difficulty: 3,
      },
      {
        title: 'Solve 5 puzzles',
        description: 'Complete 5 crossword clues, sudoku cells, or brain teasers',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 40 },
        difficulty: 3,
      },
      // Difficulty 4 - Medium
      {
        title: 'Study for 15 minutes',
        description: 'Dedicated study session for exactly 15 minutes',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 40 },
        difficulty: 4,
      },
      {
        title: 'Write 250 words',
        description: 'Write exactly 250 words on any topic',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 45 },
        difficulty: 4,
      },
      {
        title: 'Solve 10 puzzles',
        description: 'Complete 10 crossword clues, sudoku cells, or brain teasers',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 45 },
        difficulty: 4,
      },
      // Difficulty 5 - Challenging
      {
        title: 'Study for 30 minutes',
        description: 'Dedicated study session for exactly 30 minutes',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 50 },
        difficulty: 5,
      },
      {
        title: 'Write 500 words',
        description: 'Write exactly 500 words on any topic',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 55 },
        difficulty: 5,
      },
      {
        title: 'Solve 15 puzzles',
        description: 'Complete 15 crossword clues, sudoku cells, or brain teasers',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 50 },
        difficulty: 5,
      },
      // Difficulty 6 - Hard
      {
        title: 'Study for 45 minutes',
        description: 'Dedicated study session for exactly 45 minutes',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 55 },
        difficulty: 6,
      },
      {
        title: 'Write 750 words',
        description: 'Write exactly 750 words on any topic',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 60 },
        difficulty: 6,
      },
      {
        title: 'Solve 20 puzzles',
        description: 'Complete 20 crossword clues, sudoku cells, or brain teasers',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 55 },
        difficulty: 6,
      },
      // Difficulty 7 - Very Hard
      {
        title: 'Study for 60 minutes',
        description: 'Dedicated study session for exactly 60 minutes',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 60 },
        difficulty: 7,
      },
      {
        title: 'Write 1000 words',
        description: 'Write exactly 1000 words on any topic',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 65 },
        difficulty: 7,
      },
      {
        title: 'Solve 25 puzzles',
        description: 'Complete 25 crossword clues, sudoku cells, or brain teasers',
        priority: 'medium',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 60 },
        difficulty: 7,
      },
      // Difficulty 8 - Expert
      {
        title: 'Complete 90-min deep work',
        description: 'Focus on a complex task for exactly 90 minutes without interruption',
        priority: 'high',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 90 },
        difficulty: 8,
      },
      {
        title: 'Write 1500 words',
        description: 'Write exactly 1500 words on any topic',
        priority: 'high',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 95 },
        difficulty: 8,
      },
      {
        title: 'Solve 30 puzzles',
        description: 'Complete 30 crossword clues, sudoku cells, or brain teasers',
        priority: 'high',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 90 },
        difficulty: 8,
      },
      // Difficulty 9 - Master
      {
        title: 'Complete 120-min deep work',
        description: 'Focus on a complex task for exactly 120 minutes without interruption',
        priority: 'high',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 120 },
        difficulty: 9,
      },
      {
        title: 'Write 2000 words',
        description: 'Write exactly 2000 words on any topic',
        priority: 'high',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 125 },
        difficulty: 9,
      },
      {
        title: 'Solve 40 puzzles',
        description: 'Complete 40 crossword clues, sudoku cells, or brain teasers',
        priority: 'high',
        categories: ['mind'],
        statRewards: { mind: 1, xp: 120 },
        difficulty: 9,
      },
    ],
    body: [
      // Difficulty 0 - Easiest
      {
        title: 'Take 1 deep breath',
        description: 'Take exactly 1 slow, deep breath',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Stretch for 30 seconds',
        description: 'Do a simple stretch for exactly 30 seconds',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: 10 },
        difficulty: 0,
      },
      // Difficulty 1 - Very Easy
      {
        title: 'Take 5 deep breaths',
        description: 'Take exactly 5 slow, deep breaths',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Stretch for 2 minutes',
        description: 'Do a simple stretch for exactly 2 minutes',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Walk for 5 minutes',
        description: 'Go for a walk for exactly 5 minutes',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      // Difficulty 2 - Easy
      {
        title: 'Do 5 push-ups',
        description: 'Complete exactly 5 push-ups (modify form as needed)',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Stretch for 5 minutes',
        description: 'Do a focused stretching routine for exactly 5 minutes',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Walk for 10 minutes',
        description: 'Go for a walk for exactly 10 minutes',
        priority: 'low',
        categories: ['body'],
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
      // Difficulty 3 - Moderate
      {
        title: 'Do 10 push-ups',
        description: 'Complete exactly 10 push-ups (modify form as needed)',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 40 },
        difficulty: 3,
      },
      {
        title: 'Take a 15-min walk',
        description: 'Go for a brisk walk for exactly 15 minutes',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 40 },
        difficulty: 3,
      },
      {
        title: 'Do 20 jumping jacks',
        description: 'Complete exactly 20 jumping jacks',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 40 },
        difficulty: 3,
      },
      // Difficulty 4 - Medium
      {
        title: 'Do 20 push-ups',
        description: 'Complete exactly 20 push-ups in sets of 5',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 45 },
        difficulty: 4,
      },
      {
        title: 'Take a 30-min walk',
        description: 'Go for a brisk walk for exactly 30 minutes',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 45 },
        difficulty: 4,
      },
      {
        title: 'Do 50 jumping jacks',
        description: 'Complete exactly 50 jumping jacks in sets of 10',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 45 },
        difficulty: 4,
      },
      // Difficulty 5 - Challenging
      {
        title: 'Do 30 push-ups',
        description: 'Complete exactly 30 push-ups in sets of 10',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 50 },
        difficulty: 5,
      },
      {
        title: 'Do 100 jumping jacks',
        description: 'Complete exactly 100 jumping jacks in sets of 25',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 50 },
        difficulty: 5,
      },
      {
        title: 'Take a 45-min walk',
        description: 'Go for a brisk walk for exactly 45 minutes',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 50 },
        difficulty: 5,
      },
      // Difficulty 6 - Hard
      {
        title: 'Do 50 push-ups',
        description: 'Complete exactly 50 push-ups in sets of 10',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 55 },
        difficulty: 6,
      },
      {
        title: 'Do 150 jumping jacks',
        description: 'Complete exactly 150 jumping jacks in sets of 30',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 55 },
        difficulty: 6,
      },
      {
        title: 'Take a 60-min walk',
        description: 'Go for a brisk walk for exactly 60 minutes',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 55 },
        difficulty: 6,
      },
      // Difficulty 7 - Very Hard
      {
        title: 'Do 75 push-ups',
        description: 'Complete exactly 75 push-ups in sets of 15',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 60 },
        difficulty: 7,
      },
      {
        title: 'Do 200 jumping jacks',
        description: 'Complete exactly 200 jumping jacks in sets of 40',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 60 },
        difficulty: 7,
      },
      {
        title: 'Take a 90-min walk',
        description: 'Go for a brisk walk for exactly 90 minutes',
        priority: 'medium',
        categories: ['body'],
        statRewards: { body: 1, xp: 60 },
        difficulty: 7,
      },
      // Difficulty 8 - Expert
      {
        title: 'Do 100 push-ups',
        description: 'Complete exactly 100 push-ups in sets of 20',
        priority: 'high',
        categories: ['body'],
        statRewards: { body: 1, xp: 90 },
        difficulty: 8,
      },
      {
        title: 'Do 300 jumping jacks',
        description: 'Complete exactly 300 jumping jacks in sets of 50',
        priority: 'high',
        categories: ['body'],
        statRewards: { body: 1, xp: 90 },
        difficulty: 8,
      },
      {
        title: 'Take a 120-min walk',
        description: 'Go for a brisk walk for exactly 120 minutes',
        priority: 'high',
        categories: ['body'],
        statRewards: { body: 1, xp: 90 },
        difficulty: 8,
      },
      // Difficulty 9 - Master
      {
        title: 'Do 150 push-ups',
        description: 'Complete exactly 150 push-ups in sets of 25',
        priority: 'high',
        categories: ['body'],
        statRewards: { body: 1, xp: 110 },
        difficulty: 9,
      },
      {
        title: 'Do 500 jumping jacks',
        description: 'Complete exactly 500 jumping jacks in sets of 100',
        priority: 'high',
        categories: ['body'],
        statRewards: { body: 1, xp: 110 },
        difficulty: 9,
      },
      {
        title: 'Run 5 kilometers',
        description: 'Run exactly 5 kilometers at your own pace',
        priority: 'high',
        categories: ['body'],
        statRewards: { body: 1, xp: 110 },
        difficulty: 9,
      },
    ],
    soul: [
      // Difficulty 0 - Easiest
      {
        title: 'Light 1 candle',
        description: 'Light exactly 1 candle and watch it for 1 minute',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Say 1 thank you',
        description: 'Say thank you to someone or something',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 10 },
        difficulty: 0,
      },
      // Difficulty 1 - Very Easy
      {
        title: 'Light 3 candles',
        description: 'Light exactly 3 candles and watch them for 2 minutes',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Express 3 gratitudes',
        description: 'Write down or say exactly 3 things you\'re grateful for',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Take 10 deep breaths',
        description: 'Take exactly 10 slow, deep breaths',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 15 },
        difficulty: 1,
      },
      // Difficulty 2 - Easy
      {
        title: 'Express 5 gratitudes',
        description: 'Write down or say exactly 5 things you\'re grateful for',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Listen to 1 song mindfully',
        description: 'Listen to 1 song with full attention and presence',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Meditate for 2 minutes',
        description: 'Sit in meditation for exactly 2 minutes',
        priority: 'low',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 20 },
        difficulty: 2,
      },
      // Difficulty 3 - Moderate
      {
        title: 'Express 10 gratitudes',
        description: 'Write down or say exactly 10 things you\'re grateful for',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 40 },
        difficulty: 3,
      },
      {
        title: 'Listen to 3 songs mindfully',
        description: 'Listen to 3 songs with full attention and presence',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 40 },
        difficulty: 3,
      },
      {
        title: 'Meditate for 5 minutes',
        description: 'Sit in meditation for exactly 5 minutes',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 40 },
        difficulty: 3,
      },
      // Difficulty 4 - Medium
      {
        title: 'Journal for 10 minutes',
        description: 'Write in your journal for exactly 10 minutes',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 45 },
        difficulty: 4,
      },
      {
        title: 'Listen to 5 songs mindfully',
        description: 'Listen to 5 songs with full attention and presence',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 45 },
        difficulty: 4,
      },
      {
        title: 'Meditate for 10 minutes',
        description: 'Sit in meditation for exactly 10 minutes',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 45 },
        difficulty: 4,
      },
      // Difficulty 5 - Challenging
      {
        title: 'Journal for 20 minutes',
        description: 'Write in your journal for exactly 20 minutes',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 50 },
        difficulty: 5,
      },
      {
        title: 'Meditate for 15 minutes',
        description: 'Sit in meditation for exactly 15 minutes',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 50 },
        difficulty: 5,
      },
      {
        title: 'Connect with 1 friend',
        description: 'Reach out to 1 person you care about',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 50 },
        difficulty: 5,
      },
      // Difficulty 6 - Hard
      {
        title: 'Journal for 30 minutes',
        description: 'Write in your journal for exactly 30 minutes',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 55 },
        difficulty: 6,
      },
      {
        title: 'Meditate for 20 minutes',
        description: 'Sit in meditation for exactly 20 minutes',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 55 },
        difficulty: 6,
      },
      {
        title: 'Connect with 2 friends',
        description: 'Reach out to 2 people you care about',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 55 },
        difficulty: 6,
      },
      // Difficulty 7 - Very Hard
      {
        title: 'Journal for 45 minutes',
        description: 'Write in your journal for exactly 45 minutes',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 60 },
        difficulty: 7,
      },
      {
        title: 'Meditate for 30 minutes',
        description: 'Sit in meditation for exactly 30 minutes',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 60 },
        difficulty: 7,
      },
      {
        title: 'Connect with 3 friends',
        description: 'Reach out to 3 people you care about',
        priority: 'medium',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 60 },
        difficulty: 7,
      },
      // Difficulty 8 - Expert
      {
        title: 'Journal for 60 minutes',
        description: 'Write in your journal for exactly 60 minutes',
        priority: 'high',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 90 },
        difficulty: 8,
      },
      {
        title: 'Meditate for 45 minutes',
        description: 'Sit in meditation for exactly 45 minutes',
        priority: 'high',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 90 },
        difficulty: 8,
      },
      {
        title: 'Connect with 5 friends',
        description: 'Reach out to 5 people you care about',
        priority: 'high',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 90 },
        difficulty: 8,
      },
      // Difficulty 9 - Master
      {
        title: 'Journal for 90 minutes',
        description: 'Write in your journal for exactly 90 minutes',
        priority: 'high',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 120 },
        difficulty: 9,
      },
      {
        title: 'Meditate for 60 minutes',
        description: 'Sit in meditation for exactly 60 minutes',
        priority: 'high',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 120 },
        difficulty: 9,
      },
      {
        title: 'Face 3 inner truths',
        description: 'Confront 3 difficult truths about yourself',
        priority: 'high',
        categories: ['soul'],
        statRewards: { soul: 1, xp: 120 },
        difficulty: 9,
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