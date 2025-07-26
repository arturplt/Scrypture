import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HabitForm } from '../HabitForm';
import { useHabits } from '../../hooks/useHabits';

// Mock the hooks
jest.mock('../../hooks/useHabits', () => ({
  useHabits: jest.fn(),
}));

// Mock the AutoSaveIndicator component
jest.mock('../AutoSaveIndicator', () => ({
  AutoSaveIndicator: ({ isSaving }: { isSaving: boolean }) => (
    <div data-testid="auto-save-indicator">
      {isSaving ? 'Saving...' : 'Saved'}
    </div>
  ),
}));

const mockUseHabits = useHabits as jest.MockedFunction<typeof useHabits>;

const mockHabit = {
  id: '1',
  name: 'Test Habit',
  description: 'A test habit for editing',
  targetFrequency: 'daily' as const,
  categories: ['body'],
  streak: 5,
  bestStreak: 10,
  createdAt: new Date('2024-01-01'),
  lastCompleted: undefined,
  statRewards: { body: 1, mind: 0, soul: 0, xp: 5 },
};

describe('HabitForm', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseHabits.mockReturnValue({
      habits: [],
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });
  });

  it('renders habit form with auto-save indicator for new habit', () => {
    render(<HabitForm onClose={mockOnClose} />);
    
    expect(screen.getByText('Create New Habit')).toBeInTheDocument();
    expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('renders habit form with auto-save indicator for editing', () => {
    render(<HabitForm onClose={mockOnClose} habit={mockHabit} />);
    
    expect(screen.getByText('Edit Habit')).toBeInTheDocument();
    expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('shows saving state when isSaving is true', () => {
    mockUseHabits.mockReturnValue({
      habits: [],
      isSaving: true,
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    render(<HabitForm onClose={mockOnClose} />);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('creates new habit and triggers auto-save', async () => {
    const mockAddHabit = jest.fn();
    mockUseHabits.mockReturnValue({
      habits: [],
      isSaving: false,
      addHabit: mockAddHabit,
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    render(<HabitForm onClose={mockOnClose} />);
    
    const nameInput = screen.getByLabelText('Habit Name *');
    fireEvent.change(nameInput, { target: { value: 'New Habit' } });
    
    const descriptionInput = screen.getByLabelText('Description (Optional)');
    fireEvent.change(descriptionInput, { target: { value: 'A new habit description' } });
    
    const submitButton = screen.getByText('Create Habit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAddHabit).toHaveBeenCalledWith({
        name: 'New Habit',
        description: 'A new habit description',
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: {
          body: undefined,
          mind: undefined,
          soul: undefined,
          xp: undefined,
        },
      });
    });
  });

  it('updates existing habit and triggers auto-save', async () => {
    const mockUpdateHabit = jest.fn();
    mockUseHabits.mockReturnValue({
      habits: [mockHabit],
      isSaving: false,
      addHabit: jest.fn(),
      updateHabit: mockUpdateHabit,
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    render(<HabitForm onClose={mockOnClose} habit={mockHabit} />);
    
    const nameInput = screen.getByLabelText('Habit Name *');
    fireEvent.change(nameInput, { target: { value: 'Updated Habit' } });
    
    const submitButton = screen.getByText('Update Habit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockUpdateHabit).toHaveBeenCalledWith('1', {
        name: 'Updated Habit',
        description: 'A test habit for editing',
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: {
          body: 1,
          mind: undefined,
          soul: undefined,
          xp: 5,
        },
      });
    });
  });

  it('handles form validation - prevents submission with empty name', () => {
    const mockAddHabit = jest.fn();
    mockUseHabits.mockReturnValue({
      habits: [],
      isSaving: false,
      addHabit: mockAddHabit,
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    render(<HabitForm onClose={mockOnClose} />);
    
    const submitButton = screen.getByText('Create Habit');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Habit name is required')).toBeInTheDocument();
    expect(mockAddHabit).not.toHaveBeenCalled();
  });

  it('handles form validation - prevents submission with name too long', () => {
    const mockAddHabit = jest.fn();
    mockUseHabits.mockReturnValue({
      habits: [],
      isSaving: false,
      addHabit: mockAddHabit,
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    render(<HabitForm onClose={mockOnClose} />);
    
    const nameInput = screen.getByLabelText('Habit Name *');
    fireEvent.change(nameInput, { target: { value: 'a'.repeat(101) } });
    
    const submitButton = screen.getByText('Create Habit');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Habit name must be 100 characters or less')).toBeInTheDocument();
    expect(mockAddHabit).not.toHaveBeenCalled();
  });

  it('handles form validation - prevents submission with description too long', () => {
    const mockAddHabit = jest.fn();
    mockUseHabits.mockReturnValue({
      habits: [],
      isSaving: false,
      addHabit: mockAddHabit,
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    render(<HabitForm onClose={mockOnClose} />);
    
    const nameInput = screen.getByLabelText('Habit Name *');
    fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
    
    const descriptionInput = screen.getByLabelText('Description (Optional)');
    fireEvent.change(descriptionInput, { target: { value: 'a'.repeat(501) } });
    
    const submitButton = screen.getByText('Create Habit');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Description must be 500 characters or less')).toBeInTheDocument();
    expect(mockAddHabit).not.toHaveBeenCalled();
  });

  it('handles frequency selection', () => {
    render(<HabitForm onClose={mockOnClose} />);
    
    const frequencySelect = screen.getByLabelText('Frequency');
    fireEvent.change(frequencySelect, { target: { value: 'weekly' } });
    
    expect(frequencySelect).toHaveValue('weekly');
  });

  it('handles stat rewards input', () => {
    render(<HabitForm onClose={mockOnClose} />);
    
    const bodyInput = screen.getByLabelText('Body');
    fireEvent.change(bodyInput, { target: { value: '3' } });
    
    const mindInput = screen.getByLabelText('Mind');
    fireEvent.change(mindInput, { target: { value: '2' } });
    
    const soulInput = screen.getByLabelText('Soul');
    fireEvent.change(soulInput, { target: { value: '1' } });
    
    const xpInput = screen.getByLabelText('XP');
    fireEvent.change(xpInput, { target: { value: '10' } });
    
    expect(bodyInput).toHaveValue(3);
    expect(mindInput).toHaveValue(2);
    expect(soulInput).toHaveValue(1);
    expect(xpInput).toHaveValue(10);
  });

  it('handles close button click', () => {
    render(<HabitForm onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles cancel button click', () => {
    render(<HabitForm onClose={mockOnClose} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('clears errors when user starts typing', () => {
    render(<HabitForm onClose={mockOnClose} />);
    
    // Submit with empty name to trigger error
    const submitButton = screen.getByText('Create Habit');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Habit name is required')).toBeInTheDocument();
    
    // Start typing to clear error
    const nameInput = screen.getByLabelText('Habit Name *');
    fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
    
    expect(screen.queryByText('Habit name is required')).not.toBeInTheDocument();
  });

  it('pre-fills form when editing existing habit', () => {
    render(<HabitForm onClose={mockOnClose} habit={mockHabit} />);
    
    const nameInput = screen.getByLabelText('Habit Name *');
    const descriptionInput = screen.getByLabelText('Description (Optional)');
    const frequencySelect = screen.getByLabelText('Frequency');
    const bodyInput = screen.getByLabelText('Body');
    const mindInput = screen.getByLabelText('Mind');
    const soulInput = screen.getByLabelText('Soul');
    const xpInput = screen.getByLabelText('XP');
    
    expect(nameInput).toHaveValue('Test Habit');
    expect(descriptionInput).toHaveValue('A test habit for editing');
    expect(frequencySelect).toHaveValue('daily');
    expect(bodyInput).toHaveValue(1);
    expect(mindInput).toHaveValue(0);
    expect(soulInput).toHaveValue(0);
    expect(xpInput).toHaveValue(5);
  });

  it('handles habit without description', () => {
    const habitWithoutDescription = {
      ...mockHabit,
      description: undefined,
    };
    
    render(<HabitForm onClose={mockOnClose} habit={habitWithoutDescription} />);
    
    const descriptionInput = screen.getByLabelText('Description (Optional)');
    expect(descriptionInput).toHaveValue('');
  });

  it('handles habit without stat rewards', () => {
    const habitWithoutRewards = {
      ...mockHabit,
      statRewards: undefined,
    };
    
    render(<HabitForm onClose={mockOnClose} habit={habitWithoutRewards} />);
    
    const bodyInput = screen.getByLabelText('Body');
    const mindInput = screen.getByLabelText('Mind');
    const soulInput = screen.getByLabelText('Soul');
    const xpInput = screen.getByLabelText('XP');
    
    expect(bodyInput).toHaveValue(0);
    expect(mindInput).toHaveValue(0);
    expect(soulInput).toHaveValue(0);
    expect(xpInput).toHaveValue(0);
  });

  it('handles stat rewards with zero values', () => {
    const habitWithZeroRewards = {
      ...mockHabit,
      statRewards: { body: 0, mind: 0, soul: 0, xp: 0 },
    };
    
    render(<HabitForm onClose={mockOnClose} habit={habitWithZeroRewards} />);
    
    const bodyInput = screen.getByLabelText('Body');
    const mindInput = screen.getByLabelText('Mind');
    const soulInput = screen.getByLabelText('Soul');
    const xpInput = screen.getByLabelText('XP');
    
    expect(bodyInput).toHaveValue(0);
    expect(mindInput).toHaveValue(0);
    expect(soulInput).toHaveValue(0);
    expect(xpInput).toHaveValue(0);
  });

  it('submits form with trimmed values', async () => {
    const mockAddHabit = jest.fn();
    mockUseHabits.mockReturnValue({
      habits: [],
      isSaving: false,
      addHabit: mockAddHabit,
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    render(<HabitForm onClose={mockOnClose} />);
    
    const nameInput = screen.getByLabelText('Habit Name *');
    fireEvent.change(nameInput, { target: { value: '  Test Habit  ' } });
    
    const descriptionInput = screen.getByLabelText('Description (Optional)');
    fireEvent.change(descriptionInput, { target: { value: '  Test Description  ' } });
    
    const submitButton = screen.getByText('Create Habit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAddHabit).toHaveBeenCalledWith({
        name: 'Test Habit',
        description: 'Test Description',
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: {
          body: undefined,
          mind: undefined,
          soul: undefined,
          xp: undefined,
        },
      });
    });
  });

  it('handles empty description as undefined', async () => {
    const mockAddHabit = jest.fn();
    mockUseHabits.mockReturnValue({
      habits: [],
      isSaving: false,
      addHabit: mockAddHabit,
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    render(<HabitForm onClose={mockOnClose} />);
    
    const nameInput = screen.getByLabelText('Habit Name *');
    fireEvent.change(nameInput, { target: { value: 'Test Habit' } });
    
    const descriptionInput = screen.getByLabelText('Description (Optional)');
    fireEvent.change(descriptionInput, { target: { value: '   ' } });
    
    const submitButton = screen.getByText('Create Habit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAddHabit).toHaveBeenCalledWith({
        name: 'Test Habit',
        description: undefined,
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: {
          body: undefined,
          mind: undefined,
          soul: undefined,
          xp: undefined,
        },
      });
    });
  });

  it('handles different frequency types', () => {
    const weeklyHabit = {
      ...mockHabit,
      targetFrequency: 'weekly' as const,
    };
    
    render(<HabitForm onClose={mockOnClose} habit={weeklyHabit} />);
    
    const frequencySelect = screen.getByLabelText('Frequency');
    expect(frequencySelect).toHaveValue('weekly');
  });

  it('handles form submission with all stat rewards', async () => {
    const mockAddHabit = jest.fn();
    mockUseHabits.mockReturnValue({
      habits: [],
      isSaving: false,
      addHabit: mockAddHabit,
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
    });

    render(<HabitForm onClose={mockOnClose} />);
    
    const nameInput = screen.getByLabelText('Habit Name *');
    fireEvent.change(nameInput, { target: { value: 'Test Habit' } });
    
    const bodyInput = screen.getByLabelText('Body');
    fireEvent.change(bodyInput, { target: { value: '3' } });
    
    const mindInput = screen.getByLabelText('Mind');
    fireEvent.change(mindInput, { target: { value: '2' } });
    
    const soulInput = screen.getByLabelText('Soul');
    fireEvent.change(soulInput, { target: { value: '1' } });
    
    const xpInput = screen.getByLabelText('XP');
    fireEvent.change(xpInput, { target: { value: '15' } });
    
    const submitButton = screen.getByText('Create Habit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAddHabit).toHaveBeenCalledWith({
        name: 'Test Habit',
        description: undefined,
        targetFrequency: 'daily',
        categories: ['body'],
        statRewards: {
          body: 3,
          mind: 2,
          soul: 1,
          xp: 15,
        },
      });
    });
  });
}); 