# Scrypture - Habit & Task Management System

A modern, gamified habit and task management application built with React, TypeScript, and CSS Modules.

## 🎯 Features

### Core Functionality
- **Habit Management**: Create, edit, complete, and track habits with streak counting
- **Task Management**: Create, edit, and complete tasks with priority and difficulty levels
- **Category System**: Organize habits and tasks with customizable categories
- **Stat Rewards**: Earn Body, Mind, and Soul stats through habit completion
- **XP System**: Gain experience points based on task priority and difficulty
- **Data Persistence**: All data saved to localStorage for offline functionality

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

## 🧪 Testing

### Comprehensive Test Suite
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
│   ├── HabitEditForm.tsx    # Habit editing interface
│   ├── HabitCard.tsx        # Individual habit display
│   ├── HabitList.tsx        # Habit list with categories
│   ├── TaskForm.tsx         # Task/habit creation form
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useHabits.tsx       # Habit state management
│   ├── useTasks.tsx        # Task state management
│   └── useUser.tsx         # User state management
├── services/            # Business logic services
│   ├── habitService.ts     # Habit CRUD operations
│   ├── taskService.ts      # Task CRUD operations
│   ├── categoryService.ts  # Category management
│   └── storageService.ts   # localStorage operations
├── types/               # TypeScript type definitions
│   └── index.ts            # Habit, Task interfaces
└── __tests__/           # Test files
    ├── habit-system-simple.test.tsx
    └── habit-system.test.tsx
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
```

### Performance Optimizations
- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Component lazy loading for large lists
- **Efficient Rendering**: Optimized re-renders with proper dependencies
- **Memory Management**: Proper cleanup of event listeners and timers

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
- CSS Modules for modular styling 