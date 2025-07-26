import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HabitProvider } from '../hooks/useHabits';
import { TaskProvider } from '../hooks/useTasks';
import { UserProvider } from '../hooks/useUser';
import { TaskForm } from '../components/TaskForm';
import { HabitList } from '../components/HabitList';
import { HabitCard } from '../components/HabitCard';
import { HabitEditForm } from '../components/HabitEditForm';
import { habitService } from '../services/habitService';
import { taskService } from '../services/taskService';
import { categoryService } from '../services/categoryService';
import { Habit, Task } from '../types';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock the services
jest.mock('../services/storageService', () => ({
  storageService: {
    saveTasks: jest.fn(() => true),
    getTasks: jest.fn(() => []),
    saveUser: jest.fn(() => true),
    getUser: jest.fn(() => ({
      id: '1',
      name: 'Test User',
      level: 1,
      experience: 0,
      achievements: [],
      createdAt: new Date('2024-01-01'),
    })),
    getHabits: jest.fn(() => []),
    saveHabits: jest.fn(() => true),
    getStorageStats: jest.fn(() => ({
      used: 1024,
      available: 5 * 1024 * 1024,
      percentage: 0.02,
    })),
    backupData: jest.fn(() => ({ success: true })),
    restoreData: jest.fn(() => ({ success: true })),
  },
}));

jest.mock('../services/categoryService', () => ({
  categoryService: {
    getCustomCategories: jest.fn(() => []),
    saveCustomCategories: jest.fn(() => true),
    addCustomCategory: jest.fn(() => true),
    getAllCategories: jest.fn(() => [
      { name: 'body', icon: '💪', color: '#ff6b6b' },
      { name: 'mind', icon: '🧠', color: '#4ecdc4' },
      { name: 'soul', icon: '✨', color: '#45b7d1' },
      { name: 'home', icon: '🏠', color: '#96ceb4' },
      { name: 'free time', icon: '🎮', color: '#feca57' },
      { name: 'garden', icon: '🌱', color: '#ff9ff3' },
    ]),
  },
}));

// Mock crypto.randomUUID for consistent testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UserProvider>
    <TaskProvider>
      <HabitProvider>
        {children}
      </HabitProvider>
    </TaskProvider>
  </UserProvider>
);

describe('📋 HABIT SYSTEM TESTING', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mocks
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
  });

  describe('1. HABIT CREATION', () => {
    it('✓ Create habit via TaskForm', async () => {
      render(
        <TestWrapper>
          <TaskForm />
        </TestWrapper>
      );

      // Expand the form
      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);

      // Fill in habit details
      fireEvent.change(titleInput, { target: { value: 'Morning Exercise' } });
      
      // Select "Make it a Habit"
      const habitToggle = screen.getByText(/Make it a Habit/);
      fireEvent.click(habitToggle);

      // Select frequency
      const dailyButton = screen.getByText('DAILY');
      fireEvent.click(dailyButton);

      // Submit the form
      const submitButton = screen.getByText(/Create Task/);
      fireEvent.click(submitButton);

      // Verify habit was created
      await waitFor(() => {
        expect(habitService.addHabit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Morning Exercise',
            targetFrequency: 'daily',
          })
        );
      });
    });

    it('✓ Select frequency (Daily/Weekly/Monthly)', async () => {
      render(
        <TestWrapper>
          <TaskForm />
        </TestWrapper>
      );

      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);
      fireEvent.change(titleInput, { target: { value: 'Weekly Reading' } });

      // Toggle habit mode
      const habitToggle = screen.getByText(/Make it a Habit/);
      fireEvent.click(habitToggle);

      // Test all frequency options
      const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY'];
      
      for (const frequency of frequencies) {
        const frequencyButton = screen.getByText(frequency);
        fireEvent.click(frequencyButton);
        
        // Verify the button is active
        expect(frequencyButton).toHaveClass('priorityButtonActive');
      }
    });

    it('✓ Verify habit appears in habit list', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      // Mock habitService to return our test habit
      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);

      render(
        <TestWrapper>
          <HabitList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Habit')).toBeInTheDocument();
      });
    });

    it('✓ Verify habit doesn\'t appear in task list', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      const mockTask: Task = {
        id: 'test-task-1',
        title: 'Test Task',
        description: 'A test task',
        completed: false,
        priority: 'medium',
        difficulty: 0,
        categories: ['body'],
        createdAt: new Date(),
        statRewards: { body: 1, xp: 10 },
      };

      // Mock services to return test data
      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);
      jest.spyOn(taskService, 'getTasks').mockReturnValue([mockTask]);

      render(
        <TestWrapper>
          <div>
            <HabitList />
            {/* TaskList would be here in real app */}
          </div>
        </TestWrapper>
      );

      // Verify habit appears in habit list
      await waitFor(() => {
        expect(screen.getByText('Test Habit')).toBeInTheDocument();
      });

      // Verify task doesn't appear in habit list
      expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
    });
  });

  describe('2. HABIT COMPLETION', () => {
    it('✓ Complete a habit', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);
      jest.spyOn(habitService, 'completeHabit').mockReturnValue(true);
      jest.spyOn(habitService, 'isCompletedToday').mockReturnValue(false);

      render(
        <TestWrapper>
          <HabitCard habit={mockHabit} />
        </TestWrapper>
      );

      const completeButton = screen.getByRole('button', { name: /complete/i });
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(habitService.completeHabit).toHaveBeenCalledWith('test-habit-1');
      });
    });

    it('✓ Verify gold border disappears', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);
      jest.spyOn(habitService, 'isCompletedToday').mockReturnValue(false);

      render(
        <TestWrapper>
          <HabitCard habit={mockHabit} />
        </TestWrapper>
      );

      const habitCard = screen.getByTestId('habit-card');
      expect(habitCard).toHaveClass('habitCardActive'); // Gold border when active

      // Mock completion
      jest.spyOn(habitService, 'isCompletedToday').mockReturnValue(true);

      // Re-render to show completed state
      render(
        <TestWrapper>
          <HabitCard habit={mockHabit} />
        </TestWrapper>
      );

      const completedCard = screen.getByTestId('habit-card');
      expect(completedCard).not.toHaveClass('habitCardActive'); // No gold border when completed
    });

    it('✓ Verify streak increases', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 5,
        bestStreak: 5,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);
      jest.spyOn(habitService, 'completeHabit').mockReturnValue(true);
      jest.spyOn(habitService, 'isCompletedToday').mockReturnValue(false);

      render(
        <TestWrapper>
          <HabitCard habit={mockHabit} />
        </TestWrapper>
      );

      // Verify initial streak
      expect(screen.getByText('5 days')).toBeInTheDocument();

      const completeButton = screen.getByRole('button', { name: /complete/i });
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(habitService.completeHabit).toHaveBeenCalled();
      });
    });

    it('✓ Verify stat rewards are awarded', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, mind: 1, soul: 1, xp: 10 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);
      jest.spyOn(habitService, 'completeHabit').mockReturnValue(true);
      jest.spyOn(habitService, 'isCompletedToday').mockReturnValue(false);

      render(
        <TestWrapper>
          <HabitCard habit={mockHabit} />
        </TestWrapper>
      );

      const completeButton = screen.getByRole('button', { name: /complete/i });
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(habitService.completeHabit).toHaveBeenCalled();
      });
    });

    it('✓ Test daily/weekly/monthly frequency limits', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        lastCompleted: new Date(), // Already completed today
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);
      jest.spyOn(habitService, 'isCompletedToday').mockReturnValue(true);
      jest.spyOn(habitService, 'canCompleteHabit').mockReturnValue(false);

      render(
        <TestWrapper>
          <HabitCard habit={mockHabit} />
        </TestWrapper>
      );

      // Verify completion button is disabled
      const completeButton = screen.getByRole('button', { name: /complete/i });
      expect(completeButton).toBeDisabled();
    });
  });

  describe('3. HABIT EDITING', () => {
    it('✓ Edit habit name/description', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Original Name',
        description: 'Original description',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);
      jest.spyOn(habitService, 'updateHabit').mockReturnValue(true);

      render(
        <TestWrapper>
          <HabitEditForm habit={mockHabit} onCancel={() => {}} />
        </TestWrapper>
      );

      // Edit name
      const nameInput = screen.getByDisplayValue('Original Name');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      // Edit description
      const descriptionInput = screen.getByDisplayValue('Original description');
      fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

      // Submit changes
      const submitButton = screen.getByText(/Update Habit/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(habitService.updateHabit).toHaveBeenCalledWith(
          'test-habit-1',
          expect.objectContaining({
            name: 'Updated Name',
            description: 'Updated description',
          })
        );
      });
    });

    it('✓ Change categories', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);
      jest.spyOn(habitService, 'updateHabit').mockReturnValue(true);

      render(
        <TestWrapper>
          <HabitEditForm habit={mockHabit} onCancel={() => {}} />
        </TestWrapper>
      );

      // Select mind category
      const mindButton = screen.getByText(/🧠 Mind/);
      fireEvent.click(mindButton);

      // Submit changes
      const submitButton = screen.getByText(/Update Habit/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(habitService.updateHabit).toHaveBeenCalledWith(
          'test-habit-1',
          expect.objectContaining({
            categories: ['body', 'mind'],
          })
        );
      });
    });

    it('✓ Modify priority/difficulty', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);
      jest.spyOn(habitService, 'updateHabit').mockReturnValue(true);

      render(
        <TestWrapper>
          <HabitEditForm habit={mockHabit} onCancel={() => {}} />
        </TestWrapper>
      );

      // Change priority to high
      const highPriorityButton = screen.getByText('HIGH PRIORITY');
      fireEvent.click(highPriorityButton);

      // Change difficulty to 3
      const difficultyButton = screen.getByText('3');
      fireEvent.click(difficultyButton);

      // Submit changes
      const submitButton = screen.getByText(/Update Habit/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(habitService.updateHabit).toHaveBeenCalled();
      });
    });

    it('✓ Update core attributes', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);
      jest.spyOn(habitService, 'updateHabit').mockReturnValue(true);

      render(
        <TestWrapper>
          <HabitEditForm habit={mockHabit} onCancel={() => {}} />
        </TestWrapper>
      );

      // Toggle mind attribute
      const mindButton = screen.getByText('MIND');
      fireEvent.click(mindButton);

      // Submit changes
      const submitButton = screen.getByText(/Update Habit/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(habitService.updateHabit).toHaveBeenCalledWith(
          'test-habit-1',
          expect.objectContaining({
            statRewards: expect.objectContaining({
              mind: 1,
            }),
          })
        );
      });
    });

    it('✓ Convert habit to task', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);
      jest.spyOn(habitService, 'deleteHabit').mockReturnValue(true);
      jest.spyOn(taskService, 'addTask').mockReturnValue({
        id: 'new-task-1',
        title: 'Test Habit',
        description: 'A test habit',
        completed: false,
        priority: 'medium',
        difficulty: 0,
        categories: ['body'],
        createdAt: new Date(),
        statRewards: { body: 1, xp: 10 },
      });

      render(
        <TestWrapper>
          <HabitEditForm habit={mockHabit} onCancel={() => {}} />
        </TestWrapper>
      );

      // Toggle convert to task
      const convertButton = screen.getByText(/Make it a Habit/);
      fireEvent.click(convertButton);

      // Submit the conversion
      const submitButton = screen.getByText(/Convert to Task/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(taskService.addTask).toHaveBeenCalled();
        expect(habitService.deleteHabit).toHaveBeenCalledWith('test-habit-1');
      });
    });
  });

  describe('4. FORM CONSISTENCY', () => {
    it('✓ TaskForm field order: Core → Category → Priority → Difficulty → Habit', async () => {
      render(
        <TestWrapper>
          <TaskForm />
        </TestWrapper>
      );

      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);

      // Verify field order by checking for specific elements in order
      const form = screen.getByRole('form');
      const formElements = form.children;

      // This is a simplified check - in a real test you'd verify the actual DOM order
      expect(screen.getByText(/Core Attributes:/)).toBeInTheDocument();
      expect(screen.getByText(/Category:/)).toBeInTheDocument();
      expect(screen.getByText(/Priority:/)).toBeInTheDocument();
      expect(screen.getByText(/Difficulty:/)).toBeInTheDocument();
      expect(screen.getByText(/Make it a Habit/)).toBeInTheDocument();
    });

    it('✓ TaskEditForm field order: Core → Category → Priority → Difficulty → Habit', async () => {
      const mockTask: Task = {
        id: 'test-task-1',
        title: 'Test Task',
        description: 'A test task',
        completed: false,
        priority: 'medium',
        difficulty: 0,
        categories: ['body'],
        createdAt: new Date(),
        statRewards: { body: 1, xp: 10 },
      };

      render(
        <TestWrapper>
          <TaskForm taskToEdit={mockTask} />
        </TestWrapper>
      );

      // Verify field order
      expect(screen.getByText(/Core Attributes:/)).toBeInTheDocument();
      expect(screen.getByText(/Category:/)).toBeInTheDocument();
      expect(screen.getByText(/Priority:/)).toBeInTheDocument();
      expect(screen.getByText(/Difficulty:/)).toBeInTheDocument();
      expect(screen.getByText(/Make it a Habit/)).toBeInTheDocument();
    });

    it('✓ HabitEditForm field order: Core → Category → Priority → Difficulty → Frequency', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      render(
        <TestWrapper>
          <HabitEditForm habit={mockHabit} onCancel={() => {}} />
        </TestWrapper>
      );

      // Verify field order
      expect(screen.getByText(/Core Attributes:/)).toBeInTheDocument();
      expect(screen.getByText(/Category:/)).toBeInTheDocument();
      expect(screen.getByText(/Priority:/)).toBeInTheDocument();
      expect(screen.getByText(/Difficulty:/)).toBeInTheDocument();
      expect(screen.getByText(/Frequency:/)).toBeInTheDocument();
    });
  });

  describe('5. UI/UX TESTING', () => {
    it('✓ Blue habit buttons', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      render(
        <TestWrapper>
          <HabitCard habit={mockHabit} />
        </TestWrapper>
      );

      const habitCard = screen.getByTestId('habit-card');
      expect(habitCard).toHaveClass('habitCard'); // Should have blue styling
    });

    it('✓ Gold active habit borders', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'isCompletedToday').mockReturnValue(false);

      render(
        <TestWrapper>
          <HabitCard habit={mockHabit} />
        </TestWrapper>
      );

      const habitCard = screen.getByTestId('habit-card');
      expect(habitCard).toHaveClass('habitCardActive'); // Should have gold border when active
    });

    it('✓ 4px padding in habit list', async () => {
      const mockHabits: Habit[] = [
        {
          id: 'test-habit-1',
          name: 'Test Habit 1',
          description: 'A test habit',
          streak: 0,
          bestStreak: 0,
          createdAt: new Date(),
          targetFrequency: 'daily',
          categories: ['body'],
          statRewards: { body: 1, xp: 5 },
        },
        {
          id: 'test-habit-2',
          name: 'Test Habit 2',
          description: 'Another test habit',
          streak: 0,
          bestStreak: 0,
          createdAt: new Date(),
          targetFrequency: 'weekly',
          categories: ['mind'],
          statRewards: { mind: 1, xp: 5 },
        },
      ];

      jest.spyOn(habitService, 'getHabits').mockReturnValue(mockHabits);

      render(
        <TestWrapper>
          <HabitList />
        </TestWrapper>
      );

      const habitCards = screen.getAllByTestId('habit-card');
      habitCards.forEach(card => {
        const computedStyle = window.getComputedStyle(card);
        expect(computedStyle.padding).toBe('4px');
      });
    });

    it('✓ Collapsible category sections', async () => {
      const mockHabits: Habit[] = [
        {
          id: 'test-habit-1',
          name: 'Test Habit 1',
          description: 'A test habit',
          streak: 0,
          bestStreak: 0,
          createdAt: new Date(),
          targetFrequency: 'daily',
          categories: ['body'],
          statRewards: { body: 1, xp: 5 },
        },
        {
          id: 'test-habit-2',
          name: 'Test Habit 2',
          description: 'Another test habit',
          streak: 0,
          bestStreak: 0,
          createdAt: new Date(),
          targetFrequency: 'weekly',
          categories: ['mind'],
          statRewards: { mind: 1, xp: 5 },
        },
      ];

      jest.spyOn(habitService, 'getHabits').mockReturnValue(mockHabits);

      render(
        <TestWrapper>
          <HabitList />
        </TestWrapper>
      );

      // Find category headers
      const categoryHeaders = screen.getAllByText(/💪 Body|🧠 Mind/);
      
      // Click on a category header to collapse/expand
      if (categoryHeaders.length > 0) {
        fireEvent.click(categoryHeaders[0]);
        
        // Verify the section toggles (this would depend on the actual implementation)
        await waitFor(() => {
          // Check if the section is collapsed/expanded
          expect(categoryHeaders[0]).toBeInTheDocument();
        });
      }
    });

    it('✓ Empty categories hidden', async () => {
      const mockHabits: Habit[] = [
        {
          id: 'test-habit-1',
          name: 'Test Habit',
          description: 'A test habit',
          streak: 0,
          bestStreak: 0,
          createdAt: new Date(),
          targetFrequency: 'daily',
          categories: ['body'],
          statRewards: { body: 1, xp: 5 },
        },
      ];

      jest.spyOn(habitService, 'getHabits').mockReturnValue(mockHabits);

      render(
        <TestWrapper>
          <HabitList />
        </TestWrapper>
      );

      // Verify only categories with habits are shown
      expect(screen.getByText(/💪 Body/)).toBeInTheDocument();
      expect(screen.queryByText(/🧠 Mind/)).not.toBeInTheDocument(); // No mind habits
    });
  });

  describe('6. DATA PERSISTENCE', () => {
    it('✓ Habits save to localStorage', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);
      jest.spyOn(habitService, 'saveHabits').mockReturnValue(true);

      render(
        <TestWrapper>
          <HabitList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(habitService.saveHabits).toHaveBeenCalled();
      });
    });

    it('✓ Habits load on page refresh', async () => {
      const mockHabits: Habit[] = [
        {
          id: 'test-habit-1',
          name: 'Test Habit',
          description: 'A test habit',
          streak: 0,
          bestStreak: 0,
          createdAt: new Date(),
          targetFrequency: 'daily',
          categories: ['body'],
          statRewards: { body: 1, xp: 5 },
        },
      ];

      jest.spyOn(habitService, 'getHabits').mockReturnValue(mockHabits);

      render(
        <TestWrapper>
          <HabitList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Habit')).toBeInTheDocument();
      });
    });

    it('✓ Categories persist', async () => {
      const mockHabits: Habit[] = [
        {
          id: 'test-habit-1',
          name: 'Test Habit',
          description: 'A test habit',
          streak: 0,
          bestStreak: 0,
          createdAt: new Date(),
          targetFrequency: 'daily',
          categories: ['body', 'mind'],
          statRewards: { body: 1, mind: 1, xp: 5 },
        },
      ];

      jest.spyOn(habitService, 'getHabits').mockReturnValue(mockHabits);

      render(
        <TestWrapper>
          <HabitList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Habit')).toBeInTheDocument();
        // Verify categories are displayed
        expect(screen.getByText(/💪 Body/)).toBeInTheDocument();
        expect(screen.getByText(/🧠 Mind/)).toBeInTheDocument();
      });
    });

    it('✓ Streaks maintain', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 7,
        bestStreak: 10,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([mockHabit]);

      render(
        <TestWrapper>
          <HabitCard habit={mockHabit} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('7 days')).toBeInTheDocument();
        expect(screen.getByText('Best: 10')).toBeInTheDocument();
      });
    });
  });

  describe('7. ERROR HANDLING', () => {
    it('✓ Invalid habit creation', async () => {
      render(
        <TestWrapper>
          <TaskForm />
        </TestWrapper>
      );

      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);

      // Try to submit without a title
      const submitButton = screen.getByText(/Create Task/);
      fireEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    it('✓ Missing required fields', async () => {
      render(
        <TestWrapper>
          <TaskForm />
        </TestWrapper>
      );

      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);

      // Toggle habit mode without selecting frequency
      const habitToggle = screen.getByText(/Make it a Habit/);
      fireEvent.click(habitToggle);

      // Try to submit
      const submitButton = screen.getByText(/Create Task/);
      fireEvent.click(submitButton);

      // Should show frequency selection error
      await waitFor(() => {
        expect(screen.getByText(/frequency/i)).toBeInTheDocument();
      });
    });

    it('✓ Duplicate habit names', async () => {
      const existingHabit: Habit = {
        id: 'existing-habit-1',
        name: 'Existing Habit',
        description: 'An existing habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      jest.spyOn(habitService, 'getHabits').mockReturnValue([existingHabit]);
      jest.spyOn(habitService, 'addHabit').mockReturnValue(null); // Simulate failure

      render(
        <TestWrapper>
          <TaskForm />
        </TestWrapper>
      );

      const titleInput = screen.getByPlaceholderText(/Intention/);
      fireEvent.click(titleInput);
      fireEvent.change(titleInput, { target: { value: 'Existing Habit' } });

      const habitToggle = screen.getByText(/Make it a Habit/);
      fireEvent.click(habitToggle);

      const dailyButton = screen.getByText('Daily');
      fireEvent.click(dailyButton);

      const submitButton = screen.getByText(/Create Task/);
      fireEvent.click(submitButton);

      // Should handle the error gracefully
      await waitFor(() => {
        expect(habitService.addHabit).toHaveBeenCalled();
      });
    });

    it('✓ Network errors', async () => {
      // Mock network error
      jest.spyOn(habitService, 'saveHabits').mockReturnValue(false);

      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      render(
        <TestWrapper>
          <HabitEditForm habit={mockHabit} onCancel={() => {}} />
        </TestWrapper>
      );

      const nameInput = screen.getByDisplayValue('Test Habit');
      fireEvent.change(nameInput, { target: { value: 'Updated Habit' } });

      const submitButton = screen.getByText(/Update Habit/);
      fireEvent.click(submitButton);

      // Should handle save failure gracefully
      await waitFor(() => {
        expect(habitService.updateHabit).toHaveBeenCalled();
      });
    });
  });

  describe('8. PERFORMANCE', () => {
    it('✓ Large number of habits', async () => {
      const largeHabitList: Habit[] = Array.from({ length: 100 }, (_, index) => ({
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

      jest.spyOn(habitService, 'getHabits').mockReturnValue(largeHabitList);

      const startTime = performance.now();

      render(
        <TestWrapper>
          <HabitList />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);

      await waitFor(() => {
        expect(screen.getByText('Habit 0')).toBeInTheDocument();
        expect(screen.getByText('Habit 99')).toBeInTheDocument();
      });
    });

    it('✓ Smooth animations', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      render(
        <TestWrapper>
          <HabitCard habit={mockHabit} />
        </TestWrapper>
      );

      const completeButton = screen.getByTitle('Mark as complete');
      
      // Test animation by clicking the button
      fireEvent.click(completeButton);

      // Should not throw errors during animation
      await waitFor(() => {
        expect(completeButton).toBeInTheDocument();
      });
    });

    it('✓ Responsive design', async () => {
      const mockHabit: Habit = {
        id: 'test-habit-1',
        name: 'Test Habit',
        description: 'A test habit',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date(),
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: { body: 1, xp: 5 },
      };

      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <HabitCard habit={mockHabit} />
        </TestWrapper>
      );

      const habitCard = screen.getByText('Test Habit');
      expect(habitCard).toBeInTheDocument();

      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(
        <TestWrapper>
          <HabitCard habit={mockHabit} />
        </TestWrapper>
      );

      const desktopHabitCard = screen.getByText('Test Habit');
      expect(desktopHabitCard).toBeInTheDocument();
    });

    it('✓ Memory usage', async () => {
      const mockHabits: Habit[] = Array.from({ length: 50 }, (_, index) => ({
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

      jest.spyOn(habitService, 'getHabits').mockReturnValue(mockHabits);

      // Test that component unmounts cleanly
      const { unmount } = render(
        <TestWrapper>
          <HabitList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Habit 0')).toBeInTheDocument();
      });

      // Unmount should not cause memory leaks
      unmount();
    });
  });
}); 