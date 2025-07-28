# 🚀 Performance Testing Guide

## Overview

Performance testing ensures Scrypture maintains optimal user experience across different scenarios. This guide covers various performance testing approaches and how to implement them.

## Types of Performance Tests

### 1. **Component Render Performance**
Tests how quickly components render with different data sizes.

```typescript
// Example: Testing TaskList render performance
it('should render TaskList with 100 tasks in under 200ms', () => {
  const largeTaskList = Array.from({ length: 100 }, (_, index) => ({
    id: `task-${index}`,
    title: `Task ${index}`,
    // ... other properties
  }));

  const startTime = performance.now();
  render(<TaskList />);
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(200);
});
```

### 2. **User Interaction Performance**
Tests responsiveness during user interactions.

```typescript
// Example: Testing rapid task completions
it('should handle rapid task completions without lag', async () => {
  const checkboxes = screen.getAllByRole('checkbox');
  
  const startTime = performance.now();
  for (let i = 0; i < checkboxes.length; i++) {
    fireEvent.click(checkboxes[i]);
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(1000);
});
```

### 3. **Memory Usage Performance**
Tests for memory leaks and efficient memory usage.

```typescript
// Example: Testing memory usage with large datasets
it('should handle large datasets without excessive memory usage', () => {
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  render(<TaskList />);
  
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
  const memoryUsed = endMemory - startMemory;
  
  expect(memoryUsed).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
});
```

### 4. **Animation Performance**
Tests smooth animations and transitions.

```typescript
// Example: Testing animation smoothness
it('should maintain smooth animations during interactions', async () => {
  const checkbox = screen.getByRole('checkbox');
  
  // Test animation by clicking multiple times
  for (let i = 0; i < 5; i++) {
    fireEvent.click(checkbox);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Should not throw errors during animations
  expect(checkbox).toBeInTheDocument();
});
```

### 5. **Storage Performance**
Tests localStorage operations efficiency.

```typescript
// Example: Testing storage operations
it('should handle rapid storage operations efficiently', async () => {
  const tasks = Array.from({ length: 100 }, (_, index) => ({
    id: `task-${index}`,
    title: `Task ${index}`,
    // ... other properties
  }));

  const startTime = performance.now();
  
  // Perform multiple storage operations
  for (let i = 0; i < 10; i++) {
    taskService.saveTasks(tasks);
  }
  
  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(1000);
});
```

## Running Performance Tests

### Basic Commands

```bash
# Run all performance tests
npm test -- --testPathPattern="performance"

# Run specific performance test categories
npm test -- --testPathPattern="Component Render Performance"
npm test -- --testPathPattern="User Interaction Performance"
npm test -- --testPathPattern="Memory Usage Performance"

# Run with verbose output for detailed timing
npm test -- --testPathPattern="performance" --verbose
```

### Performance Test Categories

1. **Component Render Performance**
   - Tests render times for large datasets
   - Ensures components render within acceptable time limits
   - Tests different component types (TaskList, HabitList, etc.)

2. **User Interaction Performance**
   - Tests rapid user interactions
   - Ensures UI remains responsive
   - Tests form submissions and data updates

3. **Memory Usage Performance**
   - Tests for memory leaks
   - Ensures efficient memory usage with large datasets
   - Tests component cleanup and garbage collection

4. **Animation Performance**
   - Tests smooth animations and transitions
   - Ensures 60fps performance
   - Tests animation stability during interactions

5. **Storage Performance**
   - Tests localStorage operations
   - Ensures efficient data persistence
   - Tests with large datasets

## Performance Targets

### Render Performance
- **TaskList**: <200ms for 100 tasks
- **HabitList**: <150ms for 50 habits
- **AnalyticsDashboard**: <300ms for complex data
- **TaskForm**: <100ms for form rendering

### Interaction Performance
- **Task completion**: <500ms for single task
- **Rapid interactions**: <1000ms for 10 rapid clicks
- **Form submission**: <500ms for form processing
- **Data updates**: <200ms for state updates

### Memory Performance
- **Memory leaks**: <1MB increase after 10 render/unmount cycles
- **Large datasets**: <10MB for 500 tasks
- **Component cleanup**: Proper garbage collection

### Animation Performance
- **Smooth transitions**: 60fps target
- **Animation stability**: No errors during rapid interactions
- **UI responsiveness**: No blocking during animations

## Performance Monitoring

### Browser DevTools
1. **Performance Tab**: Record and analyze render performance
2. **Memory Tab**: Monitor memory usage and detect leaks
3. **Network Tab**: Monitor storage operations
4. **Console**: Check for performance warnings

### Performance Metrics
```typescript
// Example: Measuring performance metrics
const measurePerformance = (operation: () => void) => {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  operation();
  
  const endTime = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  return {
    duration: endTime - startTime,
    memoryUsed: endMemory - startMemory
  };
};
```

## Performance Optimization Tips

### 1. **Component Optimization**
- Use `React.memo()` for expensive components
- Implement `useMemo()` for expensive calculations
- Use `useCallback()` for event handlers
- Avoid unnecessary re-renders

### 2. **Data Optimization**
- Implement pagination for large lists
- Use virtual scrolling for very large datasets
- Optimize data structures for frequent access
- Cache expensive calculations

### 3. **Storage Optimization**
- Batch storage operations
- Implement debouncing for auto-save
- Use efficient serialization
- Clean up old data periodically

### 4. **Animation Optimization**
- Use CSS transforms instead of layout changes
- Implement `will-change` CSS property
- Use `requestAnimationFrame` for smooth animations
- Avoid layout thrashing

## Continuous Performance Monitoring

### Automated Performance Testing
```bash
# Run performance tests in CI/CD
npm test -- --testPathPattern="performance" --ci

# Generate performance reports
npm test -- --testPathPattern="performance" --coverage --json > performance-report.json
```

### Performance Regression Testing
- Set up automated performance testing in CI/CD
- Monitor performance metrics over time
- Alert on performance regressions
- Track performance trends

## Troubleshooting Performance Issues

### Common Issues

1. **Slow Component Rendering**
   - Check for unnecessary re-renders
   - Optimize component logic
   - Use React DevTools Profiler

2. **Memory Leaks**
   - Check for unmounted component subscriptions
   - Verify proper cleanup in useEffect
   - Monitor memory usage over time

3. **Slow User Interactions**
   - Check for blocking operations
   - Implement debouncing/throttling
   - Use web workers for heavy computations

4. **Animation Jank**
   - Check for layout thrashing
   - Use CSS transforms
   - Monitor frame rate

### Debug Tools
```typescript
// Performance debugging utility
const debugPerformance = (label: string, operation: () => void) => {
  console.time(label);
  const result = operation();
  console.timeEnd(label);
  return result;
};
```

## Best Practices

1. **Test Realistic Scenarios**
   - Use realistic data sizes
   - Test actual user workflows
   - Consider edge cases

2. **Set Appropriate Thresholds**
   - Base thresholds on user experience requirements
   - Consider device capabilities
   - Account for network conditions

3. **Monitor Performance Trends**
   - Track performance over time
   - Identify performance regressions
   - Set up alerts for performance issues

4. **Optimize Based on Data**
   - Use performance data to guide optimizations
   - Focus on bottlenecks
   - Measure impact of changes

## Integration with Existing Tests

The performance tests integrate with the existing Jest testing framework:

```bash
# Run all tests including performance
npm test

# Run only performance tests
npm test -- --testPathPattern="performance"

# Run tests with coverage including performance
npm test -- --coverage --testPathPattern="performance"
```

This ensures performance testing is part of the regular development workflow and catches performance regressions early. 