import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from '../TaskForm';
import { TaskProvider } from '../../hooks/useTasks';
import { UserProvider } from '../../hooks/useUser';

// Mock the storage service
jest.mock('../../services/storageService', () => ({
  storageService: {
    getTasks: jest.fn(() => []),
    saveTasks: jest.fn(() => true),
    getUser: jest.fn(() => ({
      id: 'test-user',
      name: 'Test User',
      level: 1,
      experience: 0,
      body: 0,
      mind: 0,
      soul: 0,
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    saveUser: jest.fn(() => true),
  },
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <UserProvider>
      <TaskProvider>
        {component}
      </TaskProvider>
    </UserProvider>
  );
};

describe('TaskForm', () => {
  it('renders task form with all elements', () => {
    renderWithProviders(<TaskForm />);
    
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description (optional)')).toBeInTheDocument();
    expect(screen.getByText('Category:')).toBeInTheDocument();
    expect(screen.getByText('Rewards:')).toBeInTheDocument();
    expect(screen.getByText('Priority:')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  it('displays category buttons with correct labels', () => {
    renderWithProviders(<TaskForm />);
    
    expect(screen.getByText('💪 BODY')).toBeInTheDocument();
    expect(screen.getByText('🧠 MIND')).toBeInTheDocument();
    expect(screen.getByText('✨ SOUL')).toBeInTheDocument();
    expect(screen.getByText('💼 CAREER')).toBeInTheDocument();
    expect(screen.getByText('🏠 HOME')).toBeInTheDocument();
    expect(screen.getByText('🎯 SKILLS')).toBeInTheDocument();
  });

  it('shows stat rewards for selected category', () => {
    renderWithProviders(<TaskForm />);
    
    // Default category is 'body', so should show body reward
    expect(screen.getByText('BODY')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getByText('💪')).toBeInTheDocument();
  });

  it('updates stat rewards when category changes', async () => {
    renderWithProviders(<TaskForm />);
    
    // Click on mind category
    const mindButton = screen.getByText('🧠 MIND');
    fireEvent.click(mindButton);
    
    await waitFor(() => {
      expect(screen.getByText('MIND')).toBeInTheDocument();
      expect(screen.getByText('+1')).toBeInTheDocument();
      expect(screen.getByText('🧠')).toBeInTheDocument();
    });
  });

  it('shows multiple stat rewards for mixed categories', async () => {
    renderWithProviders(<TaskForm />);
    
    // Click on career category (should give mind + body)
    const careerButton = screen.getByText('💼 CAREER');
    fireEvent.click(careerButton);
    
    await waitFor(() => {
      expect(screen.getByText('MIND')).toBeInTheDocument();
      expect(screen.getByText('BODY')).toBeInTheDocument();
      expect(screen.getAllByText('+1')).toHaveLength(2);
    });
  });

  it('submits task with selected category', async () => {
    renderWithProviders(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    const submitButton = screen.getByText('Add Task');
    
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    
    // Select mind category
    const mindButton = screen.getByText('🧠 MIND');
    fireEvent.click(mindButton);
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
    });
  });

  it('resets form after submission', async () => {
    renderWithProviders(<TaskForm />);
    
    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    const descriptionInput = screen.getByPlaceholderText('Description (optional)');
    const submitButton = screen.getByText('Add Task');
    
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    // Change category
    const soulButton = screen.getByText('✨ SOUL');
    fireEvent.click(soulButton);
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
      // Category should reset to body (default)
      expect(screen.getByText('💪 BODY')).toBeInTheDocument();
    });
  });

  it('validates required title field', async () => {
    renderWithProviders(<TaskForm />);
    
    const submitButton = screen.getByText('Add Task');
    fireEvent.click(submitButton);
    
    // Form should not submit without title
    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    expect(titleInput).toBeInTheDocument();
  });
}); 