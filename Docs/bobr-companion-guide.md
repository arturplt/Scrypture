# Bóbr Companion System Guide

*"A mystical forest companion who crafts magical dams from your completed tasks"*

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-Complete-green)
![Features](https://img.shields.io/badge/features-5_Core-blue)

## 🦫 **Overview**

The Bóbr Companion System is a core MVP feature that provides users with a mystical forest companion who evolves alongside their progress and helps visualize their journey through a magical dam metaphor.

### **Core Concept**
- **Companion**: A pixel art beaver character that serves as the user's mystical guide
- **Evolution**: Three stages (hatchling → young → mature) based on user level
- **Dam Progress**: Visual representation of completed tasks as building materials
- **Motivational Messages**: Context-aware encouragement and guidance

---

## 🏗️ **Architecture**

### **Core Components**
1. **BobrCompanion** - Main character display with animations
2. **BobrPen** - Sanctuary container with stage indicators
3. **DamVisualization** - Visual dam progress representation
4. **BobrIntroduction** - Onboarding modal for new users
5. **BobrService** - Business logic and state management

### **Data Models**
```typescript
interface User {
  bobrStage: 'hatchling' | 'young' | 'mature';
  damProgress: number;
  // ... other user properties
}

interface BobrMessage {
  id: string;
  type: 'greeting' | 'task_completion' | 'level_up' | 'achievement' | 'motivation' | 'dam_progress';
  stage: 'hatchling' | 'young' | 'mature';
  context?: {
    taskTitle?: string;
    category?: string;
    newLevel?: number;
    achievementName?: string;
    damPercentage?: number;
  };
  message: string;
  animation?: 'idle' | 'celebrate' | 'build' | 'evolve';
}

interface BobrState {
  stage: 'hatchling' | 'young' | 'mature';
  damProgress: number;
  lastMessage?: BobrMessage;
  evolutionHistory: {
    stage: 'hatchling' | 'young' | 'mature';
    evolvedAt: Date;
  }[];
}
```

---

## 🎯 **Features**

### **1. Character Appearance**
- **Asset**: Uses `assets/Icons/beaver_32.png` for pixel art consistency
- **Scaling**: Character size increases with evolution stage
- **Effects**: Mature stage gets golden glow effect
- **Positioning**: Located in dedicated sanctuary above start button

### **2. Evolution System**
- **Hatchling**: Levels 1-3 (0-299 XP)
- **Young**: Levels 4-6 (300-599 XP)  
- **Mature**: Levels 7+ (600+ XP)
- **Visual Indicators**: Stage dots (■■□) show current progress
- **Evolution Tracking**: Automatic detection and celebration

### **3. Dam Progress Visualization**
- **Water Level**: Visual representation of progress
- **Dam Sticks**: Individual sticks added per completed task
- **Progress Bar**: Percentage-based progress display
- **Celebration**: Animated additions for new completions

### **4. Motivational Messages**
- **Context-Aware**: Different messages for different situations
- **Stage-Specific**: Messages tailored to evolution stage
- **Animation Support**: Idle, celebrate, build, evolve animations
- **Message Types**: Greeting, task completion, level up, achievement, motivation, dam progress

### **5. Task Integration**
- **Automatic Updates**: Dam progress updates on task completion
- **Evolution Detection**: Automatic stage evolution detection
- **Celebration Messages**: Contextual celebration messages
- **Progress Tracking**: Real-time progress visualization

---

## 🎨 **UI Design**

### **Sanctuary Layout**
```
┌─────────────────────────────────────┐
│           BÓBR'S SANCTUARY          │
│  🏠                    🌳           │
├─────────────────────────────────────┤
│           ■■□ HATCHLING STAGE       │
│      Next evolution at Level 4      │
│                                     │
│           [🦫 Character]            │
│                                     │
│    "*tiny wing flutter* Hi there!"  │
│                                     │
│           DAM PROGRESS              │
│    ████████████████████████ 0%     │
└─────────────────────────────────────┘
```

### **Styling Principles**
- **Minimal Padding**: Uses `var(--spacing-xs)` for compact layout
- **Double Borders**: Sharp pixel art borders with `var(--border-width-normal)`
- **Color Consistency**: Uses global CSS variables for theming
- **Pixel Art**: Maintains pixel-perfect rendering with `image-rendering: pixelated`

### **Responsive Design**
- **Desktop**: Full sanctuary with side-by-side companion and dam
- **Tablet**: Stacked layout with maintained proportions
- **Mobile**: Compact layout with essential elements

---

## 🔧 **Technical Implementation**

### **BobrService**
```typescript
class BobrService {
  private static instance: BobrService;
  
  // Evolution thresholds
  private EVOLUTION_THRESHOLDS = {
    hatchling: 0,    // Level 1-3
    young: 300,      // Level 4-6  
    mature: 600      // Level 7+
  };
  
  // Core methods
  getBobrStage(userLevel: number): 'hatchling' | 'young' | 'mature'
  calculateDamProgress(completedTasks: number): number
  updateBobrStatus(user: User, completedTasks: number): BobrStatus
  generateMessage(type: string, stage: string, context?: any): BobrMessage
}
```

### **Component Integration**
```typescript
// App.tsx integration
<BobrPen
  user={user}
  completedTasksCount={tasks.filter(task => task.completed).length}
/>

// User service integration
addExperienceWithBobr(amount: number): {
  success: boolean;
  evolved: boolean;
  damProgressChanged: boolean;
}
```

### **State Management**
- **Local Storage**: Bóbr state persisted via `StorageService`
- **React Context**: User state managed through `UserContext`
- **Real-time Updates**: Automatic updates on task completion
- **Evolution Tracking**: History of evolution events

---

## 📊 **Message System**

### **Message Templates**
```typescript
const messageTemplates = {
  hatchling: {
    greeting: ["*chirp chirp* Welcome, friend! I'm just a little hatchling, but together we'll build something amazing!"],
    task_completion: ["*happy chirp* You did it! Each task you finish is like a twig for our future dam!"],
    level_up: ["*excited flutter* Look at you growing! Your progress is making our dam stronger!"],
    // ... more message types
  },
  young: {
    // Stage-specific messages
  },
  mature: {
    // Advanced messages for experienced users
  }
};
```

### **Context Interpolation**
- **Task Titles**: Personalized completion messages
- **Categories**: Category-specific encouragement
- **Level Progress**: Evolution milestone celebrations
- **Achievements**: Achievement unlock celebrations
- **Dam Progress**: Progress milestone messages

---

## 🎮 **User Experience**

### **Onboarding Flow**
1. **First Visit**: Bóbr introduction modal
2. **Character Display**: Sanctuary with stage indicators
3. **Progress Visualization**: Dam building metaphor
4. **Message System**: Contextual guidance and encouragement

### **Daily Interaction**
1. **Greeting**: Welcome message on app open
2. **Task Completion**: Celebration and dam progress update
3. **Level Up**: Evolution celebration and stage change
4. **Achievement**: Special achievement celebration messages

### **Progression Tracking**
- **Visual Feedback**: Stage indicators and progress bars
- **Evolution Celebrations**: Special animations for stage changes
- **Dam Building**: Visual representation of user progress
- **Motivational Messages**: Context-aware encouragement

---

## 🧪 **Testing**

### **Unit Tests**
- **BobrService**: Evolution logic and message generation
- **Components**: BobrCompanion, BobrPen, DamVisualization
- **Integration**: User service integration
- **State Management**: Local storage and context updates

### **Test Coverage**
- **Evolution Logic**: All stage transitions tested
- **Message Generation**: All message types and contexts
- **UI Components**: All component rendering and interactions
- **Integration**: Task completion and user progression

---

## 🚀 **Future Enhancements**

### **Planned Features**
- **Sound Effects**: Audio feedback for interactions
- **Advanced Animations**: More complex character animations
- **Seasonal Themes**: Different dam themes based on seasons
- **Social Features**: Share dam progress with friends
- **Customization**: Different Bóbr character skins

### **Technical Improvements**
- **Performance**: Optimized animations and rendering
- **Accessibility**: Screen reader support and keyboard navigation
- **Internationalization**: Multi-language message support
- **Analytics**: User interaction tracking and insights

---

## 📚 **Related Documentation**

- **See: 01-overview.md** - Project vision and core concepts
- **See: 03-technical-specs.md** - Technical architecture details
- **See: 07-mvp-checklist.md** - Implementation tracking
- **See: 12-achievement-system.md** - Achievement system integration

---

*"In the mystical forest of productivity, Bóbr stands as a testament to the power of small, consistent actions building something magnificent."* 🦫✨ 