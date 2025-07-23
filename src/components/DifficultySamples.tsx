import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import styles from './TaskForm.module.css';

interface DifficultySample {
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

const difficultySamples: DifficultySample[] = [
  // Difficulty 0 - Easiest
  {
    title: 'Drink 3 glasses of water',
    description: 'Stay hydrated with exactly 3 full glasses of water',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, xp: 15 },
    difficulty: 0,
  },
  {
    title: 'Light 3 candles',
    description: 'Create a peaceful atmosphere with 3 candles',
    priority: 'low',
    category: 'soul',
    statRewards: { soul: 1, xp: 15 },
    difficulty: 0,
  },

  // Difficulty 1 - Very Easy
  {
    title: 'Take 10 deep breaths',
    description: 'Pause and take exactly 10 slow, deep breaths',
    priority: 'low',
    category: 'soul',
    statRewards: { soul: 1, xp: 15 },
    difficulty: 1,
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
    title: 'Read 5 pages',
    description: 'Read exactly 5 pages of any book or article',
    priority: 'low',
    category: 'mind',
    statRewards: { mind: 1, xp: 15 },
    difficulty: 1,
  },

  // Difficulty 2 - Easy
  {
    title: 'Do 10 push-ups',
    description: 'Complete exactly 10 push-ups (modify form as needed)',
    priority: 'low',
    category: 'body',
    statRewards: { body: 1, xp: 20 },
    difficulty: 2,
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
    title: 'Express 5 gratitudes',
    description: 'Write down or say exactly 5 things you\'re grateful for',
    priority: 'low',
    category: 'soul',
    statRewards: { soul: 1, xp: 20 },
    difficulty: 2,
  },

  // Difficulty 3 - Moderate
  {
    title: 'Take a 30-min walk',
    description: 'Go for a brisk walk for exactly 30 minutes',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 40 },
    difficulty: 3,
  },
  {
    title: 'Learn 10 new words',
    description: 'Look up and learn the meaning of 10 new words',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, xp: 40 },
    difficulty: 3,
  },
  {
    title: 'Listen to 3 songs mindfully',
    description: 'Listen to 3 songs with full attention and presence',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 40 },
    difficulty: 3,
  },

  // Difficulty 4 - Medium
  {
    title: 'Do 30 push-ups',
    description: 'Complete exactly 30 push-ups in sets of 10',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 45 },
    difficulty: 4,
  },
  {
    title: 'Reflect for 15 minutes',
    description: 'Spend exactly 15 minutes in quiet reflection',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, xp: 40 },
    difficulty: 4,
  },
  {
    title: 'Journal for 20 minutes',
    description: 'Write in your journal for exactly 20 minutes',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 45 },
    difficulty: 4,
  },

  // Difficulty 5 - Challenging
  {
    title: 'Do 50 sit-ups',
    description: 'Complete exactly 50 sit-ups or crunches',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 45 },
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
  {
    title: 'Meditate for 15 minutes',
    description: 'Sit in meditation for exactly 15 minutes',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 50 },
    difficulty: 5,
  },

  // Difficulty 6 - Hard
  {
    title: 'Do 100 jumping jacks',
    description: 'Complete exactly 100 jumping jacks in sets of 25',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 50 },
    difficulty: 6,
  },
  {
    title: 'Write 500 words',
    description: 'Write exactly 500 words on any topic',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, xp: 55 },
    difficulty: 6,
  },
  {
    title: 'Connect with 3 friends',
    description: 'Reach out to 3 people you care about',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 50 },
    difficulty: 6,
  },

  // Difficulty 7 - Very Hard
  {
    title: 'Do 20 burpees',
    description: 'Complete exactly 20 burpees (modify as needed)',
    priority: 'medium',
    category: 'body',
    statRewards: { body: 1, xp: 55 },
    difficulty: 7,
  },
  {
    title: 'Solve 10 puzzles',
    description: 'Complete 10 crossword clues, sudoku cells, or brain teasers',
    priority: 'medium',
    category: 'mind',
    statRewards: { mind: 1, xp: 60 },
    difficulty: 7,
  },
  {
    title: 'Practice forgiveness for 20 minutes',
    description: 'Spend 20 minutes practicing forgiveness meditation',
    priority: 'medium',
    category: 'soul',
    statRewards: { soul: 1, xp: 55 },
    difficulty: 7,
  },

  // Difficulty 8 - Expert
  {
    title: 'Do 100 push-ups',
    description: 'Complete exactly 100 push-ups in sets of 20',
    priority: 'high',
    category: 'body',
    statRewards: { body: 1, xp: 90 },
    difficulty: 8,
  },
  {
    title: 'Complete 60-min deep work',
    description: 'Focus on a complex task for exactly 60 minutes without interruption',
    priority: 'high',
    category: 'mind',
    statRewards: { mind: 1, xp: 90 },
    difficulty: 8,
  },
  {
    title: 'Meditate for 45 minutes',
    description: 'Sit in meditation for exactly 45 minutes',
    priority: 'high',
    category: 'soul',
    statRewards: { soul: 1, xp: 90 },
    difficulty: 8,
  },

  // Difficulty 9 - Master
  {
    title: 'Run 5 kilometers',
    description: 'Run exactly 5 kilometers at your own pace',
    priority: 'high',
    category: 'body',
    statRewards: { body: 1, xp: 110 },
    difficulty: 9,
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
    title: 'Face 3 inner truths',
    description: 'Confront 3 difficult truths about yourself',
    priority: 'high',
    category: 'soul',
    statRewards: { soul: 1, xp: 120 },
    difficulty: 9,
  },
];

export const DifficultySamples: React.FC = () => {
  const { addTask, refreshTasks } = useTasks();
  const [isVisible, setIsVisible] = useState(false);

  const addDifficultySample = async (difficulty: number) => {
    const samples = difficultySamples.filter(s => s.difficulty === difficulty);
    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i];
      addTask({
        title: sample.title,
        description: sample.description,
        completed: false,
        priority: sample.priority,
        category: sample.category,
        statRewards: { ...sample.statRewards },
        difficulty: sample.difficulty,
      });
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    setTimeout(() => {
      refreshTasks();
    }, 100);
  };

  const addAllSamples = async () => {
    for (let i = 0; i < difficultySamples.length; i++) {
      const sample = difficultySamples[i];
      addTask({
        title: sample.title,
        description: sample.description,
        completed: false,
        priority: sample.priority,
        category: sample.category,
        statRewards: { ...sample.statRewards },
        difficulty: sample.difficulty,
      });
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    setTimeout(() => {
      refreshTasks();
    }, 100);
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
        📊 Difficulty Samples
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
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontFamily: 'Press Start 2P, monospace', fontSize: '14px' }}>Difficulty Samples</h3>
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
          Total samples: {difficultySamples.length}
        </p>
        <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontFamily: 'Press Start 2P, monospace' }}>
          Covers difficulty levels 0-9 with Mind, Body, Soul tasks
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={addAllSamples}
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--color-accent-gold)',
            color: 'var(--color-bg-primary)',
            border: '2px solid var(--color-accent-gold)',
            borderRadius: '0px',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          Add All Samples
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(difficulty => {
          const samples = difficultySamples.filter(s => s.difficulty === difficulty);
          const count = samples.length;
          // Map difficulty 0 to color 1, difficulty 1 to color 2, etc.
          const colorIndex = difficulty + 1;
          const colorVar = `--difficulty-${colorIndex}`;
          return (
            <button
              key={difficulty}
              onClick={() => addDifficultySample(difficulty)}
              style={{
                padding: '8px 12px',
                backgroundColor: `var(${colorVar})`,
                color: 'white',
                border: '2px solid transparent',
                borderRadius: '0px',
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              {difficulty} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: '10px', fontFamily: 'Press Start 2P, monospace', marginTop: '16px' }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>🟢 Easy (0-3):</strong> {difficultySamples.filter(s => s.difficulty <= 3).length} tasks
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>🟡 Medium (4-6):</strong> {difficultySamples.filter(s => s.difficulty >= 4 && s.difficulty <= 6).length} tasks
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>🔴 Hard (7-9):</strong> {difficultySamples.filter(s => s.difficulty >= 7).length} tasks
        </div>
      </div>
    </div>
  );
}; 