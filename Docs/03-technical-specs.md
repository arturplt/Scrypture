# Technical Specifications

*"Essential technical architecture for Scrypture MVP development"*

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-MVP_Development-yellow)
![Architecture](https://img.shields.io/badge/architecture-Essential-blue)

## 🎯 **MVP Architecture Overview**

### **Core Principles**
- **Simple & Focused**: Essential features only, avoid over-engineering
- **Progressive Enhancement**: Start basic, add complexity later
- **Performance First**: Fast loading, smooth interactions
- **Accessibility**: Screen reader compatible, keyboard navigable
- **Maintainable**: Clean code, clear structure, good documentation

### **Technology Stack**
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS Modules + CSS Custom Properties
- **State Management**: React Context + Local Storage
- **Build Tool**: Vite for fast development and optimized builds
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel/Netlify for static hosting
- **Authentication**: Mock UserContext (MVP) → JWT/Auth0 (Future)
- **Sync**: Local Storage (MVP) → Cloud Sync (Future)
- **Debug**: Development Debug Panel (Dev Mode) → Production Monitoring (Future)

---

## 🏗️ **System Architecture**

### **Application Structure**
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── features/       # Feature-specific components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── services/           # Business logic services
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── styles/             # CSS and styling
└── assets/             # Images, fonts, etc.
```

### **Data Flow**
```
User Action → Component → Service → Local Storage → UI Update
```

### **State Management**
- **User State**: User progress, stats, preferences
- **App State**: UI state, navigation, modals
- **Feature State**: Task lists, habit tracking, achievements

---

## 👥 **Multi-User Architecture**

### **Auth-Ready Design Philosophy**
- **Single User MVP**: Start with mock user context for simplicity
- **Seamless Transition**: All services abstract user scope for future auth
- **Scoped Storage**: User-specific data isolation from day one
- **Mock Authentication**: Simulate multi-user environment during development

### **User Context System**
```typescript
// contexts/UserContext.tsx
interface User {
  id: string;
  username: string;
  email?: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt: Date;
}

interface UserContextType {
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

// Mock implementation for MVP
const MockUserContext = createContext<UserContextType>({
  user: {
    id: 'mock-user-001',
    username: 'ScryptureUser',
    preferences: {
      theme: 'default',
      language: 'en',
      notifications: true
    },
    createdAt: new Date(),
    lastLoginAt: new Date()
  },
  userId: 'mock-user-001',
  isAuthenticated: true,
  login: async () => {},
  logout: async () => {},
  updateUser: async () => {}
});
```

### **User-Scoped Services**
```typescript
// services/base/BaseService.ts
abstract class BaseService {
  protected getUserId(): string {
    const userContext = useContext(UserContext);
    return userContext.userId || 'mock-user-001';
  }

  protected getStorageKey(key: string): string {
    const userId = this.getUserId();
    return `${key}_${userId}`;
  }

  protected async getUserScopedData<T>(key: string): Promise<T | null> {
    const scopedKey = this.getStorageKey(key);
    return StorageService.get<T>(scopedKey);
  }

  protected async setUserScopedData<T>(key: string, data: T): Promise<void> {
    const scopedKey = this.getStorageKey(key);
    await StorageService.set(scopedKey, data);
  }
}

// services/tasks/TaskService.ts
export class TaskService extends BaseService {
  async getTasks(): Promise<Task[]> {
    return this.getUserScopedData<Task[]>('tasks') || [];
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = {
      id: this.generateId(),
      userId: this.getUserId(), // User-scoped
      ...taskData,
      createdAt: Date.now()
    };
    
    tasks.push(newTask);
    await this.setUserScopedData('tasks', tasks);
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    await this.setUserScopedData('tasks', tasks);
    return tasks[taskIndex];
  }
}
```

### **User-Scoped Storage Keys**
```typescript
// services/storage/StorageService.ts
export class StorageService {
  private static getScopedKey(baseKey: string, userId: string): string {
    return `${baseKey}_${userId}`;
  }

  static get<T>(key: string, userId?: string): T | null {
    const scopedKey = userId ? this.getScopedKey(key, userId) : key;
    try {
      const item = localStorage.getItem(scopedKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${scopedKey}`, error);
      return null;
    }
  }

  static set<T>(key: string, value: T, userId?: string): void {
    const scopedKey = userId ? this.getScopedKey(key, userId) : key;
    try {
      localStorage.setItem(scopedKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage: ${scopedKey}`, error);
    }
  }

  // User-specific storage keys
  static readonly STORAGE_KEYS = {
    TASKS: 'scrypture_tasks',
    USER_STATS: 'scrypture_user_stats',
    HABITS: 'scrypture_habits',
  }
}

---

## 🔄 **Cross-Device Sync Architecture**

### **Sync-Ready Design Philosophy**
- **Local First**: Start with local storage for immediate performance
- **Version Tags**: All data objects include version tracking for diff syncing
- **Sync Service Stub**: Placeholder for future cloud sync implementation
- **Conflict Resolution**: Version-based conflict detection and resolution
- **Offline Support**: Full functionality without internet connection

### **Version-Tagged Data Models**
```typescript
// Base interface for all syncable data
interface SyncableData {
  id: string;
  userId: string;
  version: number; // Incremental version for conflict detection
  lastModified: Date;
  deviceId: string; // Device that last modified the data
  syncStatus: 'synced' | 'pending' | 'conflict';
}

// Updated Task Model with sync support
interface Task extends SyncableData {
  title: string;
  category: string;
  completed: boolean;
  createdAt: Date;
  // Optional future fields
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  description?: string;
  tags?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  experienceReward?: number;
  statRewards?: {
    body?: number;
    mind?: number;
    soul?: number;
  };
  completedAt?: Date;
  updatedAt: Date;
}

// Updated User Stats with sync support
interface UserStats extends SyncableData {
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

// Updated Habit with sync support
interface Habit extends SyncableData {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  bestStreak: number;
  lastCompleted?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Sync Service Stub**
```typescript
// services/sync/SyncService.ts
export interface SyncConfig {
  enabled: boolean;
  syncInterval: number; // milliseconds
  conflictResolution: 'local-wins' | 'remote-wins' | 'manual';
  autoSync: boolean;
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  conflicts: SyncConflict[];
  errors: string[];
  lastSyncTime: Date;
}

export interface SyncConflict {
  id: string;
  localVersion: number;
  remoteVersion: number;
  localData: any;
  remoteData: any;
  resolved: boolean;
}

export class SyncService {
  private static instance: SyncService;
  private config: SyncConfig;
  private deviceId: string;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.config = {
      enabled: false, // Disabled for MVP
      syncInterval: 30000, // 30 seconds
      conflictResolution: 'local-wins',
      autoSync: false
    };
    this.deviceId = this.generateDeviceId();
    this.setupOnlineListener();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // MVP: Fallback to local storage
  async syncData(): Promise<SyncResult> {
    if (!this.config.enabled) {
      console.log('Sync disabled for MVP - using local storage only');
      return {
        success: true,
        syncedItems: 0,
        conflicts: [],
        errors: [],
        lastSyncTime: new Date()
      };
    }

    try {
      // Future: Implement cloud sync here
      console.log('Cloud sync not implemented yet - using local storage');
      return {
        success: true,
        syncedItems: 0,
        conflicts: [],
        errors: [],
        lastSyncTime: new Date()
      };
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        syncedItems: 0,
        conflicts: [],
        errors: [error.message],
        lastSyncTime: new Date()
      };
    }
  }

  // Version management for conflict detection
  incrementVersion(data: SyncableData): SyncableData {
    return {
      ...data,
      version: data.version + 1,
      lastModified: new Date(),
      deviceId: this.deviceId,
      syncStatus: 'pending'
    };
  }

  // Conflict detection
  detectConflict(localData: SyncableData, remoteData: SyncableData): boolean {
    return localData.version !== remoteData.version;
  }

  // Conflict resolution
  resolveConflict(localData: SyncableData, remoteData: SyncableData): SyncableData {
    switch (this.config.conflictResolution) {
      case 'local-wins':
        return localData;
      case 'remote-wins':
        return remoteData;
      case 'manual':
        // Future: Show conflict resolution UI
        return localData;
      default:
        return localData;
    }
  }

  // Device identification
  private generateDeviceId(): string {
    const existingId = localStorage.getItem('scrypture_device_id');
    if (existingId) {
      return existingId;
    }
    
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('scrypture_device_id', deviceId);
    return deviceId;
  }

  // Online/offline detection
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Device online - sync available');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Device offline - using local storage only');
    });
  }

  // Configuration management
  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('scrypture_sync_config', JSON.stringify(this.config));
  }

  getConfig(): SyncConfig {
    return { ...this.config };
  }
}
```

### **Enhanced Base Service with Sync**
```typescript
// services/base/BaseService.ts
export abstract class BaseService {
  protected syncService: SyncService;

  constructor() {
    this.syncService = SyncService.getInstance();
  }

  protected getUserId(): string {
    const savedUser = localStorage.getItem('scrypture_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return user.id;
    }
    return 'mock-user-001';
  }

  protected getScopedStorageKey(baseKey: string): string {
    const userId = this.getUserId();
    return `${baseKey}_${userId}`;
  }

  protected async getUserScopedData<T extends SyncableData>(key: string): Promise<T[] | null> {
    const scopedKey = this.getScopedStorageKey(key);
    const data = UserScopedStorageService.get<T[]>(scopedKey);
    
    // Add version tags if missing (for existing data)
    if (data && data.length > 0) {
      return data.map(item => this.ensureVersionTags(item));
    }
    
    return data;
  }

  protected async setUserScopedData<T extends SyncableData>(key: string, data: T[]): Promise<void> {
    const scopedKey = this.getScopedStorageKey(key);
    
    // Add version tags to new/modified data
    const versionedData = data.map(item => this.ensureVersionTags(item));
    
    UserScopedStorageService.set(scopedKey, versionedData);
    
    // Trigger sync if enabled
    if (this.syncService.getConfig().enabled) {
      await this.syncService.syncData();
    }
  }

  protected ensureVersionTags<T extends SyncableData>(data: T): T {
    if (!data.version) {
      return {
        ...data,
        version: 1,
        lastModified: new Date(),
        deviceId: this.syncService['deviceId'],
        syncStatus: 'synced'
      };
    }
    return data;
  }

  protected generateId(): string {
    return `${this.getUserId()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Sync-aware data operations
  protected async createSyncableData<T extends SyncableData>(
    key: string, 
    data: Omit<T, keyof SyncableData>
  ): Promise<T> {
    const existingData = await this.getUserScopedData<T>(key) || [];
    
    const newItem: T = {
      ...data,
      id: this.generateId(),
      userId: this.getUserId(),
      version: 1,
      lastModified: new Date(),
      deviceId: this.syncService['deviceId'],
      syncStatus: 'pending'
    } as T;

    existingData.push(newItem);
    await this.setUserScopedData(key, existingData);
    
    return newItem;
  }

  protected async updateSyncableData<T extends SyncableData>(
    key: string,
    id: string,
    updates: Partial<T>
  ): Promise<T> {
    const existingData = await this.getUserScopedData<T>(key) || [];
    const itemIndex = existingData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }

    const updatedItem: T = {
      ...existingData[itemIndex],
      ...updates,
      version: existingData[itemIndex].version + 1,
      lastModified: new Date(),
      deviceId: this.syncService['deviceId'],
      syncStatus: 'pending'
    };

    existingData[itemIndex] = updatedItem;
    await this.setUserScopedData(key, existingData);
    
    return updatedItem;
  }
}
```
    ACHIEVEMENTS: 'scrypture_achievements',
    SETTINGS: 'scrypture_settings',
    TUTORIAL: 'scrypture_tutorial'
  } as const;
}
```

---

## 🎨 **UI System**

### **Design Philosophy**
- **Pixel Art Game UI**: Retro gaming aesthetic with modern usability
- **Accessibility First**: Screen reader compatible, keyboard navigation
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Performance**: 60fps animations, fast loading times

### **Core Components**

#### **Color System**
```css
/* Primary Colors */
--primary: #2D1B69;      /* Deep purple */
--secondary: #8B5CF6;    /* Bright purple */
--accent: #F59E0B;       /* Golden orange */
--success: #10B981;      /* Green */
--error: #EF4444;        /* Red */

/* Background Colors */
--bg-primary: #0F0F23;   /* Dark background */
--bg-secondary: #1E1B4B; /* Slightly lighter */
--bg-tertiary: #312E81;  /* Card backgrounds */

/* Text Colors */
--text-primary: #F3F4F6; /* White text */
--text-secondary: #9CA3AF; /* Gray text */
--text-muted: #6B7280;   /* Muted text */
```

#### **Typography**
```css
/* Font Family */
font-family: 'Press Start 2P', 'Courier New', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
```

#### **Component Examples**
```typescript
// Button Component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

---

## 📊 **Data Models**

### **Core Types**
```typescript
// Task Model (Extensible Object)
interface Task {
  id: string;
  userId: string; // User-scoped
  title: string;
  category: string;
  completed: boolean;
  createdAt: number;
  // Optional future fields
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  description?: string;
  tags?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  experienceReward?: number;
  statRewards?: {
    body?: number;
    mind?: number;
    soul?: number;
  };
  completedAt?: number;
  updatedAt?: number;
}

// User Stats Model
interface UserStats {
  userId: string; // User-scoped
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

// Habit Model
interface Habit {
  id: string;
  userId: string; // User-scoped
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  bestStreak: number;
  lastCompleted?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Achievement Model
interface Achievement {
  id: string;
  userId: string; // User-scoped
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  condition: AchievementCondition;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Local Storage Schema**
```typescript
// Storage Keys
const STORAGE_KEYS = {
  TASKS: 'scrypture_tasks',
  USER_STATS: 'scrypture_user_stats',
  HABITS: 'scrypture_habits',
  ACHIEVEMENTS: 'scrypture_achievements',
  SETTINGS: 'scrypture_settings',
  TUTORIAL: 'scrypture_tutorial'
} as const;

// Storage Service
class StorageService {
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}
```

---

## 🔧 **Core Services**

### **Task Service**
```typescript
class TaskService {
  private tasks: Task[] = [];

  constructor() {
    this.loadTasks();
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    const task: Task = {
      id: generateId(),
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      completed: false,
      experienceReward: this.calculateExperienceReward(taskData.category),
      statRewards: this.getStatRewards(taskData.category),
      createdAt: new Date(),
      completedAt: null
    };

    this.tasks.push(task);
    await this.saveTasks();
    return task;
  }

  async completeTask(taskId: string): Promise<TaskCompletion> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    task.completed = true;
    task.completedAt = new Date();

    const completion: TaskCompletion = {
      experiencePointsGained: task.experienceReward,
      statGains: task.statRewards,
      levelUp: await this.checkLevelUp(task.experienceReward)
    };

    await this.saveTasks();
    return completion;
  }

  private calculateExperienceReward(category: string): number {
    const baseReward = 10;
    const categoryBonus = this.getCategoryBonus(category);
    return baseReward + categoryBonus;
  }

  private getStatRewards(category: string): StatRewards {
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

  private async saveTasks(): Promise<void> {
    StorageService.set(STORAGE_KEYS.TASKS, this.tasks);
  }

  private loadTasks(): void {
    this.tasks = StorageService.get<Task[]>(STORAGE_KEYS.TASKS) || [];
  }
}

---

## 🔄 **Schema Versioning**

### **Version Storage**
```typescript
// Version tracking in localStorage
const SCHEMA_VERSION_KEY = 'scrypture_schema_version';

class SchemaVersionService {
  static getCurrentVersion(): number {
    return StorageService.get<number>(SCHEMA_VERSION_KEY) || 1;
  }

  static setVersion(version: number): void {
    StorageService.set(SCHEMA_VERSION_KEY, version);
  }

  static needsMigration(): boolean {
    const currentVersion = this.getCurrentVersion();
    const targetVersion = 2; // Current schema version
    return currentVersion < targetVersion;
  }
}
```

### **Migration System**
```typescript
// Migration function example
async function migrateToV2(): Promise<void> {
  console.log('Starting migration to V2...');
  
  try {
    // 1. Backup existing data
    const tasks = StorageService.get<Task[]>('scrypture_tasks') || [];
    const backup = { tasks, timestamp: Date.now() };
    StorageService.set('scrypture_backup_v1', backup);
    
    // 2. Apply field defaults to existing tasks
    const migratedTasks = tasks.map(task => ({
      ...task,
      priority: task.priority || 'medium',
      difficulty: task.difficulty || 3,
      tags: task.tags || [],
      estimatedDuration: task.estimatedDuration || null,
      actualDuration: task.actualDuration || null,
      updatedAt: task.updatedAt || task.createdAt
    }));
    
    // 3. Update schema version
    SchemaVersionService.setVersion(2);
    
    // 4. Save migrated data
    StorageService.set('scrypture_tasks', migratedTasks);
    
    console.log('Migration to V2 completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Migration runner
async function runMigrations(): Promise<void> {
  const currentVersion = SchemaVersionService.getCurrentVersion();
  
  if (currentVersion < 2) {
    await migrateToV2();
  }
  
  // Future migrations would be added here
  // if (currentVersion < 3) {
  //   await migrateToV3();
  // }
}
```
```

### **User Stats Service**
```typescript
class UserStatsService {
  private stats: UserStats;

  constructor() {
    this.stats = this.loadStats();
  }

  addExperiencePoints(points: number): LevelUpResult {
    this.stats.totalExperiencePoints += points;
    const newLevel = this.calculateLevel(this.stats.totalExperiencePoints);
    const leveledUp = newLevel > this.stats.level;

    if (leveledUp) {
      this.stats.level = newLevel;
      this.updateBobrStage();
      this.saveStats();
      return { leveledUp: true, newLevel, oldLevel: this.stats.level };
    }

    this.saveStats();
    return { leveledUp: false };
  }

  addStatRewards(rewards: StatRewards): void {
    this.stats.body += rewards.body || 0;
    this.stats.mind += rewards.mind || 0;
    this.stats.soul += rewards.soul || 0;
    this.saveStats();
  }

  private calculateLevel(totalExperiencePoints: number): number {
    const thresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700];
    return thresholds.findIndex(threshold => totalExperiencePoints < threshold);
  }

  private updateBobrStage(): void {
    if (this.stats.level <= 3) this.stats.bobrStage = 'hatchling';
    else if (this.stats.level <= 6) this.stats.bobrStage = 'young';
    else this.stats.bobrStage = 'mature';
  }

  private saveStats(): void {
    StorageService.set(STORAGE_KEYS.USER_STATS, this.stats);
  }

  private loadStats(): UserStats {
    return StorageService.get<UserStats>(STORAGE_KEYS.USER_STATS) || {
      level: 1,
      totalExperiencePoints: 0,
      body: 0,
      mind: 0,
      soul: 0,
      bobrStage: 'hatchling',
      damProgress: 0
    };
  }
}
```

---

## 🎮 **Bóbr Companion System**

### **Companion Service**
```typescript
class BobrService {
  private readonly evolutionStages = ['hatchling', 'young', 'mature'];

  getBobrStage(userLevel: number): string {
    if (userLevel <= 3) return 'hatchling';
    if (userLevel <= 6) return 'young';
    return 'mature';
  }

  getMotivationalMessage(context: 'task_complete' | 'level_up' | 'streak_maintained'): string {
    const messages = {
      task_complete: [
        "Well done, apprentice. Another log laid in the dam of destiny.",
        "The waters flow stronger with your effort.",
        "Your focus builds our sanctuary."
      ],
      level_up: [
        "Your power grows, and so does our sanctuary.",
        "Level up! You're getting stronger and so am I!",
        "The ancient wisdom flows through you now."
      ],
      streak_maintained: [
        "The ancient rhythms guide us well.",
        "Consistency is the strongest magic.",
        "Your dedication strengthens us both."
      ]
    };

    const contextMessages = messages[context];
    return contextMessages[Math.floor(Math.random() * contextMessages.length)];
  }

  calculateDamProgress(completedTasks: number): number {
    return Math.min(completedTasks * 2, 100);
  }
}
```

---

## 🔮 **Habit System**

### **Habit Service**
```typescript
class HabitService {
  private habits: Habit[] = [];

  constructor() {
    this.loadHabits();
  }

  async createHabit(habitData: CreateHabitData): Promise<Habit> {
    const habit: Habit = {
      id: generateId(),
      name: habitData.name,
      frequency: habitData.frequency,
      streak: 0,
      bestStreak: 0,
      lastCompleted: null,
      createdAt: new Date()
    };

    this.habits.push(habit);
    await this.saveHabits();
    return habit;
  }

  async completeHabit(habitId: string): Promise<HabitCompletion> {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) throw new Error('Habit not found');

    const today = new Date();
    const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
    
    // Check if already completed today
    if (lastCompleted && this.isSameDay(lastCompleted, today)) {
      throw new Error('Habit already completed today');
    }

    // Update streak
    if (lastCompleted && this.isConsecutiveDay(lastCompleted, today)) {
      habit.streak++;
    } else {
      habit.streak = 1;
    }

    habit.bestStreak = Math.max(habit.streak, habit.bestStreak);
    habit.lastCompleted = today;

    await this.saveHabits();
    return { habit, streakIncreased: true };
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private isConsecutiveDay(date1: Date, date2: Date): boolean {
    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  private async saveHabits(): Promise<void> {
    StorageService.set(STORAGE_KEYS.HABITS, this.habits);
  }

  private loadHabits(): void {
    this.habits = StorageService.get<Habit[]>(STORAGE_KEYS.HABITS) || [];
  }
}
```

---

## 🏆 **Achievement System**

### **Achievement Service**
```typescript
class AchievementService {
  private achievements: Achievement[] = [];

  constructor() {
    this.loadAchievements();
  }

  checkAchievements(userStats: UserStats, tasks: Task[], habits: Habit[]): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    this.achievements.forEach(achievement => {
      if (!achievement.unlocked && this.checkCondition(achievement.condition, userStats, tasks, habits)) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        unlockedAchievements.push(achievement);
      }
    });

    if (unlockedAchievements.length > 0) {
      this.saveAchievements();
    }

    return unlockedAchievements;
  }

  private checkCondition(condition: AchievementCondition, userStats: UserStats, tasks: Task[], habits: Habit[]): boolean {
    switch (condition.type) {
      case 'level_reach':
        return userStats.level >= condition.value;
      case 'task_complete':
        return tasks.filter(t => t.completed).length >= condition.value;
      case 'habit_streak':
        return habits.some(h => h.streak >= condition.value);
      case 'stat_reach':
        return userStats[condition.stat] >= condition.value;
      default:
        return false;
    }
  }

  private saveAchievements(): void {
    StorageService.set(STORAGE_KEYS.ACHIEVEMENTS, this.achievements);
  }

  private loadAchievements(): void {
    this.achievements = StorageService.get<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS) || this.getDefaultAchievements();
  }

  private getDefaultAchievements(): Achievement[] {
    return [
      {
        id: 'first_task',
        title: 'First Steps',
        description: 'Complete your first task',
        icon: '🌟',
        unlocked: false,
        condition: { type: 'task_complete', value: 1 }
      },
      {
        id: 'level_5',
        title: 'Apprentice',
        description: 'Reach level 5',
        icon: '📚',
        unlocked: false,
        condition: { type: 'level_reach', value: 5 }
      },
      {
        id: 'habit_master',
        title: 'Habit Master',
        description: 'Maintain a 7-day habit streak',
        icon: '🔥',
        unlocked: false,
        condition: { type: 'habit_streak', value: 7 }
      }
    ];
  }
}
```

---

## 🎓 **Onboarding System**

### **Tutorial Service**
```typescript
class TutorialService {
  private tutorialSteps = {
    welcome: { completed: false, required: true },
    ancientBobrIntro: { completed: false, required: true },
    damMetaphor: { completed: false, required: true },
    taskExplanation: { completed: false, required: true },
    firstTask: { completed: false, required: true },
    hatchlingIntro: { completed: false, required: true },
    completion: { completed: false, required: true }
  };

  constructor() {
    this.loadTutorialState();
  }

  startTutorial(): void {
    this.showWelcomeScreen();
  }

  markStepComplete(stepName: string): void {
    if (this.tutorialSteps[stepName]) {
      this.tutorialSteps[stepName].completed = true;
      this.saveTutorialState();
      
      if (this.isTutorialCompleted()) {
        this.completeTutorial();
      }
    }
  }

  private isTutorialCompleted(): boolean {
    return Object.values(this.tutorialSteps).every(step => step.completed);
  }

  private completeTutorial(): void {
    StorageService.set(STORAGE_KEYS.TUTORIAL, { completed: true });
    this.triggerTutorialCompletion();
  }

  private saveTutorialState(): void {
    StorageService.set('tutorial_steps', this.tutorialSteps);
  }

  private loadTutorialState(): void {
    const saved = StorageService.get('tutorial_steps');
    if (saved) {
      this.tutorialSteps = { ...this.tutorialSteps, ...saved };
    }
  }
}
```

---

## 🔧 **Performance & Optimization**

### **Performance Targets**
- **Initial Load**: <2 seconds
- **Task Completion**: <500ms response time
- **Animations**: 60fps smooth transitions
- **Memory Usage**: <50MB for typical usage
- **Storage**: <1MB for user data

### **Optimization Strategies**
```typescript
// Lazy Loading
const TaskList = lazy(() => import('./components/features/tasks/TaskList'));
const HabitTracker = lazy(() => import('./components/features/habits/HabitTracker'));

// Memoization
const TaskCard = memo(({ task, onComplete }: TaskCardProps) => {
  // Component implementation
});

// Debounced Search
const useDebouncedSearch = (delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, delay);
  
  return { searchTerm, setSearchTerm, debouncedSearchTerm };
};
```

### **Error Handling**
```typescript
// Global Error Boundary
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}
```

---

## 🧪 **Testing Strategy**

### **Unit Tests for Extended Task Model**

#### **TaskService Tests**
```typescript
// services/tasks/__tests__/taskService.test.ts
import { TaskService } from '../taskService';
import { StorageService } from '../../storage/storageService';

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    // Clear storage before each test
    StorageService.clear();
    taskService = new TaskService();
  });

  afterEach(() => {
    StorageService.clear();
  });

  describe('createTask', () => {
    test('should create task with all required fields', async () => {
      const taskData = {
        title: 'Test Task',
        category: 'body' as const
      };

      const task = await taskService.createTask(taskData);

      expect(task.title).toBe('Test Task');
      expect(task.category).toBe('body');
      expect(task.completed).toBe(false);
      expect(task.experienceReward).toBeGreaterThan(0);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    test('should create task with default values for optional fields', async () => {
      const taskData = {
        title: 'Test Task',
        category: 'body' as const
      };

      const task = await taskService.createTask(taskData);

      // Check default values
      expect(task.priority).toBe('medium');
      expect(task.difficulty).toBe(3);
      expect(task.tags).toEqual([]);
      expect(task.dueDate).toBeUndefined();
      expect(task.estimatedDuration).toBeUndefined();
      expect(task.actualDuration).toBeUndefined();
    });

    test('should create task with all extended fields', async () => {
      const taskData = {
        title: 'Complex Task',
        description: 'A complex task with all fields',
        category: 'mind' as const,
        priority: 'high' as const,
        difficulty: 5,
        dueDate: new Date('2024-01-20T09:00:00'),
        tags: ['complex', 'important', 'urgent'],
        estimatedDuration: 120
      };

      const task = await taskService.createTask(taskData);

      expect(task.title).toBe('Complex Task');
      expect(task.description).toBe('A complex task with all fields');
      expect(task.category).toBe('mind');
      expect(task.priority).toBe('high');
      expect(task.difficulty).toBe(5);
      expect(task.dueDate).toEqual(new Date('2024-01-20T09:00:00'));
      expect(task.tags).toEqual(['complex', 'important', 'urgent']);
      expect(task.estimatedDuration).toBe(120);
      expect(task.actualDuration).toBeUndefined();
    });

    test('should calculate experience reward based on priority and difficulty', async () => {
      const easyTask = await taskService.createTask({
        title: 'Easy Task',
        category: 'body' as const,
        priority: 'low' as const,
        difficulty: 1
      });

      const hardTask = await taskService.createTask({
        title: 'Hard Task',
        category: 'mind' as const,
        priority: 'critical' as const,
        difficulty: 5
      });

      // Critical priority (1.6x) + difficulty 5 should give more XP than low priority (0.8x) + difficulty 1
      expect(hardTask.experienceReward).toBeGreaterThan(easyTask.experienceReward);
    });
  });

  describe('updateTask', () => {
    test('should update task fields and update updatedAt timestamp', async () => {
      const task = await taskService.createTask({
        title: 'Original Task',
        category: 'body' as const
      });

      const originalUpdatedAt = task.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const updatedTask = await taskService.updateTask(task.id, {
        title: 'Updated Task',
        priority: 'high' as const,
        difficulty: 4,
        tags: ['updated', 'important']
      });

      expect(updatedTask.title).toBe('Updated Task');
      expect(updatedTask.priority).toBe('high');
      expect(updatedTask.difficulty).toBe(4);
      expect(updatedTask.tags).toEqual(['updated', 'important']);
      expect(updatedTask.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('completeTask', () => {
    test('should complete task and track actual duration', async () => {
      const task = await taskService.createTask({
        title: 'Task to Complete',
        category: 'body' as const,
        estimatedDuration: 30
      });

      const completion = await taskService.completeTask(task.id, { actualDuration: 25 });

      expect(completion.task.completed).toBe(true);
      expect(completion.task.completedAt).toBeInstanceOf(Date);
      expect(completion.task.actualDuration).toBe(25);
      expect(completion.experiencePointsGained).toBe(task.experienceReward);
    });
  });
});
```

#### **Task Validation Tests**
```typescript
// utils/validation/__tests__/taskValidation.test.ts
import { validateTask, validateCreateTaskData } from '../taskValidation';

describe('Task Validation', () => {
  describe('validateCreateTaskData', () => {
    test('should validate valid task data', () => {
      const validData = {
        title: 'Valid Task',
        category: 'body' as const,
        priority: 'medium' as const,
        difficulty: 3,
        tags: ['valid', 'test'],
        estimatedDuration: 30
      };

      const result = validateCreateTaskData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject task without title', () => {
      const invalidData = {
        category: 'body' as const
      };

      const result = validateCreateTaskData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    test('should reject task with invalid priority', () => {
      const invalidData = {
        title: 'Test Task',
        category: 'body' as const,
        priority: 'invalid' as any
      };

      const result = validateCreateTaskData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Priority must be one of: low, medium, high, critical');
    });

    test('should reject task with invalid difficulty', () => {
      const invalidData = {
        title: 'Test Task',
        category: 'body' as const,
        difficulty: 6
      };

      const result = validateCreateTaskData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Difficulty must be between 1 and 5');
    });

    test('should reject task with negative estimated duration', () => {
      const invalidData = {
        title: 'Test Task',
        category: 'body' as const,
        estimatedDuration: -10
      };

      const result = validateCreateTaskData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Estimated duration must be positive');
    });
  });
});
```

#### **Storage Service Tests**
```typescript
// services/storage/__tests__/storageService.test.ts
import { StorageService } from '../storageService';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('should store and retrieve task data with extended fields', () => {
    const taskData = {
      id: 'test-id',
      title: 'Test Task',
      category: 'body' as const,
      priority: 'high' as const,
      difficulty: 4,
      dueDate: new Date('2024-01-20T09:00:00'),
      completed: false,
      experienceReward: 25,
      statRewards: { body: 10 },
      tags: ['test', 'important'],
      estimatedDuration: 45,
      actualDuration: undefined,
      createdAt: new Date(),
      completedAt: null,
      updatedAt: new Date()
    };

    StorageService.set(StorageService.STORAGE_KEYS.TASKS, [taskData]);
    const retrieved = StorageService.get<any[]>(StorageService.STORAGE_KEYS.TASKS);

    expect(retrieved).toHaveLength(1);
    expect(retrieved[0]).toMatchObject({
      id: 'test-id',
      title: 'Test Task',
      priority: 'high',
      difficulty: 4,
      tags: ['test', 'important'],
      estimatedDuration: 45
    });
  });

  test('should handle missing data gracefully', () => {
    const result = StorageService.get<string[]>('nonexistent-key');
    expect(result).toBeNull();
  });
});
```

### **Integration Tests**
```typescript
// TaskCompletion.test.ts
describe('Task Completion Flow', () => {
  test('should complete task and update user stats', async () => {
    const taskService = new TaskService();
    const statsService = new UserStatsService();

    // Create task
    const task = await taskService.createTask({
      title: 'Morning Exercise',
      category: 'body'
    });

    // Complete task
    const completion = await taskService.completeTask(task.id);

    // Check user stats updated
    const stats = statsService.getStats();
    expect(stats.body).toBe(task.statRewards.body);
    expect(stats.totalExperiencePoints).toBe(task.experienceReward);
  });
});
```

### **Default Field Handling in Service Design**

#### **Service Layer Default Values**
```typescript
// services/tasks/taskService.ts
export class TaskService {
  // Default values for optional fields
  private static readonly DEFAULT_VALUES = {
    priority: 'medium' as const,
    difficulty: 3,
    tags: [] as string[],
    estimatedDuration: undefined,
    actualDuration: undefined
  } as const;

  async createTask(taskData: CreateTaskData): Promise<Task> {
    const task: Task = {
      id: this.generateId(),
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      // Apply defaults for optional fields
      priority: taskData.priority ?? this.DEFAULT_VALUES.priority,
      difficulty: taskData.difficulty ?? this.DEFAULT_VALUES.difficulty,
      dueDate: taskData.dueDate,
      completed: false,
      experienceReward: this.calculateExperienceReward(
        taskData.category, 
        taskData.priority ?? this.DEFAULT_VALUES.priority,
        taskData.difficulty ?? this.DEFAULT_VALUES.difficulty
      ),
      statRewards: this.getStatRewards(taskData.category),
      tags: taskData.tags ?? this.DEFAULT_VALUES.tags,
      estimatedDuration: taskData.estimatedDuration ?? this.DEFAULT_VALUES.estimatedDuration,
      actualDuration: taskData.actualDuration ?? this.DEFAULT_VALUES.actualDuration,
      createdAt: new Date(),
      completedAt: null,
      updatedAt: new Date()
    };

    this.tasks.push(task);
    await this.saveTasks();
    return task;
  }
}
```

#### **Validation with Default Handling**
```typescript
// utils/validation/taskValidation.ts
export const validateCreateTaskData = (data: Partial<CreateTaskData>): ValidationResult => {
  const errors: string[] = [];
  
  // Required fields
  if (!data.title?.trim()) {
    errors.push('Title is required');
  }
  
  if (!data.category) {
    errors.push('Category is required');
  }
  
  // Optional fields with validation
  if (data.priority && !['low', 'medium', 'high', 'critical'].includes(data.priority)) {
    errors.push('Priority must be one of: low, medium, high, critical');
  }
  
  if (data.difficulty && (data.difficulty < 1 || data.difficulty > 5)) {
    errors.push('Difficulty must be between 1 and 5');
  }
  
  if (data.estimatedDuration && data.estimatedDuration <= 0) {
    errors.push('Estimated duration must be positive');
  }
  
  if (data.actualDuration && data.actualDuration <= 0) {
    errors.push('Actual duration must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

#### **Migration Strategy for Default Values**
```typescript
// services/migrations/taskMigration.ts
export class TaskMigration {
  static migrateToExtendedFields(): void {
    const tasks = StorageService.get<Task[]>(StorageService.STORAGE_KEYS.TASKS) || [];
    
    const migratedTasks = tasks.map(task => ({
      ...task,
      // Add default values for new fields
      priority: task.priority || 'medium',
      difficulty: task.difficulty || 3,
      tags: task.tags || [],
      estimatedDuration: task.estimatedDuration,
      actualDuration: task.actualDuration,
      updatedAt: new Date()
    }));
    
    StorageService.set(StorageService.STORAGE_KEYS.TASKS, migratedTasks);
  }
}
```

---

## 🚀 **Deployment**

### **Build Configuration**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'date-fns']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
```

### **Environment Configuration**
```bash
# .env.development
VITE_API_URL=http://localhost:3000
VITE_APP_ENV=development
VITE_DEBUG=true

# .env.production
VITE_API_URL=https://api.scrypture.app
VITE_APP_ENV=production
VITE_ANALYTICS_ID=your-analytics-id
```

---

## 📚 **Cross-References**

### **Related Documentation**
- **See: 02-mvp-features.md** for feature specifications and requirements
- **See: 04-api-reference.md** for API endpoints and integration
- **See: 05-database-schema.md** for data models and database design
- **See: 06-development-guide.md** for setup and implementation guidance

### **Implementation Guides**
- **See: 12-mvp-checklist.md** for implementation tracking and status
- **See: 08-development-roadmap.md** for development timeline and milestones
- **See: 10-color-system.md** for visual design and styling guidelines

### **Testing & Quality**
- **See: 11-feature-scope.md** for feature classification and scope management
- **See: 07-future-features.md** for advanced features and future planning

---

## 🧠 **Data Observability & Debug Layer**

### **Debug-Ready Design Philosophy**
- **Development Visibility**: Real-time data inspection in dev mode
- **Schema Versioning**: Track data structure changes and migrations
- **Migration Logging**: Complete audit trail of data transformations
- **Performance Monitoring**: Track storage usage and sync performance
- **Error Tracking**: Comprehensive error logging and debugging
- **Production Safety**: Debug tools disabled in production builds

### **Debug Panel Architecture**
```typescript
// components/debug/DebugPanel.tsx
interface DebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

interface DebugData {
  schemaVersion: string;
  lastMigration: Date;
  storageUsage: StorageUsage;
  syncStatus: SyncStatus;
  userData: UserDataSnapshot;
  errors: ErrorLog[];
  performance: PerformanceMetrics;
}

interface StorageUsage {
  totalSize: number;
  availableSize: number;
  usedPercentage: number;
  breakdown: {
    tasks: number;
    habits: number;
    stats: number;
    settings: number;
  };
}

interface SyncStatus {
  lastSync: Date;
  pendingItems: number;
  conflicts: number;
  errors: string[];
  isOnline: boolean;
}

interface UserDataSnapshot {
  tasks: Task[];
  habits: Habit[];
  stats: UserStats;
  achievements: Achievement[];
  settings: UserSettings;
}

interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context: Record<string, any>;
}

interface PerformanceMetrics {
  loadTime: number;
  syncTime: number;
  storageOperations: number;
  memoryUsage: number;
}
```

### **Debug Service Implementation**
```typescript
// services/debug/DebugService.ts
export class DebugService {
  private static instance: DebugService;
  private errorLogs: ErrorLog[] = [];
  private performanceMetrics: PerformanceMetrics;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.performanceMetrics = {
      loadTime: 0,
      syncTime: 0,
      storageOperations: 0,
      memoryUsage: 0
    };
  }

  static getInstance(): DebugService {
    if (!DebugService.instance) {
      DebugService.instance = new DebugService();
    }
    return DebugService.instance;
  }

  // Schema version management
  getSchemaVersion(): string {
    return localStorage.getItem('scrypture_schema_version') || '1.0.0';
  }

  setSchemaVersion(version: string): void {
    localStorage.setItem('scrypture_schema_version', version);
    this.logMigration(`Schema updated to version ${version}`);
  }

  // Migration logging
  logMigration(description: string, data?: any): void {
    const migration = {
      id: `migration_${Date.now()}`,
      timestamp: new Date(),
      description,
      data,
      schemaVersion: this.getSchemaVersion()
    };

    const migrations = this.getMigrations();
    migrations.push(migration);
    localStorage.setItem('scrypture_migrations', JSON.stringify(migrations));
  }

  getMigrations(): MigrationLog[] {
    const migrations = localStorage.getItem('scrypture_migrations');
    return migrations ? JSON.parse(migrations) : [];
  }

  // Storage usage monitoring
  getStorageUsage(): StorageUsage {
    const totalSize = 5 * 1024 * 1024; // 5MB localStorage limit
    let usedSize = 0;
    const breakdown: Record<string, number> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('scrypture_')) {
        const value = localStorage.getItem(key);
        const size = new Blob([value || '']).size;
        usedSize += size;

        // Categorize by key prefix
        const category = key.replace('scrypture_', '').split('_')[0];
        breakdown[category] = (breakdown[category] || 0) + size;
      }
    }

    return {
      totalSize,
      availableSize: totalSize - usedSize,
      usedPercentage: (usedSize / totalSize) * 100,
      breakdown
    };
  }

  // Error logging
  logError(message: string, error?: Error, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level: 'error',
      message,
      stack: error?.stack,
      context: context || {}
    };

    this.errorLogs.push(errorLog);
    this.persistErrorLogs();

    // Console output in development
    if (this.isDevelopment) {
      console.error(`[Scrypture Debug] ${message}`, error, context);
    }
  }

  logWarning(message: string, context?: Record<string, any>): void {
    const warningLog: ErrorLog = {
      id: `warn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level: 'warn',
      message,
      context: context || {}
    };

    this.errorLogs.push(warningLog);
    this.persistErrorLogs();

    if (this.isDevelopment) {
      console.warn(`[Scrypture Debug] ${message}`, context);
    }
  }

  getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  clearErrorLogs(): void {
    this.errorLogs = [];
    this.persistErrorLogs();
  }

  private persistErrorLogs(): void {
    localStorage.setItem('scrypture_error_logs', JSON.stringify(this.errorLogs));
  }

  // Performance monitoring
  startTimer(operation: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordPerformance(operation, duration);
    };
  }

  recordPerformance(operation: string, duration: number): void {
    switch (operation) {
      case 'load':
        this.performanceMetrics.loadTime = duration;
        break;
      case 'sync':
        this.performanceMetrics.syncTime = duration;
        break;
      case 'storage':
        this.performanceMetrics.storageOperations++;
        break;
    }

    if (this.isDevelopment) {
      console.log(`[Scrypture Debug] ${operation} took ${duration.toFixed(2)}ms`);
    }
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  // Data snapshot
  async getDataSnapshot(): Promise<UserDataSnapshot> {
    const userId = this.getCurrentUserId();
    
    return {
      tasks: await this.getUserData('tasks') || [],
      habits: await this.getUserData('habits') || [],
      stats: await this.getUserData('stats') || {},
      achievements: await this.getUserData('achievements') || [],
      settings: await this.getUserData('settings') || {}
    };
  }

  private getCurrentUserId(): string {
    const savedUser = localStorage.getItem('scrypture_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return user.id;
    }
    return 'mock-user-001';
  }

  private async getUserData<T>(key: string): Promise<T | null> {
    const scopedKey = `${key}_${this.getCurrentUserId()}`;
    const data = localStorage.getItem(scopedKey);
    return data ? JSON.parse(data) : null;
  }

  // Debug utilities
  exportData(): string {
    const debugData = {
      schemaVersion: this.getSchemaVersion(),
      migrations: this.getMigrations(),
      errorLogs: this.getErrorLogs(),
      performance: this.getPerformanceMetrics(),
      storageUsage: this.getStorageUsage(),
      dataSnapshot: this.getDataSnapshot(),
      timestamp: new Date()
    };

    return JSON.stringify(debugData, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      // Validate and import debug data
      if (data.schemaVersion) {
        this.setSchemaVersion(data.schemaVersion);
      }
      // Add more import logic as needed
    } catch (error) {
      this.logError('Failed to import debug data', error);
    }
  }

  // Development mode check
  isDevMode(): boolean {
    return this.isDevelopment;
  }
}
```

### **Debug Panel Component**
```typescript
// components/debug/DebugPanel.tsx
import React, { useState, useEffect } from 'react';
import { DebugService } from '../../services/debug/DebugService';

export const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'errors' | 'performance' | 'storage'>('overview');
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const debugService = DebugService.getInstance();

  useEffect(() => {
    if (isVisible) {
      updateDebugData();
      const interval = setInterval(updateDebugData, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const updateDebugData = async () => {
    const data: DebugData = {
      schemaVersion: debugService.getSchemaVersion(),
      lastMigration: debugService.getMigrations().slice(-1)[0]?.timestamp || new Date(),
      storageUsage: debugService.getStorageUsage(),
      syncStatus: await getSyncStatus(),
      userData: await debugService.getDataSnapshot(),
      errors: debugService.getErrorLogs(),
      performance: debugService.getPerformanceMetrics()
    };
    setDebugData(data);
  };

  const getSyncStatus = async (): Promise<SyncStatus> => {
    // Mock sync status for MVP
    return {
      lastSync: new Date(),
      pendingItems: 0,
      conflicts: 0,
      errors: [],
      isOnline: navigator.onLine
    };
  };

  if (!debugService.isDevMode() || !isVisible) {
    return null;
  }

  return (
    <div className="debug-panel">
      <div className="debug-panel-header">
        <h3>🧠 Scrypture Debug Panel</h3>
        <button onClick={onClose} className="debug-close-btn">×</button>
      </div>

      <div className="debug-panel-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'data' ? 'active' : ''} 
          onClick={() => setActiveTab('data')}
        >
          Data
        </button>
        <button 
          className={activeTab === 'errors' ? 'active' : ''} 
          onClick={() => setActiveTab('errors')}
        >
          Errors
        </button>
        <button 
          className={activeTab === 'performance' ? 'active' : ''} 
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button 
          className={activeTab === 'storage' ? 'active' : ''} 
          onClick={() => setActiveTab('storage')}
        >
          Storage
        </button>
      </div>

      <div className="debug-panel-content">
        {activeTab === 'overview' && <OverviewTab debugData={debugData} />}
        {activeTab === 'data' && <DataTab debugData={debugData} />}
        {activeTab === 'errors' && <ErrorsTab debugData={debugData} />}
        {activeTab === 'performance' && <PerformanceTab debugData={debugData} />}
        {activeTab === 'storage' && <StorageTab debugData={debugData} />}
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab: React.FC<{ debugData: DebugData | null }> = ({ debugData }) => {
  if (!debugData) return <div>Loading...</div>;

  return (
    <div className="debug-overview">
      <div className="debug-card">
        <h4>Schema Version</h4>
        <p>{debugData.schemaVersion}</p>
        <small>Last migration: {debugData.lastMigration.toLocaleString()}</small>
      </div>

      <div className="debug-card">
        <h4>Storage Usage</h4>
        <div className="storage-bar">
          <div 
            className="storage-fill" 
            style={{ width: `${debugData.storageUsage.usedPercentage}%` }}
          />
        </div>
        <p>{debugData.storageUsage.usedPercentage.toFixed(1)}% used</p>
      </div>

      <div className="debug-card">
        <h4>Sync Status</h4>
        <p>Online: {debugData.syncStatus.isOnline ? '✅' : '❌'}</p>
        <p>Pending: {debugData.syncStatus.pendingItems}</p>
        <p>Conflicts: {debugData.syncStatus.conflicts}</p>
      </div>

      <div className="debug-card">
        <h4>Recent Errors</h4>
        <p>{debugData.errors.filter(e => e.level === 'error').length} errors</p>
        <p>{debugData.errors.filter(e => e.level === 'warn').length} warnings</p>
      </div>
    </div>
  );
};

const DataTab: React.FC<{ debugData: DebugData | null }> = ({ debugData }) => {
  if (!debugData) return <div>Loading...</div>;

  return (
    <div className="debug-data">
      <div className="debug-section">
        <h4>Tasks ({debugData.userData.tasks.length})</h4>
        <pre>{JSON.stringify(debugData.userData.tasks, null, 2)}</pre>
      </div>

      <div className="debug-section">
        <h4>Habits ({debugData.userData.habits.length})</h4>
        <pre>{JSON.stringify(debugData.userData.habits, null, 2)}</pre>
      </div>

      <div className="debug-section">
        <h4>User Stats</h4>
        <pre>{JSON.stringify(debugData.userData.stats, null, 2)}</pre>
      </div>
    </div>
  );
};

const ErrorsTab: React.FC<{ debugData: DebugData | null }> = ({ debugData }) => {
  const debugService = DebugService.getInstance();

  const clearErrors = () => {
    debugService.clearErrorLogs();
    // Trigger re-render
    window.location.reload();
  };

  if (!debugData) return <div>Loading...</div>;

  return (
    <div className="debug-errors">
      <div className="debug-actions">
        <button onClick={clearErrors}>Clear All Errors</button>
      </div>

      {debugData.errors.map(error => (
        <div key={error.id} className={`debug-error debug-error-${error.level}`}>
          <div className="error-header">
            <span className="error-level">{error.level.toUpperCase()}</span>
            <span className="error-time">{error.timestamp.toLocaleString()}</span>
          </div>
          <div className="error-message">{error.message}</div>
          {error.stack && (
            <details>
              <summary>Stack Trace</summary>
              <pre>{error.stack}</pre>
            </details>
          )}
          {Object.keys(error.context).length > 0 && (
            <details>
              <summary>Context</summary>
              <pre>{JSON.stringify(error.context, null, 2)}</pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
};

const PerformanceTab: React.FC<{ debugData: DebugData | null }> = ({ debugData }) => {
  if (!debugData) return <div>Loading...</div>;

  return (
    <div className="debug-performance">
      <div className="debug-card">
        <h4>Load Time</h4>
        <p>{debugData.performance.loadTime.toFixed(2)}ms</p>
      </div>

      <div className="debug-card">
        <h4>Sync Time</h4>
        <p>{debugData.performance.syncTime.toFixed(2)}ms</p>
      </div>

      <div className="debug-card">
        <h4>Storage Operations</h4>
        <p>{debugData.performance.storageOperations}</p>
      </div>

      <div className="debug-card">
        <h4>Memory Usage</h4>
        <p>{debugData.performance.memoryUsage.toFixed(2)}MB</p>
      </div>
    </div>
  );
};

const StorageTab: React.FC<{ debugData: DebugData | null }> = ({ debugData }) => {
  if (!debugData) return <div>Loading...</div>;

  return (
    <div className="debug-storage">
      <div className="debug-card">
        <h4>Storage Breakdown</h4>
        {Object.entries(debugData.storageUsage.breakdown).map(([category, size]) => (
          <div key={category} className="storage-item">
            <span>{category}</span>
            <span>{(size / 1024).toFixed(2)}KB</span>
          </div>
        ))}
      </div>

      <div className="debug-card">
        <h4>Storage Actions</h4>
        <button onClick={() => {
          const data = DebugService.getInstance().exportData();
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `scrypture-debug-${Date.now()}.json`;
          a.click();
        }}>
          Export Debug Data
        </button>
      </div>
    </div>
  );
};
```

### **Debug Panel Integration**
```typescript
// App.tsx or main layout component
import { DebugPanel } from './components/debug/DebugPanel';
import { DebugService } from './services/debug/DebugService';

const App: React.FC = () => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const debugService = DebugService.getInstance();

  // Show debug panel in development mode
  useEffect(() => {
    if (debugService.isDevMode()) {
      // Add keyboard shortcut to toggle debug panel
      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
          setShowDebugPanel(prev => !prev);
        }
      };

      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  return (
    <div className="app">
      {/* Your existing app content */}
      
      {/* Debug panel (only in development) */}
      {debugService.isDevMode() && (
        <DebugPanel 
          isVisible={showDebugPanel} 
          onClose={() => setShowDebugPanel(false)} 
        />
      )}
    </div>
  );
};
```

---

*"In the realm of technical architecture, every decision is a step toward excellence, every optimization a path to performance, and every test a safeguard of quality."* 🚀✨