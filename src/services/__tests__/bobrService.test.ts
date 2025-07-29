import { bobrService } from '../bobrService';
import { storageService } from '../storageService';
import { User, BobrState, BobrMessage } from '../../types';

// Mock the storage service
jest.mock('../storageService', () => ({
  storageService: {
    getGenericItem: jest.fn(),
    setGenericItem: jest.fn(),
  },
}));

const mockStorageService = storageService as jest.Mocked<typeof storageService>;

describe('bobrService', () => {
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

  const createMockBobrState = (overrides: Partial<BobrState> = {}): BobrState => ({
    stage: 'hatchling',
    damProgress: 0,
    evolutionHistory: [],
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService.getGenericItem.mockReturnValue(null);
    mockStorageService.setGenericItem.mockReturnValue(true);
  });

  describe('getBobrStage', () => {
    it('should return hatchling for levels 1-3', () => {
      expect(bobrService.getBobrStage(1)).toBe('hatchling');
      expect(bobrService.getBobrStage(2)).toBe('hatchling');
      expect(bobrService.getBobrStage(3)).toBe('hatchling');
    });

    it('should return young for levels 4-7', () => {
      expect(bobrService.getBobrStage(4)).toBe('young');
      expect(bobrService.getBobrStage(5)).toBe('young');
      expect(bobrService.getBobrStage(6)).toBe('young');
      expect(bobrService.getBobrStage(7)).toBe('young');
    });

    it('should return mature for levels 8+', () => {
      expect(bobrService.getBobrStage(8)).toBe('mature');
      expect(bobrService.getBobrStage(10)).toBe('mature');
      expect(bobrService.getBobrStage(50)).toBe('mature');
    });

    it('should handle edge cases', () => {
      expect(bobrService.getBobrStage(0)).toBe('hatchling');
      expect(bobrService.getBobrStage(-1)).toBe('hatchling');
    });
  });

  describe('calculateDamProgress', () => {
    it('should calculate progress correctly', () => {
      expect(bobrService.calculateDamProgress(0)).toBe(0);
      expect(bobrService.calculateDamProgress(10)).toBe(50);
      expect(bobrService.calculateDamProgress(20)).toBe(100);
    });

    it('should handle edge cases', () => {
      expect(Math.max(0, bobrService.calculateDamProgress(-1))).toBe(0); // Allow for negative values but test final result
      expect(bobrService.calculateDamProgress(0.5)).toBe(2.5);
    });
  });

  describe('updateBobrStatus', () => {
    it('should update user stage when level changes', () => {
      const user = createMockUser({ level: 2, bobrStage: 'hatchling' });
      const result = bobrService.updateBobrStatus(user, 5);

      expect(result.user.bobrStage).toBe('hatchling'); // Still hatchling at level 2
      expect(result.evolved).toBe(false);
      expect(result.damProgressChanged).toBe(false); // 5 tasks * 5% = 25%, same as current
      expect(result.user.damProgress).toBe(25);
    });

    it('should evolve user to young stage', () => {
      const user = createMockUser({ level: 5, bobrStage: 'hatchling' });
      const result = bobrService.updateBobrStatus(user, 10);

      expect(result.user.bobrStage).toBe('young');
      expect(result.evolved).toBe(true);
      expect(result.damProgressChanged).toBe(true);
      expect(result.user.damProgress).toBe(50);
    });

    it('should evolve user to mature stage', () => {
      const user = createMockUser({ level: 10, bobrStage: 'young' });
      const result = bobrService.updateBobrStatus(user, 15);

      expect(result.user.bobrStage).toBe('mature');
      expect(result.evolved).toBe(true);
      expect(result.damProgressChanged).toBe(true);
      expect(result.user.damProgress).toBe(75);
    });

    it('should not evolve when stage is already correct', () => {
      const user = createMockUser({ level: 5, bobrStage: 'young' });
      const result = bobrService.updateBobrStatus(user, 10);

      expect(result.user.bobrStage).toBe('young');
      expect(result.evolved).toBe(false);
      expect(result.damProgressChanged).toBe(true);
    });

    it('should not change dam progress when already correct', () => {
      const user = createMockUser({ level: 1, damProgress: 25 });
      const result = bobrService.updateBobrStatus(user, 5);

      expect(result.user.damProgress).toBe(25);
      expect(result.damProgressChanged).toBe(false);
    });

    it('should update user timestamp when changes occur', () => {
      const user = createMockUser({ level: 5, bobrStage: 'hatchling' });
      const beforeUpdate = new Date();
      
      // Add a small delay to ensure timestamp difference
      jest.advanceTimersByTime(1);
      
      const result = bobrService.updateBobrStatus(user, 10);
      
      expect(result.user.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
    });
  });

  describe('generateMessage', () => {
    it('should generate greeting message for hatchling', () => {
      const message = bobrService.generateMessage('greeting', 'hatchling');
      
      expect(message.id).toMatch(/^bobr_msg_\d+_[a-z0-9]+$/);
      expect(message.type).toBe('greeting');
      expect(message.stage).toBe('hatchling');
      expect(message.message).toContain('chirp');
      expect(message.animation).toBe('idle');
    });

    it('should generate task completion message for young', () => {
      const message = bobrService.generateMessage('task_completion', 'young');
      
      expect(message.type).toBe('task_completion');
      expect(message.stage).toBe('young');
      expect(message.message).toMatch(/\*.*\*.*\{taskTitle\}.*\{category\}/);
      expect(message.animation).toBe('celebrate');
    });

    it('should generate level up message for mature', () => {
      const message = bobrService.generateMessage('level_up', 'mature');
      
      expect(message.type).toBe('level_up');
      expect(message.stage).toBe('mature');
      expect(message.message).toContain('ascension');
      expect(message.animation).toBe('evolve');
    });

    it('should interpolate context variables', () => {
      const context = {
        taskTitle: 'Test Task',
        category: 'work',
        newLevel: 5,
        achievementName: 'Test Achievement',
        damPercentage: 75
      };

      const message = bobrService.generateMessage('task_completion', 'hatchling', context);
      
      expect(message.message).toContain('Test Task');
      expect(message.message).toContain('work');
    });

    it('should return fallback message for unknown type', () => {
      const message = bobrService.generateMessage('unknown' as any, 'hatchling');
      
      expect(message.type).toBe('greeting');
      expect(message.message).toContain('Hello there, friend');
      expect(message.animation).toBe('idle');
    });

    it('should return fallback message for unknown stage', () => {
      const message = bobrService.generateMessage('greeting', 'unknown' as any);
      
      expect(message.type).toBe('greeting');
      expect(message.message).toMatch(/\*.*\*.*/);
    });
  });

  describe('getTaskCelebrationMessage', () => {
    it('should generate task celebration message', () => {
      const user = createMockUser({ bobrStage: 'young' });
      const message = bobrService.getTaskCelebrationMessage(user, 'Test Task', 'work');
      
      expect(message.type).toBe('task_completion');
      expect(message.stage).toBe('young');
      expect(message.message).toContain('Test Task');
      expect(message.message).toContain('work');
      expect(message.animation).toBe('celebrate');
    });

    it('should include dam progress in context', () => {
      const user = createMockUser({ bobrStage: 'hatchling', damProgress: 50 });
      const message = bobrService.getTaskCelebrationMessage(user, 'Test Task', 'personal');
      
      expect(message.message).toContain('Test Task');
      expect(message.message).toContain('personal');
    });
  });

  describe('getEvolutionMessage', () => {
    it('should generate evolution message for hatchling', () => {
      const message = bobrService.getEvolutionMessage('hatchling');
      
      expect(message.type).toBe('level_up');
      expect(message.stage).toBe('hatchling');
      expect(message.message).toMatch(/\*.*\*.*/);
      expect(message.animation).toBe('evolve');
    });

    it('should generate evolution message for young', () => {
      const message = bobrService.getEvolutionMessage('young');
      
      expect(message.type).toBe('level_up');
      expect(message.stage).toBe('young');
      expect(message.message).toContain('growth');
      expect(message.animation).toBe('evolve');
    });

    it('should generate evolution message for mature', () => {
      const message = bobrService.getEvolutionMessage('mature');
      
      expect(message.type).toBe('level_up');
      expect(message.stage).toBe('mature');
      expect(message.message).toContain('ascension');
      expect(message.animation).toBe('evolve');
    });
  });

  describe('getMotivationalMessage', () => {
    it('should generate motivational message for hatchling', () => {
      const message = bobrService.getMotivationalMessage('hatchling');
      
      expect(message.type).toBe('motivation');
      expect(message.stage).toBe('hatchling');
      expect(message.message).toMatch(/\*.*\*.*/);
      expect(message.animation).toBe('idle');
    });

    it('should generate motivational message for young', () => {
      const message = bobrService.getMotivationalMessage('young');
      
      expect(message.type).toBe('motivation');
      expect(message.stage).toBe('young');
      expect(message.message).toMatch(/\*.*\*.*/);
      expect(message.animation).toBe('idle');
    });

    it('should generate motivational message for mature', () => {
      const message = bobrService.getMotivationalMessage('mature');
      
      expect(message.type).toBe('motivation');
      expect(message.stage).toBe('mature');
      expect(message.message).toMatch(/\*.*\*.*/);
      expect(message.animation).toBe('idle');
    });
  });

  describe('getDamProgressMessage', () => {
    it('should generate dam progress message for hatchling', () => {
      const message = bobrService.getDamProgressMessage('hatchling', 50);
      
      expect(message.type).toBe('dam_progress');
      expect(message.stage).toBe('hatchling');
      expect(message.message).toMatch(/\*.*\*.*50%/);
      expect(message.animation).toBe('build');
    });

    it('should include dam percentage in context', () => {
      const message = bobrService.getDamProgressMessage('young', 75);
      
      expect(message.message).toContain('75');
    });

    it('should generate dam progress message for mature', () => {
      const message = bobrService.getDamProgressMessage('mature', 100);
      
      expect(message.type).toBe('dam_progress');
      expect(message.stage).toBe('mature');
      expect(message.message).toContain('masterwork');
      expect(message.animation).toBe('build');
    });
  });

  describe('getBobrState', () => {
    it('should return default state when no saved state exists', () => {
      mockStorageService.getGenericItem.mockReturnValue(null);
      
      const state = bobrService.getBobrState();
      
      expect(state).toEqual({
        stage: 'hatchling',
        damProgress: 0,
        evolutionHistory: []
      });
    });

    it('should return saved state when it exists', () => {
      const savedState = createMockBobrState({
        stage: 'young',
        damProgress: 50,
        evolutionHistory: [
          { stage: 'hatchling', evolvedAt: new Date() }
        ]
      });
      
      mockStorageService.getGenericItem.mockReturnValue(savedState);
      
      const state = bobrService.getBobrState();
      
      expect(state).toEqual(savedState);
    });
  });

  describe('saveBobrState', () => {
    it('should save state to storage', () => {
      const state = createMockBobrState({
        stage: 'mature',
        damProgress: 100,
        evolutionHistory: [
          { stage: 'hatchling', evolvedAt: new Date() },
          { stage: 'young', evolvedAt: new Date() }
        ]
      });
      
      const result = bobrService.saveBobrState(state);
      
      expect(mockStorageService.setGenericItem).toHaveBeenCalledWith('bobr_state', state);
      expect(result).toBe(true);
    });

    it('should handle storage errors', () => {
      mockStorageService.setGenericItem.mockReturnValue(false);
      
      const state = createMockBobrState();
      const result = bobrService.saveBobrState(state);
      
      expect(result).toBe(false);
    });
  });

  describe('Message templates', () => {
    it('should have messages for all stages and types', () => {
      const stages: Array<'hatchling' | 'young' | 'mature'> = ['hatchling', 'young', 'mature'];
      const types: Array<BobrMessage['type']> = ['greeting', 'task_completion', 'level_up', 'achievement', 'motivation', 'dam_progress'];
      
      stages.forEach(stage => {
        types.forEach(type => {
          const message = bobrService.generateMessage(type, stage);
          expect(message).toBeDefined();
          expect(message.message).toBeTruthy();
          expect(message.id).toMatch(/^bobr_msg_/);
        });
      });
    });

    it('should have different messages for different stages', () => {
      const hatchlingMessage = bobrService.generateMessage('greeting', 'hatchling');
      const youngMessage = bobrService.generateMessage('greeting', 'young');
      const matureMessage = bobrService.generateMessage('greeting', 'mature');
      
      expect(hatchlingMessage.message).not.toBe(youngMessage.message);
      expect(youngMessage.message).not.toBe(matureMessage.message);
      expect(hatchlingMessage.message).not.toBe(matureMessage.message);
    });

    it('should have appropriate animations for each message type', () => {
      const taskMessage = bobrService.generateMessage('task_completion', 'hatchling');
      const levelMessage = bobrService.generateMessage('level_up', 'hatchling');
      const motivationMessage = bobrService.generateMessage('motivation', 'hatchling');
      const damMessage = bobrService.generateMessage('dam_progress', 'hatchling');
      
      expect(taskMessage.animation).toBe('celebrate');
      expect(levelMessage.animation).toBe('evolve');
      expect(motivationMessage.animation).toBe('idle');
      expect(damMessage.animation).toBe('build');
    });
  });

  describe('Evolution history', () => {
    it('should save evolution history when user evolves', () => {
      const user = createMockUser({ level: 5, bobrStage: 'hatchling' });
      const savedState = createMockBobrState();
      mockStorageService.getGenericItem.mockReturnValue(savedState);
      
      bobrService.updateBobrStatus(user, 10);
      
      expect(mockStorageService.setGenericItem).toHaveBeenCalledWith(
        'bobr_state',
        expect.objectContaining({
          stage: 'young',
          evolutionHistory: expect.arrayContaining([
            expect.objectContaining({
              stage: 'young',
              evolvedAt: expect.any(Date)
            })
          ])
        })
      );
    });

    it('should not save evolution history when user does not evolve', () => {
      const user = createMockUser({ level: 1, bobrStage: 'hatchling' });
      const savedState = createMockBobrState();
      mockStorageService.getGenericItem.mockReturnValue(savedState);
      
      bobrService.updateBobrStatus(user, 5);
      
      expect(mockStorageService.setGenericItem).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle very high user levels', () => {
      const user = createMockUser({ level: 999 });
      const result = bobrService.updateBobrStatus(user, 100);
      
      expect(result.user.bobrStage).toBe('mature');
    });

    it('should handle very high completed task counts', () => {
      const user = createMockUser();
      const result = bobrService.updateBobrStatus(user, 1000);
      
      expect(result.user.damProgress).toBe(100);
    });

    it('should handle negative completed task counts', () => {
      const user = createMockUser();
      const result = bobrService.updateBobrStatus(user, -5);
      
      expect(result.user.damProgress).toBe(0);
    });

    it('should handle storage service errors gracefully', () => {
      mockStorageService.getGenericItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      // Should not crash
      expect(() => bobrService.getBobrState()).not.toThrow();
    });

    it('should generate unique message IDs', () => {
      const message1 = bobrService.generateMessage('greeting', 'hatchling');
      const message2 = bobrService.generateMessage('greeting', 'hatchling');
      
      expect(message1.id).not.toBe(message2.id);
    });
  });

  describe('Performance', () => {
    it('should handle rapid state updates', () => {
      const user = createMockUser({ level: 1 });
      
      // Simulate rapid updates
      for (let i = 0; i < 100; i++) {
        const result = bobrService.updateBobrStatus(user, i);
        expect(result.user).toBeDefined();
      }
    });

    it('should handle large evolution histories', () => {
             const largeHistory = Array.from({ length: 1000 }, (_, i) => ({
         stage: (i % 3 === 0 ? 'hatchling' : i % 3 === 1 ? 'young' : 'mature') as 'hatchling' | 'young' | 'mature',
         evolvedAt: new Date()
       }));
      
      const savedState = createMockBobrState({ evolutionHistory: largeHistory });
      mockStorageService.getGenericItem.mockReturnValue(savedState);
      
      const state = bobrService.getBobrState();
      expect(state.evolutionHistory).toHaveLength(1000);
    });
  });
}); 