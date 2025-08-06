import React, { useState, useMemo } from 'react';
import { useHabits } from '../hooks/useHabits';
import { HabitCard } from './HabitCard';
import { Habit } from '../types';
import { categoryService } from '../services/categoryService';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import styles from './HabitList.module.css';

export const HabitList: React.FC = () => {
  const { habits, isSaving } = useHabits();
  
  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isCompletedToday = (lastCompleted: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completed = new Date(lastCompleted);
    completed.setHours(0, 0, 0, 0);
    return today.getTime() === completed.getTime();
  };

  // Get all available categories - memoized to prevent infinite loops
  const allCategories = useMemo(() => categoryService.getAllCategories(), []);
  
  // Separate completed and incomplete habits
  const completedHabits: Habit[] = [];
  const incompleteHabits: Habit[] = [];
  
  habits.forEach(habit => {
    if (habit.lastCompleted && isCompletedToday(habit.lastCompleted)) {
      completedHabits.push(habit);
    } else {
      incompleteHabits.push(habit);
    }
  });

  // Sort completed habits by completion time (most recent first)
  const sortedCompletedHabits = [...completedHabits].sort((a, b) => {
    if (!a.lastCompleted || !b.lastCompleted) return 0;
    return new Date(b.lastCompleted).getTime() - new Date(a.lastCompleted).getTime();
  });

  // Group incomplete habits by frequency first, then by categories
  const habitsByFrequency: Record<string, Record<string, Habit[]>> = {
    daily: {},
    weekly: {},
    monthly: {}
  };
  
  // Initialize all categories for each frequency
  allCategories.forEach(category => {
    habitsByFrequency.daily[category.name] = [];
    habitsByFrequency.weekly[category.name] = [];
    habitsByFrequency.monthly[category.name] = [];
  });
  
  // Group incomplete habits by frequency and categories
  incompleteHabits.forEach(habit => {
    const frequency = habit.targetFrequency;
    if (habit.categories && habit.categories.length > 0) {
      habit.categories.forEach(category => {
        if (habitsByFrequency[frequency] && habitsByFrequency[frequency][category]) {
          habitsByFrequency[frequency][category].push(habit);
        } else if (habitsByFrequency[frequency]) {
          habitsByFrequency[frequency][category] = [habit];
        }
      });
    } else {
      // Default to 'body' category if no categories
      if (habitsByFrequency[frequency] && habitsByFrequency[frequency]['body']) {
        habitsByFrequency[frequency]['body'].push(habit);
      } else if (habitsByFrequency[frequency]) {
        habitsByFrequency[frequency]['body'] = [habit];
      }
    }
  });

  // Sort habits within each category group
  const sortHabitsInGroup = (habitsGroup: Habit[]) => {
    return [...habitsGroup].sort((a, b) => {
      if (a.streak !== b.streak) {
        return b.streak - a.streak; // Higher streak first
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newer first
    });
  };

  // Sort habits in each frequency and category
  const sortedHabitsByFrequency: Record<string, Record<string, Habit[]>> = {};
  Object.keys(habitsByFrequency).forEach(frequency => {
    sortedHabitsByFrequency[frequency] = {};
    Object.keys(habitsByFrequency[frequency]).forEach(category => {
      sortedHabitsByFrequency[frequency][category] = sortHabitsInGroup(habitsByFrequency[frequency][category]);
    });
  });

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return '📅';
      case 'weekly':
        return '📊';
      case 'monthly':
        return '📈';
      default:
        return '📋';
    }
  };

  const getFrequencyDisplayName = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return frequency.charAt(0).toUpperCase() + frequency.slice(1);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Habits</h2>
        <AutoSaveIndicator isSaving={isSaving} />
      </div>

      {/* Frequency-based sections */}
      {Object.keys(sortedHabitsByFrequency).map(frequency => {
        const frequencyHabits = sortedHabitsByFrequency[frequency];
        const totalHabitsInFrequency = Object.values(frequencyHabits).flat().length;
        
        if (totalHabitsInFrequency === 0) return null; // Skip empty frequencies
        
        const isExpanded = expandedSections[frequency] !== false; // Default to expanded
        
        return (
          <div key={frequency} className={styles.frequencySection}>
            <h3 
              className={`${styles.frequencyTitle} ${styles.collapsibleTitle}`}
              onClick={() => toggleSection(frequency)}
            >
              <span className={styles.frequencyIcon}>{getFrequencyIcon(frequency)}</span>
              {getFrequencyDisplayName(frequency)} Habits ({totalHabitsInFrequency})
              <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
                ▼
              </span>
            </h3>
            
            <div className={`${styles.frequencyContent} ${isExpanded ? styles.contentExpanded : styles.contentCollapsed}`}>
              {/* Categories within this frequency */}
              {allCategories
                .filter(category => {
                  const categoryHabits = frequencyHabits[category.name] || [];
                  return categoryHabits.length > 0; // Only show categories with habits
                })
                .map(category => {
                  const categoryHabits = frequencyHabits[category.name] || [];
                  const categorySectionId = `${frequency}-${category.name}`;
                  const isCategoryExpanded = expandedSections[categorySectionId] !== false; // Default to expanded
                  
                  return (
                    <div key={categorySectionId} className={styles.categorySection}>
                      <h4 
                        className={`${styles.categoryTitle} ${styles.collapsibleTitle}`}
                        onClick={() => toggleSection(categorySectionId)}
                      >
                        <span className={styles.categoryIcon}>{category.icon}</span>
                        {category.name.charAt(0).toUpperCase() + category.name.slice(1)} ({categoryHabits.length})
                        <span className={`${styles.expandIcon} ${isCategoryExpanded ? styles.expanded : ''}`}>
                          ▼
                        </span>
                      </h4>
                      <div className={`${styles.categoryContent} ${isCategoryExpanded ? styles.contentExpanded : styles.contentCollapsed}`}>
                        <div className={styles.habitGrid}>
                          {categoryHabits.map((habit: Habit) => (
                            <HabitCard key={habit.id} habit={habit} />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}

      {/* Completed Habits Section */}
      {sortedCompletedHabits.length > 0 && (
        <div className={styles.section}>
          <h3 
            className={`${styles.sectionTitle} ${styles.collapsibleTitle}`}
            onClick={() => toggleSection('completed')}
          >
            <span className={styles.frequencyIcon}>✅</span>
            Completed Habits ({sortedCompletedHabits.length})
            <span className={`${styles.expandIcon} ${expandedSections['completed'] !== false ? styles.expanded : ''}`}>
              ▼
            </span>
          </h3>
          <div className={`${styles.sectionContent} ${expandedSections['completed'] !== false ? styles.contentExpanded : styles.contentCollapsed}`}>
            <div className={styles.habitGrid}>
              {sortedCompletedHabits.map((habit: Habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 