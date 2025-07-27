# Test Suite Documentation

## Overview

This document provides comprehensive documentation for the Scrypture test suite, covering all implemented tests, their purpose, coverage areas, and usage examples. The test suite ensures reliability, maintainability, and proper functionality across all application components.

## Test Structure

### Test Categories

1. **Hook Tests** - React custom hooks with context providers
2. **Service Tests** - Business logic and data management services  
3. **Component Tests** - UI components with user interactions
4. **Integration Tests** - End-to-end functionality testing

### Test Framework

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing utilities
- **TypeScript** - Type-safe test development
- **CSS Modules** - Styling validation

## Hook Tests

### useTutorial.test.tsx

**Purpose**: Tests the tutorial system hook and context provider

**Coverage Areas**:
- Tutorial state management
- Step progression and completion
- New user detection
- Tutorial start/skip/reset functionality
- Event listening and cleanup

**Key Features**:
```typescript
// Tests tutorial state initialization
it('should provide initial tutorial state', () => {
  renderWithProvider(<TestComponent />);
  expect(screen.getByTestId('tutorial-completed')).toHaveTextContent('false');
});

// Tests step completion
it('should handle markStepComplete and update state', async () => {
  renderWithProvider(<TestComponent />);
  act(() => {
    screen.getByTestId('mark-complete').click();
  });
  expect(mockTutorialService.markStepComplete).toHaveBeenCalledWith('welcome');
});
```

**Mock Strategy**:
- Mocks `tutorialService` to control behavior
- Uses `TutorialProvider` wrapper for context testing
- Tests error handling for missing provider

### useAchievements.test.tsx

**Purpose**: Tests the achievement system hook and context provider

**Coverage Areas**:
- Achievement loading and state management
- Progress tracking and updates
- Achievement checking and unlocking
- Save state management
- Error handling

**Key Features**:
```typescript
// Tests achievement loading
it('should load achievements and progress on mount', async () => {
  renderWithProvider(<TestComponent />);
  await waitFor(() => {
    expect(mockAchievementService.getAchievements).toHaveBeenCalled();
  });
});

// Tests achievement checking
it('should check achievements and update state when new achievements are unlocked', async () => {
  renderWithProvider(<TestComponent />);
  act(() => {
    screen.getByTestId('check-achievements').click();
  });
  await waitFor(() => {
    expect(screen.getByTestId('achievements-count')).toHaveTextContent('2');
  });
});
```

**Mock Strategy**:
- Mocks `achievementService` for controlled testing
- Uses `AchievementProvider` wrapper
- Tests error scenarios and edge cases

## Service Tests

### tutorialService.test.ts

**Purpose**: Tests the tutorial service singleton

**Coverage Areas**:
- Tutorial state management
- Step progression logic
- Progress calculation
- Storage integration
- Event triggering

**Key Features**:
```typescript
// Tests tutorial state management
it('should return the current tutorial state', () => {
  const state = tutorialService.getTutorialState();
  expect(state).toHaveProperty('completed', false);
  expect(state).toHaveProperty('currentStep', null);
});

// Tests step completion
it('should mark step as completed and move to next step', () => {
  tutorialService.startTutorial();
  const result = tutorialService.markStepComplete('bobrIntroduction');
  expect(result).toBe(true);
  expect(tutorialService.getCurrentStep()).toBe('damMetaphor');
});
```

**Mock Strategy**:
- Mocks `storageService` for persistence testing
- Tests singleton behavior and state isolation
- Validates event dispatching

## Component Tests

### FirstTaskWizard.test.tsx

**Purpose**: Tests the tutorial task creation wizard

**Coverage Areas**:
- Multi-step form navigation
- Form validation and input handling
- Task creation logic
- Tutorial integration
- Accessibility features

**Key Features**:
```typescript
// Tests form navigation
it('should advance to next step when Next is clicked', () => {
  renderWizard();
  fireEvent.click(screen.getByText('Next'));
  expect(screen.getByText('What do you want to accomplish?')).toBeInTheDocument();
});

// Tests task creation
it('should create task when Create Task is clicked', async () => {
  renderWizard();
  // Navigate through form...
  fireEvent.click(screen.getByText('Create Task'));
  await waitFor(() => {
    expect(mockAddTask).toHaveBeenCalledWith({
      title: 'My test task',
      categories: ['personal'],
      // ... other properties
    });
  });
});
```

**Mock Strategy**:
- Mocks `useTasks` hook for task management
- Mocks `tutorialService` for tutorial integration
- Tests form validation and user interactions

### BobrPen.test.tsx

**Purpose**: Tests the companion pen component

**Coverage Areas**:
- Expand/collapse functionality
- Stage progression based on user level
- View switching (Bobr/Dam)
- Props passing to child components
- Accessibility features

**Key Features**:
```typescript
// Tests stage progression
it('should show hatchling stage for levels 1-3', () => {
  render(<BobrPen {...defaultProps} user={createMockUser(2)} />);
  fireEvent.click(screen.getByTitle('Expand'));
  expect(screen.getByText('Hatchling Stage')).toBeInTheDocument();
});

// Tests view switching
it('should switch to dam view when dam tab is clicked', () => {
  render(<BobrPen {...defaultProps} />);
  fireEvent.click(screen.getByTitle('Expand'));
  fireEvent.click(screen.getByText('Dam'));
  expect(screen.getByTestId('dam-visualization')).toBeInTheDocument();
});
```

**Mock Strategy**:
- Mocks child components (`BobrCompanion`, `DamVisualization`)
- Tests user level-based stage progression
- Validates props passing

### AchievementNotification.test.tsx

**Purpose**: Tests the achievement notification component

**Coverage Areas**:
- Auto-close functionality with timers
- Progress bar animation
- Rarity-based styling
- Rewards display
- Manual close handling

**Key Features**:
```typescript
// Tests auto-close functionality
it('should auto-close after default duration', () => {
  render(<AchievementNotification achievement={achievement} onClose={mockOnClose} />);
  act(() => {
    jest.advanceTimersByTime(8000);
  });
  expect(mockOnClose).toHaveBeenCalledTimes(1);
});

// Tests progress bar
it('should update progress over time', () => {
  render(<AchievementNotification achievement={achievement} onClose={mockOnClose} duration={1000} />);
  act(() => {
    jest.advanceTimersByTime(500);
  });
  const currentWidth = progressFill.style.width;
  expect(parseFloat(currentWidth)).toBeLessThan(100);
});
```

**Mock Strategy**:
- Uses `jest.useFakeTimers()` for timer testing
- Tests all rarity types and styling
- Validates cleanup and memory management

### TutorialCompletionCelebration.test.tsx

**Purpose**: Tests the tutorial completion celebration modal

**Coverage Areas**:
- User personalization
- Achievement grid display
- Features showcase
- Bóbr encouragement messaging
- User interaction handling

**Key Features**:
```typescript
// Tests user personalization
it('should render celebration modal with user name', () => {
  const user = createMockUser({ name: 'Alice' });
  render(<TutorialCompletionCelebration user={user} onClose={mockOnClose} />);
  expect(screen.getByText('Congratulations, Alice!')).toBeInTheDocument();
});

// Tests achievement display
it('should display all tutorial achievements', () => {
  render(<TutorialCompletionCelebration user={user} onClose={mockOnClose} />);
  expect(screen.getByText('Met your companion Bóbr')).toBeInTheDocument();
  expect(screen.getByText('Created your first task')).toBeInTheDocument();
});
```

**Mock Strategy**:
- Tests various user name formats
- Validates content structure and accessibility
- Tests user interaction patterns

### AchievementCard.test.tsx

**Purpose**: Tests the achievement card component

**Coverage Areas**:
- Locked/unlocked state display
- Progress tracking visualization
- Rarity-based styling
- Rewards display
- User interaction handling

**Key Features**:
```typescript
// Tests locked state
it('should render locked icon for locked achievements', () => {
  const achievement = createMockAchievement({ unlocked: false });
  render(<AchievementCard achievement={achievement} />);
  expect(screen.getByText('🔒')).toBeInTheDocument();
});

// Tests progress display
it('should show progress for locked achievements with progress data', () => {
  const achievement = createMockAchievement({ unlocked: false });
  const progress = createMockProgress({ progress: 0.6, currentValue: 6, targetValue: 10 });
  render(<AchievementCard achievement={achievement} progress={progress} showProgress={true} />);
  expect(screen.getByText('Progress: 6 / 10')).toBeInTheDocument();
  expect(screen.getByText('60% Complete')).toBeInTheDocument();
});
```

**Mock Strategy**:
- Tests all rarity types and categories
- Validates progress calculation and display
- Tests edge cases and error conditions

## Test Utilities and Patterns

### Mock Data Factories

**Purpose**: Centralized mock data creation for consistent testing

**Usage**:
```typescript
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user',
  name: 'Test User',
  level: 1,
  experience: 100,
  body: 5,
  mind: 8,
  soul: 3,
  achievements: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  bobrStage: 'hatchling',
  damProgress: 10,
  ...overrides,
});
```

### Timer Testing

**Purpose**: Reliable testing of time-based functionality

**Usage**:
```typescript
jest.useFakeTimers();

it('should auto-close after duration', () => {
  render(<Component />);
  act(() => {
    jest.advanceTimersByTime(duration);
  });
  expect(mockOnClose).toHaveBeenCalled();
});
```

### Context Provider Testing

**Purpose**: Testing hooks that require context providers

**Usage**:
```typescript
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TutorialProvider>
      {component}
    </TutorialProvider>
  );
};
```

## Test Coverage Areas

### Functional Coverage
- ✅ User interaction flows
- ✅ State management and updates
- ✅ Data validation and error handling
- ✅ Timer and async functionality
- ✅ Event handling and cleanup

### UI Coverage
- ✅ Component rendering and display
- ✅ Styling and CSS class application
- ✅ Accessibility features (ARIA, keyboard navigation)
- ✅ Responsive behavior and layout

### Edge Case Coverage
- ✅ Empty or null data handling
- ✅ Error scenarios and recovery
- ✅ Memory leak prevention
- ✅ Performance considerations

### Integration Coverage
- ✅ Service-to-component integration
- ✅ Hook-to-component integration
- ✅ Cross-component communication
- ✅ Data flow validation

## Running Tests

### Individual Test Files
```bash
npm test -- src/components/__tests__/AchievementCard.test.tsx
```

### Test Categories
```bash
# Hook tests
npm test -- src/hooks/__tests__/

# Component tests  
npm test -- src/components/__tests__/

# Service tests
npm test -- src/services/__tests__/
```

### Coverage Report
```bash
npm test -- --coverage
```

## Best Practices

### Test Organization
1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the scenario
3. **Arrange-Act-Assert** pattern for clear test structure
4. **Mock external dependencies** for isolated testing

### Mock Strategy
1. **Mock at the right level** - services, not implementation details
2. **Use consistent mock data** with factory functions
3. **Reset mocks** between tests for isolation
4. **Test mock interactions** to ensure proper integration

### Async Testing
1. **Use `waitFor`** for async state updates
2. **Use `act`** for state changes
3. **Mock timers** for time-based functionality
4. **Clean up** timers and listeners

### Accessibility Testing
1. **Test ARIA roles** and attributes
2. **Validate keyboard navigation**
3. **Check focus management**
4. **Test screen reader compatibility**

## Maintenance

### Adding New Tests
1. Follow existing patterns and structure
2. Use established mock factories
3. Include edge case coverage
4. Add accessibility tests

### Updating Tests
1. Update mocks when interfaces change
2. Maintain test isolation
3. Keep tests focused and specific
4. Document complex test scenarios

### Test Quality Checklist
- [ ] Tests are isolated and independent
- [ ] Mocks are properly reset between tests
- [ ] Async operations are properly handled
- [ ] Edge cases are covered
- [ ] Accessibility is tested
- [ ] Error scenarios are validated
- [ ] Performance implications are considered

## Future Enhancements

### Planned Test Additions
- `AchievementGrid.test.tsx` - Achievement layout component
- `BobrCompanion.test.tsx` - Main companion component
- `bobrService.test.ts` - Companion service logic
- Integration tests for complete user flows

### Test Infrastructure Improvements
- Custom test utilities for common patterns
- Enhanced mock factories with more realistic data
- Performance testing for complex components
- Visual regression testing for UI components

---

*This documentation is maintained alongside the test suite and should be updated when new tests are added or existing tests are modified.* 