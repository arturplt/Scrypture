import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserCreation } from '../UserCreation';
import { UserProvider } from '../../hooks/useUser';

// Mock the storage service
jest.mock('../../services/storageService', () => ({
  storageService: {
    getUser: jest.fn(() => null),
    saveUser: jest.fn(() => true),
  },
}));

const renderWithProvider = (component: React.ReactNode) => {
  return render(
    <UserProvider>
      {component}
    </UserProvider>
  );
};

describe('UserCreation', () => {
  it('renders user creation form when no user exists', () => {
    renderWithProvider(<UserCreation />);
    
    expect(screen.getByText('Welcome to Scrypture')).toBeInTheDocument();
    expect(screen.getByText('Create your character to begin your journey')).toBeInTheDocument();
    expect(screen.getByLabelText('Character Name')).toBeInTheDocument();
    expect(screen.getByText('Begin Your Journey')).toBeInTheDocument();
  });

  it('shows error for empty name', async () => {
    renderWithProvider(<UserCreation />);
    
    const input = screen.getByLabelText('Character Name');
    const submitButton = screen.getByText('Begin Your Journey');
    
    // Enter a single character to enable the button
    fireEvent.change(input, { target: { value: 'A' } });
    
    // Clear the input to trigger validation
    fireEvent.change(input, { target: { value: '' } });
    
    // The button should be disabled when input is empty
    expect(submitButton).toBeDisabled();
    
    // Enter a character to enable the button, then submit
    fireEvent.change(input, { target: { value: 'A' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();
    });
  });

  it('shows error for name too short', async () => {
    renderWithProvider(<UserCreation />);
    
    const input = screen.getByLabelText('Character Name');
    fireEvent.change(input, { target: { value: 'A' } });
    
    const submitButton = screen.getByText('Begin Your Journey');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();
    });
  });

  it('shows error for name too long', async () => {
    renderWithProvider(<UserCreation />);
    
    const input = screen.getByLabelText('Character Name');
    fireEvent.change(input, { target: { value: 'ThisNameIsWayTooLongForTheLimit' } });
    
    const submitButton = screen.getByText('Begin Your Journey');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name must be 20 characters or less')).toBeInTheDocument();
    });
  });

  it('enables submit button when valid name is entered', () => {
    renderWithProvider(<UserCreation />);
    
    const input = screen.getByLabelText('Character Name');
    const submitButton = screen.getByText('Begin Your Journey');
    
    expect(submitButton).toBeDisabled();
    
    fireEvent.change(input, { target: { value: 'TestUser' } });
    
    expect(submitButton).toBeEnabled();
  });

  it('displays journey information', () => {
    renderWithProvider(<UserCreation />);
    
    expect(screen.getByText('Your Journey Awaits')).toBeInTheDocument();
    expect(screen.getByText('Complete tasks to gain experience and level up')).toBeInTheDocument();
    expect(screen.getByText('Develop your Body, Mind, and Soul attributes')).toBeInTheDocument();
    expect(screen.getByText('Build habits and track your progress')).toBeInTheDocument();
    expect(screen.getByText('Unlock achievements as you grow stronger')).toBeInTheDocument();
  });

  it('calls onUserCreated callback when user is created', async () => {
    const mockOnUserCreated = jest.fn();
    renderWithProvider(<UserCreation onUserCreated={mockOnUserCreated} />);
    
    const input = screen.getByLabelText('Character Name');
    const submitButton = screen.getByText('Begin Your Journey');
    
    fireEvent.change(input, { target: { value: 'TestUser' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnUserCreated).toHaveBeenCalled();
    });
  });
}); 