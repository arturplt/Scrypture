import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { HabitCard } from './HabitCard';
import { AchievementCard } from './AchievementCard';
import { Frame, Button } from './ui';
import { Task, Habit, Achievement, AchievementProgress } from '../types';
import styles from './CardDemo.module.css';

export const CardDemo: React.FC = () => {
  const [selectedCardType, setSelectedCardType] = useState<'task' | 'habit' | 'achievement'>('task');
  const [selectedTheme, setSelectedTheme] = useState('green-frame');

  const themes = [
    'green-frame', 'red-frame', 'blue-frame', 'silver', 'pale-blue', 
    'gunmetal', 'gold-ornate', 'green-ornate', 'purple-frame'
  ];

  // Sample task data
  const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Complete Project Documentation',
      description: 'Write comprehensive documentation for the new feature',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: 'high',
      categories: ['work', 'documentation'],
      statRewards: { body: 2, mind: 5, soul: 1, xp: 15 }
    },
    {
      id: '2',
      title: 'Morning Exercise Routine',
      description: '30 minutes of cardio and strength training',
      completed: true,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
      priority: 'medium',
      categories: ['health', 'exercise'],
      statRewards: { body: 8, mind: 2, soul: 1, xp: 12 }
    },
    {
      id: '3',
      title: 'Read Technical Book',
      description: 'Continue reading "Clean Code" - Chapter 5',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: 'low',
      categories: ['learning', 'reading'],
      statRewards: { body: 1, mind: 6, soul: 2, xp: 10 }
    }
  ];

  // Sample habit data
  const sampleHabits: Habit[] = [
    {
      id: '1',
      name: 'Daily Meditation',
      description: 'Practice mindfulness for 15 minutes',
      streak: 7,
      bestStreak: 12,
      lastCompleted: new Date(),
      createdAt: new Date(),
      targetFrequency: 'daily',
      categories: ['wellness', 'mindfulness'],
      statRewards: { body: 1, mind: 4, soul: 3, xp: 8 }
    },
    {
      id: '2',
      name: 'Weekly Code Review',
      description: 'Review and refactor personal projects',
      streak: 3,
      bestStreak: 8,
      lastCompleted: new Date(Date.now() - 86400000 * 2),
      createdAt: new Date(),
      targetFrequency: 'weekly',
      categories: ['work', 'development'],
      statRewards: { body: 2, mind: 6, soul: 1, xp: 12 }
    },
    {
      id: '3',
      name: 'Monthly Goal Review',
      description: 'Assess progress and set new objectives',
      streak: 1,
      bestStreak: 5,
      lastCompleted: new Date(Date.now() - 86400000 * 15),
      createdAt: new Date(),
      targetFrequency: 'monthly',
      categories: ['planning', 'reflection'],
      statRewards: { body: 1, mind: 3, soul: 5, xp: 15 }
    }
  ];

  // Sample achievement data
  const sampleAchievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first task',
      category: 'progression',
      rarity: 'common',
      conditions: [{ type: 'first_task', value: 1 }],
      rewards: { xp: 50 },
      icon: '🎯',
      unlockedMessage: 'Welcome to productivity!',
      unlocked: true,
      unlockedAt: new Date(),
      progress: 1
    },
    {
      id: '2',
      name: 'Streak Master',
      description: 'Maintain a 7-day habit streak',
      category: 'consistency',
      rarity: 'uncommon',
      conditions: [{ type: 'habit_streak', value: 7 }],
      rewards: { xp: 100, soul: 10 },
      icon: '🔥',
      unlockedMessage: 'You\'re on fire!',
      unlocked: false,
      progress: 0.57
    },
    {
      id: '3',
      name: 'Mind Master',
      description: 'Reach 100 mind points',
      category: 'mastery',
      rarity: 'rare',
      conditions: [{ type: 'stat_reach', value: 100, stat: 'mind' }],
      rewards: { xp: 200, mind: 25 },
      icon: '🧠',
      unlockedMessage: 'Your mind is a fortress!',
      unlocked: false,
      progress: 0.67
    },
    {
      id: '4',
      name: 'Task Champion',
      description: 'Complete 100 high-priority tasks',
      category: 'mastery',
      rarity: 'epic',
      conditions: [{ type: 'task_complete', value: 100, difficulty: 8 }],
      rewards: { xp: 500, body: 50, mind: 50, soul: 50 },
      icon: '🏆',
      unlockedMessage: 'You are a true champion!',
      unlocked: false,
      progress: 0.12
    }
  ];

  // Sample achievement progress data
  const sampleProgress: AchievementProgress[] = [
    { achievementId: '2', progress: 0.57, currentValue: 4, targetValue: 7, lastUpdated: new Date() },
    { achievementId: '3', progress: 0.67, currentValue: 67, targetValue: 100, lastUpdated: new Date() },
    { achievementId: '4', progress: 0.12, currentValue: 12, targetValue: 100, lastUpdated: new Date() }
  ];

  return (
    <div className={styles.container}>
      <Frame theme="green-ornate" variant="compound" customWidth={1200} customHeight={800}>
        <div className={styles.content}>
          <h1 className={styles.title}>🎮 Modern Card Components Demo</h1>
          <p className={styles.subtitle}>
            Showcasing the new sprite-based UI system
          </p>

          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Card Type:</label>
              <div className={styles.buttonGroup}>
                {(['task', 'habit', 'achievement'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={selectedCardType === type ? 'primary' : 'secondary'}
                    onClick={() => setSelectedCardType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Demo Theme:</label>
              <select 
                value={selectedTheme} 
                onChange={(e) => setSelectedTheme(e.target.value)}
                className={styles.themeSelect}
              >
                {themes.map(theme => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className={styles.cardsGrid}>
            {selectedCardType === 'task' && (
              <div className={styles.cardGrid}>
                {sampleTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}

            {selectedCardType === 'habit' && (
              <div className={styles.cardGrid}>
                {sampleHabits.map(habit => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </div>
            )}

            {selectedCardType === 'achievement' && (
              <div className={styles.cardGrid}>
                {sampleAchievements.map(achievement => {
                  const progress = sampleProgress.find(p => p.achievementId === achievement.id);
                  return (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      progress={progress}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Panel */}
          <Frame theme="pale-blue" customWidth={1100} customHeight={150} className={styles.infoPanel}>
            <div className={styles.infoContent}>
              <h3>✨ Card Features:</h3>
              <div className={styles.featuresList}>
                <div className={styles.featureColumn}>
                  <ul>
                    <li>🖼️ Frame-based sprite rendering</li>
                    <li>🎨 Dynamic theming system</li>
                    <li>📱 Responsive design</li>
                  </ul>
                </div>
                <div className={styles.featureColumn}>
                  <ul>
                    <li>⚡ Interactive states & animations</li>
                    <li>♿ Accessibility support</li>
                    <li>🔧 Modular component architecture</li>
                  </ul>
                </div>
              </div>
            </div>
          </Frame>
        </div>
      </Frame>
    </div>
  );
};

export default CardDemo;
