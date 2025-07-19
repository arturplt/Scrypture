# Auto-Save Guide for Scrypture

*"Quick reference for the auto-save system"*

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Status](https://img.shields.io/badge/status-Active-green)
![Auto-Save](https://img.shields.io/badge/auto--save-Enabled-green)

## 🎯 **Overview**

Scrypture's auto-save system ensures that all user data is automatically persisted without any manual intervention. The system provides real-time visual feedback and handles errors gracefully.

## ⚡ **How It Works**

### **1. Immediate Persistence**
```typescript
// When a user creates a task
const addTask = (taskData) => {
  const newTask = createTask(taskData);
  setTasks(prev => [...prev, newTask]);
  saveTasksWithFeedback(updatedTasks); // Auto-save happens immediately
};
```

### **2. Visual Feedback**
- **Saving**: Shows "Saving..." with animated dot
- **Saved**: Shows "Saved" with checkmark
- **Duration**: Feedback disappears after 2 seconds
- **Position**: Bottom-right corner

### **3. Non-blocking Operations**
```typescript
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

## 🔄 **Auto-Save Triggers**

### **Task Operations**
✅ **Create Task**
```typescript
addTask({ title: 'New Task', priority: 'medium' });
// Auto-saves immediately
```

✅ **Update Task**
```typescript
updateTask(id, { title: 'Updated Task' });
// Auto-saves immediately
```

✅ **Toggle Task**
```typescript
toggleTask(id);
// Auto-saves immediately
```

✅ **Delete Task**
```typescript
deleteTask(id);
// Auto-saves immediately
```

### **Habit Operations**
✅ **Create Habit**
```typescript
addHabit({ name: 'Daily Exercise', targetFrequency: 'daily' });
// Auto-saves immediately
```

✅ **Complete Habit**
```typescript
completeHabit(id);
// Auto-saves immediately
```

✅ **Update Habit**
```typescript
updateHabit(id, { name: 'Updated Habit' });
// Auto-saves immediately
```

✅ **Delete Habit**
```typescript
deleteHabit(id);
// Auto-saves immediately
```

### **User Operations**
✅ **Update User**
```typescript
updateUser({ name: 'New Name' });
// Auto-saves immediately
```

✅ **Add Experience**
```typescript
addExperience(100);
// Auto-saves immediately
```

✅ **Unlock Achievement**
```typescript
unlockAchievement('first_task');
// Auto-saves immediately
```

## 🎨 **Visual Components**

### **AutoSaveIndicator**
```typescript
import { AutoSaveIndicator } from './components/AutoSaveIndicator';

// In your component
<AutoSaveIndicator 
  isSaving={isSaving} 
  lastSaved={lastSaved}
/>
```

### **Save States**
- **isSaving**: `true` when save is in progress
- **lastSaved**: `Date` when last save completed
- **Visual States**: "Saving..." or "Saved"

## 🛠️ **Configuration**

### **Environment Variables**
```env
# Enable/disable auto-save
AUTO_SAVE_ENABLED=true

# Save delay (0 = immediate)
AUTO_SAVE_DELAY=0

# Feedback duration in milliseconds
SAVE_FEEDBACK_DURATION=2000
```

### **Service Configuration**
```typescript
const DATABASE_CONFIG = {
  autoSave: {
    enabled: process.env.AUTO_SAVE_ENABLED === 'true',
    delay: parseInt(process.env.AUTO_SAVE_DELAY || '0'),
    feedbackDuration: parseInt(process.env.SAVE_FEEDBACK_DURATION || '2000'),
  },
};
```

## 🔧 **Using Auto-Save in Components**

### **Task Component Example**
```typescript
import { useTasks } from '../hooks/useTasks';

function TaskComponent() {
  const { tasks, addTask, isSaving, lastSaved } = useTasks();

  const handleAddTask = () => {
    addTask({ 
      title: 'New Task', 
      priority: 'medium' 
    });
    // Auto-save happens automatically
  };

  return (
    <div>
      <button onClick={handleAddTask}>Add Task</button>
      {/* Auto-save indicator shows automatically */}
    </div>
  );
}
```

### **Habit Component Example**
```typescript
import { useHabits } from '../hooks/useHabits';

function HabitComponent() {
  const { habits, addHabit, completeHabit } = useHabits();

  const handleCompleteHabit = (id) => {
    completeHabit(id);
    // Auto-save happens automatically
  };

  return (
    <div>
      {habits.map(habit => (
        <button key={habit.id} onClick={() => handleCompleteHabit(habit.id)}>
          Complete {habit.name}
        </button>
      ))}
    </div>
  );
}
```

## 🚨 **Error Handling**

### **Save Failures**
```typescript
const saveTasksWithFeedback = async (tasks) => {
  setIsSaving(true);
  try {
    const success = taskService.saveTasks(tasks);
    if (success) {
      setLastSaved(new Date());
      console.log('Auto-save successful');
    } else {
      console.error('Auto-save failed');
    }
  } catch (error) {
    console.error('Auto-save error:', error);
  } finally {
    setIsSaving(false);
  }
};
```

### **Storage Quota Exceeded**
```typescript
const canSave = (data) => {
  const size = JSON.stringify(data).length;
  const available = 5 * 1024 * 1024; // 5MB
  return size < available;
};
```

## 📊 **Monitoring**

### **Save Performance**
```typescript
const measureSavePerformance = async (operation) => {
  const start = performance.now();
  await operation();
  const duration = performance.now() - start;
  console.log(`Auto-save took ${duration}ms`);
};
```

### **Save Success Tracking**
```typescript
const trackSaveSuccess = (operation) => {
  analytics.track('auto_save_success', {
    operation,
    timestamp: new Date().toISOString(),
  });
};
```

## 🧪 **Testing**

### **Unit Tests**
```typescript
test('should auto-save on task creation', () => {
  const { addTask } = useTasks();
  addTask({ title: 'Test Task', priority: 'medium' });
  
  const savedTasks = storageService.getTasks();
  expect(savedTasks).toHaveLength(1);
});
```

### **Integration Tests**
```typescript
test('should show save indicator', () => {
  render(<AutoSaveIndicator isSaving={true} />);
  expect(screen.getByText('Saving...')).toBeInTheDocument();
});
```

## 🎯 **Best Practices**

### **1. Always Use Hooks**
```typescript
// ✅ Good - Uses auto-save
const { addTask } = useTasks();
addTask(taskData);

// ❌ Bad - Bypasses auto-save
taskService.saveTasks(tasks);
```

### **2. Handle Save States**
```typescript
// ✅ Good - Shows save status
const { isSaving, lastSaved } = useTasks();
if (isSaving) return <div>Saving...</div>;

// ✅ Good - Uses indicator component
<AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
```

### **3. Error Handling**
```typescript
// ✅ Good - Handles save errors
try {
  await saveOperation();
} catch (error) {
  console.error('Save failed:', error);
  // Show user-friendly error message
}
```

## 🔄 **Migration from Manual Save**

### **Before (Manual Save)**
```typescript
const addTask = (taskData) => {
  const newTask = createTask(taskData);
  setTasks(prev => [...prev, newTask]);
  
  // Manual save
  localStorage.setItem('tasks', JSON.stringify([...tasks, newTask]));
};
```

### **After (Auto-Save)**
```typescript
const addTask = (taskData) => {
  const newTask = createTask(taskData);
  setTasks(prev => [...prev, newTask]);
  
  // Auto-save happens automatically via hook
  saveTasksWithFeedback([...tasks, newTask]);
};
```

## 📚 **Related Documentation**

- [Database Setup Guide](database-setup-guide.md) - Complete persistence guide
- [Development Guide](../06-development-guide.md) - Development instructions
- [API Reference](../04-api-reference.md) - Component documentation

---

*"Auto-save ensures your data is never lost, letting you focus on what matters most!"* ✨ 