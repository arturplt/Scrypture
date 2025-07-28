import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StartHereModal } from '../StartHereModal';
import { TaskProvider } from '../../hooks/useTasks';
import { UserProvider } from '../../hooks/useUser';
import { HabitProvider } from '../../hooks/useHabits';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <UserProvider>
      <TaskProvider>
        <HabitProvider>
          {component}
        </HabitProvider>
      </TaskProvider>
    </UserProvider>
  );
};

describe('StartHereModal', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('renders when open', () => {
    renderWithProviders(
      <StartHereModal isOpen={true} onClose={jest.fn()} />
    );

    expect(screen.getByText('Start Here')).toBeInTheDocument();
    expect(screen.getByText('Mind')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Soul')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Free time')).toBeInTheDocument();
    expect(screen.getByText('Garden')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithProviders(
      <StartHereModal isOpen={false} onClose={jest.fn()} />
    );

    expect(screen.queryByText('Start Here')).not.toBeInTheDocument();
  });

  it('shows next task for each category', () => {
    renderWithProviders(
      <StartHereModal isOpen={true} onClose={jest.fn()} />
    );

    // Check that the first (easiest) tasks are shown
    expect(screen.getByText('Read 1 page')).toBeInTheDocument();
    expect(screen.getByText('Drink 1 glass of water')).toBeInTheDocument();
    expect(screen.getByText('Light 1 candle')).toBeInTheDocument();
    expect(screen.getByText('Make your bed')).toBeInTheDocument();
    expect(screen.getByText('Play 1 song')).toBeInTheDocument();
    expect(screen.getByText('Water 1 plant')).toBeInTheDocument();
  });

  it('shows difficulty level for each task', () => {
    renderWithProviders(
      <StartHereModal isOpen={true} onClose={jest.fn()} />
    );

    expect(screen.getAllByText(/Next Task \(Difficulty \d+\)/)).toHaveLength(6);
  });

  it('shows progress for each category', () => {
    renderWithProviders(
      <StartHereModal isOpen={true} onClose={jest.fn()} />
    );

    // Should show 0% progress initially for all 6 categories
    expect(screen.getAllByText('0%')).toHaveLength(6);
  });

  it('adds task when Add This Task button is clicked', async () => {
    renderWithProviders(
      <StartHereModal isOpen={true} onClose={jest.fn()} />
    );

    const addButtons = screen.getAllByText('Add This Task');
    fireEvent.click(addButtons[0]); // Click the first add button

    // The task should be added to the task list
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'startHereGivenTasks',
        JSON.stringify(['mind_0'])
      );
    });
  });

  it('supports multi-select functionality', () => {
    renderWithProviders(
      <StartHereModal isOpen={true} onClose={jest.fn()} />
    );

    // Click on multiple category cards to select them
    const mindCard = screen.getByText('Mind').closest('div');
    const bodyCard = screen.getByText('Body').closest('div');
    const homeCard = screen.getByText('Home').closest('div');

    fireEvent.click(mindCard!);
    fireEvent.click(bodyCard!);
    fireEvent.click(homeCard!);

    // Should show selected categories
    expect(screen.getByText('Selected categories: mind, body, home')).toBeInTheDocument();
    expect(screen.getByText('Add Tasks for All Selected Categories')).toBeInTheDocument();
  });

  it('adds multiple tasks when multi-select button is clicked', async () => {
    renderWithProviders(
      <StartHereModal isOpen={true} onClose={jest.fn()} />
    );

    // Select multiple categories
    const mindCard = screen.getByText('Mind').closest('div');
    const bodyCard = screen.getByText('Body').closest('div');

    fireEvent.click(mindCard!);
    fireEvent.click(bodyCard!);

    // Click the multi-add button
    const multiAddButton = screen.getByText('Add Tasks for All Selected Categories');
    fireEvent.click(multiAddButton);

    // Should save both tasks
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'startHereGivenTasks',
        JSON.stringify(['mind_0', 'body_0'])
      );
    });
  });

  it('closes modal when close button is clicked', () => {
    const mockOnClose = jest.fn();
    renderWithProviders(
      <StartHereModal isOpen={true} onClose={mockOnClose} />
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when overlay is clicked', () => {
    const mockOnClose = jest.fn();
    renderWithProviders(
      <StartHereModal isOpen={true} onClose={mockOnClose} />
    );

    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close modal when modal content is clicked', () => {
    const mockOnClose = jest.fn();
    renderWithProviders(
      <StartHereModal isOpen={true} onClose={mockOnClose} />
    );

    const modal = screen.getByTestId('modal-content');
    fireEvent.click(modal);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // This test is skipped due to issues with user service mocking
  it('loads saved progress from localStorage', () => {
    const savedTasks = ['mind_0', 'body_1'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTasks));

    renderWithProviders(
      <StartHereModal isOpen={true} onClose={jest.fn()} />
    );

    // Should show progress for completed tasks  
    expect(screen.getByText('7%')).toBeInTheDocument(); // mind progress
    expect(screen.getByText('10%')).toBeInTheDocument(); // body progress
  });

  it('saves progress to localStorage when task is added', async () => {
    renderWithProviders(
      <StartHereModal isOpen={true} onClose={jest.fn()} />
    );

    const addButtons = screen.getAllByText('Add This Task');
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'startHereGivenTasks',
        JSON.stringify(['mind_0'])
      );
    });
  });
}); 