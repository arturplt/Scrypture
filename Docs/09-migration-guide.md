# Migration Guide

*"Comprehensive guide for safe data migrations in Scrypture"*

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-Active-green)
![Guide](https://img.shields.io/badge/guide-Migration-blue)

## 🎯 **Migration Philosophy**

### **Core Principles**
- **Data Safety First**: Always backup before migrating
- **Backward Compatibility**: Support old data formats
- **Incremental Updates**: Migrate one version at a time
- **Error Recovery**: Graceful handling of migration failures
- **Testing Required**: Test migrations with real data samples

### **Migration Strategy**
- **Version Tracking**: Store current schema version in localStorage
- **Automatic Detection**: Check for migration needs on app startup
- **User Notification**: Inform users of data updates
- **Rollback Support**: Ability to revert failed migrations

---

## 📊 **Version Migration Maps**

### **Version 1 → Version 2**

#### **Changes Summary**
- **Added Fields**: priority, difficulty, dueDate, tags, estimatedDuration, actualDuration
- **Modified Fields**: updatedAt (now required)
- **New Storage Keys**: TASK_TAGS, TASK_PRIORITIES

#### **Migration Steps**
```typescript
// 1. Backup existing data
const backup = {
  tasks: StorageService.get('scrypture_tasks'),
  userStats: StorageService.get('scrypture_user_stats'),
  timestamp: Date.now(),
  version: 1
};
StorageService.set('scrypture_backup_v1', backup);

// 2. Migrate tasks with new fields
const tasks = StorageService.get<Task[]>('scrypture_tasks') || [];
const migratedTasks = tasks.map(task => ({
  ...task,
  priority: task.priority || 'medium',
  difficulty: task.difficulty || 3,
  dueDate: task.dueDate || null,
  tags: task.tags || [],
  estimatedDuration: task.estimatedDuration || null,
  actualDuration: task.actualDuration || null,
  updatedAt: task.updatedAt || task.createdAt
}));

// 3. Initialize new storage keys
StorageService.set('scrypture_task_tags', []);
StorageService.set('scrypture_task_priorities', ['low', 'medium', 'high', 'critical']);

// 4. Update schema version
StorageService.set('scrypture_schema_version', 2);
```

#### **Rollback Procedure**
```typescript
// Rollback to V1
function rollbackToV1(): void {
  const backup = StorageService.get('scrypture_backup_v1');
  if (backup) {
    StorageService.set('scrypture_tasks', backup.tasks);
    StorageService.set('scrypture_user_stats', backup.userStats);
    StorageService.set('scrypture_schema_version', 1);
    console.log('Rollback to V1 completed');
  }
}
```

### **Future Version Migrations**

#### **Version 2 → Version 3 (Planned)**
```typescript
// Example future migration
async function migrateToV3(): Promise<void> {
  // Add new fields like:
  // - taskNotes: string[]
  // - taskDependencies: string[]
  // - taskTimeTracking: boolean
  
  const tasks = StorageService.get<Task[]>('scrypture_tasks') || [];
  const migratedTasks = tasks.map(task => ({
    ...task,
    taskNotes: task.taskNotes || [],
    taskDependencies: task.taskDependencies || [],
    taskTimeTracking: task.taskTimeTracking || false
  }));
  
  StorageService.set('scrypture_tasks', migratedTasks);
  StorageService.set('scrypture_schema_version', 3);
}
```

---

## 🔧 **Migration Implementation**

### **Migration Service**
```typescript
// services/migration/migrationService.ts
export class MigrationService {
  private static readonly CURRENT_VERSION = 2;
  
  static async checkAndRunMigrations(): Promise<void> {
    const currentVersion = StorageService.get<number>('scrypture_schema_version') || 1;
    
    if (currentVersion < this.CURRENT_VERSION) {
      console.log(`Migration needed: ${currentVersion} → ${this.CURRENT_VERSION}`);
      await this.runMigrations(currentVersion);
    }
  }
  
  private static async runMigrations(fromVersion: number): Promise<void> {
    try {
      if (fromVersion < 2) {
        await this.migrateToV2();
      }
      
      // Future migrations
      // if (fromVersion < 3) {
      //   await this.migrateToV3();
      // }
      
      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
  
  private static async migrateToV2(): Promise<void> {
    console.log('Starting V1 → V2 migration...');
    
    // Backup
    await this.backupData('v1');
    
    // Migrate tasks
    const tasks = StorageService.get<Task[]>('scrypture_tasks') || [];
    const migratedTasks = tasks.map(task => ({
      ...task,
      priority: task.priority || 'medium',
      difficulty: task.difficulty || 3,
      dueDate: task.dueDate || null,
      tags: task.tags || [],
      estimatedDuration: task.estimatedDuration || null,
      actualDuration: task.actualDuration || null,
      updatedAt: task.updatedAt || task.createdAt
    }));
    
    // Save migrated data
    StorageService.set('scrypture_tasks', migratedTasks);
    StorageService.set('scrypture_task_tags', []);
    StorageService.set('scrypture_task_priorities', ['low', 'medium', 'high', 'critical']);
    
    // Update version
    StorageService.set('scrypture_schema_version', 2);
    
    console.log('V1 → V2 migration completed');
  }
  
  private static async backupData(version: string): Promise<void> {
    const backup = {
      tasks: StorageService.get('scrypture_tasks'),
      userStats: StorageService.get('scrypture_user_stats'),
      habits: StorageService.get('scrypture_habits'),
      achievements: StorageService.get('scrypture_achievements'),
      timestamp: Date.now(),
      version: version
    };
    
    StorageService.set(`scrypture_backup_${version}`, backup);
    console.log(`Backup created for version ${version}`);
  }
}
```

### **App Startup Integration**
```typescript
// App.tsx or main.tsx
import { MigrationService } from './services/migration/migrationService';

async function initializeApp(): Promise<void> {
  try {
    // Run migrations before app starts
    await MigrationService.checkAndRunMigrations();
    
    // Continue with app initialization
    console.log('App initialized successfully');
  } catch (error) {
    console.error('App initialization failed:', error);
    // Handle migration failure (show error message, etc.)
  }
}

// Call on app startup
initializeApp();
```

---

## 🧪 **Testing Migrations**

### **CI/CD Migration Test Enforcement**

#### **Automated Migration Testing**
```yaml
# .github/workflows/migration-tests.yml
name: Migration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  migration-safety:
    runs-on: ubuntu-latest
    name: Migration Safety Tests
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migration unit tests
        run: npm run test:migration:unit
      
      - name: Test old data migration safety
        run: npm run test:migration:safety
      
      - name: Test rollback scenarios
        run: npm run test:migration:rollback
      
      - name: Check for data corruption
        run: npm run test:migration:corruption
      
      - name: Validate migration coverage
        run: npm run test:migration:coverage
        env:
          COVERAGE_THRESHOLD: 90

  migration-integration:
    runs-on: ubuntu-latest
    name: Migration Integration Tests
    needs: migration-safety
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migration integration tests
        run: npm run test:migration:integration
      
      - name: Test real user data migration
        run: npm run test:migration:real-data
      
      - name: Performance test migration speed
        run: npm run test:migration:performance
```

#### **Migration Test Scripts**
```json
// package.json
{
  "scripts": {
    "test:migration": "jest --testPathPattern=migration",
    "test:migration:unit": "jest --testPathPattern=migration/unit",
    "test:migration:integration": "jest --testPathPattern=migration/integration",
    "test:migration:safety": "jest --testPathPattern=migration/safety",
    "test:migration:rollback": "jest --testPathPattern=migration/rollback",
    "test:migration:corruption": "jest --testPathPattern=migration/corruption",
    "test:migration:coverage": "jest --testPathPattern=migration --coverage --coverageThreshold='{\"global\":{\"branches\":90,\"functions\":90,\"lines\":90,\"statements\":90}}'",
    "test:migration:real-data": "jest --testPathPattern=migration/real-data",
    "test:migration:performance": "jest --testPathPattern=migration/performance"
  }
}
```

#### **Migration Test Coverage Requirements**
```typescript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/services/migration/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  collectCoverageFrom: [
    'src/services/migration/**/*.ts',
    'src/services/storage/**/*.ts',
    '!src/**/*.d.ts'
  ]
};
```

### **Unit Tests**
```typescript
// tests/migration/migrationService.test.ts
import { MigrationService } from '../../services/migration/migrationService';

describe('MigrationService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });
  
  test('should migrate V1 tasks to V2', () => {
    // Setup V1 data
    const v1Tasks = [
      {
        id: '1',
        title: 'Old Task',
        category: 'body',
        completed: false,
        createdAt: Date.now()
      }
    ];
    
    StorageService.set('scrypture_tasks', v1Tasks);
    StorageService.set('scrypture_schema_version', 1);
    
    // Run migration
    MigrationService.checkAndRunMigrations();
    
    // Verify migration
    const migratedTasks = StorageService.get<Task[]>('scrypture_tasks');
    expect(migratedTasks[0].priority).toBe('medium');
    expect(migratedTasks[0].difficulty).toBe(3);
    expect(migratedTasks[0].tags).toEqual([]);
    expect(StorageService.get('scrypture_schema_version')).toBe(2);
  });
  
  test('should create backup before migration', () => {
    const v1Tasks = [{ id: '1', title: 'Test', category: 'body', completed: false }];
    StorageService.set('scrypture_tasks', v1Tasks);
    StorageService.set('scrypture_schema_version', 1);
    
    MigrationService.checkAndRunMigrations();
    
    const backup = StorageService.get('scrypture_backup_v1');
    expect(backup).toBeDefined();
    expect(backup.tasks).toEqual(v1Tasks);
  });
  
  test('should handle migration errors gracefully', () => {
    // Mock StorageService to throw error
    jest.spyOn(StorageService, 'get').mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    expect(() => {
      MigrationService.checkAndRunMigrations();
    }).toThrow('Storage error');
  });
});
```

### **Integration Tests**
```typescript
// tests/integration/migration.integration.test.ts
describe('Migration Integration', () => {
  test('should migrate real user data', () => {
    // Load sample user data
    const sampleData = require('../fixtures/user-data-v1.json');
    
    // Setup localStorage with sample data
    Object.entries(sampleData).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    
    // Run migration
    MigrationService.checkAndRunMigrations();
    
    // Verify all data migrated correctly
    const tasks = StorageService.get<Task[]>('scrypture_tasks');
    const userStats = StorageService.get<UserStats>('scrypture_user_stats');
    
    expect(tasks.every(task => task.priority)).toBe(true);
    expect(tasks.every(task => task.difficulty)).toBe(true);
    expect(StorageService.get('scrypture_schema_version')).toBe(2);
  });
});
```

### **Test Data Fixtures**
```json
// tests/fixtures/user-data-v1.json
{
  "scrypture_tasks": [
    {
      "id": "1",
      "title": "Morning Exercise",
      "category": "body",
      "completed": false,
      "createdAt": 1640995200000
    },
    {
      "id": "2", 
      "title": "Read Book",
      "category": "mind",
      "completed": true,
      "createdAt": 1640995200000,
      "completedAt": 1641081600000
    }
  ],
  "scrypture_user_stats": {
    "level": 2,
    "totalExperiencePoints": 150,
    "body": 25,
    "mind": 30,
    "soul": 15,
    "bobrStage": "young",
    "damProgress": 45
  },
  "scrypture_schema_version": 1
}
```

---

## 🚨 **Error Handling**

### **Migration Error Types**
```typescript
// types/migration.ts
export enum MigrationErrorType {
  BACKUP_FAILED = 'BACKUP_FAILED',
  DATA_CORRUPTION = 'DATA_CORRUPTION',
  STORAGE_ERROR = 'STORAGE_ERROR',
  VERSION_MISMATCH = 'VERSION_MISMATCH',
  FIELD_MISMATCH = 'FIELD_MISMATCH',
  ROLLBACK_FAILED = 'ROLLBACK_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED'
}

export interface MigrationError {
  type: MigrationErrorType;
  message: string;
  originalError?: Error;
  version: number;
}
```

### **Error Recovery**
```typescript
// services/migration/errorHandler.ts
export class MigrationErrorHandler {
  static handleError(error: MigrationError): void {
    console.error('Migration error:', error);
    
    switch (error.type) {
      case MigrationErrorType.BACKUP_FAILED:
        this.handleBackupFailure(error);
        break;
      case MigrationErrorType.DATA_CORRUPTION:
        this.handleDataCorruption(error);
        break;
      case MigrationErrorType.STORAGE_ERROR:
        this.handleStorageError(error);
        break;
      case MigrationErrorType.FIELD_MISMATCH:
        this.handleFieldMismatch(error);
        break;
      default:
        this.handleUnknownError(error);
    }
  }
  
  private static handleBackupFailure(error: MigrationError): void {
    // Alert user and prevent migration
    alert('Unable to backup data. Migration cancelled for safety.');
    this.notifyCI('BACKUP_FAILED', error);
  }
  
  private static handleDataCorruption(error: MigrationError): void {
    // Try to restore from backup
    const backup = StorageService.get(`scrypture_backup_v${error.version - 1}`);
    if (backup) {
      StorageService.set('scrypture_tasks', backup.tasks);
      alert('Data restored from backup due to corruption.');
    }
    this.notifyCI('DATA_CORRUPTION', error);
  }
  
  private static handleFieldMismatch(error: MigrationError): void {
    // Alert on field mismatch
    console.error('Field mismatch detected:', error.message);
    alert(`Field mismatch detected: ${error.message}. Please check data integrity.`);
    this.notifyCI('FIELD_MISMATCH', error);
  }
  
  private static handleStorageError(error: MigrationError): void {
    // Check available storage space
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        if (estimate.usage && estimate.quota && estimate.usage > estimate.quota * 0.9) {
          alert('Low storage space. Please free up space and try again.');
        }
      });
    }
    this.notifyCI('STORAGE_ERROR', error);
  }
  
  private static notifyCI(errorType: string, error: MigrationError): void {
    // Send alert to CI/CD system
    if (process.env.CI) {
      console.error(`CI ALERT: ${errorType} - ${error.message}`);
      // Could integrate with Slack, email, or other notification systems
      process.exit(1); // Fail the build
    }
  }
}
```

### **CI/CD Alert System**
```typescript
// services/migration/ciAlertService.ts
export class CIAlertService {
  static alertOnFieldMismatch(field: string, expected: any, actual: any): void {
    const error = {
      type: MigrationErrorType.FIELD_MISMATCH,
      message: `Field ${field} mismatch: expected ${expected}, got ${actual}`,
      field,
      expected,
      actual
    };
    
    if (process.env.CI) {
      console.error('🚨 CI ALERT: Field mismatch detected');
      console.error(`Field: ${field}`);
      console.error(`Expected: ${expected}`);
      console.error(`Actual: ${actual}`);
      process.exit(1);
    }
    
    MigrationErrorHandler.handleError(error);
  }
  
  static alertOnDataCorruption(corruptionType: string, details: any): void {
    const error = {
      type: MigrationErrorType.DATA_CORRUPTION,
      message: `Data corruption detected: ${corruptionType}`,
      corruptionType,
      details
    };
    
    if (process.env.CI) {
      console.error('🚨 CI ALERT: Data corruption detected');
      console.error(`Type: ${corruptionType}`);
      console.error(`Details:`, details);
      process.exit(1);
    }
    
    MigrationErrorHandler.handleError(error);
  }
  
  static alertOnRollbackFailure(version: number, reason: string): void {
    const error = {
      type: MigrationErrorType.ROLLBACK_FAILED,
      message: `Rollback to version ${version} failed: ${reason}`,
      version,
      reason
    };
    
    if (process.env.CI) {
      console.error('🚨 CI ALERT: Rollback failure');
      console.error(`Version: ${version}`);
      console.error(`Reason: ${reason}`);
      process.exit(1);
    }
    
    MigrationErrorHandler.handleError(error);
  }
}
```

---

## 📋 **Migration Checklist**

### **Before Migration**
- [ ] **Backup existing data** to safe location
- [ ] **Test migration** with sample data
- [ ] **Verify rollback procedure** works correctly
- [ ] **Check storage space** availability
- [ ] **Notify users** of upcoming changes
- [ ] **Run CI/CD migration tests** to ensure safety
- [ ] **Verify test coverage** meets requirements (90%+)
- [ ] **Test field mismatch detection** with invalid data
- [ ] **Test corruption detection** with corrupted data

### **During Migration**
- [ ] **Log all steps** for debugging
- [ ] **Validate data** after each step
- [ ] **Handle errors** gracefully
- [ ] **Update version** only after success
- [ ] **Preserve user data** integrity

### **After Migration**
- [ ] **Verify migrated data** is correct
- [ ] **Test app functionality** with new schema
- [ ] **Clean up old backups** if successful
- [ ] **Update documentation** with new schema
- [ ] **Monitor for issues** in production
- [ ] **Run post-migration CI tests** to validate success
- [ ] **Check for any CI alerts** or warnings
- [ ] **Update migration test coverage** if needed
- [ ] **Document any issues** encountered during migration

---

## 🔗 **Related Documentation**

- **See: 03-technical-specs.md** for schema versioning details
- **See: 04-api-reference.md** for StorageService migration helpers
- **See: 05-database-schema.md** for schema version history
- **See: 06-development-guide.md** for migration best practices

---

*"In the realm of data, migration is the bridge between past and future, ensuring no knowledge is lost in the journey of progress."* 🔄✨ 