import React, { useState } from 'react';
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

  // Get all available categories
  const allCategories = categoryService.getAllCategories();
  
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

  // Group incomplete habits by categories
  const habitsByCategory: Record<string, Habit[]> = {};
  
  // Initialize all categories
  allCategories.forEach(category => {
    habitsByCategory[category.name] = [];
  });
  
  // Group incomplete habits by their categories
  incompleteHabits.forEach(habit => {
    if (habit.categories && habit.categories.length > 0) {
      habit.categories.forEach(category => {
        if (habitsByCategory[category]) {
          habitsByCategory[category].push(habit);
        } else {
          habitsByCategory[category] = [habit];
        }
      });
    } else {
      // Default to 'body' category if no categories
      if (habitsByCategory['body']) {
        habitsByCategory['body'].push(habit);
      } else {
        habitsByCategory['body'] = [habit];
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

  // Sort habits in each category
  const sortedHabitsByCategory: Record<string, Habit[]> = {};
  Object.keys(habitsByCategory).forEach(category => {
    sortedHabitsByCategory[category] = sortHabitsInGroup(habitsByCategory[category]);
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Habits</h2>
        <AutoSaveIndicator isSaving={isSaving} />
      </div>

      {/* Regular Categories */}
      {allCategories
        .filter(category => {
          const categoryHabits = sortedHabitsByCategory[category.name] || [];
          return categoryHabits.length > 0; // Only show categories with habits
        })
        .map(category => {
          const categoryHabits = sortedHabitsByCategory[category.name] || [];
          const isExpanded = expandedSections[category.name] !== false; // Default to expanded
          
          return (
            <div key={category.name} className={styles.section}>
              <h3 
                className={`${styles.sectionTitle} ${styles.collapsibleTitle}`}
                onClick={() => toggleSection(category.name)}
              >
                <span className={styles.frequencyIcon}>{category.icon}</span>
                {category.name.charAt(0).toUpperCase() + category.name.slice(1)} Habits ({categoryHabits.length})
                <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
                  ▼
                </span>
              </h3>
              <div className={`${styles.sectionContent} ${isExpanded ? styles.contentExpanded : styles.contentCollapsed}`}>
                <div className={styles.habitGrid}>
                  {categoryHabits.map((habit: Habit) => (
                    <HabitCard key={habit.id} habit={habit} />
                  ))}
                </div>
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