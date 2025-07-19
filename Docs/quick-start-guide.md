# Scrypture Developer Quick Start Guide

*"From first commit to first feature - your journey begins here."*

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-MVP_Development-yellow)
![Last Updated](https://img.shields.io/badge/last_updated-2024-01-15-orange)

## 🚀 **Welcome to Scrypture!**

This guide will get you from zero to your first feature in under 30 minutes. Scrypture is a habit-tracking app with a mystical theme, built for developers who want to build something meaningful.

### **What You'll Learn**
- ✅ Project setup and environment
- ✅ Core concepts and terminology
- ✅ Your first code contribution
- ✅ Development workflow
- ✅ Where to find help

---

## 📋 **Prerequisites**

Before you start, make sure you have:

- **Node.js** (v18 or higher)
- **Git** (latest version)
- **VS Code** (recommended) or your preferred editor
- **Basic React knowledge** (components, hooks, state)
- **Basic TypeScript knowledge** (types, interfaces)

### **Quick Check**
```bash
node --version  # Should be 18+
git --version   # Should be 2.0+
```

---

## 🛠️ **Step 1: Project Setup (5 minutes)**

### **1.1 Clone the Repository**
```bash
git clone https://github.com/your-org/scrypture.git
cd scrypture
```

### **1.2 Install Dependencies**
```bash
npm install
```

### **1.3 Start Development Server**
```bash
npm run dev
```

You should see something like:
```
Local:   http://localhost:3000/
Network: http://192.168.1.100:3000/
```

### **1.4 Verify Setup**
Open `http://localhost:3000` in your browser. You should see the Scrypture app with:
- Welcome screen
- Task creation interface
- Habit tracking
- Progress visualization

---

## 🧠 **Step 2: Understand Core Concepts (10 minutes)**

### **2.1 Key Terminology**

Scrypture uses **plain English terminology** by default, with optional "Latin Mode" 

**💡 Tip**: All code uses plain English terms. Latin terms are UI-only and toggable.

### **2.2 Core Features (MVP)**

1. **Task Management**
   - Create, edit, delete tasks
   - Mark tasks as complete
   - Task categories and priorities

2. **Habit Tracking**
   - Daily habit check-ins
   - Streak counting
   - Habit statistics

3. **Progress System**
   - Experience points (XP)
   - Level progression
   - Achievement unlocks

4. **Bóbr Companion**
   - AI-powered guidance
   - Motivational messages
   - Progress insights

### **2.3 Technology Stack**

- **Frontend**: React 18 + TypeScript
- **Styling**: CSS Modules + CSS Variables
- **State Management**: React Context + Local Storage
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

---

## 🔍 **Step 3: Explore the Codebase (5 minutes)**

### **3.1 Project Structure**
```
scrypture/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # Business logic
│   ├── types/         # TypeScript definitions
│   ├── utils/         # Helper functions
│   └── styles/        # CSS modules
├── public/            # Static assets
├── docs/              # Documentation
└── tests/             # Test files
```

### **3.2 Key Files to Know**

| File | Purpose | Why Important |
|------|---------|---------------|
| `src/App.tsx` | Main application component | Entry point |
| `src/components/TaskCard.tsx` | Individual task display | Core UI component |
| `src/hooks/useTasks.ts` | Task management logic | Business logic |
| `src/services/taskService.ts` | Data persistence | Local storage |
| `src/types/index.ts` | TypeScript definitions | Type safety |

### **3.3 Development Workflow**

1. **Feature Development**
   ```bash
   git checkout -b feature/your-feature-name
   # Make changes
   npm run test
   npm run build
   git commit -m "feat: add your feature"
   ```

2. **Testing**
   ```bash
   npm run test          # Run all tests
   npm run test:watch    # Watch mode
   npm run test:coverage # Coverage report
   ```

3. **Code Quality**
   ```bash
   npm run lint          # ESLint
   npm run type-check    # TypeScript check
   npm run format        # Prettier
   ```

---

## 🎯 **Step 4: Your First Contribution (10 minutes)**

Let's add a simple feature to get you comfortable with the codebase.

### **4.1 Create a Task Counter Component**

Create `src/components/TaskCounter.tsx`:

```tsx
import React from 'react';
import { useTasks } from '../hooks/useTasks';
import styles from './TaskCounter.module.css';

interface TaskCounterProps {
  className?: string;
}

export const TaskCounter: React.FC<TaskCounterProps> = ({ className }) => {
  const { tasks } = useTasks();
  
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  
  return (
    <div className={`${styles.counter} ${className || ''}`}>
      <span className={styles.label}>Tasks Completed</span>
      <span className={styles.count}>
        {completedTasks} / {totalTasks}
      </span>
    </div>
  );
};
```

### **4.2 Add Styling**

Create `src/components/TaskCounter.module.css`:

```css
.counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--color-surface);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.count {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}
```

### **4.3 Add to Main App**

Update `src/App.tsx` to include your component:

```tsx
import { TaskCounter } from './components/TaskCounter';

// Add this inside your main component:
<TaskCounter className={styles.taskCounter} />
```

### **4.4 Test Your Component**

Create `src/components/__tests__/TaskCounter.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskCounter } from '../TaskCounter';
import { TaskProvider } from '../../hooks/useTasks';

describe('TaskCounter', () => {
  it('displays task count correctly', () => {
    render(
      <TaskProvider>
        <TaskCounter />
      </TaskProvider>
    );
    
    expect(screen.getByText(/Tasks Completed/i)).toBeInTheDocument();
    expect(screen.getByText('0 / 0')).toBeInTheDocument();
  });
});
```

### **4.5 Run Tests**
```bash
npm run test TaskCounter
```

---

## 📚 **Step 5: Learn More (5 minutes)**

### **5.1 Essential Documentation**

Read these documents in order:

1. **[01-overview.md](01-overview.md)** - Project vision and goals
2. **[terminology-guide.md](terminology-guide.md)** - Naming conventions
3. **[02-mvp-features.md](02-mvp-features.md)** - Feature specifications
4. **[06-development-guide.md](06-development-guide.md)** - Detailed development guide

### **5.2 Key Concepts to Master**

- **Task Management**: How tasks are created, stored, and updated
- **Habit Tracking**: Streak counting and habit persistence
- **Progress System**: XP calculation and level progression
- **Local Storage**: Data persistence strategy
- **Component Architecture**: How components communicate

### **5.3 Common Patterns**

```tsx
// Custom hooks for business logic
const { tasks, addTask, updateTask } = useTasks();

// Context providers for state management
<TaskProvider>
  <YourComponent />
</TaskProvider>

// CSS modules for styling
import styles from './Component.module.css';
<div className={styles.container}>
```

---

## 🆘 **Step 6: Getting Help**

### **6.1 When You're Stuck**

1. **Check the Documentation**
   - [00-documentation-index.md](00-documentation-index.md) - Master index
   - [06-development-guide.md](06-development-guide.md) - Implementation details
   - [03-technical-specs.md](03-technical-specs.md) - System architecture

2. **Look at Existing Code**
   - Similar components in `src/components/`
   - Patterns in `src/hooks/`
   - Examples in `src/services/`

3. **Run Tests**
   ```bash
   npm run test -- --verbose
   npm run type-check
   ```

4. **Ask for Help**
   - Create an issue with `[HELP]` prefix
   - Tag with appropriate labels
   - Include error messages and steps to reproduce

### **6.2 Common Issues**

| Issue | Solution |
|-------|----------|
| TypeScript errors | Run `npm run type-check` |
| Styling not working | Check CSS module imports |
| Tests failing | Run `npm run test -- --verbose` |
| Build errors | Check console for specific errors |
| Local storage issues | Check browser dev tools |

---

## 🎉 **Congratulations!**

You've successfully:
- ✅ Set up your development environment
- ✅ Understood core concepts
- ✅ Explored the codebase
- ✅ Made your first contribution
- ✅ Learned where to find help

### **Next Steps**

1. **Pick a Feature**: Choose from the [MVP checklist](12-mvp-checklist.md)
2. **Join Discussions**: Participate in feature planning
3. **Write Tests**: Add tests for your components
4. **Document**: Update docs when you add features
5. **Review Code**: Help review other contributions

### **Recommended First Features**

- **Easy**: Add task categories or priorities
- **Medium**: Implement habit streak visualization
- **Advanced**: Add achievement system integration

---

## 📞 **Quick Reference**

### **Essential Commands**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Check code quality
npm run type-check   # TypeScript check
```

### **Key Files**
- `src/App.tsx` - Main application
- `src/hooks/useTasks.ts` - Task management
- `src/services/taskService.ts` - Data persistence
- `src/types/index.ts` - Type definitions

### **Documentation**
- [00-documentation-index.md](00-documentation-index.md) - Master index
- [06-development-guide.md](06-development-guide.md) - Development guide
- [02-mvp-features.md](02-mvp-features.md) - Feature specs

---

*"Every great developer started with their first commit. Welcome to the Scrypture community!"* 🚀✨ 