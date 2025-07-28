import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BobrPen from '../BobrPen';
import { User } from '../../types';
import { UserProvider } from '../../hooks/useUser';
import { TaskProvider } from '../../hooks/useTasks';
import { HabitProvider } from '../../hooks/useHabits';

// Mock CSS modules to return the class names
jest.mock('../BobrPen.module.css', () => ({
  __esModule: true,
  default: {
    bobrPen: 'bobrPen',
    collapsed: 'collapsed',
    expanded: 'expanded',
    toggleButton: 'toggleButton',
    companionContainer: 'companionContainer',
    activeSection: 'activeSection',
    tabs: 'tabs',
    tab: 'tab',
    activeTab: 'activeTab',
  },
}));

// Mock the child components
jest.mock('../BobrCompanion', () => {
  return function MockBobrCompanion({ user, completedTasksCount }: any) {
    return (
      <div data-testid="bobr-companion">
        Bobr Companion - Level {user.level} - Tasks: {completedTasksCount}
      </div>
    );
  };
});

jest.mock('../DamVisualization', () => {
  return function MockDamVisualization({ user, completedTasksCount }: any) {
    return (
      <div data-testid="dam-visualization">
        Dam Visualization - Progress: {user.damProgress}% - Tasks: {completedTasksCount}
      </div>
    );
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <UserProvider>
      <TaskProvider>
        <HabitProvider>
          {component}
        </HabitProvider>
      </TaskProvider>
    </UserProvider>
  );
};

describe('BobrPen', () => {
  const createMockUser = (level: number, damProgress: number = 50): User => ({
    id: 'test-user',
    name: 'Test User',
    level,
    experience: level * 100,
    body: 10,
    mind: 15,
    soul: 8,
    achievements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    bobrStage: level <= 3 ? 'hatchling' : level <= 7 ? 'young' : 'mature',
    damProgress,
  });

  const defaultProps = {
    user: createMockUser(1),
    completedTasksCount: 5,
  };

  describe('Initial render', () => {
    it('should render the pen header', () => {
      renderWithProviders(<BobrPen {...defaultProps} />);
      
      expect(screen.getByText('🏡')).toBeInTheDocument();
      expect(screen.getByText('Dam & Sanctuary')).toBeInTheDocument();
    });

    it('should render collapsed by default', () => {
      renderWithProviders(<BobrPen {...defaultProps} />);
      
      const collapseButton = screen.getByTitle('Expand');
      expect(collapseButton).toBeInTheDocument();
      expect(collapseButton).toHaveTextContent('▼');
    });

    it('should not show content when collapsed', () => {
      renderWithProviders(<BobrPen {...defaultProps} />);
      
      expect(screen.queryByTestId('bobr-companion')).not.toBeInTheDocument();
      expect(screen.queryByTestId('dam-visualization')).not.toBeInTheDocument();
    });
  });

  describe('Expand/Collapse functionality', () => {
    it('should expand when collapse button is clicked', () => {
      renderWithProviders(<BobrPen {...defaultProps} />);
      
      const collapseButton = screen.getByTitle('Expand');
      fireEvent.click(collapseButton);
      
      expect(screen.getByTitle('Collapse')).toBeInTheDocument();
      expect(screen.getByTitle('Collapse')).toHaveTextContent('▲');
    });

    it('should show content when expanded', () => {
      renderWithProviders(<BobrPen {...defaultProps} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      expect(screen.getByTestId('bobr-companion')).toBeInTheDocument();
      expect(screen.queryByTestId('dam-visualization')).not.toBeInTheDocument(); // Bobr view is default
    });

    it('should collapse when collapse button is clicked again', () => {
      renderWithProviders(<BobrPen {...defaultProps} />);
      
      // Expand first
      fireEvent.click(screen.getByTitle('Expand'));
      expect(screen.getByTitle('Collapse')).toBeInTheDocument();
      
      // Then collapse
      fireEvent.click(screen.getByTitle('Collapse'));
      expect(screen.getByTitle('Expand')).toBeInTheDocument();
      expect(screen.queryByTestId('bobr-companion')).not.toBeInTheDocument();
    });
  });

  describe('Stage progression', () => {
    it('should show hatchling stage for levels 1-3', () => {
      renderWithProviders(<BobrPen {...defaultProps} user={createMockUser(2)} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      expect(screen.getByText('Hatchling Stage')).toBeInTheDocument();
    });

    it('should show young stage for levels 4-7', () => {
      renderWithProviders(<BobrPen {...defaultProps} user={createMockUser(5)} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      expect(screen.getByText('Young Stage')).toBeInTheDocument();
    });

    it('should show mature stage for levels 8+', () => {
      renderWithProviders(<BobrPen {...defaultProps} user={createMockUser(10)} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      expect(screen.getByText('Mature Stage')).toBeInTheDocument();
    });

    it('should show correct number of active stage dots', () => {
      renderWithProviders(<BobrPen {...defaultProps} user={createMockUser(5)} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      const stageDots = screen.getAllByTitle(/Hatchling|Young|Mature/);
      expect(stageDots).toHaveLength(3);
      
      // Check that first two dots are active for Young stage (level 5)
      expect(stageDots[0]).toHaveClass('active');
      expect(stageDots[1]).toHaveClass('active');
      expect(stageDots[2]).not.toHaveClass('active');
    });
  });

  describe('Evolution progress', () => {
    it('should show next evolution level for hatchling', () => {
      renderWithProviders(<BobrPen {...defaultProps} user={createMockUser(2)} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      expect(screen.getByText('Next evolution at Level 4 (2 levels to go)')).toBeInTheDocument();
    });

    it('should show next evolution level for young', () => {
      renderWithProviders(<BobrPen {...defaultProps} user={createMockUser(6)} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      expect(screen.getByText('Next evolution at Level 8 (2 levels to go)')).toBeInTheDocument();
    });

    it('should not show evolution progress for mature stage', () => {
      renderWithProviders(<BobrPen {...defaultProps} user={createMockUser(10)} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      expect(screen.queryByText(/Next evolution at Level/)).not.toBeInTheDocument();
    });
  });

  describe('View switching', () => {
    beforeEach(() => {
      renderWithProviders(<BobrPen {...defaultProps} />);
      fireEvent.click(screen.getByTitle('Expand'));
    });

    it('should show bobr view by default', () => {
      expect(screen.getByTestId('bobr-companion')).toBeInTheDocument();
      expect(screen.queryByTestId('dam-visualization')).not.toBeInTheDocument();
    });

    it('should switch to dam view when dam tab is clicked', () => {
      const damTab = screen.getByText('Dam');
      fireEvent.click(damTab);
      
      expect(screen.getByTestId('dam-visualization')).toBeInTheDocument();
      expect(screen.queryByTestId('bobr-companion')).not.toBeInTheDocument();
    });

    it('should switch back to bobr view when bobr tab is clicked', () => {
      // Switch to dam view first
      fireEvent.click(screen.getByText('Dam'));
      expect(screen.getByTestId('dam-visualization')).toBeInTheDocument();
      
      // Switch back to bobr view
      fireEvent.click(screen.getByText('Bóbr'));
      expect(screen.getByTestId('bobr-companion')).toBeInTheDocument();
      expect(screen.queryByTestId('dam-visualization')).not.toBeInTheDocument();
    });

    it('should highlight active tab', () => {
      const bobrTab = screen.getByText('Bóbr');
      const damTab = screen.getByText('Dam');
      
      // Bobr tab should be active by default
      expect(bobrTab.closest('button')).toHaveClass('active');
      expect(damTab.closest('button')).not.toHaveClass('active');
      
      // Switch to dam tab
      fireEvent.click(damTab);
      expect(damTab.closest('button')).toHaveClass('active');
      expect(bobrTab.closest('button')).not.toHaveClass('active');
    });
  });

  describe('Props passing', () => {
    it('should pass correct props to BobrCompanion', () => {
      const user = createMockUser(3);
      renderWithProviders(<BobrPen user={user} completedTasksCount={10} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      const bobrCompanion = screen.getByTestId('bobr-companion');
      expect(bobrCompanion).toHaveTextContent('Level 3');
      expect(bobrCompanion).toHaveTextContent('Tasks: 10');
    });

    it('should pass correct props to DamVisualization', () => {
      const user = createMockUser(5, 75);
      renderWithProviders(<BobrPen user={user} completedTasksCount={15} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      fireEvent.click(screen.getByText('Dam'));
      
      const damVisualization = screen.getByTestId('dam-visualization');
      expect(damVisualization).toHaveTextContent('Progress: 75%');
      expect(damVisualization).toHaveTextContent('Tasks: 15');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProviders(
        <BobrPen {...defaultProps} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should work without custom className', () => {
      const { container } = renderWithProviders(<BobrPen {...defaultProps} />);
      
      expect(container.firstChild).toHaveClass('bobrPen');
    });
  });

  describe('Accessibility', () => {
    it('should have proper button titles', () => {
      renderWithProviders(<BobrPen {...defaultProps} />);
      
      expect(screen.getByTitle('Expand')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTitle('Expand'));
      expect(screen.getByTitle('Collapse')).toBeInTheDocument();
    });

    it('should have proper stage dot titles', () => {
      renderWithProviders(<BobrPen {...defaultProps} user={createMockUser(5)} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      expect(screen.getByTitle('Hatchling')).toBeInTheDocument();
      expect(screen.getByTitle('Young')).toBeInTheDocument();
      expect(screen.getByTitle('Mature')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      renderWithProviders(<BobrPen {...defaultProps} />);
      
      const collapseButton = screen.getByTitle('Expand');
      collapseButton.focus();
      expect(document.activeElement).toBe(collapseButton);
    });
  });

  describe('Edge cases', () => {
    it('should handle level 0 correctly', () => {
      renderWithProviders(<BobrPen {...defaultProps} user={createMockUser(0)} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      expect(screen.getByText('Hatchling Stage')).toBeInTheDocument();
      expect(screen.getByText('Next evolution at Level 4 (4 levels to go)')).toBeInTheDocument();
    });

    it('should handle very high levels correctly', () => {
      renderWithProviders(<BobrPen {...defaultProps} user={createMockUser(50)} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      expect(screen.getByText('Mature Stage')).toBeInTheDocument();
      expect(screen.queryByText(/Next evolution at Level/)).not.toBeInTheDocument();
    });

    it('should handle zero completed tasks', () => {
      renderWithProviders(<BobrPen {...defaultProps} completedTasksCount={0} />);
      
      fireEvent.click(screen.getByTitle('Expand'));
      
      const bobrCompanion = screen.getByTestId('bobr-companion');
      expect(bobrCompanion).toHaveTextContent('Tasks: 0');
    });
  });
}); 