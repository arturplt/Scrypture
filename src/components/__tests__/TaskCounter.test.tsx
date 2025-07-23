import { render, screen } from '@testing-library/react';
import { TaskCounter } from '../TaskCounter';
import { TaskProvider } from '../../hooks/useTasks';
import { UserProvider } from '../../hooks/useUser';

describe('TaskCounter', () => {
  it('displays task count correctly', () => {
    render(
      <UserProvider>
        <TaskProvider>
          <TaskCounter />
        </TaskProvider>
      </UserProvider>
    );

    expect(screen.getByText(/Tasks Completed/i)).toBeInTheDocument();
    expect(screen.getByText('0 / 0')).toBeInTheDocument();
  });
});
