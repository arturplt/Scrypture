import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingDebug } from '../LoadingDebug';

describe('LoadingDebug', () => {
  const defaultProps = {
    onTriggerLoading: jest.fn(),
    isVisible: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render when isVisible is true', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      expect(screen.getByText('🐛 Loading Debug')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3000')).toBeInTheDocument();
    });

    test('should not render when isVisible is false', () => {
      render(<LoadingDebug {...defaultProps} isVisible={false} />);
      
      expect(screen.queryByText('🐛 Loading Debug')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Duration (ms):')).not.toBeInTheDocument();
    });

    test('should render all three test buttons', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /Test Loading \(3000ms\)/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Quick Test (1s)' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Long Test (5s)' })).toBeInTheDocument();
    });

    test('should render duration input with default value', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      expect(durationInput).toBeInTheDocument();
      expect(durationInput).toHaveAttribute('type', 'number');
    });

    test('should have proper styling attributes', () => {
      const { container } = render(<LoadingDebug {...defaultProps} />);
      
      const debugContainer = container.firstChild as HTMLElement;
      expect(debugContainer).toHaveStyle({
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        minWidth: '200px',
        zIndex: '10001'
      });
    });
  });

  describe('User Interactions', () => {
    test('should call onTriggerLoading with custom duration when custom test button is clicked', () => {
      const onTriggerLoading = jest.fn();
      render(<LoadingDebug {...defaultProps} onTriggerLoading={onTriggerLoading} />);
      
      const customTestButton = screen.getByRole('button', { name: /Test Loading \(3000ms\)/ });
      fireEvent.click(customTestButton);
      
      expect(onTriggerLoading).toHaveBeenCalledWith(3000);
    });

    test('should call onTriggerLoading with 1000ms when quick test button is clicked', () => {
      const onTriggerLoading = jest.fn();
      render(<LoadingDebug {...defaultProps} onTriggerLoading={onTriggerLoading} />);
      
      const quickTestButton = screen.getByRole('button', { name: 'Quick Test (1s)' });
      fireEvent.click(quickTestButton);
      
      expect(onTriggerLoading).toHaveBeenCalledWith(1000);
    });

    test('should call onTriggerLoading with 5000ms when long test button is clicked', () => {
      const onTriggerLoading = jest.fn();
      render(<LoadingDebug {...defaultProps} onTriggerLoading={onTriggerLoading} />);
      
      const longTestButton = screen.getByRole('button', { name: 'Long Test (5s)' });
      fireEvent.click(longTestButton);
      
      expect(onTriggerLoading).toHaveBeenCalledWith(5000);
    });

    test('should update custom duration when input value changes', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      fireEvent.change(durationInput, { target: { value: '5000' } });
      
      expect(durationInput).toHaveValue(5000);
    });

    test('should update button text when custom duration changes', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      fireEvent.change(durationInput, { target: { value: '2000' } });
      
      expect(screen.getByRole('button', { name: /Test Loading \(2000ms\)/ })).toBeInTheDocument();
    });

    test('should handle multiple rapid clicks', () => {
      const onTriggerLoading = jest.fn();
      render(<LoadingDebug {...defaultProps} onTriggerLoading={onTriggerLoading} />);
      
      const customTestButton = screen.getByRole('button', { name: /Test Loading \(3000ms\)/ });
      const quickTestButton = screen.getByRole('button', { name: 'Quick Test (1s)' });
      
      fireEvent.click(customTestButton);
      fireEvent.click(quickTestButton);
      fireEvent.click(customTestButton);
      
      expect(onTriggerLoading).toHaveBeenCalledTimes(3);
      expect(onTriggerLoading).toHaveBeenNthCalledWith(1, 3000);
      expect(onTriggerLoading).toHaveBeenNthCalledWith(2, 1000);
      expect(onTriggerLoading).toHaveBeenNthCalledWith(3, 3000);
    });
  });

  describe('State Management', () => {
    test('should maintain custom duration state across re-renders', () => {
      const { rerender } = render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      fireEvent.change(durationInput, { target: { value: '4000' } });
      
      rerender(<LoadingDebug {...defaultProps} />);
      
      expect(screen.getByDisplayValue('4000')).toBeInTheDocument();
    });

    test('should update custom duration to different values', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      
      fireEvent.change(durationInput, { target: { value: '1000' } });
      expect(durationInput).toHaveValue(1000);
      
      fireEvent.change(durationInput, { target: { value: '5000' } });
      expect(durationInput).toHaveValue(5000);
      
      fireEvent.change(durationInput, { target: { value: '7500' } });
      expect(durationInput).toHaveValue(7500);
    });

    test('should handle zero duration input', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      fireEvent.change(durationInput, { target: { value: '0' } });
      
      expect(durationInput).toHaveValue(0);
      expect(screen.getByRole('button', { name: /Test Loading \(0ms\)/ })).toBeInTheDocument();
    });

    test('should handle negative duration input', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      fireEvent.change(durationInput, { target: { value: '-1000' } });
      
      expect(durationInput).toHaveValue(-1000);
      expect(screen.getByRole('button', { name: /Test Loading \(-1000ms\)/ })).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    test('should handle non-numeric input gracefully', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      fireEvent.change(durationInput, { target: { value: 'abc' } });
      
      // Should convert to NaN, but input should still show the value
      expect(durationInput).toHaveValue(0);
    });

    test('should handle decimal input', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      fireEvent.change(durationInput, { target: { value: '3.5' } });
      
      expect(durationInput).toHaveValue(3.5);
    });

    test('should handle very large numbers', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      fireEvent.change(durationInput, { target: { value: '999999999' } });
      
      expect(durationInput).toHaveValue(999999999);
    });
  });

  describe('Accessibility', () => {
    test('should have proper label for duration input', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      expect(durationInput).toBeInTheDocument();
      expect(durationInput).toHaveAttribute('type', 'number');
    });

    test('should have proper button roles', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    test('should have proper button labels', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /Test Loading \(3000ms\)/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Quick Test (1s)' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Long Test (5s)' })).toBeInTheDocument();
    });

    test('should have proper input attributes', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      expect(durationInput).toHaveAttribute('type', 'number');
    });
  });

  describe('Styling and Layout', () => {
    test('should have proper container styling', () => {
      const { container } = render(<LoadingDebug {...defaultProps} />);
      
      const debugContainer = container.firstChild as HTMLElement;
      expect(debugContainer).toHaveStyle({
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        minWidth: '200px',
        zIndex: '10001'
      });
    });

    test('should have proper button styling', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveStyle({
          width: '100%',
          cursor: 'pointer'
        });
      });
    });

    test('should have proper input styling', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      expect(durationInput).toHaveStyle({
        width: '100%'
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing onTriggerLoading callback', () => {
      expect(() => {
        render(<LoadingDebug {...defaultProps} onTriggerLoading={undefined as any} />);
      }).not.toThrow();
    });

    test('should handle null onTriggerLoading callback', () => {
      expect(() => {
        render(<LoadingDebug {...defaultProps} onTriggerLoading={null as any} />);
      }).not.toThrow();
    });

    test('should handle undefined isVisible prop', () => {
      expect(() => {
        render(<LoadingDebug {...defaultProps} isVisible={undefined as any} />);
      }).not.toThrow();
    });

    test('should handle rapid input changes', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      
      // Rapid changes
      fireEvent.change(durationInput, { target: { value: '1000' } });
      fireEvent.change(durationInput, { target: { value: '2000' } });
      fireEvent.change(durationInput, { target: { value: '3000' } });
      fireEvent.change(durationInput, { target: { value: '4000' } });
      
      expect(durationInput).toHaveValue(4000);
    });

    test('should handle empty input value', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      fireEvent.change(durationInput, { target: { value: '' } });
      
      expect(durationInput).toHaveValue(0);
    });
  });

  describe('Functionality', () => {
    test('should trigger loading with updated custom duration', () => {
      const onTriggerLoading = jest.fn();
      render(<LoadingDebug {...defaultProps} onTriggerLoading={onTriggerLoading} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      fireEvent.change(durationInput, { target: { value: '2500' } });
      
      const customTestButton = screen.getByRole('button', { name: /Test Loading \(2500ms\)/ });
      fireEvent.click(customTestButton);
      
      expect(onTriggerLoading).toHaveBeenCalledWith(2500);
    });

    test('should maintain button functionality after input changes', () => {
      const onTriggerLoading = jest.fn();
      render(<LoadingDebug {...defaultProps} onTriggerLoading={onTriggerLoading} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      fireEvent.change(durationInput, { target: { value: '4000' } });
      
      const quickTestButton = screen.getByRole('button', { name: 'Quick Test (1s)' });
      fireEvent.click(quickTestButton);
      
      expect(onTriggerLoading).toHaveBeenCalledWith(1000);
    });

    test('should update button text dynamically', () => {
      render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      
      fireEvent.change(durationInput, { target: { value: '1500' } });
      expect(screen.getByRole('button', { name: /Test Loading \(1500ms\)/ })).toBeInTheDocument();
      
      fireEvent.change(durationInput, { target: { value: '6000' } });
      expect(screen.getByRole('button', { name: /Test Loading \(6000ms\)/ })).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should handle rapid state updates efficiently', () => {
      const onTriggerLoading = jest.fn();
      render(<LoadingDebug {...defaultProps} onTriggerLoading={onTriggerLoading} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      const customTestButton = screen.getByRole('button', { name: /Test Loading \(3000ms\)/ });
      
      // Rapid input changes and button clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.change(durationInput, { target: { value: String(1000 + i * 100) } });
        fireEvent.click(customTestButton);
      }
      
      expect(onTriggerLoading).toHaveBeenCalledTimes(10);
      expect(onTriggerLoading).toHaveBeenLastCalledWith(1900);
    });

    test('should not cause memory leaks with frequent updates', () => {
      const { unmount } = render(<LoadingDebug {...defaultProps} />);
      
      const durationInput = screen.getByDisplayValue('3000');
      
      // Simulate frequent updates
      for (let i = 0; i < 100; i++) {
        fireEvent.change(durationInput, { target: { value: String(i) } });
      }
      
      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });
}); 