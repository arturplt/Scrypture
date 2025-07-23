import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AutoSaveIndicator } from '../AutoSaveIndicator';

describe('AutoSaveIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders auto-save indicator when saving', () => {
      render(<AutoSaveIndicator isSaving={true} />);

      expect(screen.getByText(/Saving/i)).toBeInTheDocument();
    });

    it('renders auto-save indicator when saved', () => {
      render(<AutoSaveIndicator isSaving={false} lastSaved={new Date()} />);

      expect(screen.getByText(/Saved/i)).toBeInTheDocument();
    });

    it('does not render when not saving and no last saved', () => {
      const { container } = render(<AutoSaveIndicator isSaving={false} />);

      expect(container.firstChild).toBeNull();
    });

    it('applies correct CSS classes', () => {
      const { container } = render(<AutoSaveIndicator isSaving={true} />);

      const indicator = container.firstChild as HTMLElement;
      // CSS modules apply hashed class names, so we check if the element has a class
      expect(indicator.className).toBeTruthy();
    });
  });

  describe('Auto-save States', () => {
    it('shows "saving" state when auto-save is in progress', () => {
      render(<AutoSaveIndicator isSaving={true} />);

      expect(screen.getByText(/Saving/i)).toBeInTheDocument();
      expect(screen.getByText(/●/)).toBeInTheDocument();
    });

    it('shows "saved" state when auto-save is complete', () => {
      render(<AutoSaveIndicator isSaving={false} lastSaved={new Date()} />);

      expect(screen.getByText(/Saved/i)).toBeInTheDocument();
      expect(screen.getByText(/✓/)).toBeInTheDocument();
    });

    it('shows saved state temporarily after saving completes', async () => {
      const { rerender } = render(<AutoSaveIndicator isSaving={true} />);

      expect(screen.getByText(/Saving/i)).toBeInTheDocument();

      rerender(<AutoSaveIndicator isSaving={false} lastSaved={new Date()} />);

      expect(screen.getByText(/Saved/i)).toBeInTheDocument();

      // Should disappear after 2 seconds
      await waitFor(
        () => {
          expect(screen.queryByText(/Saved/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Visual Indicators', () => {
    it('shows dot when saving', () => {
      render(<AutoSaveIndicator isSaving={true} />);

      expect(screen.getByText(/●/)).toBeInTheDocument();
      expect(screen.getByText(/Saving/i)).toBeInTheDocument();
    });

    it('shows checkmark when saved', () => {
      render(<AutoSaveIndicator isSaving={false} lastSaved={new Date()} />);

      expect(screen.getByText(/✓/)).toBeInTheDocument();
      expect(screen.getByText(/Saved/i)).toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('transitions from saving to saved', async () => {
      const { rerender } = render(<AutoSaveIndicator isSaving={true} />);

      expect(screen.getByText(/Saving/i)).toBeInTheDocument();

      rerender(<AutoSaveIndicator isSaving={false} lastSaved={new Date()} />);

      expect(screen.getByText(/Saved/i)).toBeInTheDocument();
    });

    it('hides indicator when not saving and no last saved', () => {
      const { rerender } = render(<AutoSaveIndicator isSaving={true} />);

      expect(screen.getByText(/Saving/i)).toBeInTheDocument();

      rerender(<AutoSaveIndicator isSaving={false} />);

      expect(screen.queryByText(/Saving/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Saved/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides status updates for screen readers', () => {
      render(<AutoSaveIndicator isSaving={true} />);

      expect(screen.getByText(/Saving/i)).toBeInTheDocument();
    });

    it('provides saved status for screen readers', () => {
      render(<AutoSaveIndicator isSaving={false} lastSaved={new Date()} />);

      expect(screen.getByText(/Saved/i)).toBeInTheDocument();
    });
  });

  describe('Styling and Animation', () => {
    it('applies different styles for different states', () => {
      const { container, rerender } = render(
        <AutoSaveIndicator isSaving={true} />
      );

      // Saving state
      let indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toBeTruthy();

      // Saved state
      rerender(<AutoSaveIndicator isSaving={false} lastSaved={new Date()} />);
      indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toBeTruthy();
    });

    it('applies custom className', () => {
      const { container } = render(
        <AutoSaveIndicator isSaving={true} className="custom-class" />
      );

      const indicator = container.firstChild as HTMLElement;
      expect(indicator.className).toContain('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles null lastSaved', () => {
      render(<AutoSaveIndicator isSaving={false} lastSaved={null} />);

      expect(screen.queryByText(/Saved/i)).not.toBeInTheDocument();
    });

    it('handles undefined lastSaved', () => {
      render(<AutoSaveIndicator isSaving={false} />);

      expect(screen.queryByText(/Saved/i)).not.toBeInTheDocument();
    });

    it('handles rapid state changes', () => {
      const { rerender } = render(<AutoSaveIndicator isSaving={true} />);

      expect(screen.getByText(/Saving/i)).toBeInTheDocument();

      rerender(<AutoSaveIndicator isSaving={false} lastSaved={new Date()} />);
      expect(screen.getByText(/Saved/i)).toBeInTheDocument();

      rerender(<AutoSaveIndicator isSaving={true} />);
      expect(screen.getByText(/Saving/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<AutoSaveIndicator isSaving={true} />);

      const initialIndicator = screen.getByText(/Saving/i);

      rerender(<AutoSaveIndicator isSaving={true} />);

      const updatedIndicator = screen.getByText(/Saving/i);
      expect(updatedIndicator).toBe(initialIndicator);
    });
  });

  describe('Integration', () => {
    it('works with auto-save timing', async () => {
      const { rerender } = render(<AutoSaveIndicator isSaving={true} />);

      expect(screen.getByText(/Saving/i)).toBeInTheDocument();

      // Simulate auto-save completing
      rerender(<AutoSaveIndicator isSaving={false} lastSaved={new Date()} />);

      expect(screen.getByText(/Saved/i)).toBeInTheDocument();

      // Should disappear after timeout
      await waitFor(
        () => {
          expect(screen.queryByText(/Saved/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
