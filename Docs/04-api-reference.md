# API Reference

*"Essential API endpoints for Scrypture MVP development"*

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-MVP_Development-yellow)
![API](https://img.shields.io/badge/api-Essential-blue)

## 🎯 **MVP API Overview**

### **Core Principles**
- **Local Storage First**: MVP uses local storage for data persistence
- **Simple Endpoints**: Essential CRUD operations only
- **Consistent Format**: Standardized request/response patterns
- **Error Handling**: Clear error messages and status codes
- **Documentation**: Complete examples for all endpoints

### **Technology Stack**
- **Frontend**: React 18 + TypeScript
- **Storage**: Local Storage (MVP) / REST API (Future)
- **Authentication**: Mock UserContext (MVP) / JWT (Future)
- **Data Format**: JSON
- **Error Handling**: Standardized error responses
- **User Scope**: User-scoped services with mock authentication
- **Sync**: Local Storage (MVP) / Cloud Sync (Future)
- **Debug**: Development Debug Panel (Dev Mode) / Production Monitoring (Future)

---

## 📊 **Data Models**

### **Core Types**
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

---

## 🔧 **Local Storage API**

### **Storage Service**
```typescript
// services/storage/storageService.ts
export class StorageService {
  private static readonly STORAGE_KEYS = {
    TASKS: 'scrypture_tasks',
    USER_STATS: 'scrypture_user_stats',
    HABITS: 'scrypture_habits',
    ACHIEVEMENTS: 'scrypture_achievements',
    SETTINGS: 'scrypture_settings',
    TUTORIAL: 'scrypture_tutorial',
    TASK_TAGS: 'scrypture_task_tags', // For tag management
    TASK_PRIORITIES: 'scrypture_task_priorities' // For priority tracking
  } as const;

  // Generic storage methods
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

  static clear(): void {
    localStorage.clear();
  }

  // Migration helpers
  static getVersion(): number {
    return this.get<number>('scrypture_schema_version') || 1;
  }

  static setVersion(version: number): void {
    this.set('scrypture_schema_version', version);
  }

  static needsMigration(): boolean {
    const currentVersion = this.getVersion();
    const targetVersion = 2; // Current schema version
    return currentVersion < targetVersion;
  }

  static async runMigrations(): Promise<void> {
    const currentVersion = this.getVersion();
    
    if (currentVersion < 2) {
      await this.migrateToV2();
    }
    
    // Future migrations would be added here
    // if (currentVersion < 3) {
    //   await this.migrateToV3();
    // }
  }

  private static async migrateToV2(): Promise<void> {
    console.log('Starting migration to V2...');
    
    try {
      // 1. Backup existing data
      const tasks = this.get<Task[]>('scrypture_tasks') || [];
      const backup = { tasks, timestamp: Date.now() };
      this.set('scrypture_backup_v1', backup);
      
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
      this.setVersion(2);
      
      // 4. Save migrated data
      this.set('scrypture_tasks', migratedTasks);
      
      console.log('Migration to V2 completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
}
```

---

## 👥 **Multi-User Architecture**

### **User Context System**
```typescript
// contexts/UserContext.tsx
export const UserContext = createContext<UserContextType>({
  user: null,
  userId: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  updateUser: async () => {}
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (userData: Partial<User>) => {
    // Mock login for MVP
    const mockUser: User = {
      id: 'mock-user-001',
      username: userData.username || 'ScryptureUser',
      email: userData.email,
      preferences: {
        theme: 'default',
        language: 'en',
        notifications: true
      },
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('scrypture_current_user', JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('scrypture_current_user');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('scrypture_current_user', JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    // Auto-login mock user for MVP
    const savedUser = localStorage.getItem('scrypture_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    } else {
      // Auto-create mock user
      login({ username: 'ScryptureUser' });
    }
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      userId: user?.id || null,
      isAuthenticated,
      login,
      logout,
      updateUser
    }}>
      {children}
    </UserContext.Provider>
  );
};
```

### **User-Scoped Storage Service**
```typescript
// services/storage/UserScopedStorageService.ts
export class UserScopedStorageService {
  private static getCurrentUserId(): string {
    const savedUser = localStorage.getItem('scrypture_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return user.id;
    }
    return 'mock-user-001'; // Fallback for MVP
  }

  private static getScopedKey(baseKey: string): string {
    const userId = this.getCurrentUserId();
    return `${baseKey}_${userId}`;
  }

  static get<T>(key: string): T | null {
    const scopedKey = this.getScopedKey(key);
    try {
      const item = localStorage.getItem(scopedKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${scopedKey}`, error);
      return null;
    }
  }

  static set<T>(key: string, value: T): void {
    const scopedKey = this.getScopedKey(key);
    try {
      localStorage.setItem(scopedKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage: ${scopedKey}`, error);
    }
  }

  static remove(key: string): void {
    const scopedKey = this.getScopedKey(key);
    localStorage.removeItem(scopedKey);
  }

  static clear(): void {
    const userId = this.getCurrentUserId();
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(`_${userId}`)) {
        localStorage.removeItem(key);
      }
    });
  }

  // User-specific storage keys
  static readonly STORAGE_KEYS = {
    TASKS: 'scrypture_tasks',
    USER_STATS: 'scrypture_user_stats',
    HABITS: 'scrypture_habits',
    ACHIEVEMENTS: 'scrypture_achievements',
    SETTINGS: 'scrypture_settings',
    TUTORIAL: 'scrypture_tutorial'
  } as const;
}
```

### **Base Service for User Scope**
```typescript
// services/base/BaseService.ts
export abstract class BaseService {
  protected getUserId(): string {
    const savedUser = localStorage.getItem('scrypture_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return user.id;
    }
    return 'mock-user-001'; // Fallback for MVP
  }

  protected getScopedStorageKey(baseKey: string): string {
    const userId = this.getUserId();
    return `${baseKey}_${userId}`;
  }

  protected async getUserScopedData<T>(key: string): Promise<T | null> {
    const scopedKey = this.getScopedStorageKey(key);
    return UserScopedStorageService.get<T>(scopedKey);
  }

  protected async setUserScopedData<T>(key: string, data: T): Promise<void> {
    const scopedKey = this.getScopedStorageKey(key);
    UserScopedStorageService.set(scopedKey, data);
  }

  protected generateId(): string {
    return `${this.getUserId()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

## 🔄 **Sync Service API**

### **Sync Service Configuration**
```typescript
// services/sync/SyncService.ts
export interface SyncConfig {
  enabled: boolean; // Disabled for MVP
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

  // Version management
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

  // Configuration management
  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('scrypture_sync_config', JSON.stringify(this.config));
  }

  getConfig(): SyncConfig {
    return { ...this.config };
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
}
```

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
  estimatedDuration?: number;
  actualDuration?: number;
  createdAt: Date;
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
```

---

## 🧠 **Debug Service API**

### **Debug Service Configuration**
```typescript
// services/debug/DebugService.ts
export interface DebugConfig {
  enabled: boolean; // Only enabled in development
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  performanceTracking: boolean;
  errorTracking: boolean;
  storageMonitoring: boolean;
}

export interface DebugData {
  schemaVersion: string;
  lastMigration: Date;
  storageUsage: StorageUsage;
  syncStatus: SyncStatus;
  userData: UserDataSnapshot;
  errors: ErrorLog[];
  performance: PerformanceMetrics;
}

export interface StorageUsage {
  totalSize: number;
  availableSize: number;
  usedPercentage: number;
  breakdown: Record<string, number>;
}

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context: Record<string, any>;
}

export interface PerformanceMetrics {
  loadTime: number;
  syncTime: number;
  storageOperations: number;
  memoryUsage: number;
}

export interface MigrationLog {
  id: string;
  timestamp: Date;
  description: string;
  data?: any;
  schemaVersion: string;
}

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

### **Debug Panel Component API**
```typescript
// components/debug/DebugPanel.tsx
interface DebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

interface DebugPanelState {
  activeTab: 'overview' | 'data' | 'errors' | 'performance' | 'storage';
  debugData: DebugData | null;
  refreshInterval: number;
}

// Tab Components
interface OverviewTabProps {
  debugData: DebugData | null;
}

interface DataTabProps {
  debugData: DebugData | null;
}

interface ErrorsTabProps {
  debugData: DebugData | null;
}

interface PerformanceTabProps {
  debugData: DebugData | null;
}

interface StorageTabProps {
  debugData: DebugData | null;
}
```

### **Debug Panel Styles**
```css
/* styles/debug/DebugPanel.css */
.debug-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: #1a1a1a;
  color: #fff;
  border-left: 1px solid #333;
  z-index: 9999;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.debug-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #2a2a2a;
  border-bottom: 1px solid #333;
}

.debug-panel-header h3 {
  margin: 0;
  font-size: 14px;
}

.debug-close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
}

.debug-panel-tabs {
  display: flex;
  background: #2a2a2a;
  border-bottom: 1px solid #333;
}

.debug-panel-tabs button {
  flex: 1;
  background: none;
  border: none;
  color: #ccc;
  padding: 8px;
  cursor: pointer;
  font-size: 11px;
}

.debug-panel-tabs button.active {
  background: #333;
  color: #fff;
}

.debug-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.debug-card {
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.debug-card h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #fff;
}

.debug-card p {
  margin: 0;
  font-size: 11px;
  color: #ccc;
}

.debug-card small {
  color: #666;
  font-size: 10px;
}

.storage-bar {
  width: 100%;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
}

.storage-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
}

.debug-section {
  margin-bottom: 20px;
}

.debug-section h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #fff;
}

.debug-section pre {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 8px;
  margin: 0;
  font-size: 10px;
  color: #ccc;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.debug-error {
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.debug-error-error {
  border-left: 4px solid #f44336;
}

.debug-error-warn {
  border-left: 4px solid #ff9800;
}

.debug-error-info {
  border-left: 4px solid #2196f3;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.error-level {
  font-weight: bold;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  background: #333;
}

.error-time {
  font-size: 10px;
  color: #666;
}

.error-message {
  font-size: 11px;
  color: #ccc;
  margin-bottom: 8px;
}

.debug-actions {
  margin-bottom: 10px;
}

.debug-actions button {
  background: #333;
  border: 1px solid #555;
  color: #fff;
  padding: 4px 8px;
  border-radius: 2px;
  font-size: 10px;
  cursor: pointer;
}

.debug-actions button:hover {
  background: #444;
}

.storage-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 11px;
  color: #ccc;
}

details {
  margin-top: 8px;
}

details summary {
  cursor: pointer;
  font-size: 10px;
  color: #666;
  margin-bottom: 4px;
}

details pre {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 2px;
  padding: 4px;
  font-size: 9px;
  color: #ccc;
  margin: 0;
  max-height: 100px;
  overflow-y: auto;
}
```

---

## 📝 **Task API**

### **Task Service**
```typescript
// services/tasks/taskService.ts
export class TaskService extends BaseService {
  // GET /api/tasks
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const tasks = await this.getUserScopedData<Task[]>('tasks') || [];
    let filteredTasks = [...tasks];

    if (filters?.category) {
      filteredTasks = filteredTasks.filter(task => task.category === filters.category);
    }

    if (filters?.completed !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.completed === filters.completed);
    }

    if (filters?.limit) {
      filteredTasks = filteredTasks.slice(0, filters.limit);
    }

    return filteredTasks;
  }

  // GET /api/tasks/:id
  async getTask(id: string): Promise<Task | null> {
    return this.tasks.find(task => task.id === id) || null;
  }

  // POST /api/tasks
  async createTask(taskData: CreateTaskData): Promise<Task> {
    const tasks = await this.getUserScopedData<Task[]>('tasks') || [];
    
    const task: Task = {
      id: this.generateId(),
      userId: this.getUserId(), // User-scoped
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      priority: taskData.priority || 'medium',
      difficulty: taskData.difficulty || 3,
      dueDate: taskData.dueDate,
      completed: false,
      experienceReward: this.calculateExperienceReward(taskData.category, taskData.priority, taskData.difficulty),
      statRewards: this.getStatRewards(taskData.category),
      tags: taskData.tags || [],
      estimatedDuration: taskData.estimatedDuration,
      actualDuration: taskData.actualDuration,
      createdAt: new Date(),
      completedAt: null,
      updatedAt: new Date()
    };

    tasks.push(task);
    await this.setUserScopedData('tasks', tasks);
    return task;
  }

  // PUT /api/tasks/:id
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
    await this.saveTasks();
    return this.tasks[taskIndex];
  }

  // DELETE /api/tasks/:id
  async deleteTask(id: string): Promise<void> {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    this.tasks.splice(taskIndex, 1);
    await this.saveTasks();
  }

  // POST /api/tasks/:id/complete
  async completeTask(id: string): Promise<TaskCompletion> {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.completed) {
      throw new Error('Task already completed');
    }

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

  // Helper methods
  private calculateExperienceReward(category: string, priority: string = 'medium', difficulty: number = 3): number {
    const baseReward = 10;
    const difficultyMultiplier = difficulty * 2;
    const categoryBonus = this.getCategoryBonus(category);
    const priorityMultiplier = this.getPriorityMultiplier(priority);
    return Math.round((baseReward + difficultyMultiplier + categoryBonus) * priorityMultiplier);
  }

  private getPriorityMultiplier(priority: string): number {
    const multipliers = {
      low: 0.8,
      medium: 1.0,
      high: 1.3,
      critical: 1.6
    };
    return multipliers[priority] || 1.0;
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

  private getCategoryBonus(category: string): number {
    const bonuses = {
      body: 5,
      mind: 5,
      soul: 5,
      career: 3,
      home: 3,
      skills: 8
    };
    return bonuses[category] || 0;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async saveTasks(): Promise<void> {
    StorageService.set(StorageService.STORAGE_KEYS.TASKS, this.tasks);
  }

  private loadTasks(): void {
    this.tasks = StorageService.get<Task[]>(StorageService.STORAGE_KEYS.TASKS) || [];
  }

  private async checkLevelUp(experiencePoints: number): Promise<boolean> {
    // This would integrate with UserStatsService
    return false; // Simplified for MVP
  }
}
```

### **Task API Examples**

#### **Create Task**
```typescript
// POST /api/tasks
const taskData = {
  title: "Morning Exercise",
  description: "30 minutes of cardio",
  category: "body" as const,
  priority: "high" as const,
  difficulty: 4,
  dueDate: new Date("2024-01-20T09:00:00"),
  tags: ["exercise", "health", "morning"],
  estimatedDuration: 30
};

const task = await taskService.createTask(taskData);
console.log('Created task:', task);
```

#### **Get Tasks**
```typescript
// GET /api/tasks
const allTasks = await taskService.getTasks();

// GET /api/tasks?category=body&completed=false
const bodyTasks = await taskService.getTasks({
  category: 'body',
  completed: false
});
```

#### **Complete Task**
```typescript
// POST /api/tasks/:id/complete
const completion = await taskService.completeTask(taskId);
console.log('Task completed:', completion);
```

---

## 🔧 **Data Model Extensions**

### **Adding New Fields to Task Model**

When extending the task model with new fields, follow these patterns:

#### **1. Update TypeScript Interface**
```typescript
interface Task {
  // ... existing fields
  newField?: string; // Optional field
  requiredField: number; // Required field
}
```

#### **2. Update CreateTaskData Interface**
```typescript
interface CreateTaskData {
  title: string;
  description?: string;
  category: 'body' | 'mind' | 'soul' | 'career' | 'home' | 'skills';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  difficulty?: 1 | 2 | 3 | 4 | 5;
  dueDate?: Date;
  tags?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  // Add new fields here
  newField?: string;
  requiredField: number;
}
```

#### **3. Update TaskService.createTask Method**
```typescript
async createTask(taskData: CreateTaskData): Promise<Task> {
  const task: Task = {
    id: this.generateId(),
    title: taskData.title,
    description: taskData.description,
    category: taskData.category,
    priority: taskData.priority || 'medium',
    difficulty: taskData.difficulty || 3,
    dueDate: taskData.dueDate,
    completed: false,
    experienceReward: this.calculateExperienceReward(taskData.category, taskData.priority, taskData.difficulty),
    statRewards: this.getStatRewards(taskData.category),
    tags: taskData.tags || [],
    estimatedDuration: taskData.estimatedDuration,
    actualDuration: taskData.actualDuration,
    // Add new fields with defaults
    newField: taskData.newField,
    requiredField: taskData.requiredField,
    createdAt: new Date(),
    completedAt: null,
    updatedAt: new Date()
  };

  this.tasks.push(task);
  await this.saveTasks();
  return task;
}
```

#### **4. Update Database Schema (Future)**
```sql
ALTER TABLE tasks 
ADD COLUMN new_field VARCHAR(255),
ADD COLUMN required_field INTEGER NOT NULL DEFAULT 0;
```

#### **5. Migration Strategy**
```typescript
// services/migrations/taskMigration.ts
export class TaskMigration {
  static migrateToNewVersion(): void {
    const tasks = StorageService.get<Task[]>(StorageService.STORAGE_KEYS.TASKS) || [];
    
    const migratedTasks = tasks.map(task => ({
      ...task,
      // Add default values for new fields
      newField: task.newField || 'default',
      requiredField: task.requiredField || 0,
      updatedAt: new Date()
    }));
    
    StorageService.set(StorageService.STORAGE_KEYS.TASKS, migratedTasks);
  }
}
```

### **Storage Service Extension Patterns**

#### **Adding New Storage Keys**
```typescript
private static readonly STORAGE_KEYS = {
  // ... existing keys
  NEW_FEATURE: 'scrypture_new_feature',
  USER_PREFERENCES: 'scrypture_user_preferences'
} as const;
```

#### **Adding New Service Methods**
```typescript
// Generic method for new data types
static getTyped<T>(key: string, defaultValue: T): T {
  const data = this.get<T>(key);
  return data !== null ? data : defaultValue;
}

// Method for complex data structures
static getComplex<T>(key: string, validator: (data: any) => data is T): T | null {
  const data = this.get<any>(key);
  return validator(data) ? data : null;
}
```

---

## 👤 **User Stats API**

### **User Stats Service**
```typescript
// services/user/userStatsService.ts
export class UserStatsService {
  private stats: UserStats;

  constructor() {
    this.stats = this.loadStats();
  }

  // GET /api/user/stats
  async getUserStats(): Promise<UserStats> {
    return this.stats;
  }

  // PUT /api/user/stats
  async updateUserStats(updates: Partial<UserStats>): Promise<UserStats> {
    this.stats = { ...this.stats, ...updates };
    this.saveStats();
    return this.stats;
  }

  // POST /api/user/stats/experience
  async addExperiencePoints(points: number): Promise<LevelUpResult> {
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

  // POST /api/user/stats/rewards
  async addStatRewards(rewards: StatRewards): Promise<UserStats> {
    this.stats.body += rewards.body || 0;
    this.stats.mind += rewards.mind || 0;
    this.stats.soul += rewards.soul || 0;
    this.saveStats();
    return this.stats;
  }

  // GET /api/user/stats/level
  async getLevelInfo(): Promise<LevelInfo> {
    const currentLevel = this.stats.level;
    const nextLevel = currentLevel + 1;
    const currentThreshold = this.getLevelThreshold(currentLevel);
    const nextThreshold = this.getLevelThreshold(nextLevel);
    const progress = (this.stats.totalExperiencePoints - currentThreshold) / (nextThreshold - currentThreshold);

    return {
      currentLevel,
      nextLevel,
      currentExperiencePoints: this.stats.totalExperiencePoints,
      currentThreshold,
      nextThreshold,
      progress: Math.min(progress, 1)
    };
  }

  // Helper methods
  private calculateLevel(totalExperiencePoints: number): number {
    const thresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700];
    return thresholds.findIndex(threshold => totalExperiencePoints < threshold);
  }

  private getLevelThreshold(level: number): number {
    const thresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700];
    return thresholds[level] || thresholds[thresholds.length - 1];
  }

  private updateBobrStage(): void {
    if (this.stats.level <= 3) this.stats.bobrStage = 'hatchling';
    else if (this.stats.level <= 6) this.stats.bobrStage = 'young';
    else this.stats.bobrStage = 'mature';
  }

  private saveStats(): void {
    StorageService.set(StorageService.STORAGE_KEYS.USER_STATS, this.stats);
  }

  private loadStats(): UserStats {
    return StorageService.get<UserStats>(StorageService.STORAGE_KEYS.USER_STATS) || {
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

### **User Stats API Examples**

#### **Get User Stats**
```typescript
// GET /api/user/stats
const stats = await userStatsService.getUserStats();
console.log('User stats:', stats);
```

#### **Add Experience Points**
```typescript
// POST /api/user/stats/experience
const result = await userStatsService.addExperiencePoints(25);
if (result.leveledUp) {
  console.log(`Leveled up to ${result.newLevel}!`);
}
```

#### **Get Level Information**
```typescript
// GET /api/user/stats/level
const levelInfo = await userStatsService.getLevelInfo();
console.log(`Level ${levelInfo.currentLevel}, ${Math.round(levelInfo.progress * 100)}% to next level`);
```

---

## 🔮 **Habit API**

### **Habit Service**
```typescript
// services/habits/habitService.ts
export class HabitService {
  private habits: Habit[] = [];

  constructor() {
    this.loadHabits();
  }

  // GET /api/habits
  async getHabits(filters?: HabitFilters): Promise<Habit[]> {
    let filteredHabits = [...this.habits];

    if (filters?.frequency) {
      filteredHabits = filteredHabits.filter(habit => habit.frequency === filters.frequency);
    }

    if (filters?.active !== undefined) {
      filteredHabits = filteredHabits.filter(habit => {
        if (filters.active) {
          return this.isHabitActive(habit);
        } else {
          return !this.isHabitActive(habit);
        }
      });
    }

    return filteredHabits;
  }

  // GET /api/habits/:id
  async getHabit(id: string): Promise<Habit | null> {
    return this.habits.find(habit => habit.id === id) || null;
  }

  // POST /api/habits
  async createHabit(habitData: CreateHabitData): Promise<Habit> {
    const habit: Habit = {
      id: this.generateId(),
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

  // PUT /api/habits/:id
  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
    const habitIndex = this.habits.findIndex(habit => habit.id === id);
    if (habitIndex === -1) {
      throw new Error('Habit not found');
    }

    this.habits[habitIndex] = { ...this.habits[habitIndex], ...updates };
    await this.saveHabits();
    return this.habits[habitIndex];
  }

  // DELETE /api/habits/:id
  async deleteHabit(id: string): Promise<void> {
    const habitIndex = this.habits.findIndex(habit => habit.id === id);
    if (habitIndex === -1) {
      throw new Error('Habit not found');
    }

    this.habits.splice(habitIndex, 1);
    await this.saveHabits();
  }

  // POST /api/habits/:id/complete
  async completeHabit(id: string): Promise<HabitCompletion> {
    const habit = this.habits.find(h => h.id === id);
    if (!habit) {
      throw new Error('Habit not found');
    }

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

  // GET /api/habits/:id/streak
  async getHabitStreak(id: string): Promise<StreakInfo> {
    const habit = this.habits.find(h => h.id === id);
    if (!habit) {
      throw new Error('Habit not found');
    }

    return {
      currentStreak: habit.streak,
      bestStreak: habit.bestStreak,
      lastCompleted: habit.lastCompleted,
      isActive: this.isHabitActive(habit)
    };
  }

  // Helper methods
  private isHabitActive(habit: Habit): boolean {
    if (!habit.lastCompleted) return false;
    
    const lastCompleted = new Date(habit.lastCompleted);
    const today = new Date();
    const daysSinceLastCompletion = this.getDaysDifference(lastCompleted, today);
    
    switch (habit.frequency) {
      case 'daily':
        return daysSinceLastCompletion <= 1;
      case 'weekly':
        return daysSinceLastCompletion <= 7;
      case 'monthly':
        return daysSinceLastCompletion <= 30;
      default:
        return false;
    }
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private isConsecutiveDay(date1: Date, date2: Date): boolean {
    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  private getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async saveHabits(): Promise<void> {
    StorageService.set(StorageService.STORAGE_KEYS.HABITS, this.habits);
  }

  private loadHabits(): void {
    this.habits = StorageService.get<Habit[]>(StorageService.STORAGE_KEYS.HABITS) || [];
  }
}
```

### **Habit API Examples**

#### **Create Habit**
```typescript
// POST /api/habits
const habitData = {
  name: "Morning Meditation",
  frequency: "daily" as const
};

const habit = await habitService.createHabit(habitData);
console.log('Created habit:', habit);
```

#### **Complete Habit**
```typescript
// POST /api/habits/:id/complete
const completion = await habitService.completeHabit(habitId);
console.log('Habit completed:', completion);
```

#### **Get Habit Streak**
```typescript
// GET /api/habits/:id/streak
const streakInfo = await habitService.getHabitStreak(habitId);
console.log(`Current streak: ${streakInfo.currentStreak}, Best: ${streakInfo.bestStreak}`);
```

---

## 🏆 **Achievement API**

### **Achievement Service**
```typescript
// services/achievements/achievementService.ts
export class AchievementService {
  private achievements: Achievement[] = [];

  constructor() {
    this.loadAchievements();
  }

  // GET /api/achievements
  async getAchievements(filters?: AchievementFilters): Promise<Achievement[]> {
    let filteredAchievements = [...this.achievements];

    if (filters?.unlocked !== undefined) {
      filteredAchievements = filteredAchievements.filter(achievement => 
        achievement.unlocked === filters.unlocked
      );
    }

    return filteredAchievements;
  }

  // GET /api/achievements/:id
  async getAchievement(id: string): Promise<Achievement | null> {
    return this.achievements.find(achievement => achievement.id === id) || null;
  }

  // POST /api/achievements/check
  async checkAchievements(userStats: UserStats, tasks: Task[], habits: Habit[]): Promise<Achievement[]> {
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

  // Helper methods
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
      case 'total_experience':
        return userStats.totalExperiencePoints >= condition.value;
      default:
        return false;
    }
  }

  private saveAchievements(): void {
    StorageService.set(StorageService.STORAGE_KEYS.ACHIEVEMENTS, this.achievements);
  }

  private loadAchievements(): void {
    this.achievements = StorageService.get<Achievement[]>(StorageService.STORAGE_KEYS.ACHIEVEMENTS) || this.getDefaultAchievements();
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
      },
      {
        id: 'experience_collector',
        title: 'Experience Collector',
        description: 'Earn 1000 total experience points',
        icon: '💎',
        unlocked: false,
        condition: { type: 'total_experience', value: 1000 }
      }
    ];
  }
}
```

### **Achievement API Examples**

#### **Get Achievements**
```typescript
// GET /api/achievements
const allAchievements = await achievementService.getAchievements();

// GET /api/achievements?unlocked=true
const unlockedAchievements = await achievementService.getAchievements({ unlocked: true });
```

#### **Check Achievements**
```typescript
// POST /api/achievements/check
const newAchievements = await achievementService.checkAchievements(userStats, tasks, habits);
if (newAchievements.length > 0) {
  console.log('New achievements unlocked:', newAchievements);
}
```

---

## 🎮 **Bóbr Companion API**

### **Bóbr Service**
```typescript
// services/bobr/bobrService.ts
export class BobrService {
  private readonly evolutionStages = ['hatchling', 'young', 'mature'];

  // GET /api/bobr/stage
  async getBobrStage(userLevel: number): Promise<BobrStage> {
    const stage = this.calculateBobrStage(userLevel);
    return {
      stage,
      name: this.getStageName(stage),
      appearance: this.getStageAppearance(stage),
      description: this.getStageDescription(stage)
    };
  }

  // GET /api/bobr/message
  async getMotivationalMessage(context: 'task_complete' | 'level_up' | 'streak_maintained'): Promise<string> {
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

  // GET /api/bobr/dam-progress
  async getDamProgress(completedTasks: number): Promise<DamProgress> {
    const progress = Math.min(completedTasks * 2, 100);
    return {
      progress,
      completedTasks,
      nextMilestone: this.getNextMilestone(completedTasks)
    };
  }

  // Helper methods
  private calculateBobrStage(userLevel: number): string {
    if (userLevel <= 3) return 'hatchling';
    if (userLevel <= 6) return 'young';
    return 'mature';
  }

  private getStageName(stage: string): string {
    const names = {
      hatchling: 'Hatchling Guardian',
      young: 'Young Guardian',
      mature: 'Mature Guardian'
    };
    return names[stage] || 'Unknown Guardian';
  }

  private getStageAppearance(stage: string): string {
    const appearances = {
      hatchling: '🦫',
      young: '🦫🌟',
      mature: '🦫✨'
    };
    return appearances[stage] || '🦫';
  }

  private getStageDescription(stage: string): string {
    const descriptions = {
      hatchling: 'A young companion learning the ways of the forest',
      young: 'A capable companion and guide',
      mature: 'A wise guardian of ancient knowledge'
    };
    return descriptions[stage] || 'A mysterious forest companion';
  }

  private getNextMilestone(completedTasks: number): number {
    const milestones = [10, 25, 50, 100, 200];
    return milestones.find(milestone => completedTasks < milestone) || milestones[milestones.length - 1];
  }
}
```

### **Bóbr API Examples**

#### **Get Bóbr Stage**
```typescript
// GET /api/bobr/stage
const bobrStage = await bobrService.getBobrStage(userLevel);
console.log(`${bobrStage.name}: ${bobrStage.appearance}`);
```

#### **Get Motivational Message**
```typescript
// GET /api/bobr/message?context=task_complete
const message = await bobrService.getMotivationalMessage('task_complete');
console.log('Bóbr says:', message);
```

#### **Get Dam Progress**
```typescript
// GET /api/bobr/dam-progress
const damProgress = await bobrService.getDamProgress(completedTasks);
console.log(`Dam progress: ${damProgress.progress}%`);
```

---

## 🔧 **Error Handling**

### **Error Types**
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### **Error Handling Examples**
```typescript
// Error handling in services
async completeTask(id: string): Promise<TaskCompletion> {
  try {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      throw new ApiError('TASK_NOT_FOUND', 'Task not found', { taskId: id });
    }

    if (task.completed) {
      throw new ApiError('TASK_ALREADY_COMPLETED', 'Task already completed', { taskId: id });
    }

    // ... completion logic
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('INTERNAL_ERROR', 'An unexpected error occurred', { originalError: error.message });
  }
}

// Error handling in components
const handleCompleteTask = async (taskId: string) => {
  try {
    const completion = await taskService.completeTask(taskId);
    showSuccess('Task completed successfully!');
  } catch (error) {
    if (error instanceof ApiError) {
      showError(error.message);
    } else {
      showError('An unexpected error occurred');
    }
  }
};
```

---

## 📚 **Cross-References**

### **Related Documentation**
- **See: 03-technical-specs.md** for system architecture and technical details
- **See: 05-database-schema.md** for data models and database design
- **See: 06-development-guide.md** for setup and implementation guidance

### **Implementation Guides**
- **See: 12-mvp-checklist.md** for implementation tracking and status
- **See: 08-development-roadmap.md** for development timeline and milestones
- **See: 02-mvp-features.md** for feature specifications and requirements

### **Testing & Quality**
- **See: 11-feature-scope.md** for feature classification and scope management
- **See: 07-future-features.md** for advanced features and future planning

---

*"In the realm of API design, every endpoint is a bridge to functionality, every response a promise of data, and every error a guide to improvement."* 🔌✨ 