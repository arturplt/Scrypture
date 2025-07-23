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
    title: 'Read 1 page',
    description: 'Read one page of any book or article',
    priority: 'low',
    category: 'mind',
    statRewards: { mind: 1, xp: 10 },
    difficulty: 1,
  },
  {
    title: 'Write 1 idea',
    description: 'Write down one new idea or thought',
    priority: 'low',
    category: 'mind',
    statRewards: { mind: 1, xp: 15 },
    difficulty: 2,
  },
  {
    title: 'Learn one new word',
    description: 'Look up and learn the meaning of one new word',
    priority: 'low',
    category: 'mind',
    statRewards: { mind: 1, xp: 10 },
    difficulty: 0,
  },

  // 🧠 MIND - Medium Priority
  {
    title: 'Reflect for 10 mins',
    description: 'Spend 10 minutes in quiet reflection or contemplation',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, xp: 30 },
    difficulty: 4,
  },
  {
    title: 'Learn something new',
    description: 'Research and learn about a new topic for 15 minutes',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, xp: 40 },
    difficulty: 5,
  },
  {
    title: 'Solve a puzzle',
    description: 'Complete a crossword, sudoku, or brain teaser',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, xp: 35 },
    difficulty: 4,
  },

  // 🧠 MIND - High Priority
  {
    title: 'Complete deep work sprint',
    description: 'Focus on a complex task for 45 minutes without interruption',
    priority: 'high',
    category: 'mind',
    statRewards: { mind: 1, xp: 70 },
    difficulty: 7,
  },
  {
    title: 'Solve a tough problem',
    description: 'Tackle a challenging intellectual problem or project',
    priority: 'high',
    category: 'mind',
    statRewards: { mind: 1, xp: 100 },
    difficulty: 9,
  },
  {
    title: 'Create something complex',
    description: 'Build, write, or design something that requires deep thinking',
    priority: 'high',
    category: 'mind',
    statRewards: { mind: 1, xp: 80 },
    difficulty: 8,
  },

  // 💪 BODY - Low Priority
  {
    title: 'Stretch for 3 mins',
    description: 'Do a quick stretching routine',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, xp: 10 },
    difficulty: 1,
  },
  {
    title: 'Drink water',
    description: 'Drink a full glass of water',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, xp: 10 },
    difficulty: 0,
  },
  {
    title: 'Take 10 deep breaths',
    description: 'Focus on your breathing for 2 minutes',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, xp: 10 },
    difficulty: 1,
  },

  // 💪 BODY - Medium Priority
  {
    title: 'Take a 15-min walk',
    description: 'Go for a brisk walk around your neighborhood',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 30 },
    difficulty: 3,
  },
  {
    title: 'Cook a healthy meal',
    description: 'Prepare a nutritious meal from scratch',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 40 },
    difficulty: 5,
  },
  {
    title: 'Do 20 push-ups',
    description: 'Complete 20 push-ups (modify as needed)',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 35 },
    difficulty: 4,
  },

  // 💪 BODY - High Priority
  {
    title: 'Exercise 30 mins',
    description: 'Complete a full workout session',
    priority: 'high',
    category: 'body',
    statRewards: { body: 1, xp: 70 },
    difficulty: 7,
  },
  {
    title: 'Master a physical skill',
    description: 'Practice and improve a physical skill or sport',
    priority: 'high',
    category: 'body',
    statRewards: { body: 1, xp: 100 },
    difficulty: 9,
  },
  {
    title: 'Complete a fitness challenge',
    description: 'Push your physical limits with a challenging workout',
    priority: 'high',
    category: 'body',
    statRewards: { body: 1, xp: 80 },
    difficulty: 8,
  },

  // ✨ SOUL - Low Priority
  {
    title: 'Light a candle',
    description: 'Create a moment of peace with candlelight',
    priority: 'low',
    category: 'soul',
    statRewards: { soul: 1, xp: 10 },
    difficulty: 0,
  },
  {
    title: 'Take 3 deep breaths',
    description: 'Pause and take three slow, deep breaths',
    priority: 'low',
    category: 'soul',
    statRewards: { soul: 1, xp: 10 },
    difficulty: 1,
  },
  {
    title: 'Express gratitude',
    description: 'Write down or say three things you\'re grateful for',
    priority: 'low',
    category: 'soul',
    statRewards: { soul: 1, xp: 10 },
    difficulty: 1,
  },

  // ✨ SOUL - Medium Priority
  {
    title: 'Journal a feeling',
    description: 'Write about your current emotional state',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 30 },
    difficulty: 3,
  },
  {
    title: 'Connect with a friend',
    description: 'Reach out to someone you care about',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 40 },
    difficulty: 4,
  },
  {
    title: 'Practice self-compassion',
    description: 'Be kind to yourself for 10 minutes',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 35 },
    difficulty: 4,
  },

  // ✨ SOUL - High Priority
  {
    title: 'Meditate 20 mins',
    description: 'Sit in meditation for 20 minutes',
    priority: 'high',
    category: 'soul',
    statRewards: { soul: 1, xp: 70 },
    difficulty: 7,
  },
  {
    title: 'Face an inner truth',
    description: 'Confront a difficult truth about yourself',
    priority: 'high',
    category: 'soul',
    statRewards: { soul: 1, xp: 100 },
    difficulty: 9,
  },
  {
    title: 'Forgive someone',
    description: 'Practice forgiveness for yourself or another',
    priority: 'high',
    category: 'soul',
    statRewards: { soul: 1, xp: 80 },
    difficulty: 8,
  },

  // Mixed Attributes - Low Priority
  {
    title: 'Read while stretching',
    description: 'Read a book while doing gentle stretches',
    priority: 'low',
    category: 'mind',
    statRewards: { mind: 1, body: 1, xp: 20 },
    difficulty: 2,
  },
  {
    title: 'Mindful walking',
    description: 'Take a walk while practicing mindfulness',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, soul: 1, xp: 20 },
    difficulty: 2,
  },

  // Mixed Attributes - Medium Priority
  {
    title: 'Learn a new skill',
    description: 'Study and practice a new skill for 30 minutes',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, body: 1, xp: 50 },
    difficulty: 5,
  },
  {
    title: 'Creative expression',
    description: 'Express yourself through art, music, or writing',
    priority: 'medium',
    category: 'soul',
    statRewards: { mind: 1, soul: 1, xp: 50 },
    difficulty: 5,
  },

  // Mixed Attributes - High Priority
  {
    title: 'Transform yourself',
    description: 'Make a significant positive change in your life',
    priority: 'high',
    category: 'soul',
    statRewards: { body: 1, mind: 1, soul: 1, xp: 100 },
    difficulty: 9,
  },
  {
    title: 'Master a discipline',
    description: 'Dedicate yourself to mastering a complex skill',
    priority: 'high',
    category: 'mind',
    statRewards: { mind: 1, body: 1, xp: 90 },
    difficulty: 8,
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