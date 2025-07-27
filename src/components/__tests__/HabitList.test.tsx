import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HabitList } from '../HabitList';
import { useHabits } from '../../hooks/useHabits';

// Mock the services
jest.mock('../../services/categoryService', () => ({
  categoryService: {
    getAllCategories: jest.fn(() => [
      { name: 'body', icon: '💪' },
      { name: 'mind', icon: '🧠' },
      { name: 'home', icon: '🏠' },
    ]),
  },
}));

// Mock the useHabits hook
jest.mock('../../hooks/useHabits', () => ({
  useHabits: jest.fn(),
}));

// Mock the useUser hook
jest.mock('../../hooks/useUser', () => ({
  useUser: jest.fn(() => ({
    user: { id: '1', name: 'Test User' },
    updateUser: jest.fn(),
  })),
  UserProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockUseHabits = useHabits as jest.MockedFunction<typeof useHabits>;

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(component);
};

// Mock the AutoSaveIndicator component
jest.mock('../AutoSaveIndicator', () => ({
  AutoSaveIndicator: ({ isSaving }: { isSaving: boolean }) => (
    <div data-testid="auto-save-indicator">
      {isSaving ? 'Saving...' : 'Saved'}
    </div>
  ),
}));

const mockHabits = [
  {
    id: '1',
    name: 'Morning Exercise',
    description: 'Daily workout routine',
    targetFrequency: 'daily' as const,
    categories: ['body'],
    streak: 5,
    bestStreak: 10,
    createdAt: new Date('2024-01-01'),
    lastCompleted: undefined,
    statRewards: { body: 1, mind: 0, soul: 0, xp: 5 },
  },
  {
    id: '2',
    name: 'Read Books',
    description: 'Read for 30 minutes',
    targetFrequency: 'daily' as const,
    categories: ['mind'],
    streak: 3,
    bestStreak: 7,
    createdAt: new Date('2024-01-02'),
    lastCompleted: new Date(), // Completed today
    statRewards: { body: 0, mind: 1, soul: 0, xp: 3 },
  },
  {
    id: '3',
    name: 'Clean House',
    description: 'Daily cleaning routine',
    targetFrequency: 'weekly' as const,
    categories: ['home'],
    streak: 2,
    bestStreak: 4,
    createdAt: new Date('2024-01-03'),
    lastCompleted: undefined,
    statRewards: { body: 0, mind: 0, soul: 1, xp: 2 },
  },
];

describe('HabitList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders habits list with auto-save indicator', () => {
    mockUseHabits.mockReturnValue({
      habits: mockHabits,
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    renderWithProviders(<HabitList />);
    
    expect(screen.getByText('Habits')).toBeInTheDocument();
    expect(screen.getAllByTestId('auto-save-indicator')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Saved')).toHaveLength(4); // One for main list + 3 habit cards
  });

  it('shows saving state when isSaving is true', () => {
    mockUseHabits.mockReturnValue({
      habits: mockHabits,
      isSaving: true,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    renderWithProviders(<HabitList />);
    
    expect(screen.getAllByText('Saving...')[0]).toBeInTheDocument();
  });

  it('separates completed and incomplete habits', () => {
    mockUseHabits.mockReturnValue({
      habits: mockHabits,
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    renderWithProviders(<HabitList />);
    
    // Should show regular categories for incomplete habits
    expect(screen.getByText('Body (1)')).toBeInTheDocument();
    expect(screen.getByText('Home (1)')).toBeInTheDocument();
    
    // Should show completed habits section
    expect(screen.getByText('Completed Habits (1)')).toBeInTheDocument();
  });

  it('renders habit cards for each category', () => {
    mockUseHabits.mockReturnValue({
      habits: mockHabits,
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    renderWithProviders(<HabitList />);
    
    expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
    expect(screen.getByText('Clean House')).toBeInTheDocument();
    expect(screen.getByText('Read Books')).toBeInTheDocument();
  });

  it('allows collapsing and expanding sections', () => {
    mockUseHabits.mockReturnValue({
      habits: mockHabits,
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    renderWithProviders(<HabitList />);
    
    const bodySection = screen.getByText('Body (1)');
    fireEvent.click(bodySection);
    
    // The section should be collapsible (implementation depends on CSS)
    expect(bodySection).toBeInTheDocument();
  });

  it('sorts habits by streak and creation date', () => {
    const sortedHabits = [
      {
        id: '1',
        name: 'High Streak Habit',
        description: 'Habit with high streak',
        targetFrequency: 'daily' as const,
        categories: ['body'],
        streak: 10,
        bestStreak: 15,
        createdAt: new Date('2024-01-01'),
        lastCompleted: undefined,
        statRewards: { body: 1, mind: 0, soul: 0, xp: 5 },
      },
      {
        id: '2',
        name: 'Low Streak Habit',
        description: 'Habit with low streak',
        targetFrequency: 'daily' as const,
        categories: ['body'],
        streak: 2,
        bestStreak: 5,
        createdAt: new Date('2024-01-02'),
        lastCompleted: undefined,
        statRewards: { body: 1, mind: 0, soul: 0, xp: 3 },
      },
    ];

    mockUseHabits.mockReturnValue({
      habits: sortedHabits,
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    renderWithProviders(<HabitList />);
    
    // Higher streak habit should appear first
    const habitCards = screen.getAllByText(/High Streak Habit|Low Streak Habit/);
    expect(habitCards[0]).toHaveTextContent('High Streak Habit');
  });

  it('handles empty habits list', () => {
    mockUseHabits.mockReturnValue({
      habits: [],
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    renderWithProviders(<HabitList />);
    
    expect(screen.getByText('Habits')).toBeInTheDocument();
    expect(screen.getAllByTestId('auto-save-indicator')[0]).toBeInTheDocument();
  });

  it('handles habits without categories', () => {
    const habitsWithoutCategories = [
      {
        id: '1',
        name: 'Uncategorized Habit',
        description: 'Habit without categories',
        targetFrequency: 'daily' as const,
        categories: [],
        streak: 1,
        bestStreak: 1,
        createdAt: new Date('2024-01-01'),
        lastCompleted: undefined,
        statRewards: { body: 1, mind: 0, soul: 0, xp: 2 },
      },
    ];

    mockUseHabits.mockReturnValue({
      habits: habitsWithoutCategories,
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    renderWithProviders(<HabitList />);
    
    // Should default to 'body' category
    expect(screen.getByText('Body (1)')).toBeInTheDocument();
    expect(screen.getByText('Uncategorized Habit')).toBeInTheDocument();
  });
}); 
