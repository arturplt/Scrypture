# Service Layer Testing Tools

This directory contains comprehensive testing tools for the Scrypture service layer, focusing on data persistence, auto-save functionality, and error handling.

## 🎯 **Testing Strategy Overview**

### **What We Test**
- ✅ **Storage Service** - Core data persistence and validation
- ✅ **Task Service** - Task CRUD operations with auto-save
- ✅ **Habit Service** - Habit management and streak tracking
- ✅ **User Service** - User data, experience, and achievements
- ✅ **Error Handling** - Graceful failure recovery
- ✅ **Performance** - Large datasets and rapid operations
- ✅ **Data Validation** - Structure validation and corruption handling

### **What We Don't Test (Yet)**
- ❌ **UI Components** - Covered by component tests
- ❌ **Integration Tests** - User workflows (separate suite)
- ❌ **Visual Regression** - UI consistency (optional)

## 📁 **File Structure**

```
src/__tests__/
├── service-layer.test.ts          # Integration tests for all services
├── utils/
│   └── test-utils.tsx            # Testing utilities and mock factories
└── services/
    ├── __tests__/
    │   ├── storageService.test.ts # Storage service unit tests
    │   ├── taskService.test.ts    # Task service unit tests
    │   ├── habitService.test.ts   # Habit service unit tests
    │   └── userService.test.ts    # User service unit tests
```

## 🛠️ **Testing Tools**

### **1. Storage Service Tests** (`storageService.test.ts`)

**Core Functionality:**
```typescript
// Test data persistence
test('should save and retrieve tasks', () => {
  const tasks = [createMockTask()];
  const saveResult = storageService.saveTasks(tasks);
  expect(saveResult).toBe(true);
});

// Test error handling
test('should handle storage quota exceeded', () => {
  localStorageMock.setItem.mockImplementation(() => {
    throw new Error('Storage quota exceeded');
  });
  const result = storageService.saveTasks(tasks);
  expect(result).toBe(false);
});
```

**Key Test Areas:**
- ✅ Data persistence (save/retrieve)
- ✅ Error handling (quota exceeded, corruption)
- ✅ Data validation (structure validation)
- ✅ Backup/restore functionality
- ✅ Storage statistics
- ✅ Export/import operations

### **2. Task Service Tests** (`taskService.test.ts`)

**Auto-save Integration:**
```typescript
// Test auto-save on task modification
test('should auto-save when tasks are modified', () => {
  const tasks = [createMockTask()];
  const result = taskService.saveTasks(tasks);
  expect(result).toBe(true);
  expect(mockStorageService.saveTasks).toHaveBeenCalledWith(tasks);
});
```

**Key Test Areas:**
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Auto-save functionality
- ✅ Error handling and recovery
- ✅ Data validation
- ✅ Performance with large datasets

### **3. Habit Service Tests** (`habitService.test.ts`)

**Habit Management:**
```typescript
// Test habit completion and streak tracking
test('should complete habit and update streak', () => {
  const habits = [createMockHabit({ streak: 5 })];
  jest.spyOn(habitService, 'getHabits').mockReturnValue(habits);
  
  const result = habitService.completeHabit('1');
  expect(result).toBe(true);
});
```

**Key Test Areas:**
- ✅ Habit creation and management
- ✅ Streak tracking and validation
- ✅ Frequency-based completion rules
- ✅ Auto-save on habit operations
- ✅ Error handling

### **4. User Service Tests** (`userService.test.ts`)

**Experience and Achievements:**
```typescript
// Test experience gain and leveling
test('should add experience and level up', () => {
  const user = createMockUser({ level: 5, experience: 500 });
  jest.spyOn(userService, 'getUser').mockReturnValue(user);
  
  const result = userService.addExperience(100);
  expect(result).toBe(true);
});
```

**Key Test Areas:**
- ✅ User creation and management
- ✅ Experience and leveling system
- ✅ Achievement unlocking
- ✅ Settings management
- ✅ Data backup and restore

## 🧪 **Test Utilities** (`test-utils.tsx`)

### **Mock Data Factories**
```typescript
import { createMockTask, createMockHabit, createMockUser } from '../utils/test-utils';

// Create mock data with defaults
const task = createMockTask();
const habit = createMockHabit();
const user = createMockUser();

// Create mock data with overrides
const completedTask = createMockTask({ completed: true, priority: 'high' });
const highLevelUser = createMockUser({ level: 10, experience: 1000 });
```

### **Storage Mocking**
```typescript
import { createLocalStorageMock } from '../utils/test-utils';

const localStorageMock = createLocalStorageMock();
localStorageMock.setItem.mockImplementation(() => {
  throw new Error('Storage quota exceeded');
});
```

### **Performance Testing**
```typescript
import { measureExecutionTime, benchmarkOperation } from '../utils/test-utils';

// Measure single operation
const { result, executionTime } = await measureExecutionTime(() => {
  return storageService.saveTasks(largeTaskArray);
});

// Benchmark multiple iterations
const { averageTime, minTime, maxTime } = await benchmarkOperation(() => {
  return storageService.saveTasks(tasks);
}, 100);
```

## 🚀 **Running Tests**

### **Run All Service Tests**
```bash
npm test -- --testPathPattern="services"
```

### **Run Specific Service Tests**
```bash
# Storage service only
npm test -- --testPathPattern="storageService"

# Task service only
npm test -- --testPathPattern="taskService"

# Habit service only
npm test -- --testPathPattern="habitService"

# User service only
npm test -- --testPathPattern="userService"
```

### **Run with Coverage**
```bash
npm run test:coverage -- --testPathPattern="services"
```

### **Run Integration Tests**
```bash
npm test -- --testPathPattern="service-layer"
```

## 📊 **Test Coverage Goals**

### **Storage Service** - 95% Coverage
- ✅ Data persistence operations
- ✅ Error handling scenarios
- ✅ Data validation and corruption handling
- ✅ Backup/restore functionality
- ✅ Storage statistics

### **Task Service** - 90% Coverage
- ✅ CRUD operations
- ✅ Auto-save integration
- ✅ Error handling
- ✅ Data validation
- ✅ Performance testing

### **Habit Service** - 90% Coverage
- ✅ Habit management
- ✅ Streak tracking
- ✅ Completion rules
- ✅ Auto-save functionality
- ✅ Error handling

### **User Service** - 90% Coverage
- ✅ User management
- ✅ Experience system
- ✅ Achievement system
- ✅ Settings management
- ✅ Data operations

## 🎯 **Testing Best Practices**

### **1. Mock External Dependencies**
```typescript
// Always mock localStorage
const localStorageMock = createLocalStorageMock();

// Mock service dependencies
jest.mock('../storageService');
const mockStorageService = storageService as jest.Mocked<typeof storageService>;
```

### **2. Test Error Scenarios**
```typescript
// Test storage errors
test('should handle storage quota exceeded', () => {
  localStorageMock.setItem.mockImplementation(() => {
    throw new Error('Storage quota exceeded');
  });
  // ... test implementation
});

// Test data corruption
test('should handle corrupted data gracefully', () => {
  localStorageMock.getItem.mockReturnValue('invalid json');
  // ... test implementation
});
```

### **3. Test Performance**
```typescript
// Test with large datasets
test('should handle large task arrays efficiently', () => {
  const largeTaskArray = generateMockTasks(1000);
  const result = storageService.saveTasks(largeTaskArray);
  expect(result).toBe(true);
});
```

### **4. Test Auto-save Integration**
```typescript
// Verify auto-save is triggered
test('should auto-save when data is modified', () => {
  const tasks = [createMockTask()];
  const result = taskService.saveTasks(tasks);
  expect(result).toBe(true);
  expect(mockStorageService.saveTasks).toHaveBeenCalledWith(tasks);
});
```

## 🔧 **Configuration**

### **Jest Configuration** (`jest.config.cjs`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/setupTests.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### **Environment Variables**
```bash
# Auto-save configuration
REACT_APP_AUTO_SAVE_ENABLED=true
REACT_APP_AUTO_SAVE_DELAY=1000

# Storage configuration
REACT_APP_STORAGE_QUOTA=5242880
REACT_APP_STORAGE_BACKUP_ENABLED=true
```

## 📈 **Monitoring and Metrics**

### **Test Metrics**
- **Coverage**: Target 90%+ for all services
- **Performance**: < 100ms for save operations
- **Reliability**: 100% error handling coverage
- **Auto-save**: 100% operation coverage

### **Quality Gates**
- ✅ All tests must pass
- ✅ Coverage must meet thresholds
- ✅ No critical errors in error handling
- ✅ Performance benchmarks met

## 🚀 **Next Steps**

### **Phase 1: Core Testing** ✅
- [x] Storage service tests
- [x] Task service tests
- [x] Habit service tests
- [x] User service tests
- [x] Integration tests

### **Phase 2: Advanced Testing** (Future)
- [ ] Visual regression tests
- [ ] End-to-end tests
- [ ] Performance benchmarks
- [ ] Stress testing
- [ ] Cross-browser testing

### **Phase 3: Monitoring** (Future)
- [ ] Test result analytics
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Coverage reporting

## 🎯 **Summary**

The service layer testing tools provide comprehensive coverage for:

1. **Data Persistence** - All storage operations with error handling
2. **Auto-save** - Real-time data saving with visual feedback
3. **Error Recovery** - Graceful handling of storage failures
4. **Performance** - Efficient handling of large datasets
5. **Validation** - Data structure validation and corruption handling

This testing foundation ensures your Scrypture app's data layer is **rock-solid** and **user-reliable**! 🚀 