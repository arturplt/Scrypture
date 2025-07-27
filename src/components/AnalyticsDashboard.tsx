import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { useTasks } from '../hooks/useTasks';
import { useHabits } from '../hooks/useHabits';
import { useAchievements } from '../hooks/useAchievements';
import styles from './AnalyticsDashboard.module.css';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalXP: number;
  currentLevel: number;
  averageTasksPerDay: number;
  longestStreak: number;
  totalAchievements: number;
  unlockedAchievements: number;
  categoryBreakdown: Record<string, number>;
  weeklyProgress: Array<{ date: string; tasks: number; xp: number }>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useUser();
  const { tasks } = useTasks();
  const { habits } = useHabits();
  const { achievements } = useAchievements();
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'habits' | 'achievements'>('overview');

  if (!isOpen) return null;

  // Calculate analytics data
  const analyticsData: AnalyticsData = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.completed).length,
    completionRate: tasks.length > 0 ? (tasks.filter(task => task.completed).length / tasks.length) * 100 : 0,
    totalXP: user?.experience || 0,
    currentLevel: user?.level || 1,
    averageTasksPerDay: calculateAverageTasksPerDay(),
    longestStreak: calculateLongestStreak(),
    totalAchievements: achievements.length,
    unlockedAchievements: achievements.filter(achievement => achievement.unlocked).length,
    categoryBreakdown: calculateCategoryBreakdown(),
    weeklyProgress: calculateWeeklyProgress()
  };

  function calculateAverageTasksPerDay(): number {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.completed);
    if (completedTasks.length === 0) return 0;
    
    const firstTaskDate = new Date(Math.min(...completedTasks.map(task => new Date(task.createdAt).getTime())));
    const daysSinceFirstTask = Math.max(1, Math.ceil((Date.now() - firstTaskDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    return Math.round((completedTasks.length / daysSinceFirstTask) * 10) / 10;
  }

  function calculateLongestStreak(): number {
    if (habits.length === 0) return 0;
    
    return Math.max(...habits.map(habit => habit.bestStreak || 0));
  }

  function calculateCategoryBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    tasks.forEach(task => {
      task.categories?.forEach(category => {
        breakdown[category] = (breakdown[category] || 0) + 1;
      });
    });
    
    return breakdown;
  }

  function calculateWeeklyProgress(): Array<{ date: string; tasks: number; xp: number }> {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
        return taskDate === date && task.completed;
      });

      const dayXP = dayTasks.reduce((total, task) => {
        return total + (task.statRewards?.xp || 10);
      }, 0);

      return {
        date,
        tasks: dayTasks.length,
        xp: dayXP
      };
    });
  }

  function calculateProgressBarHeight(dayTasks: number, maxTasks: number): number {
    if (maxTasks === 0) return 10;
    const percentage = (dayTasks / maxTasks) * 100;
    return Math.max(10, Math.min(100, percentage));
  }

  const renderOverviewTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statValue}>{analyticsData.completionRate.toFixed(1)}%</div>
          <div className={styles.statLabel}>Completion Rate</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⭐</div>
          <div className={styles.statValue}>{analyticsData.totalXP}</div>
          <div className={styles.statLabel}>Total XP</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statValue}>{analyticsData.averageTasksPerDay}</div>
          <div className={styles.statLabel}>Tasks/Day</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statValue}>{analyticsData.longestStreak}</div>
          <div className={styles.statLabel}>Best Streak</div>
        </div>
      </div>

      <div className={styles.categoryBreakdown}>
        <h3 className={styles.sectionTitle}>Category Distribution</h3>
        <div className={styles.categoryGrid}>
          {Object.entries(analyticsData.categoryBreakdown).map(([category, count]) => (
            <div key={category} className={styles.categoryItem}>
              <div className={styles.categoryName}>{category}</div>
              <div className={styles.categoryCount}>{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProgressTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.weeklyProgress}>
        <h3 className={styles.sectionTitle}>Weekly Progress</h3>
        <div className={styles.progressChart}>
          {analyticsData.weeklyProgress.map((day) => (
            <div key={day.date} className={styles.progressBar}>
              <div className={styles.progressLabel}>
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBarFill}
                  style={{ 
                    height: `${calculateProgressBarHeight(day.tasks, Math.max(1, Math.max(...analyticsData.weeklyProgress.map(d => d.tasks))))}%` 
                  }}
                />
              </div>
              <div className={styles.progressValue}>
                {day.tasks} ({day.xp} XP)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHabitsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.habitsOverview}>
        <h3 className={styles.sectionTitle}>Habit Performance</h3>
        {habits.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p>No habits created yet</p>
            <p>Create your first habit to see analytics here</p>
          </div>
        ) : (
          <div className={styles.habitsList}>
            {habits.map(habit => (
              <div key={habit.id} className={styles.habitItem}>
                <div className={styles.habitInfo}>
                  <div className={styles.habitName}>{habit.name}</div>
                  <div className={styles.habitFrequency}>{habit.categories?.[0] || 'daily'}</div>
                </div>
                <div className={styles.habitStats}>
                  <div className={styles.habitStreak}>
                    <span className={styles.streakLabel}>Current:</span>
                    <span className={styles.streakValue}>{habit.streak}</span>
                  </div>
                  <div className={styles.habitBest}>
                    <span className={styles.bestLabel}>Best:</span>
                    <span className={styles.bestValue}>{habit.bestStreak}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAchievementsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.achievementsOverview}>
        <h3 className={styles.sectionTitle}>Achievement Progress</h3>
        <div className={styles.achievementStats}>
          <div className={styles.achievementStat}>
            <div className={styles.statNumber}>{analyticsData.unlockedAchievements}</div>
            <div className={styles.statLabel}>Unlocked</div>
          </div>
          <div className={styles.achievementStat}>
            <div className={styles.statNumber}>{analyticsData.totalAchievements}</div>
            <div className={styles.statLabel}>Total</div>
          </div>
          <div className={styles.achievementStat}>
            <div className={styles.statNumber}>
              {analyticsData.totalAchievements > 0 
                ? Math.round((analyticsData.unlockedAchievements / analyticsData.totalAchievements) * 100)
                : 0}%
            </div>
            <div className={styles.statLabel}>Completion</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Analytics Dashboard</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'progress' ? styles.active : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'habits' ? styles.active : ''}`}
            onClick={() => setActiveTab('habits')}
          >
            Habits
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'achievements' ? styles.active : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'progress' && renderProgressTab()}
          {activeTab === 'habits' && renderHabitsTab()}
          {activeTab === 'achievements' && renderAchievementsTab()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 