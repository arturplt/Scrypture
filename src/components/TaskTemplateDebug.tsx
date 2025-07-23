import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import styles from './TaskForm.module.css';

interface TaskTemplate {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  statRewards: {
    body?: number;
    mind?: number;
    soul?: number;
    xp: number;
  };
  difficulty: number;
}

const taskTemplates: TaskTemplate[] = [
  // 🧠 MIND - Low Priority
  {
    title: 'Read 5 pages',
    description: 'Read exactly 5 pages of any book or article',
    priority: 'low',
    category: 'mind',
    statRewards: { mind: 1, xp: 15 },
    difficulty: 1,
  },
  {
    title: 'Write 3 ideas',
    description: 'Write down exactly 3 new ideas or thoughts',
    priority: 'low',
    category: 'mind',
    statRewards: { mind: 1, xp: 20 },
    difficulty: 2,
  },
  {
    title: 'Learn 5 new words',
    description: 'Look up and learn the meaning of 5 new words',
    priority: 'low',
    category: 'mind',
    statRewards: { mind: 1, xp: 25 },
    difficulty: 1,
  },
  {
    title: 'Solve 3 math problems',
    description: 'Complete 3 math problems of any difficulty',
    priority: 'low',
    category: 'mind',
    statRewards: { mind: 1, xp: 20 },
    difficulty: 2,
  },
  {
    title: 'Memorize 10 facts',
    description: 'Learn and memorize 10 facts about any topic',
    priority: 'low',
    category: 'mind',
    statRewards: { mind: 1, xp: 25 },
    difficulty: 2,
  },

  // 🧠 MIND - Medium Priority
  {
    title: 'Reflect for 15 minutes',
    description: 'Spend exactly 15 minutes in quiet reflection',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, xp: 40 },
    difficulty: 4,
  },
  {
    title: 'Learn 3 new concepts',
    description: 'Research and understand 3 new concepts for 20 minutes',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, xp: 50 },
    difficulty: 5,
  },
  {
    title: 'Solve 5 puzzles',
    description: 'Complete 5 crossword clues, sudoku cells, or brain teasers',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, xp: 45 },
    difficulty: 4,
  },
  {
    title: 'Write 500 words',
    description: 'Write exactly 500 words on any topic',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, xp: 55 },
    difficulty: 5,
  },
  {
    title: 'Study for 30 minutes',
    description: 'Dedicated study session for exactly 30 minutes',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, xp: 50 },
    difficulty: 5,
  },

  // 🧠 MIND - High Priority
  {
    title: 'Complete 60-min deep work',
    description: 'Focus on a complex task for exactly 60 minutes without interruption',
    priority: 'high',
    category: 'mind',
    statRewards: { mind: 1, xp: 90 },
    difficulty: 8,
  },
  {
    title: 'Solve 10 complex problems',
    description: 'Tackle 10 challenging intellectual problems or projects',
    priority: 'high',
    category: 'mind',
    statRewards: { mind: 1, xp: 120 },
    difficulty: 9,
  },
  {
    title: 'Create 1000-word document',
    description: 'Write a comprehensive 1000-word document on any topic',
    priority: 'high',
    category: 'mind',
    statRewards: { mind: 1, xp: 100 },
    difficulty: 8,
  },
  {
    title: 'Master 5 new skills',
    description: 'Learn and practice 5 new skills for 2 hours total',
    priority: 'high',
    category: 'mind',
    statRewards: { mind: 1, xp: 110 },
    difficulty: 9,
  },
  {
    title: 'Analyze 3 complex topics',
    description: 'Deep dive analysis of 3 complex topics for 90 minutes',
    priority: 'high',
    category: 'mind',
    statRewards: { mind: 1, xp: 95 },
    difficulty: 8,
  },

  // 💪 BODY - Low Priority
  {
    title: 'Do 10 push-ups',
    description: 'Complete exactly 10 push-ups (modify form as needed)',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, xp: 20 },
    difficulty: 2,
  },
  {
    title: 'Do 15 sit-ups',
    description: 'Complete exactly 15 sit-ups or crunches',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, xp: 20 },
    difficulty: 2,
  },
  {
    title: 'Stretch for 5 minutes',
    description: 'Do a focused stretching routine for exactly 5 minutes',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, xp: 15 },
    difficulty: 1,
  },
  {
    title: 'Drink 3 glasses of water',
    description: 'Drink exactly 3 full glasses of water',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, xp: 15 },
    difficulty: 0,
  },
  {
    title: 'Take 20 deep breaths',
    description: 'Focus on your breathing for exactly 20 deep breaths',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, xp: 15 },
    difficulty: 1,
  },
  {
    title: 'Do 20 jumping jacks',
    description: 'Complete exactly 20 jumping jacks',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, xp: 20 },
    difficulty: 2,
  },
  {
    title: 'Walk for 10 minutes',
    description: 'Take a brisk walk for exactly 10 minutes',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, xp: 20 },
    difficulty: 2,
  },

  // 💪 BODY - Medium Priority
  {
    title: 'Do 30 push-ups',
    description: 'Complete exactly 30 push-ups in sets of 10',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 45 },
    difficulty: 4,
  },
  {
    title: 'Do 50 sit-ups',
    description: 'Complete exactly 50 sit-ups or crunches',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 45 },
    difficulty: 4,
  },
  {
    title: 'Take a 30-min walk',
    description: 'Go for a brisk walk for exactly 30 minutes',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 40 },
    difficulty: 3,
  },
  {
    title: 'Cook a healthy meal',
    description: 'Prepare a nutritious meal from scratch with 5+ ingredients',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 50 },
    difficulty: 5,
  },
  {
    title: 'Do 100 jumping jacks',
    description: 'Complete exactly 100 jumping jacks in sets of 25',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 50 },
    difficulty: 4,
  },
  {
    title: 'Stretch for 15 minutes',
    description: 'Complete a comprehensive 15-minute stretching routine',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 40 },
    difficulty: 3,
  },
  {
    title: 'Do 20 burpees',
    description: 'Complete exactly 20 burpees (modify as needed)',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 55 },
    difficulty: 5,
  },

  // 💪 BODY - High Priority
  {
    title: 'Do 100 push-ups',
    description: 'Complete exactly 100 push-ups in sets of 20',
    priority: 'high',
    category: 'body',
    statRewards: { body: 1, xp: 90 },
    difficulty: 8,
  },
  {
    title: 'Do 200 sit-ups',
    description: 'Complete exactly 200 sit-ups in sets of 25',
    priority: 'high',
    category: 'body',
    statRewards: { body: 1, xp: 90 },
    difficulty: 8,
  },
  {
    title: 'Exercise for 60 minutes',
    description: 'Complete a full workout session for exactly 60 minutes',
    priority: 'high',
    category: 'body',
    statRewards: { body: 1, xp: 100 },
    difficulty: 8,
  },
  {
    title: 'Run 5 kilometers',
    description: 'Run exactly 5 kilometers at your own pace',
    priority: 'high',
    category: 'body',
    statRewards: { body: 1, xp: 110 },
    difficulty: 9,
  },
  {
    title: 'Do 50 burpees',
    description: 'Complete exactly 50 burpees in sets of 10',
    priority: 'high',
    category: 'body',
    statRewards: { body: 1, xp: 95 },
    difficulty: 8,
  },
  {
    title: 'Complete 3 workout circuits',
    description: 'Do 3 complete circuits of a 10-exercise workout',
    priority: 'high',
    category: 'body',
    statRewards: { body: 1, xp: 105 },
    difficulty: 9,
  },

  // ✨ SOUL - Low Priority
  {
    title: 'Light 3 candles',
    description: 'Create a peaceful atmosphere with 3 candles',
    priority: 'low',
    category: 'soul',
    statRewards: { soul: 1, xp: 15 },
    difficulty: 0,
  },
  {
    title: 'Take 10 deep breaths',
    description: 'Pause and take exactly 10 slow, deep breaths',
    priority: 'low',
    category: 'soul',
    statRewards: { soul: 1, xp: 15 },
    difficulty: 1,
  },
  {
    title: 'Express 5 gratitudes',
    description: 'Write down or say exactly 5 things you\'re grateful for',
    priority: 'low',
    category: 'soul',
    statRewards: { soul: 1, xp: 20 },
    difficulty: 1,
  },
  {
    title: 'Listen to 3 songs mindfully',
    description: 'Listen to 3 songs with full attention and presence',
    priority: 'low',
    category: 'soul',
    statRewards: { soul: 1, xp: 20 },
    difficulty: 2,
  },
  {
    title: 'Write 3 positive affirmations',
    description: 'Write exactly 3 positive affirmations about yourself',
    priority: 'low',
    category: 'soul',
    statRewards: { soul: 1, xp: 20 },
    difficulty: 2,
  },

  // ✨ SOUL - Medium Priority
  {
    title: 'Journal for 20 minutes',
    description: 'Write in your journal for exactly 20 minutes',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 45 },
    difficulty: 4,
  },
  {
    title: 'Connect with 3 friends',
    description: 'Reach out to 3 people you care about',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 50 },
    difficulty: 4,
  },
  {
    title: 'Practice self-compassion for 15 minutes',
    description: 'Be kind to yourself for exactly 15 minutes',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 45 },
    difficulty: 4,
  },
  {
    title: 'Meditate for 15 minutes',
    description: 'Sit in meditation for exactly 15 minutes',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 50 },
    difficulty: 5,
  },
  {
    title: 'Write 10 things you love',
    description: 'Write exactly 10 things you love about yourself or life',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 45 },
    difficulty: 4,
  },
  {
    title: 'Practice forgiveness for 20 minutes',
    description: 'Spend 20 minutes practicing forgiveness meditation',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 55 },
    difficulty: 5,
  },

  // ✨ SOUL - High Priority
  {
    title: 'Meditate for 45 minutes',
    description: 'Sit in meditation for exactly 45 minutes',
    priority: 'high',
    category: 'soul',
    statRewards: { soul: 1, xp: 90 },
    difficulty: 8,
  },
  {
    title: 'Face 3 inner truths',
    description: 'Confront 3 difficult truths about yourself',
    priority: 'high',
    category: 'soul',
    statRewards: { soul: 1, xp: 120 },
    difficulty: 9,
  },
  {
    title: 'Forgive 5 people',
    description: 'Practice forgiveness for yourself and 4 others',
    priority: 'high',
    category: 'soul',
    statRewards: { soul: 1, xp: 100 },
    difficulty: 8,
  },
  {
    title: 'Write your life story',
    description: 'Write a 2000-word autobiography or life reflection',
    priority: 'high',
    category: 'soul',
    statRewards: { soul: 1, xp: 110 },
    difficulty: 9,
  },
  {
    title: 'Practice loving-kindness for 30 minutes',
    description: 'Practice loving-kindness meditation for exactly 30 minutes',
    priority: 'high',
    category: 'soul',
    statRewards: { soul: 1, xp: 95 },
    difficulty: 8,
  },

  // Mixed Attributes - Low Priority
  {
    title: 'Read while stretching',
    description: 'Read 10 pages while doing gentle stretches',
    priority: 'low',
    category: 'mind',
    statRewards: { mind: 1, body: 1, xp: 30 },
    difficulty: 3,
  },
  {
    title: 'Mindful walking for 15 minutes',
    description: 'Take a 15-minute walk while practicing mindfulness',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, soul: 1, xp: 30 },
    difficulty: 3,
  },
  {
    title: 'Learn 5 words while exercising',
    description: 'Learn 5 new words while doing 20 jumping jacks',
    priority: 'low',
    category: 'mind',
    statRewards: { mind: 1, body: 1, xp: 35 },
    difficulty: 3,
  },

  // Mixed Attributes - Medium Priority
  {
    title: 'Learn 10 new skills',
    description: 'Study and practice 10 new skills for 45 minutes',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, body: 1, xp: 70 },
    difficulty: 6,
  },
  {
    title: 'Creative expression for 30 minutes',
    description: 'Express yourself through art, music, or writing for 30 minutes',
    priority: 'medium',
    category: 'soul',
    statRewards: { mind: 1, soul: 1, xp: 70 },
    difficulty: 6,
  },
  {
    title: 'Exercise while learning',
    description: 'Do 50 push-ups while listening to an educational podcast',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, mind: 1, xp: 75 },
    difficulty: 6,
  },
  {
    title: 'Mindful workout',
    description: 'Complete a 30-minute workout with full mindfulness',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, soul: 1, xp: 70 },
    difficulty: 6,
  },

  // Mixed Attributes - High Priority
  {
    title: 'Transform yourself in 3 areas',
    description: 'Make significant positive changes in mind, body, and soul',
    priority: 'high',
    category: 'soul',
    statRewards: { body: 1, mind: 1, soul: 1, xp: 150 },
    difficulty: 10,
  },
  {
    title: 'Master 3 disciplines',
    description: 'Dedicate yourself to mastering 3 complex skills',
    priority: 'high',
    category: 'mind',
    statRewards: { mind: 1, body: 1, xp: 130 },
    difficulty: 9,
  },
  {
    title: 'Complete triathlon training',
    description: 'Train for swimming, cycling, and running for 90 minutes',
    priority: 'high',
    category: 'body',
    statRewards: { body: 1, mind: 1, xp: 140 },
    difficulty: 9,
  },
  {
    title: 'Create masterpiece',
    description: 'Create a significant work of art, writing, or music',
    priority: 'high',
    category: 'soul',
    statRewards: { mind: 1, soul: 1, xp: 120 },
    difficulty: 9,
  },
];

export const TaskTemplateDebug: React.FC = () => {
  const { addTask } = useTasks();
  const [isVisible, setIsVisible] = useState(false);

  const addAllTemplates = () => {
    taskTemplates.forEach((template) => {
      addTask({
        title: template.title,
        description: template.description,
        completed: false,
        priority: template.priority,
        category: template.category,
        statRewards: template.statRewards,
        difficulty: template.difficulty,
      });
    });
  };

  const addRandomTemplate = () => {
    const randomTemplate = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
    addTask({
      title: randomTemplate.title,
      description: randomTemplate.description,
      completed: false,
      priority: randomTemplate.priority,
      category: randomTemplate.category,
      statRewards: randomTemplate.statRewards,
      difficulty: randomTemplate.difficulty,
    });
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '8px 16px',
          backgroundColor: '#2a3a7b',
          color: 'white',
          border: '2px solid #3a4a9b',
          borderRadius: '0px',
          fontFamily: 'Press Start 2P, monospace',
          fontSize: '12px',
          cursor: 'pointer',
        }}
      >
        🎲 Start Here
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        backgroundColor: 'var(--color-bg-primary)',
        border: '4px solid var(--color-border-primary)',
        padding: '16px',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontFamily: 'Press Start 2P, monospace', fontSize: '14px' }}>Task Templates</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', marginBottom: '8px', fontFamily: 'Press Start 2P, monospace' }}>
          Total templates: {taskTemplates.length}
        </p>
        <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontFamily: 'Press Start 2P, monospace' }}>
          Covers Mind, Body, Soul with varying difficulty (0-9) and XP (10-100)
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={addAllTemplates}
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--color-accent-gold)',
            color: 'var(--color-bg-primary)',
            border: '2px solid var(--color-accent-gold)',
            borderRadius: '0px',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '10px',
            cursor: 'pointer',
            flex: 1,
          }}
        >
          Add All ({taskTemplates.length})
        </button>
        <button
          onClick={addRandomTemplate}
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            border: '2px solid var(--color-border-primary)',
            borderRadius: '0px',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '10px',
            cursor: 'pointer',
            flex: 1,
          }}
        >
          Add Random
        </button>
      </div>

      <div style={{ fontSize: '10px', fontFamily: 'Press Start 2P, monospace' }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>🧠 Mind:</strong> {taskTemplates.filter(t => t.category === 'mind').length} tasks
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>💪 Body:</strong> {taskTemplates.filter(t => t.category === 'body').length} tasks
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>✨ Soul:</strong> {taskTemplates.filter(t => t.category === 'soul').length} tasks
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Mixed:</strong> {taskTemplates.filter(t => t.statRewards.body && t.statRewards.mind || t.statRewards.mind && t.statRewards.soul || t.statRewards.body && t.statRewards.soul).length} tasks
        </div>
      </div>
    </div>
  );
}; 