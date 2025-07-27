# Development Guide

*"Practical implementation guidance for Scrypture MVP development"*

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-MVP_Development-yellow)
![Guide](https://img.shields.io/badge/guide-Implementation-blue)

## 📚 **Terminology Guide**

### **Default Language: Plain English**
All code examples and documentation use **plain English terminology** by default. Users can unlock **Latin Mode** for the full mystical experience.

### **Core Terminology Mapping**


- **Code**: Always use plain English variable names and function names
- **UI**: Display Latin terms when Latin Mode is enabled
- **Database**: Use plain English table and column names
- **API**: Use plain English endpoint names and parameters

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Git for version control
- Code editor (VS Code recommended)
- Browser for testing

### **Setup Steps**
1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/scrypture.git
   cd scrypture
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   ```
   http://localhost:3000
   ```

---

## 📊 **Current Progress Summary**

### **Completed Features**
- ✅ **Phase 1 Complete**: Core infrastructure and UI framework
- ✅ **Task System**: Basic task creation, completion, and management
- ✅ **Data Layer**: Local storage, validation, and persistence
- ✅ **UI Framework**: Pixel art theme, color system, typography

### **In Progress**
- 🔄 **User Progression**: Core attributes tracking and leveling system
- 🔄 **Bóbr Companion**: Character introduction and evolution stages

### **Next Priority**
- 📋 **Habit System**: Basic habit creation and tracking
- 📋 **Achievement System**: Achievement unlocks and celebrations
- 📋 **Onboarding**: Welcome screen and tutorial flow

---

## 📋 **Implementation Checklist**

### **Phase 1: Core Infrastructure (Week 1)**
- [x] **Project Setup**
  - [x] Repository structure
  - [x] Development environment
  - [x] Basic build system
  - [x] Code formatting and linting

- [x] **Basic UI Framework**
  - [x] Component library setup
  - [x] Pixel art game UI theme
  - [x] Color system implementation
  - [x] Typography system

- [x] **Data Layer**
  - [x] Local storage setup
  - [x] Data models and validation
  - [x] State management
  - [x] Persistence layer

### **Phase 2: Core Features (Week 2-3)**
- [x] **Task System**
  - [x] Task creation interface
  - [x] Task completion system
  - [x] Category organization
  - [x] Experience points and stat rewards

- [ ] **User Progression**
  - [ ] Core attributes tracking
  - [ ] Leveling system
  - [ ] Progress indicators
  - [ ] Level-up celebrations

- [ ] **Bóbr Companion**
  - [ ] Character introduction
  - [ ] Evolution stages
  - [ ] Motivational messages
  - [ ] Dam visualization

### **Phase 3: Advanced Features (Week 4)**
- [ ] **Habit System**
  - [ ] Habit creation
  - [ ] Streak tracking
  - [ ] Completion interface
  - [ ] Motivational feedback

- [x] **Achievement System** ✅
  - [x] Achievement unlocks (15 achievements with auto-detection)
  - [x] Progress tracking (real-time progress calculation)  
  - [x] Celebration animations (rarity-based effects)
  - [x] Milestone rewards (XP and stat rewards)

- [ ] **Onboarding**
  - [ ] Welcome screen
  - [ ] Tutorial flow
  - [ ] First task guide
  - [ ] Progress tracking

### **Phase 4: Polish & Testing (Week 5)**
- [ ] **User Experience**
  - [ ] Animation polish
  - [ ] Sound effects
  - [ ] Responsive design
  - [ ] Accessibility compliance

- [ ] **Testing & Quality**
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] User testing
  - [ ] Performance optimization

- [ ] **Deployment**
  - [ ] Production build
  - [ ] Environment configuration
  - [ ] Deployment pipeline
  - [ ] Monitoring setup

---

## 🏗️ **Project Structure**

```
scrypture/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Basic UI components
│   │   ├── features/       # Feature-specific components
│   │   └── layout/         # Layout components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── styles/             # CSS and styling
│   └── assets/             # Images, fonts, etc.
├── public/                 # Static assets
├── docs/                   # Documentation
├── tests/                  # Test files
├── scripts/                # Build and deployment scripts
└── config/                 # Configuration files
```

### **Key Directories**

#### **Components Structure**
```
components/
├── ui/                     # Reusable UI components
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── ProgressBar.tsx
│   └── index.ts
├── features/               # Feature-specific components
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   └── TaskList.tsx
│   ├── habits/
│   ├── achievements/
│   └── bobr/
└── layout/                 # Layout components
    ├── Header.tsx
    ├── Sidebar.tsx
    └── AppLayout.tsx
```

#### **Services Structure**
```
services/
├── base/                   # Base service classes
│   ├── BaseService.ts      # User-scoped base service
│   └── index.ts
├── storage/                # Storage services
│   ├── StorageService.ts   # Basic storage
│   ├── UserScopedStorageService.ts # User-scoped storage
│   └── index.ts
├── sync/                   # Sync services
│   ├── SyncService.ts      # Sync service stub
│   ├── ConflictResolver.ts # Conflict resolution
│   └── index.ts
├── debug/                  # Debug services
│   ├── DebugService.ts     # Debug service
│   ├── MigrationLogger.ts  # Migration logging
│   └── index.ts
├── tasks/                  # Task management
│   ├── TaskService.ts      # User-scoped task service
│   └── index.ts
├── habits/                 # Habit management
│   ├── HabitService.ts     # User-scoped habit service
│   └── index.ts
├── achievements/            # Achievement system
│   ├── AchievementService.ts # User-scoped achievement service
│   └── index.ts
└── user/                   # User management
    ├── UserService.ts      # User data service
    └── index.ts
```

#### **Contexts Structure**
```
contexts/
├── UserContext.tsx         # User authentication context
├── AppContext.tsx          # Application state context
└── index.ts
```
```
services/
├── storage/                # Storage service
│   ├── storageService.ts
│   └── migrations/         # Data migrations
├── tasks/                  # Task management
│   ├── taskService.ts
│   └── taskValidation.ts
├── user/                   # User stats and progression
│   ├── userStatsService.ts
│   └── levelService.ts
├── habits/                 # Habit tracking
│   ├── habitService.ts
│   └── streakService.ts
└── achievements/           # Achievement system
    ├── achievementService.ts
    └── conditionService.ts
```

---

## 🔧 **Data Model Extensions**

### **Adding New Fields to Task Model**

When extending the task model with new fields, follow these patterns:

#### **1. Update TypeScript Interfaces**
```typescript
// types/task.ts
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
  estimatedDuration?: number;
  actualDuration?: number;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
  // Add new fields here
  newField?: string;
  requiredField: number;
}

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

#### **2. Update TaskService.createTask Method**
```typescript
// services/tasks/taskService.ts
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

#### **3. Update UI Components**
```typescript
// components/features/tasks/TaskForm.tsx
const TaskForm = () => {
  const [newField, setNewField] = useState('');
  const [requiredField, setRequiredField] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title,
      description,
      category,
      priority,
      difficulty,
      dueDate,
      tags,
      estimatedDuration,
      // Add new fields
      newField,
      requiredField
    };

    await createTask(taskData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Existing fields */}
      
      {/* New fields */}
      <div>
        <label htmlFor="newField">New Field</label>
        <input
          id="newField"
          type="text"
          value={newField}
          onChange={(e) => setNewField(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="requiredField">Required Field</label>
        <input
          id="requiredField"
          type="number"
          value={requiredField}
          onChange={(e) => setRequiredField(parseInt(e.target.value))}
          required
        />
      </div>
    </form>
  );
};
```

#### **4. Data Migration Strategy**
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

// Call migration on app startup
// App.tsx
useEffect(() => {
  TaskMigration.migrateToNewVersion();
}, []);
```

#### **5. Update Database Schema (Future)**
```sql
-- For future database implementation
ALTER TABLE tasks 
ADD COLUMN new_field VARCHAR(255),
ADD COLUMN required_field INTEGER NOT NULL DEFAULT 0;

-- Add indexes for new fields if needed
CREATE INDEX idx_tasks_new_field ON tasks(new_field);
CREATE INDEX idx_tasks_required_field ON tasks(required_field);
```

### **Best Practices for Data Model Extensions**

#### **1. Backward Compatibility**
- Always provide default values for new optional fields
- Use migration scripts to update existing data
- Test with existing data to ensure compatibility

#### **2. Validation**
```typescript
// utils/validation/taskValidation.ts
export const validateTask = (task: CreateTaskData): ValidationResult => {
  const errors: string[] = [];
  
  if (!task.title.trim()) {
    errors.push('Title is required');
  }
  
  if (task.requiredField < 0) {
    errors.push('Required field must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

#### **3. Type Safety**
```typescript
// Use strict typing for new fields
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type TaskDifficulty = 1 | 2 | 3 | 4 | 5;

interface Task {
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  // ... other fields
}
```

#### **4. Testing**
```typescript
// tests/services/taskService.test.ts
describe('TaskService with new fields', () => {
  beforeEach(() => {
    StorageService.clear();
  });

  afterEach(() => {
    StorageService.clear();
  });

  it('should create task with new fields', async () => {
    const taskData = {
      title: 'Test Task',
      category: 'body' as const,
      newField: 'test value',
      requiredField: 5
    };
    
    const task = await taskService.createTask(taskData);
    
    expect(task.newField).toBe('test value');
    expect(task.requiredField).toBe(5);
  });

  it('should apply default values for optional fields', async () => {
    const taskData = {
      title: 'Test Task',
      category: 'body' as const
    };
    
    const task = await taskService.createTask(taskData);
    
    expect(task.priority).toBe('medium');
    expect(task.difficulty).toBe(3);
    expect(task.tags).toEqual([]);
  });

  it('should validate new fields correctly', () => {
    const invalidData = {
      title: 'Test Task',
      category: 'body' as const,
      priority: 'invalid' as any,
      difficulty: 6
    };
    
    const result = validateCreateTaskData(invalidData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Priority must be one of: low, medium, high, critical');
    expect(result.errors).toContain('Difficulty must be between 1 and 5');
  });
});
```

### **Testing Strategy for Extended Fields**

#### **Unit Test Categories**

##### **1. Service Layer Tests**
- **Default value handling**: Test that optional fields get proper defaults
- **Field validation**: Test that invalid values are rejected
- **Experience calculation**: Test that priority and difficulty affect XP correctly
- **Data persistence**: Test that extended fields are saved and loaded correctly

##### **2. Validation Tests**
- **Required fields**: Test that required fields are enforced
- **Optional fields**: Test that optional fields can be omitted
- **Field constraints**: Test that field values are within valid ranges
- **Type safety**: Test that TypeScript types are enforced

##### **3. Migration Tests**
- **Backward compatibility**: Test that existing data works with new fields
- **Default application**: Test that missing fields get proper defaults
- **Data integrity**: Test that no data is lost during migration

##### **4. Integration Tests**
- **UI integration**: Test that forms handle new fields correctly
- **API integration**: Test that API endpoints work with extended data
- **Storage integration**: Test that localStorage handles extended objects

#### **Test Data Patterns**
```typescript
// test-utils/taskTestData.ts
export const createTestTaskData = (overrides: Partial<CreateTaskData> = {}): CreateTaskData => ({
  title: 'Test Task',
  category: 'body' as const,
  ...overrides
});

export const createTestTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'test-id',
  title: 'Test Task',
  category: 'body' as const,
  priority: 'medium' as const,
  difficulty: 3,
  completed: false,
  experienceReward: 15,
  statRewards: { body: 10 },
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});
```
```
services/
├── tasks/                  # Task-related services
│   ├── taskService.ts
│   ├── taskValidation.ts
│   └── taskRewards.ts
├── user/                   # User progression services
│   ├── userService.ts
│   ├── levelService.ts
│   └── statsService.ts
├── habits/                 # Habit services
├── achievements/            # Achievement services
└── storage/                # Data persistence
    ├── localStorage.ts
    └── syncService.ts
```

---

## 🔧 **Core Implementation**

### **Task System Implementation**

#### **Task Service**
```typescript
// services/tasks/taskService.ts
export class TaskService {
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
```

#### **Task Component**
```typescript
// components/features/tasks/TaskCard.tsx
import { useTerminology } from '../hooks/useTerminology';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  const { getTerm } = useTerminology();
  
  return (
    <div className={`task-card ${task.completed ? 'completed' : ''}`}>
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      <div className="task-rewards">
        <span>{getTerm('Experience Points')}: {task.experienceReward}</span>
        {Object.entries(task.statRewards).map(([stat, value]) => (
          <span key={stat}>{stat}: +{value}</span>
        ))}
      </div>
      {!task.completed && (
        <button onClick={() => onComplete(task.id)}>
          {getTerm('Complete')}
        </button>
      )}
    </div>
  );
};
```

### **Task Detail Modal with Swipe Navigation**

#### **TaskDetailModal Component**
```typescript
// components/features/tasks/TaskDetailModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { Modal } from './Modal';
import { formatRelativeTime } from '../utils/dateUtils';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onEdit, 
  onNext, 
  onPrevious, 
  hasNext = false, 
  hasPrevious = false 
}) => {
  // Navigation state for swipe/drag functionality
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance required to trigger navigation (in px)
  const minSwipeDistance = 50;

  // Unified drag handling for both touch and mouse events
  const handleDragStart = (clientX: number) => {
    setDragEnd(null);
    setDragStart(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (isDragging) {
      setDragEnd(clientX);
    }
  };

  const handleDragEnd = () => {
    if (!dragStart || !dragEnd || !isDragging) return;
    
    // Calculate swipe distance and direction
    const distance = dragStart - dragEnd;
    const isLeftSwipe = distance > minSwipeDistance;  // Swipe left = next task
    const isRightSwipe = distance < -minSwipeDistance; // Swipe right = previous task

    // Navigate based on swipe direction and availability
    if (isLeftSwipe && hasNext && onNext) {
      onNext();
    } else if (isRightSwipe && hasPrevious && onPrevious) {
      onPrevious();
    }

    setIsDragging(false);
  };

  // Touch event handlers for mobile devices
  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse event handlers for desktop devices
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleDragMove(e.clientX);
    }
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  // Global mouse event listeners for seamless drag tracking
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleDragMove(e.clientX);
      };

      const handleGlobalMouseUp = () => {
        handleDragEnd();
      };

      // Add global listeners to track mouse even when cursor leaves the modal
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, dragEnd]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details">
      <div 
        className={styles.container}
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {/* Navigation bar with clickable buttons and swipe indicators */}
        <div className={styles.navigationBar}>
          {hasPrevious && (
            <button 
              className={`${styles.navIndicator} ${styles.navPrevious}`}
              onClick={onPrevious}
              aria-label="Go to previous task"
            >
              ← Previous
            </button>
          )}
          {hasNext && (
            <button 
              className={`${styles.navIndicator} ${styles.navNext}`}
              onClick={onNext}
              aria-label="Go to next task"
            >
              Next →
            </button>
          )}
        </div>
        
        {/* Task details content */}
        <div className={styles.header}>
          <h3 className={styles.title}>{task?.title}</h3>
          <div className={styles.meta}>
            <span className={styles.category}>{task?.category}</span>
            <span className={styles.priority}>{task?.priority}</span>
            <span className={styles.date}>
              {task?.createdAt && formatRelativeTime(new Date(task.createdAt))}
            </span>
          </div>
        </div>
        
        {task?.description && (
          <div className={styles.description}>
            <h4>Description</h4>
            <p>{task.description}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
```

#### **Key Implementation Features**

**Cross-Platform Navigation**:
- **Touch Support**: Mobile swipe gestures with touch event handling
- **Mouse Support**: Desktop drag functionality with global mouse tracking
- **Button Navigation**: Clickable "Previous" and "Next" buttons for accessibility
- **Unified Logic**: Single drag handling for both input methods

**Accessibility Features**:
- **Keyboard Navigation**: Tab to focus buttons, Enter to activate
- **Screen Reader Support**: ARIA labels for navigation buttons
- **Visual Feedback**: Cursor changes and hover states
- **Boundary Handling**: Prevents navigation beyond first/last task

**Technical Implementation**:
- **50px Threshold**: Minimum distance required for navigation
- **Global Mouse Tracking**: Seamless drag even when cursor leaves modal
- **State Management**: Centralized modal state in TaskList component
- **Event Prevention**: Prevents text selection during drag interactions

#### **CSS Styling for Navigation**
```css
/* Navigation bar styling */
.navigationBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 2px solid var(--color-border-primary);
  margin-bottom: var(--spacing-md);
}

.navIndicator {
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 2px solid var(--color-border-primary);
  border-radius: 0px;
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.navIndicator:hover {
  background: var(--color-accent-gold);
  color: var(--color-bg-primary);
  border-color: var(--color-accent-gold);
}

.navIndicator:active {
  transform: translateY(1px);
  box-shadow: inset 2px 2px 0px rgba(0, 0, 0, 0.2);
}

/* Container styling for drag interaction */
.container {
  user-select: none;
  cursor: grab;
  position: relative;
}

.container:active {
  cursor: grabbing;
}
```

### **User Progression System**

#### **Level Service**
```typescript
// services/user/levelService.ts
export class LevelService {
  private readonly levelThresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700];
  
  calculateLevel(totalExperiencePoints: number): number {
    return this.levelThresholds.findIndex(threshold => totalExperiencePoints < threshold);
  }
  
  calculateLevelProgress(totalExperiencePoints: number): LevelProgress {
    const currentLevel = this.calculateLevel(totalExperiencePoints);
    const currentThreshold = this.levelThresholds[currentLevel];
    const nextThreshold = this.levelThresholds[currentLevel + 1] || currentThreshold;
    
    return {
      level: currentLevel,
      currentExperiencePoints: totalExperiencePoints,
      currentThreshold,
      nextThreshold,
      progress: (totalExperiencePoints - currentThreshold) / (nextThreshold - currentThreshold)
    };
  }
  
  checkLevelUp(currentExperiencePoints: number, newExperiencePoints: number): boolean {
    const currentLevel = this.calculateLevel(currentExperiencePoints);
    const newLevel = this.calculateLevel(currentExperiencePoints + newExperiencePoints);
    return newLevel > currentLevel;
  }
}
```

#### **Stats Service**
```typescript
// services/user/statsService.ts
export class StatsService {
  private stats: UserStats = {
    body: 0,
    mind: 0,
    soul: 0,
    totalExperiencePoints: 0,
    level: 1
  };
  
  addStatRewards(rewards: StatRewards): void {
    this.stats.body += rewards.body || 0;
    this.stats.mind += rewards.mind || 0;
    this.stats.soul += rewards.soul || 0;
    this.saveStats();
  }
  
  addExperiencePoints(experiencePoints: number): LevelUpResult {
    this.stats.totalExperiencePoints += experiencePoints;
    const newLevel = levelService.calculateLevel(this.stats.totalExperiencePoints);
    const leveledUp = newLevel > this.stats.level;
    
    if (leveledUp) {
      this.stats.level = newLevel;
      this.saveStats();
      return { leveledUp: true, newLevel, oldLevel: this.stats.level };
    }
    
    this.saveStats();
    return { leveledUp: false };
  }
  
  private saveStats(): void {
    localStorage.setItem('userStats', JSON.stringify(this.stats));
  }
}
```

### **Bóbr Companion System**

#### **Bóbr Service**
```typescript
// services/bobr/bobrService.ts
export class BobrService {
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

## 👥 **Multi-User Architecture Implementation**

### **Auth-Ready Design Principles**
- **Single User MVP**: Start with mock user context for simplicity
- **Seamless Transition**: All services abstract user scope for future auth
- **Scoped Storage**: User-specific data isolation from day one
- **Mock Authentication**: Simulate multi-user environment during development

### **User Context Setup**
```typescript
// contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

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

const UserContext = createContext<UserContextType | undefined>(undefined);

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

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
```

### **Base Service Implementation**
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

### **User-Scoped Service Example**
```typescript
// services/tasks/TaskService.ts
import { BaseService } from '../base/BaseService';

export class TaskService extends BaseService {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const tasks = await this.getUserScopedData<Task[]>('tasks') || [];
    let filteredTasks = [...tasks];

    if (filters?.category) {
      filteredTasks = filteredTasks.filter(task => task.category === filters.category);
    }

    if (filters?.completed !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.completed === filters.completed);
    }

    return filteredTasks;
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    const tasks = await this.getUserScopedData<Task[]>('tasks') || [];
    
    const newTask: Task = {
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

    tasks.push(newTask);
    await this.setUserScopedData('tasks', tasks);
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const tasks = await this.getUserScopedData<Task[]>('tasks') || [];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date() };
    await this.setUserScopedData('tasks', tasks);
    return tasks[taskIndex];
  }

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getUserScopedData<Task[]>('tasks') || [];
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    await this.setUserScopedData('tasks', filteredTasks);
  }
}
```

### **App Integration**
```typescript
// App.tsx
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <div className="app">
        {/* Your app components */}
      </div>
    </UserProvider>
  );
}

// Component usage
import { useUser } from './contexts/UserContext';

const TaskList: React.FC = () => {
  const { user, userId } = useUser();
  
  return (
    <div>
      <h2>Tasks for {user?.username}</h2>
      {/* Task list implementation */}
    </div>
  );
};
```

### **Testing Multi-User Architecture**
```typescript
// tests/services/TaskService.test.ts
describe('TaskService - Multi-User', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should scope tasks to current user', async () => {
    // Mock user context
    const mockUser = { id: 'user-001', username: 'TestUser' };
    localStorage.setItem('scrypture_current_user', JSON.stringify(mockUser));

    const taskService = new TaskService();
    const task = await taskService.createTask({
      title: 'Test Task',
      category: 'body'
    });

    expect(task.userId).toBe('user-001');
    
    // Verify storage key is scoped
    const storedTasks = JSON.parse(localStorage.getItem('tasks_user-001') || '[]');
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0].userId).toBe('user-001');
  });

  test('should isolate data between users', async () => {
    // Create task for user 1
    localStorage.setItem('scrypture_current_user', JSON.stringify({ id: 'user-001' }));
    const taskService1 = new TaskService();
    await taskService1.createTask({ title: 'User 1 Task', category: 'body' });

    // Switch to user 2
    localStorage.setItem('scrypture_current_user', JSON.stringify({ id: 'user-002' }));
    const taskService2 = new TaskService();
    const user2Tasks = await taskService2.getTasks();

    expect(user2Tasks).toHaveLength(0); // User 2 should have no tasks
  });
});
```

---

## 🔄 **Cross-Device Sync Implementation**

### **Sync-Ready Design Principles**
- **Local First**: Start with local storage for immediate performance
- **Version Tags**: All data objects include version tracking for diff syncing
- **Sync Service Stub**: Placeholder for future cloud sync implementation
- **Conflict Resolution**: Version-based conflict detection and resolution
- **Offline Support**: Full functionality without internet connection

### **Sync Service Implementation**
```typescript
// services/sync/SyncService.ts
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

### **Sync-Aware Task Service**
```typescript
// services/tasks/TaskService.ts
import { BaseService } from '../base/BaseService';

export class TaskService extends BaseService {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const tasks = await this.getUserScopedData<Task>('tasks') || [];
    let filteredTasks = [...tasks];

    if (filters?.category) {
      filteredTasks = filteredTasks.filter(task => task.category === filters.category);
    }

    if (filters?.completed !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.completed === filters.completed);
    }

    return filteredTasks;
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    return this.createSyncableData<Task>('tasks', {
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
    });
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    return this.updateSyncableData<Task>('tasks', taskId, updates);
  }

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getUserScopedData<Task>('tasks') || [];
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    await this.setUserScopedData('tasks', filteredTasks);
  }
}
```

### **Testing Sync Functionality**
```typescript
// tests/services/SyncService.test.ts
describe('SyncService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should fallback to local storage for MVP', async () => {
    const syncService = SyncService.getInstance();
    const result = await syncService.syncData();
    
    expect(result.success).toBe(true);
    expect(result.syncedItems).toBe(0);
    expect(result.conflicts).toHaveLength(0);
  });

  test('should generate unique device ID', () => {
    const syncService = SyncService.getInstance();
    const deviceId1 = syncService['deviceId'];
    const deviceId2 = syncService['deviceId'];
    
    expect(deviceId1).toBe(deviceId2);
    expect(deviceId1).toMatch(/^device_\d+_[a-z0-9]+$/);
  });

  test('should detect conflicts between versions', () => {
    const syncService = SyncService.getInstance();
    
    const localData: SyncableData = {
      id: '1',
      userId: 'user-1',
      version: 1,
      lastModified: new Date(),
      deviceId: 'device-1',
      syncStatus: 'synced'
    };
    
    const remoteData: SyncableData = {
      id: '1',
      userId: 'user-1',
      version: 2,
      lastModified: new Date(),
      deviceId: 'device-2',
      syncStatus: 'synced'
    };
    
    const hasConflict = syncService.detectConflict(localData, remoteData);
    expect(hasConflict).toBe(true);
  });

  test('should resolve conflicts based on config', () => {
    const syncService = SyncService.getInstance();
    
    const localData: SyncableData = {
      id: '1',
      userId: 'user-1',
      version: 1,
      lastModified: new Date(),
      deviceId: 'device-1',
      syncStatus: 'synced'
    };
    
    const remoteData: SyncableData = {
      id: '1',
      userId: 'user-1',
      version: 2,
      lastModified: new Date(),
      deviceId: 'device-2',
      syncStatus: 'synced'
    };
    
    // Test local-wins resolution
    syncService.updateConfig({ conflictResolution: 'local-wins' });
    const resolved = syncService.resolveConflict(localData, remoteData);
    expect(resolved).toBe(localData);
    
    // Test remote-wins resolution
    syncService.updateConfig({ conflictResolution: 'remote-wins' });
    const resolved2 = syncService.resolveConflict(localData, remoteData);
    expect(resolved2).toBe(remoteData);
  });
});
```

---

## 🧠 **Data Observability & Debug Implementation**

### **Debug-Ready Design Principles**
- **Development Visibility**: Real-time data inspection in dev mode
- **Schema Versioning**: Track data structure changes and migrations
- **Migration Logging**: Complete audit trail of data transformations
- **Performance Monitoring**: Track storage usage and sync performance
- **Error Tracking**: Comprehensive error logging and debugging
- **Production Safety**: Debug tools disabled in production builds

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

### **Enhanced Base Service with Debug**
```typescript
// services/base/BaseService.ts
export abstract class BaseService {
  protected debugService: DebugService;

  constructor() {
    this.debugService = DebugService.getInstance();
  }

  protected async getUserScopedData<T>(key: string): Promise<T[] | null> {
    const stopTimer = this.debugService.startTimer('storage-read');
    try {
      const scopedKey = this.getScopedStorageKey(key);
      const data = UserScopedStorageService.get<T[]>(scopedKey);
      
      // Add version tags if missing (for existing data)
      if (data && data.length > 0) {
        return data.map(item => this.ensureVersionTags(item));
      }
      
      return data;
    } catch (error) {
      this.debugService.logError(`Failed to get user data for key: ${key}`, error);
      throw error;
    } finally {
      stopTimer();
    }
  }

  protected async setUserScopedData<T>(key: string, data: T[]): Promise<void> {
    const stopTimer = this.debugService.startTimer('storage-write');
    try {
      const scopedKey = this.getScopedStorageKey(key);
      
      // Add version tags to new/modified data
      const versionedData = data.map(item => this.ensureVersionTags(item));
      
      UserScopedStorageService.set(scopedKey, versionedData);
      
      // Trigger sync if enabled
      if (this.syncService.getConfig().enabled) {
        await this.syncService.syncData();
      }
    } catch (error) {
      this.debugService.logError(`Failed to set user data for key: ${key}`, error);
      throw error;
    } finally {
      stopTimer();
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
}
```

### **Testing Debug Functionality**
```typescript
// tests/services/DebugService.test.ts
describe('DebugService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should only be enabled in development mode', () => {
    const debugService = DebugService.getInstance();
    expect(debugService.isDevMode()).toBe(process.env.NODE_ENV === 'development');
  });

  test('should track schema version', () => {
    const debugService = DebugService.getInstance();
    expect(debugService.getSchemaVersion()).toBe('1.0.0');
    
    debugService.setSchemaVersion('1.1.0');
    expect(debugService.getSchemaVersion()).toBe('1.1.0');
  });

  test('should log migrations', () => {
    const debugService = DebugService.getInstance();
    debugService.logMigration('Test migration', { test: 'data' });
    
    const migrations = debugService.getMigrations();
    expect(migrations).toHaveLength(1);
    expect(migrations[0].description).toBe('Test migration');
    expect(migrations[0].data).toEqual({ test: 'data' });
  });

  test('should track storage usage', () => {
    const debugService = DebugService.getInstance();
    
    // Add some test data
    localStorage.setItem('scrypture_tasks_mock-user-001', JSON.stringify([{ id: '1', title: 'Test' }]));
    
    const usage = debugService.getStorageUsage();
    expect(usage.totalSize).toBe(5 * 1024 * 1024);
    expect(usage.usedPercentage).toBeGreaterThan(0);
    expect(usage.breakdown.tasks).toBeGreaterThan(0);
  });

  test('should log errors and warnings', () => {
    const debugService = DebugService.getInstance();
    
    debugService.logError('Test error', new Error('Test error message'));
    debugService.logWarning('Test warning');
    
    const logs = debugService.getErrorLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0].level).toBe('error');
    expect(logs[1].level).toBe('warn');
  });

  test('should track performance metrics', () => {
    const debugService = DebugService.getInstance();
    
    const stopTimer = debugService.startTimer('test-operation');
    setTimeout(() => {
      stopTimer();
      
      const metrics = debugService.getPerformanceMetrics();
      expect(metrics.loadTime).toBeGreaterThan(0);
    }, 10);
  });

  test('should export debug data', () => {
    const debugService = DebugService.getInstance();
    debugService.logError('Test error');
    
    const exportedData = debugService.exportData();
    const parsed = JSON.parse(exportedData);
    
    expect(parsed.schemaVersion).toBe('1.0.0');
    expect(parsed.errorLogs).toHaveLength(1);
    expect(parsed.timestamp).toBeDefined();
  });
});
```

---

## 🧪 **Testing Strategy**

### **Comprehensive Test Suite Overview**

The Scrypture app includes a comprehensive test suite covering all critical user workflows and edge cases. The test suite consists of:

#### **📁 Test Structure**
```
src/
├── __tests__/                    # Integration tests
│   ├── integration.test.tsx      # Complete user workflows
│   └── integration-simple.test.tsx # Core functionality tests
├── components/__tests__/         # Component tests
│   ├── TaskCard.test.tsx         # Task display & interactions
│   ├── TaskList.test.tsx         # Filtering, sorting, modals
│   ├── TaskDetailModal.test.tsx  # Navigation, gestures, styling
│   ├── DataManager.test.tsx      # Import/export, backup/restore
│   ├── AutoSaveIndicator.test.tsx # Status display, transitions
│   ├── TaskForm.test.tsx         # Form interactions and validation
│   ├── TaskCounter.test.tsx      # Task statistics display
│   ├── StatsDisplay.test.tsx     # User stats and progress
│   └── CategoryModal.test.tsx    # Custom category management
├── services/__tests__/           # Service layer tests
│   ├── taskService.test.ts       # Task CRUD operations
│   ├── userService.test.ts       # User progression and stats
│   ├── storageService.test.ts    # Data persistence and validation
│   └── categoryService.test.ts   # Category management
└── hooks/__tests__/             # Hook tests
    ├── useTasks.test.tsx         # Task management hooks
    └── useUser.test.tsx          # User state management
```

### **🎯 Recent Test Suite Improvements (Phase 1-5)**

#### **Major Fixes Completed**
- ✅ **CategoryService Tests** - Fixed singleton mock setup (8 errors → 0)
- ✅ **StatsDisplay Tests** - Fixed user data mocking (5 errors → 0)
- ✅ **UserService Tests** - Fixed experience calculation (1 error → 0)
- ✅ **TaskForm Tests** - Improved form interaction timing (10+ errors reduced)
- ✅ **Integration Tests** - Fixed data loading (4 errors → 0)
- ✅ **Service Layer Tests** - Fixed error handling (1 error → 0)

#### **Technical Improvements**
- **Enhanced Mock Data Quality** - Complete User objects with all required properties
- **Improved Test Reliability** - Better timeouts and retry logic
- **Fixed CSS Modules Issues** - Proper class name handling in tests
- **Enhanced Error Handling** - Graceful error scenarios in tests
- **Better Integration Test Setup** - Proper localStorage mocking

#### **Current Test Status**
- **Total Tests:** 345 tests
- **Passing:** 284 tests (82%)
- **Failing:** 61 tests (18%)
- **Improvement:** 34% error reduction (93 → 61 errors)

#### **Remaining Issues (Phase 6)**
- **CSS Class Matching** - CSS Modules hashed class names
- **UI Element Queries** - Icon text duplication and accessibility
- **Form Validation Timing** - Async validation and state updates
- **Component Integration** - Context provider and hook dependencies

### **🧩 Component Tests**

#### **TaskCard Component**
```typescript
// src/components/__tests__/TaskCard.test.tsx
describe('TaskCard', () => {
  // Rendering tests
  test('renders task information correctly', () => {
    // Tests title, description, category, priority display
  });

  // Interaction tests
  test('handles completion checkbox clicks', () => {
    // Tests task completion workflow
  });

  // Styling tests
  test('applies correct styling for different states', () => {
    // Tests completed, pending, priority styling
  });

  // Edge cases
  test('handles missing optional fields gracefully', () => {
    // Tests robustness with incomplete data
  });
});
```

#### **TaskForm Component**
```typescript
// src/components/__tests__/TaskForm.test.tsx
describe('TaskForm', () => {
  // Form expansion
  test('expands when title is clicked', () => {
    // Tests form expansion behavior
  });

  // Category selection
  test('allows selecting categories', () => {
    // Tests body, mind, soul category selection
  });

  // Priority selection
  test('allows selecting priority levels', () => {
    // Tests low, medium, high priority selection
  });

  // Form submission
  test('submits task with correct data', async () => {
    // Tests complete form submission workflow
  });

  // Reward calculation
  test('calculates rewards correctly for different categories', () => {
    // Tests stat rewards and XP calculation
  });
});
```

#### **StatsDisplay Component**
```typescript
// src/components/__tests__/StatsDisplay.test.tsx
describe('StatsDisplay', () => {
  // User data display
  test('renders stats display with user data', () => {
    // Tests body, mind, soul stats display
  });

  // Progress bars
  test('shows progress bars for each stat', () => {
    // Tests visual progress indicators
  });

  // Level and experience
  test('displays level and experience information', () => {
    // Tests user progression display
  });

  // Empty state
  test('shows no user message when user is null', () => {
    // Tests graceful empty state handling
  });
});
```

#### **CategoryModal Component**
```typescript
// src/components/__tests__/CategoryModal.test.tsx
describe('CategoryModal', () => {
  // Form validation
  test('shows validation error for empty name', () => {
    // Tests required field validation
  });

  // Icon selection
  test('allows selecting icons', () => {
    // Tests icon picker functionality
  });

  // Category creation
  test('successfully creates a new category', async () => {
    // Tests complete category creation workflow
  });

  // Preview functionality
  test('shows preview of the category', () => {
    // Tests real-time preview updates
  });
});
```

### **🔧 Service Layer Tests**

#### **TaskService Tests**
```typescript
// src/services/__tests__/taskService.test.ts
describe('TaskService', () => {
  // CRUD operations
  test('creates, reads, updates, deletes tasks', () => {
    // Tests all basic operations
  });

  // Stat rewards calculation
  test('calculates stat rewards correctly', () => {
    // Tests XP and stat point calculation
  });

  // Data validation
  test('validates task data structure', () => {
    // Tests required fields and constraints
  });
});
```

#### **UserService Tests**
```typescript
// src/services/__tests__/userService.test.ts
describe('UserService', () => {
  // Experience and leveling
  test('handles level calculation correctly', () => {
    // Tests XP addition and level progression
  });

  // Achievement system
  test('unlocks achievements correctly', () => {
    // Tests achievement unlocking logic
  });

  // Stat management
  test('manages user stats correctly', () => {
    // Tests body, mind, soul stat tracking
  });
});
```

#### **StorageService Tests**
```typescript
// src/services/__tests__/storageService.test.ts
describe('StorageService', () => {
  // Data persistence
  test('saves and retrieves data correctly', () => {
    // Tests localStorage integration
  });

  // User operations
  test('handles user data with achievements', () => {
    // Tests complex user object persistence
  });

  // Storage statistics
  test('calculates storage usage', () => {
    // Tests storage monitoring functionality
  });
});
```

#### **CategoryService Tests**
```typescript
// src/services/__tests__/categoryService.test.ts
describe('CategoryService', () => {
  // Custom category management
  test('adds and removes custom categories', () => {
    // Tests custom category CRUD operations
  });

  // Category validation
  test('prevents duplicate category names', () => {
    // Tests duplicate prevention logic
  });

  // Category combination
  test('combines default and custom categories', () => {
    // Tests category list generation
  });
});
```

### **🔗 Integration Tests**

#### **Core User Workflows**
```typescript
// src/__tests__/integration-simple.test.tsx
describe('Simple Integration Tests', () => {
  // Task creation workflow
  test('allows user to create a task successfully', async () => {
    // 1. Verify app loads with empty state
    // 2. Click on title input to expand form
    // 3. Fill in task title
    // 4. Submit the task
    // 5. Verify task appears in the list
  });

  // Form validation
  test('handles form validation correctly', async () => {
    // Tests required field validation
    // Tests error message display
  });

  // Category and priority selection
  test('allows user to select different categories', async () => {
    // Tests body, mind, soul category selection
  });

  // Task completion
  test('allows user to complete a task', async () => {
    // Tests checkbox interaction and state changes
  });

  // Data persistence
  test('persists task data across app reloads', async () => {
    // Tests localStorage integration
    // Tests data recovery on app restart
  });

  // Error handling
  test('handles storage errors gracefully', async () => {
    // Tests graceful degradation
    // Tests user feedback for errors
  });
});
```

#### **Advanced Integration Scenarios**
```typescript
// src/__tests__/integration.test.tsx
describe('Integration Tests', () => {
  // Complete user workflows
  test('supports full task management workflow', async () => {
    // Tests create, edit, complete, delete cycle
  });

  // Performance testing
  test('handles large number of tasks efficiently', async () => {
    // Tests performance with many tasks
    // Tests UI responsiveness
  });

  // Accessibility testing
  test('supports keyboard navigation throughout the app', async () => {
    // Tests keyboard accessibility
    // Tests ARIA compliance
  });
});
```

### **🧪 Test Categories**

#### **1. Unit Tests**
- **Service Layer**: Task, user, storage, category service functionality
- **Utility Functions**: Date formatting, calculations, validations
- **Hook Logic**: Custom React hooks behavior

#### **2. Component Tests**
- **Rendering**: Component displays correctly
- **Interactions**: User interactions work as expected
- **Styling**: Visual states and CSS classes applied correctly
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

#### **3. Integration Tests**
- **User Workflows**: Complete end-to-end user scenarios
- **Data Flow**: How data moves between components
- **Error Handling**: Graceful degradation and user feedback
- **Performance**: App responsiveness under load

#### **4. Edge Case Tests**
- **Empty States**: App behavior with no data
- **Invalid Data**: Handling of corrupted or invalid data
- **Network Errors**: Offline scenarios and error recovery
- **Storage Limits**: Behavior when storage is full

### **🚀 Running Tests**

```bash
# Run all tests
npm test

# Run specific test categories
npm test -- --testPathPattern="components"    # Component tests
npm test -- --testPathPattern="services"      # Service layer tests
npm test -- --testPathPattern="hooks"         # Hook tests
npm test -- --testPathPattern="integration"   # Integration tests

# Run with coverage
npm test -- --coverage

# Run with verbose output
npm test -- --verbose

# Run specific test files
npm test -- --testPathPattern="TaskForm.test.tsx"
npm test -- --testPathPattern="userService.test.ts"
```

### **📊 Test Quality Metrics**

#### **Current Status**
- **Total Tests:** 345
- **Passing:** 284 (82%)
- **Failing:** 61 (18%)
- **Coverage:** Comprehensive coverage of core functionality

#### **Test Categories Breakdown**
- **Component Tests:** 45% of total tests
- **Service Layer Tests:** 25% of total tests
- **Integration Tests:** 20% of total tests
- **Hook Tests:** 10% of total tests

#### **Recent Improvements**
- **Error Reduction:** 34% improvement (93 → 61 errors)
- **Mock Quality:** Enhanced mock data completeness
- **Test Reliability:** Improved timeouts and retry logic
- **Error Handling:** Better graceful degradation testing

### **🔧 Test Development Guidelines**

#### **Best Practices**
1. **Use Descriptive Test Names** - Clear, specific test descriptions
2. **Follow AAA Pattern** - Arrange, Act, Assert structure
3. **Mock External Dependencies** - Isolate units under test
4. **Test Edge Cases** - Handle error scenarios gracefully
5. **Use TypeScript** - Leverage type safety in tests

#### **Mock Strategy**
```typescript
// Example: Comprehensive User mock
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  name: 'Test User',
  level: 1,
  experience: 0,
  body: 0,
  mind: 0,
  soul: 0,
  achievements: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
});
```

#### **Integration Test Patterns**
```typescript
// Example: User workflow testing
test('complete task management workflow', async () => {
  // Arrange: Setup test data and mocks
  const mockUser = createMockUser();
  const mockTask = createMockTask();
  
  // Act: Perform user actions
  render(<App />);
  await userEvent.click(screen.getByText('Add Task'));
  await userEvent.type(screen.getByLabelText('Title'), 'Test Task');
  await userEvent.click(screen.getByText('Submit'));
  
  // Assert: Verify expected outcomes
  expect(screen.getByText('Test Task')).toBeInTheDocument();
  expect(mockAddTask).toHaveBeenCalledWith(expect.objectContaining({
    title: 'Test Task'
  }));
});
```

---

## 🔄 **Writing Safe Migrations**

### **Migration Best Practices**

#### **1. Always Backup Data**
```typescript
// services/migration/migrationService.ts
export class MigrationService {
  static async backupData(version: string): Promise<void> {
    const backup = {
      tasks: StorageService.get('scrypture_tasks'),
      userStats: StorageService.get('scrypture_user_stats'),
      habits: StorageService.get('scrypture_habits'),
      timestamp: Date.now(),
      version: version
    };
    
    StorageService.set(`scrypture_backup_${version}`, backup);
    console.log(`Backup created for version ${version}`);
  }
}
```

#### **2. Apply Field Defaults**
```typescript
// Example: Adding new fields to existing tasks
const migratedTasks = tasks.map(task => ({
  ...task,
  priority: task.priority || 'medium',
  difficulty: task.difficulty || 3,
  tags: task.tags || [],
  estimatedDuration: task.estimatedDuration || null,
  actualDuration: task.actualDuration || null,
  updatedAt: task.updatedAt || task.createdAt
}));
```

#### **3. Update Schema Version**
```typescript
// Always update version after successful migration
StorageService.set('scrypture_schema_version', newVersion);
```

#### **4. Log Success/Errors**
```typescript
try {
  await migrateToV2();
  console.log('Migration to V2 completed successfully');
} catch (error) {
  console.error('Migration failed:', error);
  // Optionally rollback or alert user
  throw error;
}
```

### **Migration Checklist**

- [ ] **Back up existing data** before any migration
- [ ] **Apply field defaults** for new optional fields
- [ ] **Update schema version** after successful migration
- [ ] **Log success/errors** for debugging
- [ ] **Test migration** with sample data
- [ ] **Handle rollback** if migration fails
- [ ] **Validate migrated data** after completion

### **Real Migration Example**
```typescript
// services/migration/v2Migration.ts
export async function migrateToV2(): Promise<void> {
  console.log('Starting migration to V2...');
  
  try {
    // 1. Backup existing data
    await MigrationService.backupData('v1');
    
    // 2. Get current data
    const tasks = StorageService.get<Task[]>('scrypture_tasks') || [];
    const userStats = StorageService.get<UserStats>('scrypture_user_stats');
    
    // 3. Apply field defaults to existing tasks
    const migratedTasks = tasks.map(task => ({
      ...task,
      priority: task.priority || 'medium',
      difficulty: task.difficulty || 3,
      tags: task.tags || [],
      estimatedDuration: task.estimatedDuration || null,
      actualDuration: task.actualDuration || null,
      updatedAt: task.updatedAt || task.createdAt
    }));
    
    // 4. Update user stats with new fields
    const migratedUserStats = {
      ...userStats,
      // Add any new user stats fields here
    };
    
    // 5. Save migrated data
    StorageService.set('scrypture_tasks', migratedTasks);
    StorageService.set('scrypture_user_stats', migratedUserStats);
    
    // 6. Update schema version
    StorageService.set('scrypture_schema_version', 2);
    
    console.log('Migration to V2 completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
```

### **Testing Migrations**

#### **CI/CD Migration Test Suite**
```typescript
// tests/migration/unit/migrationService.test.ts
describe('MigrationService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should detect migration needs', () => {
    StorageService.set('scrypture_schema_version', 1);
    expect(MigrationService.needsMigration()).toBe(true);
  });

  test('should backup data before migration', async () => {
    const testData = { tasks: [{ id: '1', title: 'Test' }] };
    StorageService.set('scrypture_tasks', testData.tasks);
    
    await MigrationService.migrateToV2();
    
    const backup = StorageService.get('scrypture_backup_v1');
    expect(backup).toBeDefined();
    expect(backup.tasks).toEqual(testData.tasks);
  });

  test('should apply field defaults correctly', async () => {
    const oldTask = { id: '1', title: 'Old Task', category: 'body', completed: false };
    StorageService.set('scrypture_tasks', [oldTask]);
    
    await MigrationService.migrateToV2();
    
    const migratedTasks = StorageService.get<Task[]>('scrypture_tasks');
    expect(migratedTasks[0].priority).toBe('medium');
    expect(migratedTasks[0].difficulty).toBe(3);
    expect(migratedTasks[0].tags).toEqual([]);
  });
});
```

#### **Old Data Migration Safety Tests**
```typescript
// tests/migration/safety/oldDataMigration.test.ts
describe('Old Data Migration Safety', () => {
  test('should handle missing fields gracefully', () => {
    const incompleteTask = { id: '1', title: 'Incomplete Task' };
    StorageService.set('scrypture_tasks', [incompleteTask]);
    
    expect(() => {
      MigrationService.migrateToV2();
    }).not.toThrow();
    
    const migratedTasks = StorageService.get<Task[]>('scrypture_tasks');
    expect(migratedTasks[0].category).toBeDefined();
    expect(migratedTasks[0].completed).toBeDefined();
  });

  test('should preserve existing data integrity', () => {
    const originalTask = {
      id: '1',
      title: 'Original Task',
      category: 'mind',
      completed: true,
      createdAt: Date.now()
    };
    StorageService.set('scrypture_tasks', [originalTask]);
    
    MigrationService.migrateToV2();
    
    const migratedTasks = StorageService.get<Task[]>('scrypture_tasks');
    expect(migratedTasks[0].title).toBe('Original Task');
    expect(migratedTasks[0].category).toBe('mind');
    expect(migratedTasks[0].completed).toBe(true);
  });
});
```

#### **Rollback Scenario Tests**
```typescript
// tests/migration/rollback/rollbackScenarios.test.ts
describe('Migration Rollback Scenarios', () => {
  test('should rollback on migration failure', () => {
    const originalData = { tasks: [{ id: '1', title: 'Original' }] };
    StorageService.set('scrypture_tasks', originalData.tasks);
    
    // Mock migration to fail
    jest.spyOn(MigrationService, 'migrateToV2').mockImplementation(() => {
      throw new Error('Migration failed');
    });
    
    expect(() => {
      MigrationService.checkAndRunMigrations();
    }).toThrow('Migration failed');
    
    // Verify data is preserved
    const tasks = StorageService.get('scrypture_tasks');
    expect(tasks).toEqual(originalData.tasks);
  });

  test('should restore from backup on corruption', () => {
    const backupData = { tasks: [{ id: '1', title: 'Backup' }] };
    StorageService.set('scrypture_backup_v1', backupData);
    
    // Simulate corrupted data
    StorageService.set('scrypture_tasks', null);
    
    MigrationErrorHandler.handleDataCorruption({
      type: MigrationErrorType.DATA_CORRUPTION,
      message: 'Data corrupted',
      version: 2
    });
    
    const restoredTasks = StorageService.get('scrypture_tasks');
    expect(restoredTasks).toEqual(backupData.tasks);
  });
});
```

#### **Data Corruption Detection Tests**
```typescript
// tests/migration/corruption/dataCorruption.test.ts
describe('Data Corruption Detection', () => {
  test('should detect field mismatch', () => {
    const corruptedTask = {
      id: '1',
      title: 'Corrupted Task',
      priority: 'invalid_priority', // Invalid value
      difficulty: 'not_a_number' // Wrong type
    };
    StorageService.set('scrypture_tasks', [corruptedTask]);
    
    const validationResult = MigrationService.validateMigratedData();
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain('Invalid priority value');
    expect(validationResult.errors).toContain('Difficulty must be a number');
  });

  test('should detect missing required fields', () => {
    const incompleteTask = { id: '1' }; // Missing required fields
    StorageService.set('scrypture_tasks', [incompleteTask]);
    
    const validationResult = MigrationService.validateMigratedData();
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain('Missing required field: title');
    expect(validationResult.errors).toContain('Missing required field: category');
  });

  test('should alert on data corruption', () => {
    const alertSpy = jest.spyOn(global, 'alert').mockImplementation();
    
    MigrationErrorHandler.handleDataCorruption({
      type: MigrationErrorType.DATA_CORRUPTION,
      message: 'Data corrupted during migration',
      version: 2
    });
    
    expect(alertSpy).toHaveBeenCalledWith('Data restored from backup due to corruption.');
  });
});
```

---

## 🚀 **Deployment**

### **Production Build**
```bash
# Build for production
npm run build

# Test production build locally
npm run preview
```

### **Environment Configuration**
```bash
# .env.production
VITE_API_URL=https://api.scrypture.app
VITE_APP_ENV=production
VITE_ANALYTICS_ID=your-analytics-id
```

### **Deployment Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:migration
      - run: npm run test:integration
      - run: npm run test:coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### **Migration Testing in CI/CD**
```yaml
# .github/workflows/migration-tests.yml
name: Migration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  migration-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migration unit tests
        run: npm run test:migration:unit
      
      - name: Run migration integration tests
        run: npm run test:migration:integration
      
      - name: Test old data migration safety
        run: npm run test:migration:safety
      
      - name: Test rollback scenarios
        run: npm run test:migration:rollback
      
      - name: Check for data corruption
        run: npm run test:migration:corruption
      
      - name: Upload test coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: migration-tests
          name: migration-coverage
```

### **Monitoring Setup**
```typescript
// services/monitoring/analytics.ts
export class AnalyticsService {
  trackEvent(event: string, properties?: Record<string, any>) {
    // Send to analytics service
    if (import.meta.env.VITE_ANALYTICS_ID) {
      // Implementation depends on analytics provider
      console.log('Track event:', event, properties);
    }
  }
  
  trackTaskCompletion(category: string, experiencePointsGained: number) {
    this.trackEvent('task_completed', {
      category,
      experience_points_gained: experiencePointsGained,
      timestamp: new Date().toISOString()
    });
  }
  
  trackLevelUp(newLevel: number) {
    this.trackEvent('level_up', {
      new_level: newLevel,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## 🔧 **Development Tools**

### **Code Quality**
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error",
    "no-unused-vars": "error"
  }
}
```

### **Pre-commit Hooks**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### **Development Scripts**
```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:migration": "jest --testPathPattern=migration",
    "test:migration:unit": "jest --testPathPattern=migration/unit",
    "test:migration:integration": "jest --testPathPattern=migration/integration",
    "test:migration:safety": "jest --testPathPattern=migration/safety",
    "test:migration:rollback": "jest --testPathPattern=migration/rollback",
    "test:migration:corruption": "jest --testPathPattern=migration/corruption",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src/**/*.{ts,tsx,css,md}"
  }
}
```

---

## 📚 **Cross-References**

### **Related Documentation**
- **See: 02-mvp-features.md** for feature specifications and requirements
- **See: 03-technical-specs.md** for system architecture and technical details
- **See: 04-api-reference.md** for API endpoints and integration
- **See: 05-database-schema.md** for data models and database design

### **Implementation Guides**
- **See: 12-mvp-checklist.md** for implementation tracking and status
- **See: 08-development-roadmap.md** for development timeline and milestones
- **See: 11-feature-scope.md** for feature classification and scope management

### **Testing & Quality**
- **See: 07-future-features.md** for advanced features and future planning

---

*"In the realm of development, every line of code is a step toward mastery, every test a safeguard of quality, and every deployment a milestone of progress."* 🚀✨ 

### **Form Validation System**

#### **Custom Validation Implementation**
```typescript
// TaskForm.tsx - Custom validation with no browser popups
export const TaskForm: React.FC = () => {
  const handleInvalid = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent browser validation popups
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <input
        required
        onInvalid={handleInvalid}
        // ... other props
      />
      <div className={styles.validationMessage}>
        Please fill in this field.
      </div>
    </form>
  );
};
```

#### **CSS Validation Styling**
```css
/* TaskForm.module.css - Custom pixel art validation messages */
.titleInput:invalid + .validationMessage {
  display: block;
  background: var(--color-error);
  color: var(--color-text-primary);
  border: 2px solid var(--color-urgent-border);
  margin-top: 8px;
  font-size: var(--font-size-xl);
  font-family: 'Press Start 2P', monospace;
}

.validationMessage::before {
  content: "!";
  display: inline-block;
  width: 12px;
  height: 12px;
  background: var(--color-text-primary);
  color: var(--color-error);
  text-align: center;
  line-height: 12px;
  margin-right: var(--spacing-xs);
}
```

#### **Key Implementation Details**
- **Browser Validation Prevention**: Use `noValidate` on form and `onInvalid` handlers to prevent native browser validation popups
- **Custom Styling**: CSS adjacent sibling selectors (`:invalid + .validationMessage`) to show/hide custom messages
- **Pixel Art Consistency**: All validation messages use Press Start 2P font and pixel art styling
- **Accessibility**: Custom messages maintain proper contrast and readability
- **Spacing**: 8px margin-top for proper visual separation from form fields

---