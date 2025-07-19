# Terminology Guide

*"Clear language for clear understanding - plain English by default, Latin magic by choice"*

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-Active-green)
![Language](https://img.shields.io/badge/language-Plain_English-blue)

## 🎯 **Terminology Philosophy**

### **Core Principles**
- **Plain English First**: All documentation and code use plain English by default
- **Accessibility Focus**: Clear, understandable language for all users
- **Unlockable Magic**: Latin terminology as an optional feature
- **Consistency**: Same terms used throughout the application
- **Developer-Friendly**: Code uses plain English variable names

### **Language Modes**

#### **Default Mode: Plain English**
- **Purpose**: Accessibility and clarity for all users
- **Audience**: New users, developers, and accessibility-focused users
- **Benefits**: Clear understanding, reduced cognitive load, universal accessibility

#### **Latin Mode: Classical Terminology**
- **Purpose**: Immersive classical experience
- **Unlock Condition**: Complete your first 10 tasks
- **Toggle**: Settings → Language → Latin Mode
- **Benefits**: Thematic immersion, unique user experience

---

## 📚 **Core Terminology Mapping**

### **Primary Concepts**

| **Plain English** | **Latin Mode** | **Definition** | **Usage Context** |
|-------------------|----------------|----------------|-------------------|
| **Task** | Transmutatio | A specific action or activity to complete | UI labels, user interactions |
| **Habit** | Ritus | A recurring practice or behavior | Feature names, navigation |
| **Goal** | Intentum | A larger objective or target | Long-term planning |
| **Experience Points** | Virtus | Points earned for completing tasks | Progress tracking, rewards |
| **Level** | Ascensio | Character progression level | User progression |
| **Stats** | Potentiae | Body, Mind, Soul progression | Character development |
| **Achievement** | Laurea | Unlocked accomplishments | Rewards system |
| **Journal** | Grimoirium Vivendi | Personal progress tracking | Main navigation |
| **Daily Goals** | Vota Diurna | Daily objectives and challenges | Daily planning |
| **Companion** | Genius | Bóbr the forest companion | Character system |
| **Progress** | Virtus | User advancement and growth | Progress tracking |
| **Body** | Corpus | Physical attributes and health | Character stats |
| **Mind** | Mens | Mental attributes and knowledge | Character stats |
| **Soul** | Anima | Spiritual attributes and creativity | Character stats |

### **Secondary Concepts**

| **Plain English** | **Latin Mode** | **Definition** | **Usage Context** |
|-------------------|----------------|----------------|-------------------|
| **Complete** | Transmutatio Peracta | Mark a task as finished | Action buttons |
| **Create** | Incantare Novum | Create a new task | Action buttons |
| **Rewards** | Praemia Arcana | Benefits from completing tasks | Reward system |
| **Streak** | Flamma Continuata | Consecutive completions | Habit tracking |
| **Dashboard** | Altare Intentium | Main user interface | Navigation |
| **Settings** | Sigilla Occulta | Application configuration | Navigation |
| **Analytics** | Divinatio Numerorum | Progress insights | Feature names |

### **Extended Task Fields**

| **Plain English** | **Latin Mode** | **Definition** | **Usage Context** |
|-------------------|----------------|----------------|-------------------|
| **Priority** | Praecedentia | Task importance level | Task creation, sorting |
| **Difficulty** | Difficultas | Task complexity rating | Task creation, XP calculation |
| **Due Date** | Terminus | Task deadline | Task scheduling |
| **Tags** | Tagae | Task categorization labels | Task organization |
| **Duration** | Duratio | Time estimation for tasks | Time tracking |
| **Estimated Duration** | Duratio Praesumpta | Predicted time for completion | Task planning |
| **Actual Duration** | Duratio Reale | Real time spent on task | Time tracking |
| **Description** | Descriptio | Detailed task explanation | Task details |
| **Category** | Categoria | Task classification | Task organization |

---

## 💻 **Code Implementation Guidelines**

### **Variable Naming**

#### **Always Use Plain English in Code**
```typescript
// ✅ Correct - Plain English
const task = createTask(taskData);
const experiencePoints = calculateExperiencePoints(difficulty);
const habitStreak = getHabitStreak(habitId);
const userLevel = calculateUserLevel(totalExperiencePoints);
const userProgress = calculateUserProgress(userStats);
const bodyStat = getUserBodyStat();
const mindStat = getUserMindStat();
const soulStat = getUserSoulStat();
const dailyGoals = getDailyGoals();
const taskCompleted = completeTask(taskId);
const newTaskCreated = createNewTask(taskData);
const rewardsEarned = calculateRewards(completedTasks);
const streakCount = getStreakCount(habitId);
const dashboardData = getDashboardData();
const settingsConfig = getSettingsConfig();
const analyticsData = getAnalyticsData();

// ✅ Correct - Extended field plain English
const taskPriority = getTaskPriority(taskId);
const taskDifficulty = getTaskDifficulty(taskId);
const taskDueDate = getTaskDueDate(taskId);
const taskTags = getTaskTags(taskId);
const taskDuration = getTaskDuration(taskId);
const estimatedDuration = getEstimatedDuration(taskId);
const actualDuration = getActualDuration(taskId);
const taskDescription = getTaskDescription(taskId);
const taskCategory = getTaskCategory(taskId);


```

#### **Function Naming**
```typescript
// ✅ Correct - Plain English functions
function createTask(taskData: TaskData): Task
function calculateExperiencePoints(difficulty: number): number
function completeTask(taskId: string): TaskCompletion
function getHabitStreak(habitId: string): number
function trackUserProgress(userStats: UserStats): Progress
function getBodyStat(): number
function getMindStat(): number
function getSoulStat(): number
function getDailyGoals(): DailyGoal[]
function completeTask(taskId: string): TaskCompletion
function createNewTask(taskData: TaskData): Task
function calculateRewards(completedTasks: Task[]): Reward[]
function getStreakCount(habitId: string): number
function getDashboardData(): DashboardData
function getSettingsConfig(): SettingsConfig
function getAnalyticsData(): AnalyticsData


```

### **Database Schema**

#### **Table Names**
```sql
-- ✅ Correct - Plain English table names
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    difficulty INTEGER DEFAULT 3,
    due_date TIMESTAMP,
    tags JSONB DEFAULT '[]'::jsonb,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    description TEXT,
    experience_reward INTEGER DEFAULT 10,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habits (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    streak INTEGER DEFAULT 0
);

CREATE TABLE goals (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_date DATE,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE daily_goals (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE achievements (
    id INTEGER PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    unlocked BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_stats (
    id INTEGER PRIMARY KEY,
    level INTEGER DEFAULT 1,
    total_experience_points INTEGER DEFAULT 0,
    body_stat INTEGER DEFAULT 0,
    mind_stat INTEGER DEFAULT 0,
    soul_stat INTEGER DEFAULT 0
);

CREATE TABLE rewards (
    id INTEGER PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    experience_points INTEGER DEFAULT 0,
    unlocked BOOLEAN DEFAULT FALSE
);

CREATE TABLE streaks (
    id INTEGER PRIMARY KEY,
    habit_id INTEGER,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completed_date DATE
);

CREATE TABLE dashboard_data (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    recent_activities JSON,
    quick_stats JSON,
    last_updated TIMESTAMP
);

CREATE TABLE settings (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    language_mode VARCHAR(20) DEFAULT 'plain',
    theme_preference VARCHAR(20) DEFAULT 'default',
    notification_settings JSON
);

CREATE TABLE analytics (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    completion_rate DECIMAL(5,2),
    average_daily_tasks INTEGER,
    streak_analytics JSON,
    progress_metrics JSON
);


```

#### **Column Names**
```sql
-- ✅ Correct - Plain English column names
experience_points INTEGER,
task_category VARCHAR(50),
habit_frequency VARCHAR(20),
goal_target_date DATE,
daily_goal_date DATE,
completion_date TIMESTAMP,
user_progress JSON,
body_stat INTEGER,
mind_stat INTEGER,
soul_stat INTEGER,
reward_points INTEGER,
streak_count INTEGER,
dashboard_stats JSON,
settings_config JSON,
analytics_data JSON



### **Extended Field Terminology**

#### **New Task Fields**
The extended task model includes additional fields that follow the same terminology principles:

##### **Priority System**
```typescript
// ✅ Correct - Plain English priority values
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// UI Display (Latin Mode)
const priorityLabels = {
  low: 'Humilis',        // Low
  medium: 'Medius',      // Medium  
  high: 'Altus',         // High
  critical: 'Criticus'   // Critical
};
```

##### **Difficulty System**
```typescript
// ✅ Correct - Plain English difficulty values
type TaskDifficulty = 1 | 2 | 3 | 4 | 5;

// UI Display (Latin Mode)
const difficultyLabels = {
  1: 'Facilis',      // Easy
  2: 'Simplex',      // Simple
  3: 'Moderatus',    // Moderate
  4: 'Difficilis',   // Challenging
  5: 'Expertus'      // Expert
};
```

##### **Duration Tracking**
```typescript
// ✅ Correct - Plain English duration fields
interface TaskDuration {
  estimatedDuration?: number; // Minutes
  actualDuration?: number;    // Minutes
}

// UI Display (Latin Mode)
const durationLabels = {
  estimatedDuration: 'Duratio Praesumpta',
  actualDuration: 'Duratio Reale'
};
```

##### **Tag System**
```typescript
// ✅ Correct - Plain English tag handling
const taskTags: string[] = ['work', 'urgent', 'project'];

// UI Display (Latin Mode)
const tagLabels = {
  work: 'Labor',
  urgent: 'Urgens',
  project: 'Proiectum'
};
```
casting_date TIMESTAMP,
user_experience_points JSON,
body_stat INTEGER,
mind_stat INTEGER,
soul_stat INTEGER,
reward_points INTEGER,
streak_count INTEGER,
dashboard_stats JSON,
settings_config JSON,
analytics_data JSON
```

### **API Endpoints**

#### **REST Endpoints**
```typescript
// ✅ Correct - Plain English endpoints
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id

GET /api/habits
POST /api/habits
PUT /api/habits/:id

GET /api/goals
POST /api/goals
PUT /api/goals/:id

GET /api/daily-goals
POST /api/daily-goals
PUT /api/daily-goals/:id

GET /api/achievements
POST /api/achievements

GET /api/progress
POST /api/progress

GET /api/stats
PUT /api/stats

GET /api/rewards
POST /api/rewards

GET /api/streaks
PUT /api/streaks/:id

GET /api/dashboard
PUT /api/dashboard

GET /api/settings
PUT /api/settings

GET /api/analytics
POST /api/analytics


```

### **Type Definitions**

#### **TypeScript Interfaces**
```typescript
// ✅ Correct - Plain English interfaces
interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  experienceReward: number;
  completed: boolean;
  createdAt: Date;
}

interface Habit {
  id: string;
  name: string;
  frequency: HabitFrequency;
  streak: number;
  lastCompleted?: Date;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  completed: boolean;
  createdAt: Date;
}

interface DailyGoal {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  createdAt: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface Progress {
  level: number;
  totalExperiencePoints: number;
  body: number;
  mind: number;
  soul: number;
}

interface UserStats {
  level: number;
  totalExperiencePoints: number;
  body: number;
  mind: number;
  soul: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  experiencePoints: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface Streak {
  id: string;
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date;
}

interface DashboardData {
  id: string;
  userId: string;
  recentActivities: Activity[];
  quickStats: QuickStats;
  lastUpdated: Date;
}

interface Settings {
  id: string;
  userId: string;
  languageMode: 'plain' | 'latin';
  themePreference: string;
  notificationSettings: NotificationSettings;
}

interface Analytics {
  id: string;
  userId: string;
  completionRate: number;
  averageDailyTasks: number;
  streakAnalytics: StreakAnalytics;
  progressMetrics: ProgressMetrics;
}


```

---

## 🎨 **UI Implementation**

### **Component Props**
```typescript
// ✅ Correct - Plain English props
interface TaskCardProps {
  task: Task;
  onTaskComplete: (taskId: string) => void;
  showProgress: boolean;
}

interface HabitTrackerProps {
  habits: Habit[];
  onHabitComplete: (habitId: string) => void;
  showStreak: boolean;
}

interface GoalTrackerProps {
  goals: Goal[];
  onGoalComplete: (goalId: string) => void;
  showProgress: boolean;
}

interface DailyGoalsProps {
  dailyGoals: DailyGoal[];
  onDailyGoalComplete: (goalId: string) => void;
  showProgress: boolean;
}

interface AchievementDisplayProps {
  achievements: Achievement[];
  onAchievementUnlock: (achievementId: string) => void;
}

interface StatsDisplayProps {
  stats: UserStats;
  showLevel: boolean;
}

interface RewardDisplayProps {
  rewards: Reward[];
  onRewardUnlock: (rewardId: string) => void;
}

interface StreakDisplayProps {
  streak: Streak;
  showProgress: boolean;
}

interface DashboardProps {
  dashboardData: DashboardData;
  onRefresh: () => void;
}

interface SettingsProps {
  settings: Settings;
  onSettingsUpdate: (settings: Settings) => void;
}

interface AnalyticsProps {
  analytics: Analytics;
  showDetailed: boolean;
}


```

### **CSS Classes**
```css
/* ✅ Correct - Plain English classes */
.task-card { }
.task-complete { }
.task-progress { }
.habit-tracker { }
.habit-streak { }
.goal-tracker { }
.goal-progress { }
.daily-goals { }
.daily-goal-complete { }
.achievement-unlocked { }
.progress-bar { }
.stats-display { }
.body-stat { }
.mind-stat { }
.soul-stat { }
.reward-display { }
.streak-display { }
.dashboard-container { }
.settings-panel { }
.analytics-view { }


```

---

## 🔄 **Language Mode Switching**

### **UI Text Switching**
```typescript
// Component for handling language mode
const TerminologyText: React.FC<{ plainText: string; latinText: string }> = ({
  plainText,
  latinText
}) => {
  const { languageMode } = useLanguageMode();
  
  return (
    <span>
      {languageMode === 'latin' ? latinText : plainText}
    </span>
  );
};

// Usage examples
<TerminologyText plainText="Create Task" latinText="Incantare Novum Transmutationem" />
<TerminologyText plainText="Complete" latinText="Transmutatio Peracta" />
<TerminologyText plainText="Habit" latinText="Ritus" />
<TerminologyText plainText="Goal" latinText="Intentum" />
<TerminologyText plainText="Daily Goals" latinText="Vota Diurna" />
<TerminologyText plainText="Progress" latinText="Virtus" />
<TerminologyText plainText="Achievement" latinText="Laurea" />
<TerminologyText plainText="Experience Points" latinText="Virtus" />
<TerminologyText plainText="Level" latinText="Ascensio" />
<TerminologyText plainText="Stats" latinText="Potentiae" />
<TerminologyText plainText="Body" latinText="Corpus" />
<TerminologyText plainText="Mind" latinText="Mens" />
<TerminologyText plainText="Soul" latinText="Anima" />
<TerminologyText plainText="Companion" latinText="Genius" />
<TerminologyText plainText="Journal" latinText="Grimoirium Vivendi" />
<TerminologyText plainText="Rewards" latinText="Praemia Arcana" />
<TerminologyText plainText="Streak" latinText="Flamma Continuata" />
<TerminologyText plainText="Dashboard" latinText="Altare Intentium" />
<TerminologyText plainText="Settings" latinText="Sigilla Occulta" />
<TerminologyText plainText="Analytics" latinText="Divinatio Numerorum" />
```

### **Language Mode Hook**
```typescript
// Hook for managing language mode
export const useLanguageMode = () => {
  const [languageMode, setLanguageMode] = useState<'plain' | 'latin'>('plain');
  
  const toggleLanguageMode = () => {
    setLanguageMode(prev => prev === 'plain' ? 'latin' : 'plain');
  };
  
  const isLatinMode = languageMode === 'latin';
  
  return {
    languageMode,
    toggleLanguageMode,
    isLatinMode
  };
};
```

---

## 📚 **Cross-References**

### **Related Documentation**
- **See: 01-overview.md** for project vision and core concepts
- **See: 02-mvp-features.md** for feature specifications and implementation
- **See: 03-technical-specs.md** for technical architecture and data models
- **See: 06-development-guide.md** for development setup and workflow

### **Implementation Guides**
- **See: 12-mvp-checklist.md** for implementation tracking and status
- **See: 11-feature-scope.md** for feature classification and scope management
- **See: 08-development-roadmap.md** for development timeline and milestones

### **Design References**
- **See: 02-user-experience.md** for UX flows and accessibility guidelines
- **See: 10-color-system.md** for visual design and color palette
- **See: 18-ui-theming-system.md** for theme system and customization

---

*"Clear language leads to clear understanding, and clear understanding leads to intentional living."* 📚✨ 