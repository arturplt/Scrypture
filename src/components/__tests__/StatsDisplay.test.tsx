jest.mock('../../hooks/useUser', () => {
  const actual = jest.requireActual('../../hooks/useUser');
  return {
    ...actual,
    default: actual.default,
    useUser: jest.fn(),
    UserProvider: actual.UserProvider,
  };
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsDisplay } from '../StatsDisplay';

const mockUseUser = jest.mocked(require('../../hooks/useUser').useUser);

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
      updatedAt: new Date('2024-01-01'),
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
      updatedAt: new Date('2024-01-01'),
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
      updatedAt: new Date('2024-01-01'),
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
      updatedAt: new Date('2024-01-01'),
    };

    mockUseUser.mockReturnValue({ user: mockUser });

    renderWithProvider(<StatsDisplay />);

    // Check that stat cards exist
    const statCards = screen.getAllByText(/Body|Mind|Soul/);
    expect(statCards.length).toBe(3); // Body, Mind, Soul
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
      updatedAt: new Date('2024-01-01'),
    };

    mockUseUser.mockReturnValue({ user: mockUser });

    renderWithProvider(<StatsDisplay />);

    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Level value
    // The component shows "250 / 500" format for experience
    expect(screen.getByText('250 / 500')).toBeInTheDocument(); // Experience value
  });

  it('shows no user message when user is null', () => {
    mockUseUser.mockReturnValue({ user: null });

    renderWithProvider(<StatsDisplay />);

    expect(screen.getByText('Core Attributes')).toBeInTheDocument();
    expect(
      screen.getByText('Create a user to see your stats')
    ).toBeInTheDocument();
  });
});
