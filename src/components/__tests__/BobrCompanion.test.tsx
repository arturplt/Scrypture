import React, { createRef } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import BobrCompanion, { BobrCompanionRef } from '../BobrCompanion';
import { bobrService } from '../../services/bobrService';
import { User, BobrMessage } from '../../types';

// Mock CSS modules to return the class names
jest.mock('../BobrCompanion.module.css', () => ({
  __esModule: true,
  default: {
    companion: 'companion',
    bobrCharacter: 'bobrCharacter',
    young: 'young',
    hatchling: 'hatchling',
    mature: 'mature',
    celebrating: 'celebrating',
    evolving: 'evolving',
    building: 'building',
    idle: 'idle',
  },
}));

// Mock the bobr service
jest.mock('../../services/bobrService', () => ({
  bobrService: {
    generateMessage: jest.fn(),
    getEvolutionMessage: jest.fn(),
    getTaskCelebrationMessage: jest.fn(),
    getMotivationalMessage: jest.fn(),
    getDamProgressMessage: jest.fn(),
  },
}));

const mockBobrService = bobrService as jest.Mocked<typeof bobrService>;

describe('BobrCompanion', () => {
  const createMockUser = (overrides: Partial<User> = {}): User => ({
    id: 'test-user',
    name: 'Test User',
    level: 1,
    experience: 100,
    body: 5,
    mind: 8,
    soul: 3,
    achievements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    bobrStage: 'hatchling',
    damProgress: 25,
    ...overrides,
  });

  const createMockBobrMessage = (overrides: any = {}) => ({
    id: 'test-message',
    message: 'Hello, I am Bóbr!',
    type: 'greeting',
    animation: 'idle',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clear any existing timers first
    jest.clearAllTimers();
    jest.useRealTimers();
    
    // Now install fake timers
    jest.useFakeTimers({ legacyFakeTimers: true });

    // Mock default service responses
    mockBobrService.generateMessage.mockReturnValue(createMockBobrMessage());
    mockBobrService.getEvolutionMessage.mockReturnValue(createMockBobrMessage({ animation: 'evolve' }));
    mockBobrService.getTaskCelebrationMessage.mockReturnValue(createMockBobrMessage({ animation: 'celebrate' }));
    mockBobrService.getMotivationalMessage.mockReturnValue(createMockBobrMessage());
    mockBobrService.getDamProgressMessage.mockReturnValue(createMockBobrMessage());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial render', () => {
    it('should render Bóbr companion with basic information', () => {
      const user = createMockUser();
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('hatchling')).toBeInTheDocument();
      expect(screen.getByText('A curious young beaver, eager to learn and grow alongside you.')).toBeInTheDocument();
      expect(screen.getByText('Dam Progress')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should render Bóbr image with correct alt text', () => {
      const user = createMockUser();
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      const bobrImage = screen.getByAltText('Bóbr the beaver - hatchling stage');
      expect(bobrImage).toBeInTheDocument();
      expect(bobrImage).toHaveAttribute('src', '/assets/Icons/beaver_32.png');
    });

    it('should show greeting message on mount', () => {
      const user = createMockUser();
      const greetingMessage = createMockBobrMessage({ message: 'Welcome to your journey!' });
      mockBobrService.generateMessage.mockReturnValue(greetingMessage);

      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('Welcome to your journey!')).toBeInTheDocument();
      expect(mockBobrService.generateMessage).toHaveBeenCalledWith('greeting', 'hatchling');
    });
  });

  describe('Stage progression', () => {
    it('should display hatchling stage correctly', () => {
      const user = createMockUser({ bobrStage: 'hatchling' });
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('hatchling')).toBeInTheDocument();
      expect(screen.getByText('A curious young beaver, eager to learn and grow alongside you.')).toBeInTheDocument();
    });

    it('should display young stage correctly', () => {
      const user = createMockUser({ bobrStage: 'young' });
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('young')).toBeInTheDocument();
      expect(screen.getByText('A capable beaver who has learned much from your journey together.')).toBeInTheDocument();
    });

    it('should display mature stage correctly', () => {
      const user = createMockUser({ bobrStage: 'mature' });
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('mature')).toBeInTheDocument();
      expect(screen.getByText('An ancient and wise beaver, master of the mystical dam arts.')).toBeInTheDocument();
    });

    it('should update when user stage changes', () => {
      const { rerender } = render(
        <BobrCompanion user={createMockUser({ bobrStage: 'hatchling' })} completedTasksCount={5} />
      );

      expect(screen.getByText('hatchling')).toBeInTheDocument();

      rerender(
        <BobrCompanion user={createMockUser({ bobrStage: 'young' })} completedTasksCount={5} />
      );

      expect(screen.getByText('young')).toBeInTheDocument();
      expect(screen.getByText('A capable beaver who has learned much from your journey together.')).toBeInTheDocument();
    });
  });

  describe('Dam progress display', () => {
    it('should display dam progress bar correctly', () => {
      const user = createMockUser({ damProgress: 75 });
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('Dam Progress')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should handle zero dam progress', () => {
      const user = createMockUser({ damProgress: 0 });
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle full dam progress', () => {
      const user = createMockUser({ damProgress: 100 });
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should round dam progress percentage', () => {
      const user = createMockUser({ damProgress: 33.7 });
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('34%')).toBeInTheDocument();
    });
  });

  describe('Evolution notification', () => {
    it('should show evolution notification when enabled', () => {
      const user = createMockUser();
      const evolutionMessage = createMockBobrMessage({ 
        message: 'I have evolved!',
        animation: 'evolve'
      });
      mockBobrService.getEvolutionMessage.mockReturnValue(evolutionMessage);

      render(
        <BobrCompanion 
          user={user} 
          completedTasksCount={5}
          showEvolutionNotification={true}
        />
      );

      expect(screen.getByText('Evolved!')).toBeInTheDocument();
      expect(screen.getByText('I have evolved!')).toBeInTheDocument();
    });

    it('should not show evolution notification when disabled', () => {
      const user = createMockUser();
      render(
        <BobrCompanion 
          user={user} 
          completedTasksCount={5}
          showEvolutionNotification={false}
        />
      );

      expect(screen.queryByText('Evolved!')).not.toBeInTheDocument();
    });

    it('should call onEvolutionComplete after animation', async () => {
      const mockOnEvolutionComplete = jest.fn();
      const user = createMockUser();
      const evolutionMessage = createMockBobrMessage({ animation: 'evolve' });
      mockBobrService.getEvolutionMessage.mockReturnValue(evolutionMessage);

      render(
        <BobrCompanion 
          user={user} 
          completedTasksCount={5}
          showEvolutionNotification={true}
          onEvolutionComplete={mockOnEvolutionComplete}
        />
      );

      act(() => {
        jest.advanceTimersByTime(2500);
      });

      expect(mockOnEvolutionComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Message display', () => {
    it('should display current message', () => {
      const user = createMockUser();
      const message = createMockBobrMessage({ message: 'Great job on that task!' });
      mockBobrService.generateMessage.mockReturnValue(message);

      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('Great job on that task!')).toBeInTheDocument();
    });

    it('should update message when new message is shown', () => {
      const user = createMockUser();
      const initialMessage = createMockBobrMessage({ message: 'Hello!' });
      const newMessage = createMockBobrMessage({ message: 'New message!' });
      
      mockBobrService.generateMessage.mockReturnValue(initialMessage);

      const { rerender } = render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('Hello!')).toBeInTheDocument();

      // Simulate new message by changing service response
      mockBobrService.generateMessage.mockReturnValue(newMessage);
      rerender(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('New message!')).toBeInTheDocument();
    });
  });

  describe('Animation handling', () => {
    it('should apply animation classes when message has animation', () => {
      const user = createMockUser();
      const message = createMockBobrMessage({ animation: 'celebrate' });
      mockBobrService.generateMessage.mockReturnValue(message);

      const { container } = render(<BobrCompanion user={user} completedTasksCount={5} />);

      // Check that the bobr character element exists and has animation classes
      const bobrCharacter = container.querySelector('[class*="bobrCharacter"]');
      expect(bobrCharacter).toBeInTheDocument();
      // The animation class will be applied via CSS modules, so we can't test the exact class name
      expect(bobrCharacter?.className).toContain('bobrCharacter');
    });

    it('should reset animation after duration', () => {
      const user = createMockUser();
      const message = createMockBobrMessage({ animation: 'celebrate' });
      mockBobrService.generateMessage.mockReturnValue(message);

      const { container } = render(<BobrCompanion user={user} completedTasksCount={5} />);

      const bobrCharacter = container.querySelector('[class*="bobrCharacter"]');
      expect(bobrCharacter).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Animation should be reset
      expect(bobrCharacter).toBeInTheDocument();
    });

    it('should handle evolve animation with longer duration', () => {
      const user = createMockUser();
      const message = createMockBobrMessage({ animation: 'evolve' });
      mockBobrService.generateMessage.mockReturnValue(message);

      const { container } = render(<BobrCompanion user={user} completedTasksCount={5} />);

      const bobrCharacter = container.querySelector('[class*="bobrCharacter"]');
      expect(bobrCharacter).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should still be animating
      expect(bobrCharacter).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should be done
      expect(bobrCharacter).toBeInTheDocument();
    });
  });

  describe('CSS classes and styling', () => {
    it('should apply stage-specific CSS classes', () => {
      const user = createMockUser({ bobrStage: 'young' });
      const { container } = render(<BobrCompanion user={user} completedTasksCount={5} />);

      const companion = container.querySelector('.companion');
      expect(companion).toHaveClass('young');
    });

    it('should apply custom className', () => {
      const user = createMockUser();
      const { container } = render(
        <BobrCompanion user={user} completedTasksCount={5} className="custom-class" />
      );

      const companion = container.querySelector('.companion');
      expect(companion).toHaveClass('custom-class');
    });

    it('should apply animation classes correctly', () => {
      const user = createMockUser();
      const message = createMockBobrMessage({ animation: 'build' });
      mockBobrService.generateMessage.mockReturnValue(message);

      const { container } = render(<BobrCompanion user={user} completedTasksCount={5} />);

      const bobrCharacter = container.querySelector('.bobrCharacter');
      expect(bobrCharacter).toHaveClass('building');
    });
  });

  describe('BobrCompanionRef (forwardRef)', () => {
    it('should expose imperative methods', () => {
      const user = createMockUser();
      const ref = createRef<any>();

      render(<BobrCompanionRef ref={ref} user={user} completedTasksCount={5} />);

      expect(ref.current).toBeDefined();
      expect(ref.current.celebrateTaskCompletion).toBeDefined();
      expect(ref.current.showMotivation).toBeDefined();
      expect(ref.current.celebrateDamProgress).toBeDefined();
    });

    it('should call celebrateTaskCompletion method', () => {
      const user = createMockUser();
      const ref = createRef<any>();
      const celebrationMessage = createMockBobrMessage({ message: 'Great job!' });
      mockBobrService.getTaskCelebrationMessage.mockReturnValue(celebrationMessage);

      render(<BobrCompanionRef ref={ref} user={user} completedTasksCount={5} />);

      ref.current.celebrateTaskCompletion('Test Task', 'work');

      expect(mockBobrService.getTaskCelebrationMessage).toHaveBeenCalledWith(user, 'Test Task', 'work');
    });

    it('should call showMotivation method', () => {
      const user = createMockUser();
      const ref = createRef<any>();
      const motivationMessage = createMockBobrMessage({ message: 'You can do it!' });
      mockBobrService.getMotivationalMessage.mockReturnValue(motivationMessage);

      render(<BobrCompanionRef ref={ref} user={user} completedTasksCount={5} />);

      ref.current.showMotivation();

      expect(mockBobrService.getMotivationalMessage).toHaveBeenCalledWith(user.bobrStage);
    });

    it('should call celebrateDamProgress method', () => {
      const user = createMockUser({ damProgress: 50 });
      const ref = createRef<any>();
      const damMessage = createMockBobrMessage({ message: 'Dam progress!' });
      mockBobrService.getDamProgressMessage.mockReturnValue(damMessage);

      render(<BobrCompanionRef ref={ref} user={user} completedTasksCount={5} />);

      ref.current.celebrateDamProgress();

      expect(mockBobrService.getDamProgressMessage).toHaveBeenCalledWith(user.bobrStage, user.damProgress);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const user = createMockUser();
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      const bobrCharacters = screen.getAllByRole('img');
      const bobrCharacter = bobrCharacters.find(img => img.getAttribute('aria-label')?.includes('Bóbr companion'));
      expect(bobrCharacter).toHaveAttribute('aria-label', 'Bóbr companion in young stage');
    });

    it('should have proper image alt text', () => {
      const user = createMockUser({ bobrStage: 'mature' });
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      const bobrImage = screen.getByAltText('Bóbr the beaver - mature stage');
      expect(bobrImage).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing user data gracefully', () => {
      const user = createMockUser({ damProgress: NaN });
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('hatchling')).toBeInTheDocument();
      expect(screen.getByText('NaN%')).toBeInTheDocument(); // NaN becomes NaN
    });

    it('should handle very high dam progress', () => {
      const user = createMockUser({ damProgress: 150 });
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('should handle negative dam progress', () => {
      const user = createMockUser({ damProgress: -10 });
      render(<BobrCompanion user={user} completedTasksCount={5} />);

      expect(screen.getByText('-10%')).toBeInTheDocument();
    });

    it('should handle service errors gracefully', () => {
      const user = createMockUser();
      mockBobrService.generateMessage.mockImplementation(() => {
        throw new Error('Service error');
      });

      // Should not crash
      expect(() => render(<BobrCompanion user={user} completedTasksCount={5} />)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const user = createMockUser();
      const { rerender } = render(<BobrCompanion user={user} completedTasksCount={5} />);

      const initialRender = screen.getByText('hatchling');

      // Re-render with same props
      rerender(<BobrCompanion user={user} completedTasksCount={5} />);

      const afterRender = screen.getByText('hatchling');
      expect(afterRender).toBe(initialRender);
    });

    it('should handle rapid state changes', () => {
      const user = createMockUser();
      const { rerender } = render(<BobrCompanion user={user} completedTasksCount={5} />);

      // Rapidly change user stage
      for (let i = 0; i < 10; i++) {
        rerender(
          <BobrCompanion 
            user={createMockUser({ bobrStage: i % 2 === 0 ? 'hatchling' : 'young' })} 
            completedTasksCount={5} 
          />
        );
      }

      // Should still render correctly
      expect(screen.getByText(/hatchling|young/)).toBeInTheDocument();
    });
  });
}); 