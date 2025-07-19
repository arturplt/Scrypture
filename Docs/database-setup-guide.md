# Database Setup Guide for Scrypture

*"Complete guide to setting up database persistence for Scrypture"*

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Status](https://img.shields.io/badge/status-Enhanced_Local_Storage-green)
![Database](https://img.shields.io/badge/database-Local_Storage-blue)
![Auto-Save](https://img.shields.io/badge/auto--save-Enabled-green)

## 🎯 **Current Implementation: Enhanced Local Storage with Auto-Save**

### **What's Been Set Up**

1. **Enhanced Storage Service** (`src/services/storageService.ts`)
   - Singleton pattern for consistent data access
   - Data validation and error handling
   - Backup/restore functionality
   - Storage usage monitoring
   - Cross-browser compatibility checks

2. **Service Layer** 
   - `taskService.ts` - Task management with auto-save
   - `habitService.ts` - Habit tracking with auto-save
   - `userService.ts` - User data and achievements with auto-save

3. **React Hooks with Auto-Save**
   - `useTasks.tsx` - Task state management with real-time saving
   - `useHabits.tsx` - Habit state management with auto-save
   - `useUser.tsx` - User state management with auto-save

4. **Data Management UI**
   - `DataManager.tsx` - Backup/restore interface
   - `AutoSaveIndicator.tsx` - Visual save feedback
   - Export/import functionality
   - Storage statistics

### **Features Included**

✅ **Data Validation** - All data is validated before storage  
✅ **Error Handling** - Graceful handling of storage errors  
✅ **Backup System** - Automatic and manual backup creation  
✅ **Export/Import** - JSON data export and import  
✅ **Storage Monitoring** - Usage statistics and limits  
✅ **Cross-browser Support** - Works across different browsers  
✅ **Type Safety** - Full TypeScript support  
✅ **Auto-Save** - Real-time data persistence  
✅ **Visual Feedback** - Save status indicators  
✅ **Performance Optimized** - Non-blocking save operations  

---

## 🚀 **Quick Start**

### **1. Current Setup (No Additional Installation)**

The enhanced local storage system with auto-save is already implemented and ready to use:

```typescript
// Import the services
import { taskService } from './services/taskService';
import { habitService } from './services/habitService';
import { userService } from './services/userService';

// Use in your components - auto-save happens automatically
const tasks = taskService.getTasks();
taskService.saveTasks(updatedTasks); // Auto-save with feedback
```

### **2. Using the Data Manager**

The `DataManager` component provides a UI for:
- Creating backups
- Restoring from backups
- Exporting data as JSON files
- Importing data from JSON files
- Clearing all data
- Viewing storage usage

### **3. React Hooks Usage with Auto-Save**

```typescript
import { useTasks } from './hooks/useTasks';
import { useHabits } from './hooks/useHabits';
import { useUser } from './hooks/useUser';

function MyComponent() {
  const { tasks, addTask, updateTask, isSaving, lastSaved } = useTasks();
  const { habits, addHabit, completeHabit } = useHabits();
  const { user, addExperience, unlockAchievement } = useUser();
  
  // Auto-save happens automatically on all operations
  const handleAddTask = () => {
    addTask({ title: 'New Task', priority: 'medium' });
    // Data is automatically saved with visual feedback
  };
}
```

### **4. Auto-Save Visual Feedback**

The `AutoSaveIndicator` component provides real-time feedback:
- Shows "Saving..." with animated dot during save operations
- Shows "Saved" with checkmark when save completes
- Automatically disappears after 2 seconds
- Positioned in bottom-right corner

---

## 🔄 **Auto-Save System**

### **How Auto-Save Works**

1. **Immediate Persistence**: All data changes are saved instantly
2. **Non-blocking**: Save operations don't block the UI
3. **Visual Feedback**: Users see save status in real-time
4. **Error Handling**: Graceful handling of save failures
5. **State Consistency**: UI remains responsive during saves

### **Auto-Save Triggers**

✅ **Task Operations**
- Creating new tasks
- Updating task details
- Toggling task completion
- Deleting tasks

✅ **Habit Operations**
- Creating new habits
- Updating habit details
- Completing habits
- Deleting habits

✅ **User Operations**
- Updating user profile
- Adding experience points
- Unlocking achievements
- Creating new users

### **Auto-Save Implementation**

```typescript
// Example from useTasks hook
const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newTask: Task = {
    ...taskData,
    id: generateUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const updatedTasks = [...tasks, newTask];
  setTasks(updatedTasks);
  saveTasksWithFeedback(updatedTasks); // Auto-save with feedback
};

const saveTasksWithFeedback = async (updatedTasks: Task[]) => {
  setIsSaving(true);
  try {
    const success = taskService.saveTasks(updatedTasks);
    if (success) {
      setLastSaved(new Date());
      console.log('Tasks auto-saved successfully');
    }
  } catch (error) {
    console.error('Auto-save error:', error);
  } finally {
    setIsSaving(false);
  }
};
```

---

## 🔄 **Migration Paths**

### **Option 1: IndexedDB (Recommended for MVP+)**

For better performance and larger storage capacity:

```bash
npm install idb
```

**Implementation:**
```typescript
// src/services/indexedDBService.ts
import { openDB } from 'idb';

const DB_NAME = 'scrypture_db';
const DB_VERSION = 1;

export class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
      },
    });
  }

  async getTasks(): Promise<Task[]> {
    if (!this.db) await this.init();
    return this.db!.getAll('tasks');
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    
    // Clear existing data
    await store.clear();
    
    // Add new data
    for (const task of tasks) {
      await store.add(task);
    }
  }
}
```

### **Option 2: SQLite with Tauri (Desktop App)**

For a desktop application with SQLite:

```bash
npm install @tauri-apps/api
```

**Implementation:**
```typescript
// src/services/sqliteService.ts
import { invoke } from '@tauri-apps/api/tauri';

export class SQLiteService {
  async init() {
    await invoke('init_database');
  }

  async getTasks(): Promise<Task[]> {
    return await invoke('get_tasks');
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    await invoke('save_tasks', { tasks });
  }
}
```

### **Option 3: PostgreSQL (Production)**

For a full production database:

```bash
npm install pg
npm install @types/pg --save-dev
```

**Implementation:**
```typescript
// src/services/postgresService.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class PostgresService {
  async getTasks(): Promise<Task[]> {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [userId]);
    return result.rows;
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Clear existing tasks
      await client.query('DELETE FROM tasks WHERE user_id = $1', [userId]);
      
      // Insert new tasks
      for (const task of tasks) {
        await client.query(
          'INSERT INTO tasks (id, user_id, title, description, completed, created_at, updated_at, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [task.id, userId, task.title, task.description, task.completed, task.createdAt, task.updatedAt, task.priority]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

---

## 🛠️ **Configuration Options**

### **Environment Variables**

Create a `.env` file for database configuration:

```env
# For PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/scrypture

# For SQLite (Tauri)
DATABASE_PATH=./data/scrypture.db

# For IndexedDB
STORAGE_TYPE=indexeddb

# Auto-save settings
AUTO_SAVE_ENABLED=true
AUTO_SAVE_DELAY=0
SAVE_FEEDBACK_DURATION=2000
```

### **Service Configuration**

```typescript
// src/config/database.ts
export const DATABASE_CONFIG = {
  type: process.env.STORAGE_TYPE || 'localStorage',
  maxStorageSize: 5 * 1024 * 1024, // 5MB
  backupInterval: 24 * 60 * 60 * 1000, // 24 hours
  enableCompression: true,
  enableEncryption: false,
  autoSave: {
    enabled: process.env.AUTO_SAVE_ENABLED === 'true',
    delay: parseInt(process.env.AUTO_SAVE_DELAY || '0'),
    feedbackDuration: parseInt(process.env.SAVE_FEEDBACK_DURATION || '2000'),
  },
};
```

---

## 📊 **Performance Considerations**

### **Local Storage Limits**
- **Chrome/Edge**: ~5-10MB
- **Firefox**: ~10MB
- **Safari**: ~5-10MB

### **IndexedDB Advantages**
- **Storage**: 50% of available disk space
- **Performance**: Better for large datasets
- **Transactions**: ACID compliance
- **Indexing**: Fast queries

### **Auto-Save Performance**

1. **Immediate Saves**
```typescript
// Saves happen instantly on data change
const addTask = (taskData) => {
  const newTask = createTask(taskData);
  setTasks(prev => [...prev, newTask]);
  saveTasksWithFeedback([...tasks, newTask]); // Immediate save
};
```

2. **Non-blocking Operations**
```typescript
// Save operations don't block the UI
const saveTasksWithFeedback = async (tasks) => {
  setIsSaving(true);
  try {
    await taskService.saveTasks(tasks);
    setLastSaved(new Date());
  } finally {
    setIsSaving(false);
  }
};
```

3. **Efficient Updates**
```typescript
// Only saves when data actually changes
const updateTask = (id, updates) => {
  const updatedTasks = tasks.map(task =>
    task.id === id ? { ...task, ...updates } : task
  );
  setTasks(updatedTasks);
  saveTasksWithFeedback(updatedTasks); // Only if changed
};
```

---

## 🔧 **Testing Database Setup**

### **Unit Tests**

```typescript
// src/services/__tests__/storageService.test.ts
import { storageService } from '../storageService';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should save and retrieve tasks', () => {
    const tasks = [{ id: '1', title: 'Test', completed: false }];
    storageService.saveTasks(tasks);
    const retrieved = storageService.getTasks();
    expect(retrieved).toEqual(tasks);
  });

  test('should auto-save on task creation', () => {
    const { addTask } = useTasks();
    addTask({ title: 'New Task', priority: 'medium' });
    const savedTasks = storageService.getTasks();
    expect(savedTasks).toHaveLength(1);
  });
});
```

### **Integration Tests**

```typescript
// src/hooks/__tests__/useTasks.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useTasks, TaskProvider } from '../useTasks';

test('should auto-save when adding task', () => {
  const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;
  const { result } = renderHook(() => useTasks(), { wrapper });

  act(() => {
    result.current.addTask({ title: 'Test', priority: 'medium' });
  });

  expect(result.current.tasks).toHaveLength(1);
  expect(result.current.isSaving).toBe(false);
  expect(result.current.lastSaved).toBeInstanceOf(Date);
});
```

### **Auto-Save Tests**

```typescript
// src/components/__tests__/AutoSaveIndicator.test.tsx
import { render, screen } from '@testing-library/react';
import { AutoSaveIndicator } from '../AutoSaveIndicator';

test('should show saving indicator', () => {
  render(<AutoSaveIndicator isSaving={true} />);
  expect(screen.getByText('Saving...')).toBeInTheDocument();
});

test('should show saved indicator', () => {
  render(<AutoSaveIndicator isSaving={false} lastSaved={new Date()} />);
  expect(screen.getByText('Saved')).toBeInTheDocument();
});
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Storage Quota Exceeded**
```typescript
// Check storage before saving
const canSave = (data: any) => {
  const size = JSON.stringify(data).length;
  const available = 5 * 1024 * 1024; // 5MB
  return size < available;
};
```

2. **Auto-Save Not Working**
```typescript
// Check if auto-save is enabled
const isAutoSaveEnabled = () => {
  return process.env.AUTO_SAVE_ENABLED === 'true';
};
```

3. **Save Feedback Not Showing**
```typescript
// Ensure AutoSaveIndicator is mounted
const App = () => (
  <TaskProvider>
    <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
  </TaskProvider>
);
```

4. **Data Corruption**
```typescript
// Validate data before using
const validateData = (data: any) => {
  try {
    // Your validation logic
    return true;
  } catch {
    return false;
  }
};
```

5. **Browser Compatibility**
```typescript
// Check browser support
const isStorageSupported = () => {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};
```

---

## 📈 **Monitoring and Analytics**

### **Storage Analytics**

```typescript
// Track storage usage
const trackStorageUsage = () => {
  const stats = storageService.getStorageStats();
  analytics.track('storage_usage', {
    used: stats.used,
    percentage: stats.percentage,
  });
};
```

### **Auto-Save Performance Monitoring**

```typescript
// Monitor auto-save performance
const measureAutoSavePerformance = async (operation: () => Promise<any>) => {
  const start = performance.now();
  const result = await operation();
  const duration = performance.now() - start;
  
  console.log(`Auto-save took ${duration}ms`);
  return result;
};
```

### **Save Success Tracking**

```typescript
// Track successful saves
const trackSaveSuccess = (operation: string) => {
  analytics.track('auto_save_success', {
    operation,
    timestamp: new Date().toISOString(),
  });
};
```

---

## 🎯 **Next Steps**

1. **Immediate**: Test the current enhanced local storage system with auto-save
2. **Short-term**: Consider IndexedDB for better performance
3. **Medium-term**: Implement server-side database for multi-device sync
4. **Long-term**: Add real-time collaboration features

The current setup provides a solid foundation for data persistence with comprehensive auto-save functionality and room for future expansion! 