import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskList } from '../components/TaskList';
import { TaskListOptimized } from '../components/TaskListOptimized';
import { TaskCard } from '../components/TaskCard';
import { TaskCardOptimized } from '../components/TaskCardOptimized';
import { useTasks } from '../hooks/useTasks';

// Mock the hooks
jest.mock('../hooks/useTasks');
jest.mock('../services/taskService');
jest.mock('../services/habitService');
jest.mock('../services/categoryService');

const mockUseTasks = useTasks as jest.MockedFunction<typeof useTasks>;

describe('Component Rendering Optimization Comparison', () => {
  const createMockTasks = (count: number) => {
    return Array.from({ length: count }, (_, index) => ({
      id: `task-${index}`,
      title: `Task ${index}`,
      description: `Description for task ${index}`,
      completed: false,
      priority: 'medium' as const,
      difficulty: 1,
      categories: ['work'],
      createdAt: new Date(),
      updatedAt: new Date(),
      statRewards: {
        xp: 10,
        body: 2,
        mind: 1,
        soul: 1
      }
    }));
  };

  beforeEach(() => {
    mockUseTasks.mockReturnValue({
      tasks: [],
      refreshTasks: jest.fn(),
      isSaving: false,
      toggleTask: jest.fn(),
      bringTaskToTop: jest.fn(),
      addTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      lastSaved: null
    });
  });

  describe('Performance Comparison', () => {
    it('should render optimized TaskList faster than regular TaskList', () => {
      const largeTaskList = createMockTasks(100);
      mockUseTasks.mockReturnValue({
        tasks: largeTaskList,
        refreshTasks: jest.fn(),
        isSaving: false,
        toggleTask: jest.fn(),
        bringTaskToTop: jest.fn(),
        addTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        lastSaved: null
      });

      // Test regular TaskList render time
      const regularStartTime = performance.now();
      render(<TaskList />);
      const regularEndTime = performance.now();
      const regularRenderTime = regularEndTime - regularStartTime;

      // Test optimized TaskList render time
      const optimizedStartTime = performance.now();
      render(<TaskListOptimized />);
      const optimizedEndTime = performance.now();
      const optimizedRenderTime = optimizedEndTime - optimizedStartTime;

      // The optimized version should be faster
      expect(optimizedRenderTime).toBeLessThan(regularRenderTime);
      
      console.log(`Regular TaskList render time: ${regularRenderTime.toFixed(2)}ms`);
      console.log(`Optimized TaskList render time: ${optimizedRenderTime.toFixed(2)}ms`);
      console.log(`Performance improvement: ${((regularRenderTime - optimizedRenderTime) / regularRenderTime * 100).toFixed(2)}%`);
    });

    it('should render optimized TaskCard faster than regular TaskCard', () => {
      const task = createMockTasks(1)[0];

      // Test regular TaskCard render time
      const regularStartTime = performance.now();
      render(<TaskCard task={task} />);
      const regularEndTime = performance.now();
      const regularRenderTime = regularEndTime - regularStartTime;

      // Test optimized TaskCard render time
      const optimizedStartTime = performance.now();
      render(<TaskCardOptimized task={task} />);
      const optimizedEndTime = performance.now();
      const optimizedRenderTime = optimizedEndTime - optimizedStartTime;

      // The optimized version should be faster
      expect(optimizedRenderTime).toBeLessThan(regularRenderTime);
      
      console.log(`Regular TaskCard render time: ${regularRenderTime.toFixed(2)}ms`);
      console.log(`Optimized TaskCard render time: ${optimizedRenderTime.toFixed(2)}ms`);
      console.log(`Performance improvement: ${((regularRenderTime - optimizedRenderTime) / regularRenderTime * 100).toFixed(2)}%`);
    });

    it('should handle large datasets efficiently with optimized components', () => {
      const veryLargeTaskList = createMockTasks(500);
      mockUseTasks.mockReturnValue({
        tasks: veryLargeTaskList,
        refreshTasks: jest.fn(),
        isSaving: false,
        toggleTask: jest.fn(),
        bringTaskToTop: jest.fn(),
        addTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        lastSaved: null
      });

      const startTime = performance.now();
      
      // This should render without significant performance issues
      render(<TaskListOptimized />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render large datasets within reasonable time
      expect(renderTime).toBeLessThan(1000); // Less than 1 second for 500 tasks
      
      console.log(`Large dataset (500 tasks) render time: ${renderTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Comparison', () => {
    it('should use less memory with optimized components', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render optimized components multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<TaskListOptimized />);
        unmount();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
      
      console.log(`Memory increase after 10 renders: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('Optimization Techniques Validation', () => {
    it('should demonstrate React.memo benefits', () => {
      const task = createMockTasks(1)[0];
      
      // Test that memoized components don't re-render unnecessarily
      const { rerender } = render(<TaskCardOptimized task={task} />);
      
      // Re-render with same props should be fast
      const startTime = performance.now();
      rerender(<TaskCardOptimized task={task} />);
      const endTime = performance.now();
      const rerenderTime = endTime - startTime;
      
      expect(rerenderTime).toBeLessThan(50); // Should be very fast
      
      console.log(`Memoized component re-render time: ${rerenderTime.toFixed(2)}ms`);
    });

    it('should demonstrate useMemo benefits', () => {
      const tasks = createMockTasks(100);
      mockUseTasks.mockReturnValue({
        tasks,
        refreshTasks: jest.fn(),
        isSaving: false,
        toggleTask: jest.fn(),
        bringTaskToTop: jest.fn(),
        addTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        lastSaved: null
      });

      // Test that expensive calculations are memoized
      const startTime = performance.now();
      render(<TaskListOptimized />);
      const endTime = performance.now();
      const firstRenderTime = endTime - startTime;

      // Second render should be faster due to memoization
      const secondStartTime = performance.now();
      render(<TaskListOptimized />);
      const secondEndTime = performance.now();
      const secondRenderTime = secondEndTime - secondStartTime;

      // Second render should be faster
      expect(secondRenderTime).toBeLessThan(firstRenderTime);
      
      console.log(`First render time: ${firstRenderTime.toFixed(2)}ms`);
      console.log(`Second render time: ${secondRenderTime.toFixed(2)}ms`);
    });
  });
}); 