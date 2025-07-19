import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskCounter } from '../TaskCounter';
import { TaskProvider } from '../../hooks/useTasks';

describe('TaskCounter', () => {
  it('displays task count correctly', () => {
    render(
      <TaskProvider>
        <TaskCounter />
      </TaskProvider>
    );
    
    expect(screen.getByText(/Tasks Completed/i)).toBeInTheDocument();
    expect(screen.getByText('0 / 0')).toBeInTheDocument();
  });
}); 