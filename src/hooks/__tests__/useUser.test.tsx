import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { useUser, UserProvider } from '../useUser';

// Mock the services
jest.mock('../../services/userService', () => ({
  userService: {
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
    addExperience: jest.fn(() => true),
    addStatRewards: jest.fn(() => true),
    updateUser: jest.fn(() => true),
  },
}));

jest.mock('../../services/storageService', () => ({
  storageService: {
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

// Test component to access hooks
const TestComponent = () => {
  const { user, addStatRewards } = useUser();

  return (
    <div>
      <div data-testid="user-stats">
        Body: {user?.body}, Mind: {user?.mind}, Soul: {user?.soul}
      </div>
      <button 
        data-testid="add-stat-rewards" 
        onClick={() => addStatRewards({ body: 1, mind: 1, xp: 10 })}
      >
        Add Stat Rewards
      </button>
    </div>
  );
};

describe('useUser - Stat Rewards', () => {
  it('should update user stats when addStatRewards is called', async () => {
    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Check initial stats
    expect(getByTestId('user-stats')).toHaveTextContent('Body: 0, Mind: 0, Soul: 0');

    // Add stat rewards
    act(() => {
      getByTestId('add-stat-rewards').click();
    });

    // Wait for state updates and check that stats were updated
    await waitFor(() => {
      expect(getByTestId('user-stats')).toHaveTextContent('Body: 1, Mind: 1, Soul: 0');
    });
  });
}); 