# Database Schema

*"Essential database design for Scrypture MVP development"*

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-MVP_Development-yellow)
![Database](https://img.shields.io/badge/database-Essential-blue)

## 🎯 **MVP Database Overview**

### **Core Principles**
- **Local Storage First**: MVP uses local storage for data persistence
- **Simple Schema**: Essential tables only, avoid over-engineering
- **Performance Focused**: Optimized for fast queries and updates
- **Scalable Design**: Foundation for future database migration
- **Clear Relationships**: Simple, well-defined table relationships

### **Technology Stack**
- **MVP**: Local Storage (JSON) for data persistence
- **Future**: SQLite/PostgreSQL for production database
- **Migration**: Simple JSON to SQL migration path
- **Backup**: Local storage export/import functionality

---

## 📊 **Data Storage Strategy**

### **MVP: Local Storage**
The MVP uses browser local storage for data persistence, with a clear migration path to a proper database.

### **Local Storage Schema**
```typescript
// Local Storage Keys
const STORAGE_KEYS = {
  TASKS: 'scrypture_tasks',
  USER_STATS: 'scrypture_user_stats',
  HABITS: 'scrypture_habits',
  ACHIEVEMENTS: 'scrypture_achievements',
  SETTINGS: 'scrypture_settings',
  TUTORIAL: 'scrypture_tutorial',
  TASK_TAGS: 'scrypture_task_tags', // For tag management
  TASK_PRIORITIES: 'scrypture_task_priorities' // For priority tracking
} as const;

// Data Structure Examples
interface LocalStorageData {
  tasks: Task[];
  userStats: UserStats;
  habits: Habit[];
  achievements: Achievement[];
  settings: UserSettings;
  tutorial: TutorialState;
}
```

---

## 🗄️ **Future Database Schema**

### **Core Tables**

#### **Users Table**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    settings JSONB DEFAULT '{}'::jsonb,
    plain_language_mode BOOLEAN DEFAULT FALSE,
    theme_preference VARCHAR(50) DEFAULT 'default'
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### **User Stats Table**
```sql
CREATE TABLE user_stats (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    level INTEGER DEFAULT 1,
    total_experience_points INTEGER DEFAULT 0,
    body INTEGER DEFAULT 0,
    mind INTEGER DEFAULT 0,
    soul INTEGER DEFAULT 0,
    bobr_stage VARCHAR(50) DEFAULT 'hatchling',
    dam_progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Indexes for user stats queries
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_level ON user_stats(level);
CREATE INDEX idx_user_stats_experience ON user_stats(total_experience_points);
```

#### **Tasks Table**
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    difficulty INTEGER DEFAULT 3,
    due_date TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE,
    experience_reward INTEGER DEFAULT 10,
    stat_rewards JSONB DEFAULT '{}'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    estimated_duration INTEGER, -- Duration in minutes
    actual_duration INTEGER, -- Actual time spent in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for task queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_difficulty ON tasks(difficulty);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_user_category ON tasks(user_id, category);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
CREATE INDEX idx_tasks_user_priority ON tasks(user_id, priority);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);
```

#### **Habits Table**
```sql
CREATE TABLE habits (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    frequency VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_completed TIMESTAMP
);

-- Indexes for habit queries
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_frequency ON habits(frequency);
CREATE INDEX idx_habits_streak ON habits(streak);
CREATE INDEX idx_habits_last_completed ON habits(last_completed);
```

#### **Achievements Table**
```sql
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    unlock_conditions JSONB NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for achievement queries
CREATE INDEX idx_achievements_category ON achievements(category);
```

#### **User Achievements Table**
```sql
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    achievement_id INTEGER REFERENCES achievements(id),
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Indexes for user achievements
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);
```

---

## 🔄 **Schema Version History**

### **Version Tracking Table**
```sql
CREATE TABLE schema_versions (
    id INTEGER PRIMARY KEY,
    version INTEGER NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    migration_script TEXT,
    rollback_script TEXT
);

-- Insert version history
INSERT INTO schema_versions (version, description) VALUES
(1, 'Base Task, Habit, Stats schema - MVP version'),
(2, 'Added priority, difficulty, dueDate, tags, duration fields - Requires migration logic');
```

### **Migration-Safe Schema Snippets**
```sql
-- Tasks table with DEFAULT values for migration safety
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- Migration-safe default
    difficulty INTEGER DEFAULT 3, -- Migration-safe default
    due_date TIMESTAMP DEFAULT NULL,
    completed BOOLEAN DEFAULT FALSE,
    experience_reward INTEGER DEFAULT 10,
    stat_rewards JSONB DEFAULT '{}'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb, -- Migration-safe default
    estimated_duration INTEGER DEFAULT NULL,
    actual_duration INTEGER DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Stats with migration-safe defaults
CREATE TABLE user_stats (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    level INTEGER DEFAULT 1,
    total_experience_points INTEGER DEFAULT 0,
    body INTEGER DEFAULT 0,
    mind INTEGER DEFAULT 0,
    soul INTEGER DEFAULT 0,
    bobr_stage VARCHAR(50) DEFAULT 'hatchling',
    dam_progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);
```

---

## 🔧 **Data Models**
  id: string;
  userId: string;
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
  deadline?: Date;
}

interface UserStats {
  id: string;
  userId: string;
  level: number;
  totalExperiencePoints: number;
  body: number;
  mind: number;
  soul: number;
  bobrStage: 'hatchling' | 'young' | 'mature';
  damProgress: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  bestStreak: number;
  createdAt: Date;
  lastCompleted?: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  unlockConditions: AchievementCondition;
  icon: string;
  createdAt: Date;
}

interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

interface UserSettings {
  plainLanguageMode: boolean;
  themePreference: string;
  notifications: boolean;
  arcaneMode: boolean;
}
```

---

## 📊 **Query Examples**

### **Task Queries**
```sql
-- Get all tasks for a user
SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC;

-- Get incomplete tasks by category
SELECT * FROM tasks 
WHERE user_id = ? AND completed = FALSE AND category = ?
ORDER BY created_at DESC;

-- Get completed tasks in date range
SELECT * FROM tasks 
WHERE user_id = ? AND completed = TRUE 
AND completed_at BETWEEN ? AND ?
ORDER BY completed_at DESC;

-- Get task statistics
    SELECT 
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN completed = TRUE THEN 1 END) as completed_tasks,
  SUM(CASE WHEN completed = TRUE THEN experience_reward END) as total_experience
FROM tasks WHERE user_id = ?;
```

### **User Stats Queries**
```sql
-- Get user stats
SELECT * FROM user_stats WHERE user_id = ?;

-- Update user stats
UPDATE user_stats 
SET level = ?, total_experience_points = ?, body = ?, mind = ?, soul = ?, 
    bobr_stage = ?, dam_progress = ?, updated_at = CURRENT_TIMESTAMP
WHERE user_id = ?;

-- Get level progression
SELECT level, total_experience_points 
FROM user_stats 
WHERE user_id = ? 
ORDER BY updated_at DESC;
```

### **Habit Queries**
```sql
-- Get all habits for a user
SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC;

-- Get active habits (completed today)
SELECT * FROM habits 
WHERE user_id = ? AND last_completed >= CURRENT_DATE
ORDER BY streak DESC;

-- Get habits with longest streaks
SELECT * FROM habits 
WHERE user_id = ? 
ORDER BY best_streak DESC, streak DESC;

-- Update habit completion
UPDATE habits 
SET streak = ?, best_streak = ?, last_completed = CURRENT_TIMESTAMP
WHERE id = ?;
```

### **Achievement Queries**
```sql
-- Get all achievements
SELECT * FROM achievements ORDER BY category, name;

-- Get user's unlocked achievements
SELECT a.*, ua.unlocked_at 
FROM achievements a
JOIN user_achievements ua ON a.id = ua.achievement_id
WHERE ua.user_id = ?
ORDER BY ua.unlocked_at DESC;

-- Get achievement progress
SELECT 
  COUNT(*) as total_achievements,
  COUNT(ua.id) as unlocked_achievements
FROM achievements a
LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
WHERE a.category = ?;
```

---

## 🔄 **Migration Strategy**

### **Local Storage to Database Migration**
```typescript
// Migration service
class MigrationService {
  static async migrateToDatabase(): Promise<void> {
    try {
      // Export local storage data
      const localData = this.exportLocalStorageData();
      
      // Transform data for database
      const dbData = this.transformForDatabase(localData);
      
      // Insert into database
      await this.insertIntoDatabase(dbData);
      
      // Clear local storage
      this.clearLocalStorage();
      
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  private static exportLocalStorageData(): LocalStorageData {
    return {
      tasks: StorageService.get<Task[]>(STORAGE_KEYS.TASKS) || [],
      userStats: StorageService.get<UserStats>(STORAGE_KEYS.USER_STATS) || {},
      habits: StorageService.get<Habit[]>(STORAGE_KEYS.HABITS) || [],
      achievements: StorageService.get<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS) || [],
      settings: StorageService.get<UserSettings>(STORAGE_KEYS.SETTINGS) || {},
      tutorial: StorageService.get<TutorialState>(STORAGE_KEYS.TUTORIAL) || {}
    };
  }

  private static transformForDatabase(localData: LocalStorageData): DatabaseData {
    return {
      users: this.transformUsers(localData),
      userStats: this.transformUserStats(localData),
      tasks: this.transformTasks(localData),
      habits: this.transformHabits(localData),
      userAchievements: this.transformUserAchievements(localData)
    };
  }

  private static async insertIntoDatabase(dbData: DatabaseData): Promise<void> {
    // Implementation would use database client
    console.log('Inserting data into database:', dbData);
  }
}
```

### **Database Backup/Restore**
```typescript
// Backup service
class BackupService {
  static exportData(): string {
    const data = {
      tasks: StorageService.get<Task[]>(STORAGE_KEYS.TASKS),
      userStats: StorageService.get<UserStats>(STORAGE_KEYS.USER_STATS),
      habits: StorageService.get<Habit[]>(STORAGE_KEYS.HABITS),
      achievements: StorageService.get<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS),
      settings: StorageService.get<UserSettings>(STORAGE_KEYS.SETTINGS),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      if (!this.validateImportData(data)) {
        throw new Error('Invalid backup data format');
      }
      
      // Import data
      StorageService.set(STORAGE_KEYS.TASKS, data.tasks || []);
      StorageService.set(STORAGE_KEYS.USER_STATS, data.userStats || {});
      StorageService.set(STORAGE_KEYS.HABITS, data.habits || []);
      StorageService.set(STORAGE_KEYS.ACHIEVEMENTS, data.achievements || []);
      StorageService.set(STORAGE_KEYS.SETTINGS, data.settings || {});
      
      console.log('Data imported successfully');
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }

  private static validateImportData(data: any): boolean {
    return data && 
           typeof data === 'object' && 
           'exportDate' in data && 
           'version' in data;
  }
}
```

---

## 🔧 **Performance Optimization**

### **Indexing Strategy**
```sql
-- Primary indexes for common queries
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
CREATE INDEX idx_tasks_user_category ON tasks(user_id, category);
CREATE INDEX idx_habits_user_frequency ON habits(user_id, frequency);
CREATE INDEX idx_user_achievements_user_unlocked ON user_achievements(user_id, unlocked_at);

-- Composite indexes for complex queries
CREATE INDEX idx_tasks_user_category_completed ON tasks(user_id, category, completed);
CREATE INDEX idx_habits_user_streak ON habits(user_id, streak DESC);
CREATE INDEX idx_user_stats_experience_level ON user_stats(total_experience_points, level);
```

### **Query Optimization**
```sql
-- Optimized task completion query
SELECT t.*, us.level, us.total_experience_points
FROM tasks t
JOIN user_stats us ON t.user_id = us.user_id
WHERE t.user_id = ? AND t.completed = FALSE
ORDER BY t.created_at DESC
LIMIT 50;

-- Optimized habit streak query
SELECT h.*, 
       CASE 
         WHEN h.last_completed >= CURRENT_DATE THEN TRUE 
         ELSE FALSE 
       END as completed_today
FROM habits h
WHERE h.user_id = ?
ORDER BY h.streak DESC, h.best_streak DESC;

-- Optimized achievement progress query
SELECT a.*, 
       CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END as unlocked
FROM achievements a
LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
ORDER BY a.category, a.name;
```

---

## 🧪 **Testing Strategy**

### **Database Tests**
```typescript
// Database service tests
describe('DatabaseService', () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    dbService = new DatabaseService();
  });

  test('should create and retrieve tasks', async () => {
    const taskData = {
      userId: 'user1',
      title: 'Test Task',
      category: 'body' as const
    };

    const task = await dbService.createTask(taskData);
    const retrieved = await dbService.getTask(task.id);

    expect(retrieved).toEqual(task);
  });

  test('should update user stats correctly', async () => {
    const userId = 'user1';
    const initialStats = await dbService.getUserStats(userId);
    
    await dbService.addExperiencePoints(userId, 25);
    
    const updatedStats = await dbService.getUserStats(userId);
    expect(updatedStats.totalExperiencePoints).toBe(initialStats.totalExperiencePoints + 25);
  });
});
```

### **Migration Tests**
```typescript
// Migration service tests
describe('MigrationService', () => {
  test('should migrate local storage to database', async () => {
    // Setup local storage data
    const testData = {
      tasks: [{ id: '1', title: 'Test Task', userId: 'user1' }],
      userStats: { userId: 'user1', level: 1, totalExperiencePoints: 0 }
    };
    
    StorageService.set(STORAGE_KEYS.TASKS, testData.tasks);
    StorageService.set(STORAGE_KEYS.USER_STATS, testData.userStats);

    // Perform migration
    await MigrationService.migrateToDatabase();

    // Verify data in database
    const dbTasks = await dbService.getTasks('user1');
    expect(dbTasks).toHaveLength(1);
    expect(dbTasks[0].title).toBe('Test Task');
  });
});
```

---

## 📚 **Cross-References**

### **Related Documentation**
- **See: 03-technical-specs.md** for system architecture and technical details
- **See: 04-api-reference.md** for API endpoints and integration
- **See: 06-development-guide.md** for setup and implementation guidance

### **Implementation Guides**
- **See: 12-mvp-checklist.md** for implementation tracking and status
- **See: 08-development-roadmap.md** for development timeline and milestones
- **See: 02-mvp-features.md** for feature specifications and requirements

### **Testing & Quality**
- **See: 11-feature-scope.md** for feature classification and scope management
- **See: 07-future-features.md** for advanced features and future planning

---

*"In the realm of data persistence, every table is a foundation for features, every index a path to performance, and every migration a step toward scalability."* 🗄️✨ 