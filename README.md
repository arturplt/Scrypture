# Scrypture - Habit & Task Management System

A modern, gamified habit and task management application built with React, TypeScript, and CSS Modules.

## 🎯 Features

### Core Functionality
- **Habit Management**: Create, edit, complete, and track habits with streak counting
- **Task Management**: Create, edit, and complete tasks with priority and difficulty levels
- **Achievement System**: 15 unlockable achievements with mystical Bóbr-themed rewards
- **Category System**: Organize habits and tasks with customizable categories
- **Stat Rewards**: Earn Body, Mind, and Soul stats through habit completion
- **XP System**: Gain experience points based on task priority and difficulty
- **Data Persistence**: All data saved to localStorage for offline functionality
- **Secret Menu**: Password-protected access to advanced tools including 8-Bit Synthesizer and Pixel Grid Converter

### Habit System
- **Frequency Options**: Daily, Weekly, Monthly habits
- **Streak Tracking**: Automatic streak calculation and best streak recording
- **Stat Rewards**: Earn Body, Mind, and Soul stats on completion
- **Convert to Task**: Transform habits into one-time tasks
- **Visual Feedback**: Gold borders for active habits, blue habit buttons

### Task System
- **Priority Levels**: Low, Medium, High priority tasks
- **Difficulty Scale**: 0-9 difficulty levels with Fibonacci XP rewards
- **Category Assignment**: Organize tasks by custom categories
- **Completion Tracking**: Mark tasks as complete with rewards

### Achievement System
- **15 Achievements**: Progression, Mastery, Consistency, Exploration, and Special categories
- **Rarity Levels**: Common, Uncommon, Rare, Epic, and Legendary achievements
- **Auto-Unlock**: Automatic detection and celebration of achievement unlocks
- **Progress Tracking**: Visual progress bars for partially completed achievements
- **Mystical Theme**: Bóbr-themed unlock messages and descriptions
- **Celebration Effects**: Animated notifications with rarity-based visual effects

## 🏆 Achievement Rewards System

The achievement system now properly rewards players with XP and core attributes when achievements are unlocked. When an achievement is unlocked, the system automatically:

- **Applies XP rewards** that may trigger level-ups
- **Boosts core attributes** (Body, Mind, Soul) 
- **Integrates with Bóbr evolution** - high XP gains can trigger companion evolution
- **Updates dam progress** based on completed tasks
- **Provides detailed console logging** for debugging

### Example Achievement Rewards:
- **First Steps**: +50 XP
- **Dam Builder**: +100 XP, +5 Body/Mind/Soul
- **Ancient Wisdom**: +200 XP, +15 Soul

### Auto-Save and Refresh System

The achievement system includes robust auto-save and refresh functionality:

#### Auto-Save Features:
- **Debounced saving** (500ms delay) prevents excessive storage writes
- **Real persistence** to localStorage via `achievementService.saveAchievements()` and `achievementService.saveProgress()`
- **Visual feedback** with save indicators and timestamps
- **Error handling** for storage failures with console logging

#### Refresh Features:
- **Manual refresh** via refresh button (🔄) in AchievementGrid header
- **Auto-refresh** every 30 seconds to sync with storage
- **Real-time updates** when achievements unlock
- **Progress synchronization** across browser tabs/windows

#### Technical Implementation:
- **Debounced auto-save** prevents performance issues from rapid saves
- **Periodic refresh** ensures data consistency across sessions
- **Error recovery** with graceful fallbacks
- **Console logging** for debugging and monitoring

The system ensures achievements are always up-to-date and properly persisted, providing a reliable and responsive user experience.

---

## 🚀 Deployment

### Streamlined Deployment System
The project includes a comprehensive deployment system that ensures changes appear immediately on the live site:

#### Quick Deployment Commands
```bash
# Full automated deployment (recommended)
npm run deploy:auto

# Quick deployment with version bump
npm run deploy:force

# Manual deployment
npm run deploy
```

#### Deployment Monitoring
- **Deployment Status**: https://scrypture.app/deployment-status.html
- **Force Refresh**: https://scrypture.app/force-deploy-refresh.html
- **GitHub Actions**: https://github.com/arturplt/Scrypture/actions

#### Documentation
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Troubleshooting**: [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 🧪 Testing
The application includes a complete test suite covering all major functionality:

#### Test Coverage
- **17 Test Cases** covering all core functionality
- **Habit Creation**: TaskForm integration, frequency selection, list verification
- **Habit Completion**: Streak tracking, stat rewards, frequency limits
- **Habit Editing**: Name/description updates, category changes, priority/difficulty modification
- **Form Consistency**: Field ordering and validation
- **UI/UX Testing**: Visual elements, responsive design, animations
- **Data Persistence**: localStorage integration, data recovery
- **Error Handling**: Invalid inputs, missing fields, edge cases
- **Performance**: Large dataset handling, smooth animations

#### Test Files
- `src/__tests__/habit-system-simple.test.tsx` - Comprehensive habit system tests
- `src/__tests__/habit-system.test.tsx` - Additional habit functionality tests

#### Running Tests
```bash
npm test                    # Run all tests
npm test -- --watch        # Run tests in watch mode
npm test habit-system      # Run specific test file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
git clone <repository-url>
cd Scrypture
npm install
```

### Development
```bash
npm start
```
The application will open at `http://localhost:3000`

### Building for Production
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── HabitEditForm.tsx       # Habit editing interface
│   ├── HabitCard.tsx           # Individual habit display
│   ├── HabitList.tsx           # Habit list with categories
│   ├── TaskForm.tsx            # Task/habit creation form
│   ├── AchievementCard.tsx     # Individual achievement display
│   ├── AchievementGrid.tsx     # Achievement grid with filtering
│   ├── AchievementNotification.tsx # Achievement unlock celebrations
│   ├── Synthesizer.tsx         # 8-Bit synthesizer component
│   ├── Pixelite.tsx            # Pixel grid converter
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useHabits.tsx           # Habit state management
│   ├── useTasks.tsx            # Task state management
│   ├── useUser.tsx             # User state management
│   ├── useAchievements.tsx     # Achievement state management
│   └── useSynthesizer.tsx      # Synthesizer audio logic
├── services/            # Business logic services
│   ├── habitService.ts         # Habit CRUD operations
│   ├── taskService.ts          # Task CRUD operations
│   ├── categoryService.ts      # Category management
│   ├── achievementService.ts   # Achievement logic and checking
│   └── storageService.ts       # localStorage operations
├── types/               # TypeScript type definitions
│   ├── index.ts               # Habit, Task, Achievement interfaces
│   └── synthesizer.ts         # Synthesizer type definitions
├── data/                # Data constants
│   └── synthesizerData.ts     # Musical data and presets
└── __tests__/           # Test files
    ├── habit-system-simple.test.tsx
    ├── habit-system.test.tsx
    └── Synthesizer.test.tsx
```

## 🎮 Usage Guide

### Creating Habits
1. Click "Create Task" button
2. Fill in habit name and description
3. Select "Make it a Habit" toggle
4. Choose frequency (Daily/Weekly/Monthly)
5. Set categories, priority, and difficulty
6. Click "Create Task" to save

### Completing Habits
1. Click the complete button (✓) on any habit
2. Verify the gold border disappears
3. Check that streak increases
4. Confirm stat rewards are awarded

### Editing Habits
1. Click the edit button on any habit
2. Modify name, description, or attributes
3. Change categories, priority, or difficulty
4. Update frequency or convert to task
5. Click "Update Habit" to save changes

### Managing Categories
1. Click "+ Add Category" in any form
2. Enter category name, icon, and color
3. Categories are automatically saved and available

### Achievement System
1. **Viewing Achievements**: Click the 🏆 button in the header to open the Achievement Grid
2. **Achievement Progress**: Locked achievements show progress bars and current/target values
3. **Filtering**: Use category filters (All, Unlocked, Locked, Progression, Mastery, etc.)
4. **Unlock Notifications**: Achievements automatically unlock with celebration animations
5. **Achievement Categories**:
   - **🌱 Progression**: Level and task completion milestones
   - **⚔️ Mastery**: Stat-based and difficulty achievements  
   - **🔥 Consistency**: Streak and daily completion achievements
   - **🗺️ Exploration**: Category and variety achievements
   - **✨ Special**: High-value and legendary achievements

### Secret Menu
1. **Accessing Tools**: Scroll to the bottom of the page to find the "🔐 Secret Menu" section
2. **Unlocking**: Click the "🔒 LOCKED" button to open the combination lock
   - **Combination Code**: 2137
   - **Default Position**: 2136 (only one number needs to be changed)
   - **Hint**: Try moving just one number from the default position
3. **Available Tools** (after unlocking):
   - **🎨 Pixelite**: Click to open the advanced pixel grid converter for image processing
   - **🎵 Synthesizer**: Click to toggle the 8-Bit synthesizer at the bottom of the page
4. **Synthesizer Features**: 
   - Use keyboard shortcuts (A-K keys) or click/drag on the piano keyboard
   - Explore chord progressions organized by genre and mood
   - Create patterns with the step sequencer
   - Try Scrypture-themed sound presets for achievements and UI feedback

### Available Achievements
- **First Steps** 🌱 - Complete your first task
- **Dam Builder** 🏗️ - Complete 10 tasks  
- **Ancient Wisdom** 🔮 - Reach level 5
- **Bóbr's Chosen** 👑 - Reach level 10
- **Mind Over Matter** 🧠 - Reach 50 Mind stat
- **Body Temple** 💪 - Reach 50 Body stat
- **Soul Seeker** ✨ - Reach 50 Soul stat
- **Difficulty Conqueror** ⚔️ - Complete 15 high-difficulty tasks
- **Streak Starter** 🔥 - Maintain a 7-day habit streak
- **Unwavering** 🌟 - Maintain a 30-day habit streak
- **Speed Demon** ⚡ - Complete 5 tasks in one day
- **Category Explorer** 🗺️ - Complete tasks in 4 different categories
- **Habit Collector** 📚 - Create your first habit
- **Experience Master** 💎 - Accumulate 1000 total XP
- **Streak Legend** 🏆 - Achieve a 100-day best streak (LEGENDARY!)

### Secret Menu Tools
- **🔐 Combination Lock**: Suitcase-style 4-digit combination lock (Code: 2137)
- **🎨 Pixelite**: Advanced pixel grid converter for image processing
- **🎵 Synthesizer**: 8-Bit synthesizer with comprehensive musical features including:
  - Interactive piano keyboard with multiple waveforms
  - Chord progressions and music theory tools
  - Step sequencer with 20+ patterns
  - Scrypture-themed sound presets for achievements and UI feedback
  - Real-time audio synthesis with anti-clipping protection

## 🔧 Technical Details

### State Management
- **React Context**: Global state management for habits, tasks, and user data
- **Local State**: Component-level state for forms and UI interactions
- **Persistence**: Automatic localStorage synchronization

### Data Models
```typescript
interface Habit {
  id: string;
  name: string;
  description?: string;
  streak: number;
  bestStreak: number;
  lastCompleted?: Date;
  createdAt: Date;
  targetFrequency: 'daily' | 'weekly' | 'monthly';
  categories: string[];
  statRewards?: {
    body?: number;
    mind?: number;
    soul?: number;
    xp?: number;
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'progression' | 'mastery' | 'consistency' | 'exploration' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  conditions: AchievementCondition[];
  rewards?: {
    xp?: number;
    body?: number;
    mind?: number;
    soul?: number;
  };
  icon: string;
  unlockedMessage: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
}

interface AchievementCondition {
  type: 'level_reach' | 'task_complete' | 'habit_streak' | 'stat_reach' | 
        'total_experience' | 'category_tasks' | 'daily_tasks' | 'difficulty_master' |
        'speed_demon' | 'consistency' | 'explorer' | 'first_task' | 'first_habit' | 
        'multi_category' | 'streak_master';
  value: number;
  category?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly';
  stat?: 'body' | 'mind' | 'soul';
  difficulty?: number;
}
```

### Performance Optimizations
- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Component lazy loading for large lists
- **Efficient Rendering**: Optimized re-renders with proper dependencies
- **Memory Management**: Proper cleanup of event listeners and timers

### Audio System
- **8-Bit Synthesizer**: Web Audio API-based real-time synthesis
- **Anti-Clipping Protection**: Advanced audio processing with dynamic limiting
- **Multiple Waveforms**: Sine, Square, Triangle, Sawtooth synthesis
- **Real-time Effects**: Reverb, LFO, compression, and stereo processing
- **Scrypture Integration**: Custom sound presets for achievements and UI feedback

## 🎨 Styling

### CSS Modules
- Modular CSS for component-specific styling
- CSS custom properties for theming
- Responsive design with mobile-first approach
- Smooth animations and transitions

### Design System
- **Colors**: CSS custom properties for consistent theming
- **Typography**: Consistent font hierarchy and spacing
- **Components**: Reusable UI components with consistent styling
- **Animations**: Smooth transitions and micro-interactions

## 🐛 Troubleshooting

### Common Issues
1. **Tests Failing**: Ensure all dependencies are installed with `npm install`
2. **Data Not Persisting**: Check browser localStorage support and permissions
3. **Performance Issues**: Verify large datasets are handled efficiently
4. **Styling Issues**: Ensure CSS modules are properly configured

### Debug Mode
```bash
npm start -- --debug
```

## 📈 Future Enhancements

### Planned Features
- **Data Export/Import**: Backup and restore functionality
- **Advanced Analytics**: Detailed habit and task statistics
- **Social Features**: Share habits and achievements
- **Mobile App**: Native mobile application
- **Cloud Sync**: Multi-device synchronization

### Performance Improvements
- **Virtual Scrolling**: For large habit/task lists
- **Service Workers**: Offline functionality
- **Progressive Web App**: Installable web application

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Testing Guidelines
- Write tests for all new features
- Ensure existing tests continue to pass
- Follow the established testing patterns
- Test both success and error scenarios

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- TypeScript for type safety
- Testing Library for excellent testing utilities
- CSS Modules for modular styling #   U p d a t e d   0 7 / 2 7 / 2 0 2 5   1 3 : 3 0 : 5 6 
 
 