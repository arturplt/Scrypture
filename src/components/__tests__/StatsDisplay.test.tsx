import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsDisplay } from '../StatsDisplay';
import { UserProvider } from '../../hooks/useUser';
import { User } from '../../types';

// Mock the storage service
jest.mock('../../services/storageService', () => ({
  storageService: {
    getUser: jest.fn(),
    saveUser: jest.fn(() => true),
  },
}));

const mockUser: User = {
  id: '1',
  name: 'Test User',
  level: 5,
  experience: 250,
  body: 45,
  mind: 60,
  soul: 30,
  achievements: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const renderWithProvider = (component: React.ReactNode, user?: User) => {
  return render(
    <UserProvider>
      {component}
    </UserProvider>
  );
};

describe('StatsDisplay', () => {
  it('renders stats display with user data', () => {
    renderWithProvider(<StatsDisplay />);
    
    expect(screen.getByText('Core Attributes')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Mind')).toBeInTheDocument();
    expect(screen.getByText('Soul')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });

  it('displays correct stat values', () => {
    renderWithProvider(<StatsDisplay />);
    
    // Check that stat values are displayed
    expect(screen.getByText('45')).toBeInTheDocument(); // Body
    expect(screen.getByText('60')).toBeInTheDocument(); // Mind
    expect(screen.getByText('30')).toBeInTheDocument(); // Soul
    expect(screen.getByText('5')).toBeInTheDocument(); // Level
    expect(screen.getByText('250 XP')).toBeInTheDocument(); // Experience
  });

  it('displays stat icons', () => {
    renderWithProvider(<StatsDisplay />);
    
    expect(screen.getByText('💪')).toBeInTheDocument(); // Body icon
    expect(screen.getByText('🧠')).toBeInTheDocument(); // Mind icon
    expect(screen.getByText('✨')).toBeInTheDocument(); // Soul icon
  });

  it('shows progress bars for each stat', () => {
    renderWithProvider(<StatsDisplay />);
    
    // Check that progress containers exist
    const progressContainers = document.querySelectorAll('[class*="progressContainer"]');
    expect(progressContainers.length).toBe(3); // Body, Mind, Soul
  });

  it('displays level and experience information', () => {
    renderWithProvider(<StatsDisplay />);
    
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Level value
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('250 XP')).toBeInTheDocument(); // Experience value
  });
}); 