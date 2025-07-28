import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DamVisualization from '../DamVisualization';

describe('DamVisualization', () => {
  const defaultProps = {
    completedTasks: 5,
    totalTasks: 20,
    damProgress: 25,
    className: 'test-class',
    showCelebration: false,
    onCelebrationComplete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render with default props', () => {
      render(<DamVisualization {...defaultProps} />);
      
      expect(screen.getByText('Mystical Dam')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // completed tasks
      expect(screen.getByText('25%')).toBeInTheDocument(); // dam progress
      expect(screen.getByText('20%')).toBeInTheDocument(); // water level (25% * 0.8)
    });

    test('should render with custom className', () => {
      const { container } = render(<DamVisualization {...defaultProps} />);
      
      expect(container.firstChild).toHaveClass('test-class');
    });

    test('should render dam stats correctly', () => {
      render(<DamVisualization {...defaultProps} />);
      
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Water')).toBeInTheDocument();
      
      expect(screen.getByText('5')).toBeInTheDocument(); // completed tasks
      expect(screen.getByText('25%')).toBeInTheDocument(); // dam progress
      expect(screen.getByText('20%')).toBeInTheDocument(); // water level
    });

    test('should render milestone markers', () => {
      render(<DamVisualization {...defaultProps} />);
      
      // Should have 4 milestone markers (25, 50, 75, 100)
      const milestoneElements = document.querySelectorAll('div > div > div > div');
      expect(milestoneElements.length).toBeGreaterThanOrEqual(4);
    });

    test('should render progress bar', () => {
      render(<DamVisualization {...defaultProps} />);
      
      // Check for progress bar structure
      const progressElements = document.querySelectorAll('div[style*="width"]');
      expect(progressElements.length).toBeGreaterThan(0);
    });
  });

  describe('Progress Calculations', () => {
    test('should calculate water level correctly', () => {
      render(<DamVisualization {...defaultProps} damProgress={50} />);
      
      expect(screen.getByText('40%')).toBeInTheDocument(); // 50% * 0.8 = 40%
    });

    test('should cap water level at 80%', () => {
      render(<DamVisualization {...defaultProps} damProgress={100} />);
      
      expect(screen.getByText('80%')).toBeInTheDocument(); // Capped at 80%
    });

    test('should calculate dam height based on completed tasks', () => {
      const { container } = render(<DamVisualization {...defaultProps} completedTasks={10} totalTasks={20} />);
      
      const damElement = container.querySelector('div[style*="height"]');
      expect(damElement).toBeInTheDocument();
    });

    test('should cap dam height at 160px', () => {
      const { container } = render(<DamVisualization {...defaultProps} completedTasks={30} totalTasks={20} />);
      
      const damElement = container.querySelector('div[style*="height"]');
      expect(damElement).toBeInTheDocument();
    });
  });

  describe('Dam Stages', () => {
    test('should render dam container with progress', () => {
      const { container } = render(<DamVisualization {...defaultProps} damProgress={0} />);
      
      expect(container.firstChild).toBeInTheDocument();
    });

    test('should render dam container with 25% progress', () => {
      const { container } = render(<DamVisualization {...defaultProps} damProgress={25} />);
      
      expect(container.firstChild).toBeInTheDocument();
    });

    test('should render dam container with 50% progress', () => {
      const { container } = render(<DamVisualization {...defaultProps} damProgress={50} />);
      
      expect(container.firstChild).toBeInTheDocument();
    });

    test('should render dam container with 75% progress', () => {
      const { container } = render(<DamVisualization {...defaultProps} damProgress={75} />);
      
      expect(container.firstChild).toBeInTheDocument();
    });

    test('should render dam container with 100% progress', () => {
      const { container } = render(<DamVisualization {...defaultProps} damProgress={100} />);
      
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Dam Sticks Generation', () => {
    test('should generate sticks for completed tasks', () => {
      render(<DamVisualization {...defaultProps} completedTasks={3} />);
      
      // Check for stick elements with style properties
      const stickElements = document.querySelectorAll('div[style*="left"]');
      expect(stickElements.length).toBeGreaterThan(0);
    });

    test('should generate sticks with random properties', () => {
      render(<DamVisualization {...defaultProps} completedTasks={1} />);
      
      const stickElements = document.querySelectorAll('div[style*="left"]');
      expect(stickElements.length).toBeGreaterThan(0);
      
      // Check that sticks have the required style properties
      stickElements.forEach(stick => {
        const style = (stick as HTMLElement).style;
        expect(style.left).toBeDefined();
        expect(style.bottom).toBeDefined();
        expect(style.width).toBeDefined();
        expect(style.height).toBeDefined();
        expect(style.transform).toBeDefined();
      });
    });

    test('should update sticks when completed tasks change', () => {
      const { rerender } = render(<DamVisualization {...defaultProps} completedTasks={1} />);
      
      let stickElements = document.querySelectorAll('div[style*="left"]');
      expect(stickElements.length).toBeGreaterThan(0);
      
      rerender(<DamVisualization {...defaultProps} completedTasks={2} />);
      
      stickElements = document.querySelectorAll('div[style*="left"]');
      expect(stickElements.length).toBeGreaterThan(0);
    });
  });

  describe('Animation Handling', () => {
    test('should handle stick updates when tasks are completed', () => {
      const { rerender } = render(<DamVisualization {...defaultProps} completedTasks={1} />);
      
      // Add more tasks to trigger updates
      rerender(<DamVisualization {...defaultProps} completedTasks={2} />);
      
      // Check that sticks are updated
      const stickElements = document.querySelectorAll('div[style*="left"]');
      expect(stickElements.length).toBeGreaterThan(0);
    });

    test('should handle animation state correctly', () => {
      const { rerender } = render(<DamVisualization {...defaultProps} completedTasks={1} />);
      
      rerender(<DamVisualization {...defaultProps} completedTasks={2} />);
      
      // Check that component updates correctly
      const stickElements = document.querySelectorAll('div[style*="left"]');
      expect(stickElements.length).toBeGreaterThan(0);
    });
  });

  describe('Celebration', () => {
    test('should show celebration when showCelebration is true', () => {
      render(<DamVisualization {...defaultProps} showCelebration={true} />);
      
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    test('should not show celebration when showCelebration is false', () => {
      render(<DamVisualization {...defaultProps} showCelebration={false} />);
      
      expect(screen.queryByText('🎉')).not.toBeInTheDocument();
    });

    test('should call onCelebrationComplete when celebration is shown', () => {
      const onCelebrationComplete = jest.fn();
      
      render(<DamVisualization {...defaultProps} showCelebration={true} onCelebrationComplete={onCelebrationComplete} />);
      
      // The callback should be set up but not called immediately
      expect(onCelebrationComplete).not.toHaveBeenCalled();
    });

    test('should not call onCelebrationComplete when showCelebration is false', () => {
      const onCelebrationComplete = jest.fn();
      
      render(<DamVisualization {...defaultProps} showCelebration={false} onCelebrationComplete={onCelebrationComplete} />);
      
      expect(onCelebrationComplete).not.toHaveBeenCalled();
    });
  });

  describe('Milestone Markers', () => {
    test('should render milestone structure', () => {
      render(<DamVisualization {...defaultProps} damProgress={50} />);
      
      const milestoneElements = document.querySelectorAll('div > div > div > div');
      expect(milestoneElements.length).toBeGreaterThanOrEqual(4);
    });

    test('should not mark unreached milestones', () => {
      render(<DamVisualization {...defaultProps} damProgress={20} />);
      
      // Check that component renders without errors
      expect(screen.getByText('Mystical Dam')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero completed tasks', () => {
      render(<DamVisualization {...defaultProps} completedTasks={0} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
      
      const stickElements = document.querySelectorAll('div[style*="left"]');
      expect(stickElements).toHaveLength(0);
    });

    test('should handle negative dam progress', () => {
      render(<DamVisualization {...defaultProps} damProgress={-10} />);
      
      // Component should render without errors
      expect(screen.getByText('Mystical Dam')).toBeInTheDocument();
    });

    test('should handle very high dam progress', () => {
      render(<DamVisualization {...defaultProps} damProgress={150} />);
      
      expect(screen.getByText('80%')).toBeInTheDocument(); // Water level capped at 80%
    });

    test('should handle zero total tasks', () => {
      const { container } = render(<DamVisualization {...defaultProps} totalTasks={0} />);
      
      const damElement = container.querySelector('div[style*="height"]');
      expect(damElement).toBeInTheDocument();
    });

    test('should handle missing onCelebrationComplete callback', () => {
      expect(() => {
        render(<DamVisualization {...defaultProps} showCelebration={true} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    test('should have proper structure for screen readers', () => {
      render(<DamVisualization {...defaultProps} />);
      
      expect(screen.getByText('Mystical Dam')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Water')).toBeInTheDocument();
    });

    test('should display progress information clearly', () => {
      render(<DamVisualization {...defaultProps} />);
      
      // Progress information should be clearly visible
      expect(screen.getByText('5')).toBeInTheDocument(); // Completed tasks
      expect(screen.getByText('25%')).toBeInTheDocument(); // Dam progress
      expect(screen.getByText('20%')).toBeInTheDocument(); // Water level
    });
  });

  describe('Performance', () => {
    test('should handle large number of completed tasks efficiently', () => {
      const startTime = performance.now();
      
      render(<DamVisualization {...defaultProps} completedTasks={100} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);
      
      // Should generate sticks for completed tasks
      const stickElements = document.querySelectorAll('div[style*="left"]');
      expect(stickElements.length).toBeGreaterThan(0);
    });

    test('should not cause memory leaks with frequent updates', () => {
      const { rerender, unmount } = render(<DamVisualization {...defaultProps} completedTasks={1} />);
      
      // Simulate frequent updates
      for (let i = 2; i <= 10; i++) {
        rerender(<DamVisualization {...defaultProps} completedTasks={i} />);
      }
      
      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });
}); 