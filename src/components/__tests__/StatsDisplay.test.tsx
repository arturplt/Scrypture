import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsDisplay } from '../StatsDisplay';
import { UserProvider } from '../../hooks/useUser';

// Mock the useUser hook
jest.mock('../../hooks/useUser', () => ({
  useUser: jest.fn(),
  UserProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const mockUseUser = require('../../hooks/useUser').useUser;

const renderWithProvider = (component: React.ReactElement) => {
  return render(component);
};

describe('StatsDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders stats display with user data', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      level: 5,
      experience: 250,
      body: 45,
      mind: 60,
      soul: 30,
      achievements: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    mockUseUser.mockReturnValue({ user: mockUser });

    renderWithProvider(<StatsDisplay />);

    expect(screen.getByText('Core Attributes')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Mind')).toBeInTheDocument();
    expect(screen.getByText('Soul')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
  });

  it('displays correct stat values', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      level: 5,
      experience: 250,
      body: 45,
      mind: 60,
      soul: 30,
      achievements: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    mockUseUser.mockReturnValue({ user: mockUser });

    renderWithProvider(<StatsDisplay />);

    // Check that stat values are displayed
    expect(screen.getByText('45')).toBeInTheDocument(); // Body
    expect(screen.getByText('60')).toBeInTheDocument(); // Mind
    expect(screen.getByText('30')).toBeInTheDocument(); // Soul
    expect(screen.getByText('5')).toBeInTheDocument(); // Level
  });

  it('displays stat icons', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      level: 5,
      experience: 250,
      body: 45,
      mind: 60,
      soul: 30,
      achievements: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    mockUseUser.mockReturnValue({ user: mockUser });

    renderWithProvider(<StatsDisplay />);

    expect(screen.getByText('💪')).toBeInTheDocument(); // Body icon
    expect(screen.getByText('🧠')).toBeInTheDocument(); // Mind icon
    expect(screen.getByText('✨')).toBeInTheDocument(); // Soul icon
  });

  it('shows progress bars for each stat', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      level: 5,
      experience: 250,
      body: 45,
      mind: 60,
      soul: 30,
      achievements: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    mockUseUser.mockReturnValue({ user: mockUser });

    renderWithProvider(<StatsDisplay />);

    // Check that progress containers exist
    const progressContainers = document.querySelectorAll('[class*="progressContainer"]'); 
    expect(progressContainers.length).toBe(3); // Body, Mind, Soul
  });

  it('displays level and experience information', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      level: 5,
      experience: 250,
      body: 45,
      mind: 60,
      soul: 30,
      achievements: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    mockUseUser.mockReturnValue({ user: mockUser });

    renderWithProvider(<StatsDisplay />);

    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Level value
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('250 XP')).toBeInTheDocument(); // Experience value
  });

  it('shows no user message when user is null', () => {
    mockUseUser.mockReturnValue({ user: null });

    renderWithProvider(<StatsDisplay />);

    expect(screen.getByText('Core Attributes')).toBeInTheDocument();
    expect(screen.getByText('Create a user to see your stats')).toBeInTheDocument();
  });
}); 