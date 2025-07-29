import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BobrPen from '../BobrPen';
import { User } from '../../types';
import { UserProvider, useUser } from '../../hooks/useUser';
import { TaskProvider, useTasks } from '../../hooks/useTasks';
import { HabitProvider, useHabits } from '../../hooks/useHabits';

// Mock the hooks but preserve the providers
jest.mock('../../hooks/useUser', () => {
  const actual = jest.requireActual('../../hooks/useUser');
  return {
    ...actual,
    useUser: jest.fn(),
    UserProvider: actual.UserProvider,
  };
});

jest.mock('../../hooks/useTasks', () => {
  const actual = jest.requireActual('../../hooks/useTasks');
  return {
    ...actual,
    useTasks: jest.fn(),
    TaskProvider: actual.TaskProvider,
  };
});

jest.mock('../../hooks/useHabits', () => {
  const actual = jest.requireActual('../../hooks/useHabits');
  return {
    ...actual,
    useHabits: jest.fn(),
    HabitProvider: actual.HabitProvider,
  };
});

// Mock the services that providers depend on
jest.mock('../../services/userService', () => ({
  userService: {
    getUser: jest.fn(() => ({
      id: 'test-user',
      name: 'Test User',
      level: 1,
      experience: 100,
      body: 10,
      mind: 15,
      soul: 8,
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      bobrStage: 'hatchling',
      damProgress: 50,
    })),
    saveUser: jest.fn(() => true),
    updateUser: jest.fn(() => true),
    addExperience: jest.fn(() => true),
    addExperienceWithBobr: jest.fn(() => ({ success: true, evolved: false, damProgressChanged: false })),
  },
}));

jest.mock('../../services/taskService', () => ({
  taskService: {
    getTasks: jest.fn(() => []),
    saveTasks: jest.fn(() => true),
    addTask: jest.fn(() => 'test-task-id'),
    updateTask: jest.fn(() => true),
    deleteTask: jest.fn(() => true),
  },
}));

jest.mock('../../services/habitService', () => ({
  habitService: {
    getHabits: jest.fn(() => []),
    saveHabits: jest.fn(() => true),
    addHabit: jest.fn(() => 'test-habit-id'),
    updateHabit: jest.fn(() => true),
    deleteHabit: jest.fn(() => true),
  },
}));

// Mock CSS modules to return the class names
jest.mock('../BobrPen.module.css', () => ({
  __esModule: true,
  default: {
    bobrPen: 'bobrPen',
    collapsed: 'collapsed',
    expanded: 'expanded',
    penHeader: 'penHeader',
    penIcon: 'penIcon',
    penTitle: 'penTitle',
    collapseButton: 'collapseButton',
    stageIndicator: 'stageIndicator',
    stageDots: 'stageDots',
    stageDot: 'stageDot',
    active: 'active',
    stageLabel: 'stageLabel',
    evolutionProgress: 'evolutionProgress',
    viewToggle: 'viewToggle',
    toggleButton: 'toggleButton',
    companionContainer: 'companionContainer',
    activeSection: 'activeSection',
    tabs: 'tabs',
    tab: 'tab',
    activeTab: 'activeTab',
  },
}));

// Mock the child components
jest.mock('../BobrCompanion', () => ({
  __esModule: true,
  default: ({ user, completedTasksCount }: any) => (
    <div data-testid="bobr-companion">
      <div>Companion for {user?.name || 'Unknown'}</div>
      <div>Completed tasks: {completedTasksCount}</div>
      <div>Level {user?.level || 0}</div>
      <div>Tasks: {completedTasksCount}</div>
    </div>
  ),
}));

jest.mock('../DamVisualization', () => ({
  __esModule: true,
  default: ({ user, completedTasksCount, damProgress }: any) => (
    <div data-testid="dam-visualization">
      <div>Dam for {user?.name || 'Unknown'}</div>
      <div>Progress: {damProgress || user?.damProgress || 0}%</div>
    </div>
  ),
}));

jest.mock('../BobrInteraction', () => ({
  __esModule: true,
  BobrInteraction: ({ isOpen, onClose, onTaskCreated }: any) => (
    <div data-testid="bobr-interaction">
      <div>Interaction {isOpen ? 'Open' : 'Closed'}</div>
      <button onClick={onClose}>Close</button>
      <button onClick={() => onTaskCreated && onTaskCreated()}>Create Task</button>
    </div>
  ),
}));

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
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configure mock hooks
    (useUser as jest.Mock).mockReturnValue({
      user: {
        id: 'test-user',
        name: 'Test User',
        level: 1,
        experience: 100,
        body: 10,
        mind: 15,
        soul: 8,
        achievements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        bobrStage: 'hatchling',
        damProgress: 50,
      },
      createUser: jest.fn(),
      updateUser: jest.fn(),
      addExperience: jest.fn(),
      addExperienceWithBobr: jest.fn(),
      addStatRewards: jest.fn(),
      removeStatRewards: jest.fn(),
      removeExperience: jest.fn(),
      unlockAchievement: jest.fn(),
      isSaving: false,
      addStatRewardsWithBobr: jest.fn(),
      applyAchievementRewards: jest.fn(),
    });
    
    (useTasks as jest.Mock).mockReturnValue({
      tasks: [],
      addTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTask: jest.fn(),
      bringTaskToTop: jest.fn(),
      isSaving: false,
      lastSaved: new Date(),
      refreshTasks: jest.fn(),
    });
    
    (useHabits as jest.Mock).mockReturnValue({
      habits: [],
      addHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      completeHabit: jest.fn(),
      isSaving: false,
    });
  });

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

  describe('Provider test', () => {
    it('should render providers correctly', () => {
      const { container } = render(
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

  describe('Initial render', () => {
    it('should render the pen header without providers', () => {
      render(<BobrPen {...defaultProps} />);
      
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
      const user = createMockUser(2); // Level 2, should show evolution to level 4
      
      renderWithProviders(<BobrPen user={user} completedTasksCount={5} />);
      fireEvent.click(screen.getByTitle('Expand'));

      expect(screen.getByText(/Next evolution at Level 4/)).toBeInTheDocument();
      expect(screen.getByText(/2 levels to go/)).toBeInTheDocument();
    });

    it('should show next evolution level for young', () => {
      const user = createMockUser(6); // Level 6, should show evolution to level 8
      
      renderWithProviders(<BobrPen user={user} completedTasksCount={5} />);
      fireEvent.click(screen.getByTitle('Expand'));

      expect(screen.getByText(/Next evolution at Level 8/)).toBeInTheDocument();
      expect(screen.getByText(/2 levels to go/)).toBeInTheDocument();
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
      renderWithProviders(<BobrPen {...defaultProps} />);
      fireEvent.click(screen.getByTitle('Expand'));

      const damTabs = screen.getAllByText(/🏗️ Dam/);
      fireEvent.click(damTabs[0]);

      expect(screen.getByTestId('dam-visualization')).toBeInTheDocument();
    });

    it('should switch back to bobr view when bobr tab is clicked', () => {
      renderWithProviders(<BobrPen {...defaultProps} />);
      fireEvent.click(screen.getByTitle('Expand'));

      // Switch to dam view first
      const damTabs = screen.getAllByText(/🏗️ Dam/);
      fireEvent.click(damTabs[0]);
      expect(screen.getByTestId('dam-visualization')).toBeInTheDocument();

      // Switch back to bobr view
      const bobrTabs = screen.getAllByText(/🦫 Bóbr/);
      fireEvent.click(bobrTabs[0]);

      const bobrCompanions = screen.getAllByTestId('bobr-companion');
      expect(bobrCompanions.length).toBeGreaterThan(0);
    });

    it('should highlight active tab', () => {
      renderWithProviders(<BobrPen {...defaultProps} />);
      fireEvent.click(screen.getByTitle('Expand'));

      const bobrTabs = screen.getAllByText(/🦫 Bóbr/);
      const damTabs = screen.getAllByText(/🏗️ Dam/);

      // Bobr tab should be active by default
      expect(bobrTabs[0].closest('button')).toHaveClass('active');

      // Click dam tab
      fireEvent.click(damTabs[0]);
      expect(damTabs[0].closest('button')).toHaveClass('active');
      expect(bobrTabs[0].closest('button')).not.toHaveClass('active');
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
      const damTabs = screen.getAllByText(/🏗️ Dam/);
      fireEvent.click(damTabs[0]);

      const damVisualization = screen.getByTestId('dam-visualization');
      expect(damVisualization).toHaveTextContent('Progress: 75%');
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
      const user = createMockUser(0);
      
      renderWithProviders(<BobrPen user={user} completedTasksCount={5} />);
      fireEvent.click(screen.getByTitle('Expand'));

      expect(screen.getByText('Hatchling Stage')).toBeInTheDocument();
      expect(screen.getByText(/Next evolution at Level 4/)).toBeInTheDocument();
      expect(screen.getByText(/4 levels to go/)).toBeInTheDocument();
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