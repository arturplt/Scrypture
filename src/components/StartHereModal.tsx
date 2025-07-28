import React, { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useHabits } from '../hooks/useHabits';

import styles from './StartHereModal.module.css';

interface StartHereModalProps {
  isOpen: boolean;
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

export const StartHereModal: React.FC<StartHereModalProps> = ({ isOpen, onClose }) => {
  const { addTask } = useTasks();
  const { addHabit } = useHabits();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [givenTasks, setGivenTasks] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['mind', 'body', 'soul', 'home', 'free time', 'garden']));

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
      // Difficulty 0 - Easiest
      {
        title: 'Make your bed',
        description: 'Start your day by making your bed',
        priority: 'low',
        categories: ['home'],
        statRewards: { body: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Wash 1 dish',
        description: 'Wash exactly 1 dish or cup',
        priority: 'low',
        categories: ['home'],
        statRewards: { body: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Pick up 3 items',
        description: 'Pick up and put away exactly 3 items',
        priority: 'low',
        categories: ['home'],
        statRewards: { body: 1, xp: 10 },
        difficulty: 0,
      },
      // Difficulty 1 - Very Easy
      {
        title: 'Wash 5 dishes',
        description: 'Wash exactly 5 dishes or cups',
        priority: 'low',
        categories: ['home'],
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Pick up 10 items',
        description: 'Pick up and put away exactly 10 items',
        priority: 'low',
        categories: ['home'],
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Wipe 1 surface',
        description: 'Wipe down exactly 1 surface (table, counter, etc.)',
        priority: 'low',
        categories: ['home'],
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      // Difficulty 2 - Easy
      {
        title: 'Do 1 load of laundry',
        description: 'Wash, dry, and fold 1 load of laundry',
        priority: 'medium',
        categories: ['home'],
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Clean 1 room',
        description: 'Clean exactly 1 room thoroughly',
        priority: 'medium',
        categories: ['home'],
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Organize 1 drawer',
        description: 'Organize exactly 1 drawer or small space',
        priority: 'medium',
        categories: ['home'],
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
    ],
    'free time': [
      // Difficulty 0 - Easiest
      {
        title: 'Play 1 song',
        description: 'Listen to exactly 1 song you enjoy',
        priority: 'low',
        categories: ['free time'],
        statRewards: { soul: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Watch 1 episode',
        description: 'Watch exactly 1 episode of a show you like',
        priority: 'low',
        categories: ['free time'],
        statRewards: { soul: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Play 1 game',
        description: 'Play exactly 1 game (video game, board game, etc.)',
        priority: 'low',
        categories: ['free time'],
        statRewards: { soul: 1, xp: 10 },
        difficulty: 0,
      },
      // Difficulty 1 - Very Easy
      {
        title: 'Read 1 chapter',
        description: 'Read exactly 1 chapter of a book you enjoy',
        priority: 'low',
        categories: ['free time'],
        statRewards: { soul: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Draw 1 picture',
        description: 'Draw exactly 1 picture of anything',
        priority: 'low',
        categories: ['free time'],
        statRewards: { soul: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Cook 1 meal',
        description: 'Cook exactly 1 meal for yourself',
        priority: 'low',
        categories: ['free time'],
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      // Difficulty 2 - Easy
      {
        title: 'Learn 1 new skill',
        description: 'Spend 30 minutes learning 1 new skill',
        priority: 'medium',
        categories: ['free time', 'mind'],
        statRewards: { mind: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Create 1 art piece',
        description: 'Create exactly 1 piece of art (drawing, painting, etc.)',
        priority: 'medium',
        categories: ['free time'],
        statRewards: { soul: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Visit 1 new place',
        description: 'Visit exactly 1 new place in your area',
        priority: 'medium',
        categories: ['free time'],
        statRewards: { soul: 1, xp: 20 },
        difficulty: 2,
      },
    ],
    garden: [
      // Difficulty 0 - Easiest
      {
        title: 'Water 1 plant',
        description: 'Water exactly 1 plant in your home or garden',
        priority: 'low',
        categories: ['garden'],
        statRewards: { body: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Look at 1 plant',
        description: 'Spend 1 minute looking at and appreciating 1 plant',
        priority: 'low',
        categories: ['garden'],
        statRewards: { soul: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Touch 1 plant',
        description: 'Gently touch and feel 1 plant',
        priority: 'low',
        categories: ['garden'],
        statRewards: { soul: 1, xp: 10 },
        difficulty: 0,
      },
      // Difficulty 1 - Very Easy
      {
        title: 'Water 3 plants',
        description: 'Water exactly 3 plants in your home or garden',
        priority: 'low',
        categories: ['garden'],
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Plant 1 seed',
        description: 'Plant exactly 1 seed in a pot or garden',
        priority: 'low',
        categories: ['garden'],
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Prune 1 plant',
        description: 'Prune exactly 1 plant (remove dead leaves, etc.)',
        priority: 'low',
        categories: ['garden'],
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      // Difficulty 2 - Easy
      {
        title: 'Repot 1 plant',
        description: 'Repot exactly 1 plant into a larger container',
        priority: 'medium',
        categories: ['garden'],
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Fertilize 3 plants',
        description: 'Fertilize exactly 3 plants in your garden',
        priority: 'medium',
        categories: ['garden'],
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Create 1 garden plan',
        description: 'Plan exactly 1 new garden area or container',
        priority: 'medium',
        categories: ['garden', 'mind'],
        statRewards: { mind: 1, xp: 20 },
        difficulty: 2,
      },
    ],
  };

  const getNextTask = (category: string): TaskTemplate | null => {
    const tasks = taskTemplates[category];
    if (!tasks) return null;
    
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
    const tasks = taskTemplates[category];
    if (!tasks) return 0;
    
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

  const getNextTaskForCategory = (category: string): TaskTemplate | null => {
    return getNextTask(category);
  };

  const getCompletedTasksForCategory = (category: string): TaskTemplate[] => {
    const tasks = taskTemplates[category];
    if (!tasks) return [];
    
    const categoryKey = `${category}_`;
    const completedTasks: TaskTemplate[] = [];
    
    for (const task of tasks) {
      const taskKey = `${categoryKey}${task.difficulty}`;
      if (givenTasks.has(taskKey)) {
        completedTasks.push(task);
      }
    }
    
    return completedTasks;
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleCategoryExpand = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleAddMultipleTasks = () => {
    selectedCategories.forEach(category => {
      handleAddTask(category);
    });
    setSelectedCategories([]);
  };

  const availableCategories = ['mind', 'body', 'soul', 'home', 'free time', 'garden'];

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
            Choose categories to get started with progressively challenging tasks:
          </p>
          
          {selectedCategories.length > 0 && (
            <div className={styles.multiSelectActions}>
              <p>Selected categories: {selectedCategories.join(', ')}</p>
              <button 
                className={styles.addMultipleButton}
                onClick={handleAddMultipleTasks}
              >
                Add Tasks for All Selected Categories
              </button>
            </div>
          )}
          
          <div className={styles.categories}>
            {availableCategories.map((category) => {
              const nextTask = getNextTaskForCategory(category);
              const progress = getProgressForCategory(category);
              // const isCompleted = progress === 100; // Unused variable
              const isSelected = selectedCategories.includes(category);
              
              const completedTasks = getCompletedTasksForCategory(category);
              
              return (
                <div 
                  key={category} 
                  className={`${styles.categoryCard} ${isSelected ? styles.selected : ''} ${expandedCategories.has(category) ? styles.expanded : ''}`}
                  onClick={() => handleCategoryToggle(category)}
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
                  
                  <button 
                    className={styles.expandButton}
                    onClick={(e) => handleCategoryExpand(category, e)}
                  >
                    {expandedCategories.has(category) ? '▼' : '▶'}
                  </button>
                  
                  {expandedCategories.has(category) && (
                    <>
                      {completedTasks.length > 0 && (
                        <div className={styles.completedTasksSection}>
                          <h4 className={styles.completedTasksTitle}>Completed Tasks</h4>
                          <div className={styles.completedTasksList}>
                            {completedTasks.map((task, index) => (
                              <div key={index} className={styles.completedTaskItem}>
                                <span className={styles.completedTaskTitle}>✅ {task.title}</span>
                                <span className={styles.completedTaskDifficulty}>(Difficulty {task.difficulty})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {nextTask ? (
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
          </div>
        </div>
      </div>
    </div>
  );
};