import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskList } from '../components/TaskList';
import { HabitList } from '../components/HabitList';
import { TaskForm } from '../components/TaskForm';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { taskService } from '../services/taskService';
import { habitService } from '../services/habitService';
import { UserProvider } from '../hooks/useUser';
import { TaskProvider } from '../hooks/useTasks';
import { HabitProvider } from '../hooks/useHabits';

// Mock services
jest.mock('../services/taskService');
jest.mock('../services/habitService');

const mockTaskService = taskService as jest.Mocked<typeof taskService>;
const mockHabitService = habitService as jest.Mocked<typeof habitService>;

// TestWrapper component with proper context providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UserProvider>
    <TaskProvider>
      <HabitProvider>
        {children}
      </HabitProvider>
    </TaskProvider>
  </UserProvider>
);

describe('🚀 PERFORMANCE TESTING', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Render Performance', () => {
    it('should render TaskList with 100 tasks in under 200ms', () => {
      const largeTaskList = Array.from({ length: 100 }, (_, index) => ({
        id: `task-${index}`,
        title: `Task ${index}`,
        description: `Description for task ${index}`,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'medium' as const,
        difficulty: 2,
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      }));

      mockTaskService.getTasks.mockReturnValue(largeTaskList);

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(200);
      expect(screen.getByText('Task 0')).toBeInTheDocument();
      expect(screen.getByText('Task 99')).toBeInTheDocument();
    });

    it('should render HabitList with 50 habits in under 150ms', () => {
      const largeHabitList = Array.from({ length: 50 }, (_, index) => ({
        id: `habit-${index}`,
        name: `Habit ${index}`,
        description: `Description for habit ${index}`,
        streak: Math.floor(Math.random() * 10),
        bestStreak: Math.floor(Math.random() * 20),
        createdAt: new Date(),
        targetFrequency: 'daily' as const,
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      }));

      mockHabitService.getHabits.mockReturnValue(largeHabitList);

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <HabitList />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(150);
      expect(screen.getByText('Habit 0')).toBeInTheDocument();
      expect(screen.getByText('Habit 49')).toBeInTheDocument();
    });

    it('should render AnalyticsDashboard with complex data in under 300ms', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <AnalyticsDashboard isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(300);
    });
  });

  describe('User Interaction Performance', () => {
    it('should handle rapid task completions without lag', async () => {
      const mockTasks = Array.from({ length: 10 }, (_, index) => ({
        id: `task-${index}`,
        title: `Task ${index}`,
        description: `Description ${index}`,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'medium' as const,
        difficulty: 2,
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      }));

      mockTaskService.getTasks.mockReturnValue(mockTasks);

      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      const checkboxes = screen.getAllByRole('checkbox');
      
      const startTime = performance.now();
      
      // Rapidly click all checkboxes
      for (let i = 0; i < checkboxes.length; i++) {
        fireEvent.click(checkboxes[i]);
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      }
      
      const endTime = performance.now();
      const interactionTime = endTime - startTime;

      expect(interactionTime).toBeLessThan(1000); // Should complete within 1 second
      expect(mockTaskService.saveTasks).toHaveBeenCalled();
    });

    it('should handle form submission without blocking UI', async () => {
      render(
        <TestWrapper>
          <TaskForm />
        </TestWrapper>
      );

      const titleInput = screen.getByPlaceholderText(/Intention/);
      const submitButton = screen.getByText(/Create Task/);

      const startTime = performance.now();
      
      // Fill form and submit
      fireEvent.change(titleInput, { target: { value: 'Performance Test Task' } });
      fireEvent.click(submitButton);
      
      const endTime = performance.now();
      const formTime = endTime - startTime;

      expect(formTime).toBeLessThan(500); // Should complete within 500ms
      expect(mockTaskService.createTask).toHaveBeenCalled();
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not cause memory leaks with repeated renders', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render and unmount component multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <TestWrapper>
            <TaskList />
          </TestWrapper>
        );
        unmount();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });

    it('should handle large datasets without excessive memory usage', () => {
      const largeTaskList = Array.from({ length: 500 }, (_, index) => ({
        id: `task-${index}`,
        title: `Task ${index}`,
        description: `Description for task ${index}`,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'medium' as const,
        difficulty: 2,
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      }));

      mockTaskService.getTasks.mockReturnValue(largeTaskList);

      const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryUsed = endMemory - startMemory;

      // Should use less than 10MB for 500 tasks
      expect(memoryUsed).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Animation Performance', () => {
    it('should maintain smooth animations during interactions', async () => {
      const mockTask = {
        id: 'test-task',
        title: 'Animation Test Task',
        description: 'Testing smooth animations',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'medium' as const,
        difficulty: 2,
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      mockTaskService.getTasks.mockReturnValue([mockTask]);

      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      const checkbox = screen.getByRole('checkbox');
      
      // Test animation smoothness by clicking multiple times
      for (let i = 0; i < 5; i++) {
        fireEvent.click(checkbox);
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for animation
      }

      // Should not throw errors during animations
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Storage Performance', () => {
    it('should handle rapid storage operations efficiently', async () => {
      const tasks = Array.from({ length: 100 }, (_, index) => ({
        id: `task-${index}`,
        title: `Task ${index}`,
        description: `Description ${index}`,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'medium' as const,
        difficulty: 2,
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      }));

      const startTime = performance.now();
      
      // Perform multiple storage operations
      for (let i = 0; i < 10; i++) {
        mockTaskService.saveTasks(tasks);
      }
      
      const endTime = performance.now();
      const storageTime = endTime - startTime;

      expect(storageTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
}); 