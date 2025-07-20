# MVP Features Specification

*"Essential features for the Scrypture MVP - focused, practical, and implementable"*

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-MVP_Development-yellow)
![Features](https://img.shields.io/badge/features-30_Core-blue)

## 🎯 **MVP Philosophy**

### **Core Principles**
- **Essential Features Only**: 30 core features that deliver the core value proposition
- **Implementation First**: Focus on practical implementation over comprehensive specifications
- **User-Centric**: Every feature serves a clear user need
- **Progressive Enhancement**: Start simple, add complexity later
- **Quality Over Quantity**: 30 well-implemented features > 100+ incomplete features
- **Terminology Consistency**: All code uses plain English, UI can display Latin mode (toggleable)
- **Scalability Focus**: Design for future expansion while maintaining simplicity

### **MVP Scope**
- **Core Task System**: Advanced task creation with priority, difficulty, due dates, tags, and duration tracking
- **Core Attributes**: Body, Mind, Soul progression with experience points and leveling
- **Bóbr Companion**: Basic companion system with evolution stages
- **Habit System**: Simple daily habit tracking and streaks
- **Achievement System**: Basic achievements and milestone unlocks
- **Onboarding**: Story-driven tutorial with Ancient Bóbr

---

## 📱 **Core Task System (13 Features)**

### **1. Task Creation Interface**
**Purpose**: Allow users to create tasks with mystical theme
**Implementation**: Simple form with title, category, and optional description
**User Flow**: Click "+" → Enter title → Select category → Create
**Technical**: Modal form with validation and persistence

**Validation System**: Custom pixel art validation messages with orange exclamation icons. Browser validation popups are prevented to maintain consistent UI. Validation messages appear with 8px spacing and use the Press Start 2P font for consistent pixel art styling.

**Form Fields**:
- **Title Input**: Required field with 1-100 character limit, 2px border
- **Priority Select**: Required dropdown with low/medium/high options, 4px border  
- **Description Textarea**: Optional field with 500 character limit, 4px border

**Validation Messages**: Custom styled error messages with red background, orange exclamation icons, and pixel art typography. Messages appear below invalid fields with proper spacing and visual hierarchy.

### **2. Six Core Categories**
**Purpose**: Organize tasks by life area
**Categories**: Body, Mind, Soul, Career, Home, Skills
**Implementation**: Tabbed interface with category-specific styling
**User Flow**: Click category tab → View tasks → Create new

### **3. Quick Task Creation**
**Purpose**: Ultra-fast task creation for immediate action
**Implementation**: Title + category only, auto-configured defaults
**User Flow**: Quick button → Enter title → Select category → Start
**Technical**: One-click creation with sensible defaults

### **4. Task Completion System**
**Purpose**: Mark tasks as complete with rewards
**Implementation**: Completion button with experience points and stat rewards
**User Flow**: Click "Complete" → See rewards → Update progress
**Technical**: Completion tracking with reward calculation

### **5. Basic Task Properties**
**Purpose**: Store essential task data
**Properties**: Title, description, category, experience reward, stat rewards
**Implementation**: Simple data model with validation
**Technical**: JSON storage with type validation

### **6. Experience Point Calculation**
**Purpose**: Provide experience points for completed tasks
**Implementation**: Base 10 experience points with category bonuses
**User Flow**: Complete task → See experience points gained → Update level
**Technical**: Simple calculation based on difficulty and category

### **7. Stat Rewards System**
**Purpose**: Award Body, Mind, Soul points for completed tasks
**Implementation**: Category-based stat rewards
**User Flow**: Complete task → See stat gains → Update attributes
**Technical**: JSON object with stat type and value

### **8. Completion Tracking**
**Purpose**: Persist task data and completion status
**Implementation**: Local storage with sync capabilities
**User Flow**: Complete task → Data saved → Progress tracked
**Technical**: JSON persistence with completion timestamps

### **8.1. Task Priority System**
**Purpose**: Allow users to prioritize tasks by importance
**Implementation**: Four priority levels (low, medium, high, critical)
**User Flow**: Create task → Set priority → Sort by priority
**Technical**: Priority field with color coding and sorting

### **8.2. Task Difficulty Rating**
**Purpose**: Rate task complexity for better experience point calculation
**Implementation**: 1-5 difficulty scale with visual indicators
**User Flow**: Create task → Set difficulty → Get appropriate rewards
**Technical**: Difficulty field affecting experience point calculation

### **8.3. Task Due Dates**
**Purpose**: Set deadlines for task completion
**Implementation**: Optional due date with reminder system
**User Flow**: Create task → Set due date → Get notifications
**Technical**: Date field with overdue highlighting

### **8.4. Task Tagging System**
**Purpose**: Organize tasks with custom tags
**Implementation**: Comma-separated tag input with tag management
**User Flow**: Create task → Add tags → Filter by tags
**Technical**: Tags array with tag-based filtering

### **8.5. Task Duration Tracking**
**Purpose**: Track estimated vs actual time spent on tasks
**Implementation**: Estimated duration input and actual time tracking
**User Flow**: Set estimate → Track time → Compare estimates
**Technical**: Duration fields with time tracking on completion

### **8.6. Task Model Scalability**
**Purpose**: Support future field additions without breaking existing data
**Implementation**: Flexible task structure with optional fields and migration support
**User Flow**: App updates automatically handle new fields with sensible defaults
**Technical**: Schema versioning with migration functions and backward compatibility

**Migration Support**: Task model supports future fields (e.g., dueDate, priority) via flexible structure. Planned support for task schema migration ensures data integrity during updates.

---

## 🎭 **Core Attributes System (6 Features)**

### **9. Core Stats Tracking**
**Purpose**: Track Body, Mind, Soul progression
**Implementation**: Three progress bars with numerical values
**User Flow**: Complete tasks → See stat increases → Track progress
**Technical**: Integer values with visual progress indicators

### **10. Experience Point Calculation System**
**Purpose**: Calculate and track experience points
**Implementation**: Simple experience point accumulation with level thresholds
**User Flow**: Gain experience points → See progress → Level up
**Technical**: Integer experience points with level calculation

### **11. Leveling System**
**Purpose**: Provide character progression through levels
**Implementation**: Level 1-10 with experience point thresholds
**User Flow**: Gain experience points → Reach threshold → Level up celebration
**Technical**: Level calculation based on total experience points

### **12. Visual Progress Indicators**
**Purpose**: Show progress visually with progress bars
**Implementation**: Progress bars for stats and experience points
**User Flow**: View dashboard → See progress bars → Understand status
**Technical**: CSS progress bars with percentage calculations

### **13. Level-Up Celebrations**
**Purpose**: Celebrate user progress and achievements
**Implementation**: Animation and notification for level ups
**User Flow**: Level up → See celebration → Feel accomplished
**Technical**: CSS animations with sound effects

### **14. Stat Rewards from Tasks**
**Purpose**: Award stat points for completed tasks
**Implementation**: Category-based stat rewards
**User Flow**: Complete task → Receive stat points → Update attributes
**Technical**: JSON configuration for category-to-stat mapping

---

## 🦫 **Bóbr Companion System (5 Features)**

### **15. Bóbr Introduction**
**Purpose**: Introduce the mystical companion character
**Implementation**: Story-driven introduction with Ancient Bóbr
**User Flow**: Start app → Meet Bóbr → Learn about dam metaphor
**Technical**: Dialogue system with character sprites

### **16. Three-Stage Evolution**
**Purpose**: Show Bóbr's growth alongside user progress
**Stages**: Hatchling, Young, Mature
**Implementation**: Visual evolution based on user level
**User Flow**: Level up → See Bóbr evolve → Feel progression
**Technical**: Level-based stage calculation

### **17. Dam Progress Visualization**
**Purpose**: Visual representation of user's completed work
**Implementation**: Dam that grows with completed tasks
**User Flow**: Complete tasks → See dam grow → Visual progress
**Technical**: Canvas or SVG-based dam visualization

### **18. Motivational Messages**
**Purpose**: Provide encouragement and guidance
**Implementation**: Context-aware messages from Bóbr
**User Flow**: Complete task → Receive message → Feel motivated
**Technical**: Message templates with context selection

### **19. Task Completion Celebrations**
**Purpose**: Celebrate user achievements with Bóbr
**Implementation**: Bóbr reactions to completed tasks
**User Flow**: Complete task → See Bóbr celebration → Feel rewarded
**Technical**: Animation system with character reactions

---

## 🔮 **Habit System (4 Features)**

### **20. Basic Habit Creation**
**Purpose**: Allow users to create recurring practices
**Implementation**: Simple form for habit name and frequency
**User Flow**: Create habit → Set frequency → Start tracking
**Technical**: Form with frequency selection (daily, weekly, monthly)

### **21. Daily Habit Tracking**
**Purpose**: Track daily habit completion
**Implementation**: Checkbox interface for daily habits
**User Flow**: View habits → Mark complete → Track progress
**Technical**: Boolean tracking with completion timestamps

### **22. Streak Counting**
**Purpose**: Track consecutive habit completions
**Implementation**: Counter for current and best streaks
**User Flow**: Complete habit → See streak increase → Stay motivated
**Technical**: Integer counters with streak calculation logic

### **23. Habit Completion Interface**
**Purpose**: Provide clear habit management
**Implementation**: List view with completion buttons
**User Flow**: View habits → Mark complete → See streak update
**Technical**: List component with completion actions

---

## 🏆 **Achievement System (3 Features)**

### **24. Basic Achievement Unlocks**
**Purpose**: Reward user milestones and progress
**Implementation**: Achievement conditions and unlock logic
**User Flow**: Meet condition → Unlock achievement → See celebration
**Technical**: Condition checking with achievement database

### **25. Achievement Display Interface**
**Purpose**: Show unlocked achievements and progress
**Implementation**: Grid or list view of achievements
**User Flow**: View achievements → See progress → Understand goals
**Technical**: Achievement component with progress indicators

### **26. Achievement Unlock Celebrations**
**Purpose**: Celebrate achievement unlocks
**Implementation**: Animation and notification for achievements
**User Flow**: Unlock achievement → See celebration → Feel accomplished
**Technical**: CSS animations with achievement-specific effects

---

## 🎓 **Onboarding System (4 Features)**

### **27. Welcome Screen**
**Purpose**: Introduce Scrypture and its mystical theme
**Implementation**: Story-driven welcome with Ancient Bóbr
**User Flow**: Open app → See welcome → Begin journey
**Technical**: Modal or full-screen welcome component

### **28. Ancient Bóbr Introduction**
**Purpose**: Introduce the mystical companion character
**Implementation**: Character dialogue with dam metaphor
**User Flow**: Meet Bóbr → Learn story → Understand purpose
**Technical**: Dialogue system with character animations

### **29. First Task Creation Guide**
**Purpose**: Guide users through their first task
**Implementation**: Step-by-step tutorial for task creation
**User Flow**: Follow guide → Create first task → Learn process
**Technical**: Interactive tutorial with form guidance

### **30. Tutorial Completion Tracking**
**Purpose**: Track onboarding progress and completion
**Implementation**: Progress tracking for tutorial steps
**User Flow**: Complete steps → Track progress → Finish tutorial
**Technical**: Boolean tracking for tutorial completion

---

## 🎨 **User Experience Flows**

### **Core User Journey**
1. **Welcome**: Story-driven introduction with Ancient Bóbr
2. **First Task**: Guided creation of first task
3. **Daily Use**: Open app → Check tasks → Complete tasks → Track progress
4. **Progression**: Gain experience points → Level up → See Bóbr evolve → Unlock achievements

### **Key User Flows**

#### **Task Creation Flow**
```
User clicks "+" → Modal opens → User enters title → 
Selects category → Clicks "Create" → Task appears in list
```

#### **Task Completion Flow**
```
User clicks "Complete" → Animation plays → Experience points awarded → 
Stats updated → Bóbr celebrates → Progress saved
```

#### **Level Up Flow**
```
User gains experience points → Reaches threshold → Level up animation → 
Bóbr evolves → Achievement check → Celebration
```

#### **Habit Tracking Flow**
```
User views habits → Clicks "Complete" → Streak updates → 
Motivational message → Progress saved
```

---

## 💻 **Implementation Examples**

### **React Components**

#### **Task Creation Component**
```typescript
// components/features/tasks/TaskCreationModal.tsx
import React, { useState } from 'react';
import { useTaskService } from '../../hooks/useTaskService';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'body' | 'mind' | 'soul' | 'career' | 'home' | 'skills'>('body');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [dueDate, setDueDate] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createTask } = useTaskService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const task = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        difficulty,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        estimatedDuration: estimatedDuration || undefined
      });
      
      onTaskCreated(task);
      onClose();
      setTitle('');
      setDescription('');
      setCategory('body');
      setPriority('medium');
      setDifficulty(3);
      setDueDate('');
      setTags('');
      setEstimatedDuration(30);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Task Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            placeholder="Enter task title..."
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            placeholder="Enter task description..."
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Category *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            required
          >
            <option value="body">Body</option>
            <option value="mind">Mind</option>
            <option value="soul">Soul</option>
            <option value="career">Career</option>
            <option value="home">Home</option>
            <option value="skills">Skills</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value) as any)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value={1}>1 - Easy</option>
              <option value={2}>2 - Simple</option>
              <option value={3}>3 - Moderate</option>
              <option value={4}>4 - Challenging</option>
              <option value={5}>5 - Expert</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium">
              Due Date (Optional)
            </label>
            <input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="estimatedDuration" className="block text-sm font-medium">
              Estimated Duration (minutes)
            </label>
            <input
              id="estimatedDuration"
              type="number"
              min="5"
              max="480"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 30)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium">
            Tags (Optional)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            placeholder="Enter tags separated by commas..."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
```

#### **Task Card Component**
```typescript
// components/features/tasks/TaskCard.tsx
import React from 'react';
import { useTaskService } from '../../hooks/useTaskService';
import { useUserStatsService } from '../../hooks/useUserStatsService';
import { Button } from '../../ui/Button';

interface TaskCardProps {
  task: Task;
  onTaskUpdated: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskUpdated }) => {
  const { completeTask } = useTaskService();
  const { addExperiencePoints, addStatRewards } = useUserStatsService();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    try {
      const completion = await completeTask(task.id);
      
      // Update user stats
      await addExperiencePoints(completion.experiencePointsGained);
      await addStatRewards(completion.statGains);
      
      // Update task
      onTaskUpdated({ ...task, completed: true, completedAt: new Date() });
      
      // Show celebration
      showCompletionCelebration(completion);
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      body: 'bg-red-100 text-red-800',
      mind: 'bg-blue-100 text-blue-800',
      soul: 'bg-purple-100 text-purple-800',
      career: 'bg-green-100 text-green-800',
      home: 'bg-yellow-100 text-yellow-800',
      skills: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`border rounded-lg p-4 ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(task.category)}`}>
              {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
              Difficulty {task.difficulty}
            </span>
            {task.completed && (
              <span className="text-green-600 text-sm">✓ Completed</span>
            )}
          </div>
          
          <h3 className={`font-medium ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-gray-600 text-sm mt-1">{task.description}</p>
          )}
          
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <span>Experience Points: {task.experienceReward}</span>
            {Object.entries(task.statRewards).map(([stat, value]) => (
              <span key={stat}>{stat}: +{value}</span>
            ))}
          </div>
          
          {task.dueDate && (
            <div className="mt-2 text-sm text-gray-500">
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          
          {task.estimatedDuration && (
            <div className="mt-1 text-sm text-gray-500">
              <span>Estimated: {task.estimatedDuration} min</span>
              {task.actualDuration && (
                <span className="ml-2">Actual: {task.actualDuration} min</span>
              )}
            </div>
          )}
          
          {task.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {!task.completed && (
          <Button
            onClick={handleComplete}
            disabled={isCompleting}
            variant="primary"
            size="sm"
          >
            Complete
          </Button>
        )}
      </div>
    </div>
  );
};
```

#### **Habit Tracker Component**
```typescript
// components/features/habits/HabitTracker.tsx
import React, { useState } from 'react';
import { useHabitService } from '../../hooks/useHabitService';
import { Button } from '../../ui/Button';

interface HabitTrackerProps {
  habits: Habit[];
  onHabitUpdated: (habit: Habit) => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, onHabitUpdated }) => {
  const { completeHabit } = useHabitService();
  const [isCompleting, setIsCompleting] = useState<string | null>(null);

  const handleCompleteHabit = async (habitId: string) => {
    if (isCompleting) return;
    
    setIsCompleting(habitId);
    try {
      const completion = await completeHabit(habitId);
      onHabitUpdated(completion.habit);
      
      // Show streak celebration
      if (completion.streakIncreased) {
        showStreakCelebration(completion.habit);
      }
    } catch (error) {
      console.error('Failed to complete habit:', error);
    } finally {
      setIsCompleting(null);
    }
  };

  const isCompletedToday = (habit: Habit) => {
    if (!habit.lastCompleted) return false;
    const lastCompleted = new Date(habit.lastCompleted);
    const today = new Date();
    return lastCompleted.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Daily Habits</h2>
      
      {habits.length === 0 ? (
        <p className="text-gray-500">No habits created yet. Create your first habit to get started!</p>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const completedToday = isCompletedToday(habit);
            
            return (
              <div key={habit.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium ${completedToday ? 'line-through' : ''}`}>
                      {habit.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {habit.frequency} • Streak: {habit.streak} • Best: {habit.bestStreak}
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => handleCompleteHabit(habit.id)}
                    disabled={completedToday || isCompleting === habit.id}
                    variant={completedToday ? 'secondary' : 'primary'}
                    size="sm"
                  >
                    {completedToday ? 'Completed' : 'Complete'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
```

### **Custom Hooks**

#### **Task Service Hook**
```typescript
// hooks/useTaskService.ts
import { useState, useEffect } from 'react';
import { TaskService } from '../services/tasks/taskService';
import { Task, CreateTaskData } from '../types';

export const useTaskService = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const taskService = new TaskService();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const taskList = await taskService.getTasks();
      setTasks(taskList);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: CreateTaskData): Promise<Task> => {
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError('Failed to create task');
      throw err;
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const completion = await taskService.completeTask(taskId);
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: true, completedAt: new Date() }
          : task
      ));
      return completion;
    } catch (err) {
      setError('Failed to complete task');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    completeTask,
    refresh: loadTasks
  };
};
```

#### **User Stats Hook**
```typescript
// hooks/useUserStatsService.ts
import { useState, useEffect } from 'react';
import { UserStatsService } from '../services/user/userStatsService';
import { UserStats, StatRewards, LevelUpResult } from '../types';

export const useUserStatsService = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const userStatsService = new UserStatsService();

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const stats = await userStatsService.getUserStats();
      setUserStats(stats);
    } catch (err) {
      setError('Failed to load user stats');
      console.error('Error loading user stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const addExperiencePoints = async (points: number): Promise<LevelUpResult> => {
    try {
      const result = await userStatsService.addExperiencePoints(points);
      
      // Update local state
      if (userStats) {
        setUserStats(prev => prev ? {
          ...prev,
          totalExperiencePoints: prev.totalExperiencePoints + points,
          level: result.leveledUp ? result.newLevel : prev.level
        } : null);
      }
      
      return result;
    } catch (err) {
      setError('Failed to add experience points');
      throw err;
    }
  };

  const addStatRewards = async (rewards: StatRewards): Promise<UserStats> => {
    try {
      const updatedStats = await userStatsService.addStatRewards(rewards);
      setUserStats(updatedStats);
      return updatedStats;
    } catch (err) {
      setError('Failed to add stat rewards');
      throw err;
    }
  };

  return {
    userStats,
    loading,
    error,
    addExperiencePoints,
    addStatRewards,
    refresh: loadUserStats
  };
};
```

---

## 🔧 **Technical Implementation**

### **Data Models**

#### **Task**
```typescript
// Task Model
interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'body' | 'mind' | 'soul' | 'career' | 'home' | 'skills';
  priority: 'low' | 'medium' | 'high' | 'critical';
  difficulty: 1 | 2 | 3 | 4 | 5;
  dueDate?: Date;
  completed: boolean;
  experienceReward: number;
  statRewards: {
    body?: number;
    mind?: number;
    soul?: number;
  };
  tags: string[];
  estimatedDuration?: number; // Duration in minutes
  actualDuration?: number; // Actual time spent in minutes
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}
```

#### **User Stats**
```typescript
// User Stats Model
interface UserStats {
  level: number;
  totalExperiencePoints: number;
  body: number;
  mind: number;
  soul: number;
  bobrStage: 'hatchling' | 'young' | 'mature';
  damProgress: number;
}
```

#### **Habit**
```typescript
// Habit Model
interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  bestStreak: number;
  lastCompleted?: Date;
  createdAt: Date;
}
```

#### **Achievement**
```typescript
// Achievement Model
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  condition: AchievementCondition;
}
```

### **Enhanced Task Model Features**

#### **Priority System**
- **Four Levels**: Low, Medium, High, Critical
- **Visual Indicators**: Color-coded priority badges
- **Experience Multiplier**: Higher priority tasks give more experience points
- **Sorting**: Tasks can be sorted by priority level

#### **Difficulty Rating**
- **Five Levels**: 1 (Easy) to 5 (Expert)
- **Experience Calculation**: Difficulty affects base experience points
- **Visual Feedback**: Difficulty indicators on task cards
- **Balanced Rewards**: Appropriate rewards for task complexity

#### **Due Date Management**
- **Optional Deadlines**: Users can set due dates for tasks
- **Overdue Highlighting**: Visual indicators for overdue tasks
- **Date Formatting**: User-friendly date display
- **Future Integration**: Foundation for reminder system

#### **Tagging System**
- **Custom Tags**: Users can add multiple tags per task
- **Tag Management**: Comma-separated input with validation
- **Visual Display**: Tag chips on task cards
- **Future Filtering**: Foundation for tag-based filtering

#### **Duration Tracking**
- **Estimated Duration**: Users can set time estimates in minutes
- **Actual Duration**: Track real time spent on tasks
- **Time Comparison**: Compare estimates vs actual time
- **Productivity Insights**: Foundation for time analytics

### **Core Functions**
```typescript
function calculateExperiencePoints(difficulty: number, category: string, priority: string): number {
  const baseExperiencePoints = 10;
  const difficultyMultiplier = difficulty * 2;
  const categoryBonus = getCategoryBonus(category);
  const priorityMultiplier = getPriorityMultiplier(priority);
  return Math.round((baseExperiencePoints + difficultyMultiplier + categoryBonus) * priorityMultiplier);
}

function getPriorityMultiplier(priority: string): number {
  const multipliers = {
    low: 0.8,
    medium: 1.0,
    high: 1.3,
    critical: 1.6
  };
  return multipliers[priority] || 1.0;
}
```

#### **Level Calculation**
```typescript
function calculateLevel(totalExperiencePoints: number): number {
  const levelThresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700];
  return levelThresholds.findIndex(threshold => totalExperiencePoints < threshold);
}
```

#### **Stat Rewards**
```typescript
function getStatRewards(category: string): StatRewards {
  const rewards = {
    body: { body: 10 },
    mind: { mind: 10 },
    soul: { soul: 10 },
    career: { mind: 5, body: 5 },
    home: { body: 5, soul: 5 },
    skills: { mind: 8, soul: 2 }
  };
  return rewards[category] || { soul: 5, mind: 3, body: 2 };
}
```

---

## 🎯 **Success Metrics**

### **User Engagement**
- **Task Completion Rate**: 85%+ of created tasks completed
- **Daily Active Users**: 70%+ retention after 30 days
- **Session Duration**: Average 10+ minutes per session
- **Habit Streak Maintenance**: 60%+ of users maintain 7+ day habit streaks

### **Technical Performance**
- **Load Time**: <2 seconds for initial page load
- **Animation Performance**: 60fps for all effects
- **Data Persistence**: 99.9%+ data integrity
- **Cross-Device Sync**: <5 second sync delay

### **Feature Adoption**
- **Task Creation**: 80%+ of users create tasks within first week
- **Habit Usage**: 50%+ of users create at least one habit
- **Achievement Unlocks**: Average 2+ achievements per user per month
- **Bóbr Interaction**: 90%+ of users interact with Bóbr daily

---

## 📚 **Cross-References**

### **Related Documentation**
- **See: 01-overview.md** for project vision and core concepts
- **See: 03-technical-specs.md** for system architecture and implementation details
- **See: 04-api-reference.md** for API endpoints and integration
- **See: 05-database-schema.md** for data models and database design
- **See: 06-development-guide.md** for setup and implementation guidance

### **Implementation Guides**
- **See: 07-mvp-checklist.md** for implementation tracking and status

### **Design References**
- **See: 10-color-system.md** for visual design and color palette

---

*"In the realm of MVP development, every feature must serve a purpose, every interaction must feel meaningful, and every line of code must contribute to the user's journey of intentional living."* 📚✨ 