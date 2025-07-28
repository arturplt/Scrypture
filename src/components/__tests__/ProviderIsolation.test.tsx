import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserProvider } from '../../hooks/useUser';
import { TaskProvider } from '../../hooks/useTasks';
import { HabitProvider } from '../../hooks/useHabits';

describe('Provider isolation', () => {
  it('renders all providers and children', () => {
    render(
      <UserProvider>
        <TaskProvider>
          <HabitProvider>
            <div data-testid="test-content">Test Content</div>
          </HabitProvider>
        </TaskProvider>
      </UserProvider>
    );
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });
}); 