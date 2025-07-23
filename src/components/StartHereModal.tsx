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
      {
        title: 'Read 1 page',
        description: 'Read exactly 1 page of any book or article',
        priority: 'low',
        category: 'mind',
        statRewards: { mind: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Write 1 idea',
        description: 'Write down 1 new idea or thought',
        priority: 'low',
        category: 'mind',
        statRewards: { mind: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Learn 3 new words',
        description: 'Look up and learn the meaning of 3 new words',
        priority: 'low',
        category: 'mind',
        statRewards: { mind: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Study for 10 minutes',
        description: 'Dedicated study session for exactly 10 minutes',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 25 },
        difficulty: 3,
      },
      {
        title: 'Write 100 words',
        description: 'Write exactly 100 words on any topic',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 30 },
        difficulty: 4,
      },
      {
        title: 'Solve 5 puzzles',
        description: 'Complete 5 crossword clues, sudoku cells, or brain teasers',
        priority: 'medium',
        category: 'mind',
        statRewards: { mind: 1, xp: 35 },
        difficulty: 5,
      },
    ],
    body: [
      {
        title: 'Drink 1 glass of water',
        description: 'Stay hydrated with 1 full glass of water',
        priority: 'low',
        category: 'body',
        statRewards: { body: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Take 5 deep breaths',
        description: 'Pause and take exactly 5 slow, deep breaths',
        priority: 'low',
        category: 'body',
        statRewards: { body: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Do 5 push-ups',
        description: 'Complete exactly 5 push-ups (modify form as needed)',
        priority: 'low',
        category: 'body',
        statRewards: { body: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Take a 15-min walk',
        description: 'Go for a brisk walk for exactly 15 minutes',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 25 },
        difficulty: 3,
      },
      {
        title: 'Do 20 sit-ups',
        description: 'Complete exactly 20 sit-ups or crunches',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 30 },
        difficulty: 4,
      },
      {
        title: 'Do 50 jumping jacks',
        description: 'Complete exactly 50 jumping jacks in sets of 10',
        priority: 'medium',
        category: 'body',
        statRewards: { body: 1, xp: 35 },
        difficulty: 5,
      },
    ],
    soul: [
      {
        title: 'Light 1 candle',
        description: 'Create a peaceful atmosphere with 1 candle',
        priority: 'low',
        category: 'soul',
        statRewards: { soul: 1, xp: 10 },
        difficulty: 0,
      },
      {
        title: 'Express 1 gratitude',
        description: 'Write down or say 1 thing you\'re grateful for',
        priority: 'low',
        category: 'soul',
        statRewards: { soul: 1, xp: 15 },
        difficulty: 1,
      },
      {
        title: 'Listen to 1 song mindfully',
        description: 'Listen to 1 song with full attention and presence',
        priority: 'low',
        category: 'soul',
        statRewards: { soul: 1, xp: 20 },
        difficulty: 2,
      },
      {
        title: 'Reflect for 5 minutes',
        description: 'Spend exactly 5 minutes in quiet reflection',
        priority: 'medium',
        category: 'soul',
        statRewards: { soul: 1, xp: 25 },
        difficulty: 3,
      },
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
        statRewards: { soul: 1, xp: 35 },
        difficulty: 5,
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