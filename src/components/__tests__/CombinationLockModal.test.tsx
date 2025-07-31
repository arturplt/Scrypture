import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CombinationLockModal } from '../CombinationLockModal';

// Mock the Modal component
jest.mock('../Modal', () => ({
  Modal: ({ children, isOpen, onClose }: any) => 
    isOpen ? (
      <div data-testid="modal">
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    ) : null
}));

describe('CombinationLockModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUnlock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(
      <CombinationLockModal
        isOpen={true}
        onClose={mockOnClose}
        onUnlock={mockOnUnlock}
      />
    );

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('🔐 Secret Menu Access')).toBeInTheDocument();
    expect(screen.getByText('COMBINATION LOCK')).toBeInTheDocument();
    expect(screen.getByText('🔒 UNLOCK')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <CombinationLockModal
        isOpen={false}
        onClose={mockOnClose}
        onUnlock={mockOnUnlock}
      />
    );

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('starts with default combination 2136', () => {
    render(
      <CombinationLockModal
        isOpen={true}
        onClose={mockOnClose}
        onUnlock={mockOnUnlock}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('allows changing digits with up/down buttons', () => {
    render(
      <CombinationLockModal
        isOpen={true}
        onClose={mockOnClose}
        onUnlock={mockOnUnlock}
      />
    );

    const upButtons = screen.getAllByTitle('Increase');
    const downButtons = screen.getAllByTitle('Decrease');

    // Click the first up button to change 2 to 3
    fireEvent.click(upButtons[0]);
    expect(screen.getByText('3')).toBeInTheDocument();

    // Click the last down button to change 6 to 5
    fireEvent.click(downButtons[3]);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('unlocks with correct combination 2137', async () => {
    render(
      <CombinationLockModal
        isOpen={true}
        onClose={mockOnClose}
        onUnlock={mockOnUnlock}
      />
    );

    const upButtons = screen.getAllByTitle('Increase');
    
    // Change the last digit from 6 to 7
    fireEvent.click(upButtons[3]);

    // Click unlock button
    const unlockButton = screen.getByText('🔒 UNLOCK');
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(screen.getByText('🔓 UNLOCKED')).toBeInTheDocument();
    });

    // Should call onUnlock and onClose after a delay
    await waitFor(() => {
      expect(mockOnUnlock).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('shows error with incorrect combination', () => {
    render(
      <CombinationLockModal
        isOpen={true}
        onClose={mockOnClose}
        onUnlock={mockOnUnlock}
      />
    );

    // Click unlock button without changing anything (still 2136)
    const unlockButton = screen.getByText('🔒 UNLOCK');
    fireEvent.click(unlockButton);

    expect(screen.getByText('Attempts: 1')).toBeInTheDocument();
    expect(mockOnUnlock).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows hint text', () => {
    render(
      <CombinationLockModal
        isOpen={true}
        onClose={mockOnClose}
        onUnlock={mockOnUnlock}
      />
    );

    expect(screen.getByText('💡 Hint: Try moving just one number from the default position')).toBeInTheDocument();
  });

  it('handles Enter key press', async () => {
    render(
      <CombinationLockModal
        isOpen={true}
        onClose={mockOnClose}
        onUnlock={mockOnUnlock}
      />
    );

    const upButtons = screen.getAllByTitle('Increase');
    
    // Change the last digit from 6 to 7
    fireEvent.click(upButtons[3]);

    // Press Enter on the unlock button
    const unlockButton = screen.getByText('🔒 UNLOCK');
    fireEvent.keyPress(unlockButton, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('🔓 UNLOCKED')).toBeInTheDocument();
    });
  });
}); 