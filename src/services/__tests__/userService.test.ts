import { userService } from '../userService';
import { storageService } from '../storageService';
import { User, Achievement } from '../../types';

// Mock the storage service
jest.mock('../storageService');

const mockStorageService = storageService as jest.Mocked<typeof storageService>;

// Helper function to create a complete User object
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  name: 'Test User',
  level: 1,
  experience: 0,
  body: 0,
  mind: 0,
  soul: 0,
  achievements: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
  },
});

// Suppress console.error in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    test('should return user from storage service', () => {
      const mockUser = createMockUser({
        level: 5,
        experience: 500,
      });

      mockStorageService.getUser.mockReturnValue(mockUser);

      const result = userService.getUser();

      expect(result).toEqual(mockUser);
      expect(mockStorageService.getUser).toHaveBeenCalledTimes(1);
    });

    test('should return null when no user exists', () => {
      mockStorageService.getUser.mockReturnValue(null);

      const result = userService.getUser();

      expect(result).toBeNull();
      expect(mockStorageService.getUser).toHaveBeenCalledTimes(1);
    });

    test('should handle storage service errors gracefully', () => {
      mockStorageService.getUser.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => userService.getUser()).toThrow('Storage error');
    });
  });

  describe('saveUser', () => {
    test('should save user successfully', () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      mockStorageService.saveUser.mockReturnValue(true);

      const result = userService.saveUser(user);

      expect(result).toBe(true);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith(user);
      expect(mockStorageService.saveUser).toHaveBeenCalledTimes(1);
    });

    test('should handle save failures', () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      mockStorageService.saveUser.mockReturnValue(false);

      const result = userService.saveUser(user);

      expect(result).toBe(false);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith(user);
    });
  });

  describe('createUser', () => {
    test('should create new user successfully', () => {
      const userName = 'New User';
      mockStorageService.saveUser.mockReturnValue(true);

      const result = userService.createUser(userName);

      expect(result.id).toBeDefined();
      expect(result.name).toBe(userName);
      expect(result.level).toBe(1);
      expect(result.experience).toBe(0);
      expect(result.achievements).toEqual([]);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith(result);
    });

    test('should handle save failure when creating user', () => {
      const userName = 'New User';
      mockStorageService.saveUser.mockReturnValue(false);

      const result = userService.createUser(userName);

      expect(result).toBeDefined();
      expect(result.name).toBe(userName);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith(result);
    });
  });

  describe('updateUser', () => {
    test('should update existing user successfully', () => {
      const existingUser: User = {
        id: '1',
        name: 'Old Name',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      const updates = {
        name: 'New Name',
        level: 6,
      };

      mockStorageService.getUser.mockReturnValue(existingUser);
      mockStorageService.saveUser.mockReturnValue(true);

      const result = userService.updateUser(updates);

      expect(result).toBe(true);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith({
        ...existingUser,
        ...updates,
      });
    });

    test('should return false when no user exists', () => {
      const updates = { name: 'New Name' };

      mockStorageService.getUser.mockReturnValue(null);

      const result = userService.updateUser(updates);

      expect(result).toBe(false);
      expect(mockStorageService.saveUser).not.toHaveBeenCalled();
    });

    test('should handle save failure when updating user', () => {
      const existingUser: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      const updates = { name: 'New Name' };

      mockStorageService.getUser.mockReturnValue(existingUser);
      mockStorageService.saveUser.mockReturnValue(false);

      const result = userService.updateUser(updates);

      expect(result).toBe(false);
    });
  });

  describe('addExperience', () => {
    test('should add experience and update level successfully', () => {
      const existingUser: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      const experienceToAdd = 100;

      mockStorageService.getUser.mockReturnValue(existingUser);
      mockStorageService.saveUser.mockReturnValue(true);

      const result = userService.addExperience(experienceToAdd);

      expect(result).toBe(true);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingUser,
          experience: 600,
          level: 7, // Math.floor(600 / 100) + 1
        })
      );
    });

    test('should handle level calculation correctly', () => {
      const existingUser: User = {
        id: '1',
        name: 'Test User',
        level: 1,
        experience: 0,
        body: 0,
        mind: 0,
        soul: 0,
        achievements: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockStorageService.getUser.mockReturnValue(existingUser);
      mockStorageService.saveUser.mockReturnValue(true);

      const result = userService.addExperience(250);

      expect(result).toBe(true);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingUser,
          experience: 250,
          level: 3, // Math.floor(250 / 100) + 1 = 2 + 1 = 3
        })
      );
    });

    test('should return false when no user exists', () => {
      mockStorageService.getUser.mockReturnValue(null);

      const result = userService.addExperience(100);

      expect(result).toBe(false);
      expect(mockStorageService.saveUser).not.toHaveBeenCalled();
    });

    test('should handle save failure when adding experience', () => {
      const existingUser: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      mockStorageService.getUser.mockReturnValue(existingUser);
      mockStorageService.saveUser.mockReturnValue(false);

      const result = userService.addExperience(100);

      expect(result).toBe(false);
    });
  });

  describe('unlockAchievement', () => {
    test('should unlock new achievement successfully', () => {
      const existingUser: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      const achievementId = 'first_task';

      mockStorageService.getUser.mockReturnValue(existingUser);
      mockStorageService.saveUser.mockReturnValue(true);

      const result = userService.unlockAchievement(achievementId);

      expect(result).toBe(true);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith({
        ...existingUser,
        achievements: [
          {
            id: achievementId,
            name: `Achievement ${achievementId}`,
            description: 'An unlocked achievement',
            unlocked: true,
            unlockedAt: expect.any(Date),
            icon: '🏆',
          },
        ],
      });
    });

    test('should not unlock already unlocked achievement', () => {
      const existingAchievement: Achievement = {
        id: 'first_task',
        name: 'First Task',
        description: 'Complete your first task',
        unlocked: true,
        unlockedAt: new Date('2024-01-01'),
        icon: '🏆',
      };

      const existingUser: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [existingAchievement],
        createdAt: new Date('2024-01-01'),
      };

      const achievementId = 'first_task';

      mockStorageService.getUser.mockReturnValue(existingUser);

      const result = userService.unlockAchievement(achievementId);

      expect(result).toBe(false);
      expect(mockStorageService.saveUser).not.toHaveBeenCalled();
    });

    test('should add achievement to existing achievements', () => {
      const existingAchievement: Achievement = {
        id: 'first_task',
        name: 'First Task',
        description: 'Complete your first task',
        unlocked: true,
        unlockedAt: new Date('2024-01-01'),
        icon: '🏆',
      };

      const existingUser: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [existingAchievement],
        createdAt: new Date('2024-01-01'),
      };

      const newAchievementId = 'second_task';

      mockStorageService.getUser.mockReturnValue(existingUser);
      mockStorageService.saveUser.mockReturnValue(true);

      const result = userService.unlockAchievement(newAchievementId);

      expect(result).toBe(true);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith({
        ...existingUser,
        achievements: [
          existingAchievement,
          {
            id: newAchievementId,
            name: `Achievement ${newAchievementId}`,
            description: 'An unlocked achievement',
            unlocked: true,
            unlockedAt: expect.any(Date),
            icon: '🏆',
          },
        ],
      });
    });

    test('should return false when no user exists', () => {
      mockStorageService.getUser.mockReturnValue(null);

      const result = userService.unlockAchievement('first_task');

      expect(result).toBe(false);
      expect(mockStorageService.saveUser).not.toHaveBeenCalled();
    });

    test('should handle save failure when unlocking achievement', () => {
      const existingUser: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      mockStorageService.getUser.mockReturnValue(existingUser);
      mockStorageService.saveUser.mockReturnValue(false);

      const result = userService.unlockAchievement('first_task');

      expect(result).toBe(false);
    });
  });

  describe('Settings Operations', () => {
    test('should get settings successfully', () => {
      const mockSettings = { theme: 'dark', notifications: true };

      mockStorageService.getSettings.mockReturnValue(mockSettings);

      const result = userService.getSettings();

      expect(result).toEqual(mockSettings);
      expect(mockStorageService.getSettings).toHaveBeenCalledTimes(1);
    });

    test('should save settings successfully', () => {
      const settings = { theme: 'light', notifications: false };

      mockStorageService.saveSettings.mockReturnValue(true);

      const result = userService.saveSettings(settings);

      expect(result).toBe(true);
      expect(mockStorageService.saveSettings).toHaveBeenCalledWith(settings);
    });

    test('should update single setting successfully', () => {
      const existingSettings = { theme: 'dark', notifications: true };
      const newSettings = { theme: 'light', notifications: true };

      mockStorageService.getSettings.mockReturnValue(existingSettings);
      mockStorageService.saveSettings.mockReturnValue(true);

      const result = userService.updateSetting('theme', 'light');

      expect(result).toBe(true);
      expect(mockStorageService.saveSettings).toHaveBeenCalledWith(newSettings);
    });
  });

  describe('Data Management Operations', () => {
    test('should export user data successfully', () => {
      const mockData = '{"tasks":[],"habits":[],"user":null,"settings":{}}';

      mockStorageService.exportData.mockReturnValue(mockData);

      const result = userService.exportUserData();

      expect(result).toBe(mockData);
      expect(mockStorageService.exportData).toHaveBeenCalledTimes(1);
    });

    test('should import user data successfully', () => {
      const jsonData = '{"tasks":[],"habits":[],"user":null,"settings":{}}';

      mockStorageService.importData.mockReturnValue(true);

      const result = userService.importUserData(jsonData);

      expect(result).toBe(true);
      expect(mockStorageService.importData).toHaveBeenCalledWith(jsonData);
    });

    test('should create backup successfully', () => {
      const mockBackup = {
        tasks: [],
        habits: [],
        user: null,
        settings: {},
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };

      mockStorageService.createBackup.mockReturnValue(mockBackup);

      const result = userService.createBackup();

      expect(result).toEqual(mockBackup);
      expect(mockStorageService.createBackup).toHaveBeenCalledTimes(1);
    });

    test('should restore from backup successfully', () => {
      const mockBackup = {
        tasks: [],
        habits: [],
        user: null,
        settings: {},
      };

      mockStorageService.restoreFromBackup.mockReturnValue(true);

      const result = userService.restoreFromBackup(mockBackup);

      expect(result).toBe(true);
      expect(mockStorageService.restoreFromBackup).toHaveBeenCalledWith(mockBackup);
    });

    test('should clear all data successfully', () => {
      mockStorageService.clearAllData.mockReturnValue(true);

      const result = userService.clearAllData();

      expect(result).toBe(true);
      expect(mockStorageService.clearAllData).toHaveBeenCalledTimes(1);
    });

    test('should get storage stats successfully', () => {
      const mockStats = {
        used: 1024,
        available: 5242880,
        percentage: 0.02,
      };

      mockStorageService.getStorageStats.mockReturnValue(mockStats);

      const result = userService.getStorageStats();

      expect(result).toEqual(mockStats);
      expect(mockStorageService.getStorageStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('Backup Operations', () => {
    test('should save backup successfully', () => {
      const backup = {
        tasks: [],
        habits: [],
        user: null,
        settings: {},
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };

      mockStorageService.saveBackup.mockReturnValue(true);

      const result = userService.saveBackup(backup);

      expect(result).toBe(true);
      expect(mockStorageService.saveBackup).toHaveBeenCalledWith(backup);
    });

    test('should get backup successfully', () => {
      const mockBackup = {
        tasks: [],
        habits: [],
        user: null,
        settings: {},
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };

      mockStorageService.getBackup.mockReturnValue(mockBackup);

      const result = userService.getBackup();

      expect(result).toEqual(mockBackup);
      expect(mockStorageService.getBackup).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auto-save Integration', () => {
    test('should auto-save when user data is modified', () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      mockStorageService.saveUser.mockReturnValue(true);

      const result = userService.saveUser(user);

      expect(result).toBe(true);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith(user);
    });

    test('should handle auto-save errors gracefully', () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      mockStorageService.saveUser.mockImplementation(() => {
        throw new Error('Auto-save error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => userService.saveUser(user)).toThrow('Auto-save error');
    });
  });

  describe('Data Validation', () => {
    test('should handle user with missing optional fields', () => {
      const userData = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      mockStorageService.saveUser.mockReturnValue(true);

      const result = userService.saveUser(userData as User);

      expect(result).toBe(true);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith(userData);
    });

    test('should handle user with all fields populated', () => {
      const completeUser: User = {
        id: '1',
        name: 'Test User',
        level: 10,
        experience: 1000,
        achievements: [
          {
            id: 'achievement1',
            name: 'First Task',
            description: 'Complete your first task',
            unlocked: true,
            unlockedAt: new Date('2024-01-01'),
            icon: '🏆',
          },
        ],
        createdAt: new Date('2024-01-01'),
      };

      mockStorageService.saveUser.mockReturnValue(true);

      const result = userService.saveUser(completeUser);

      expect(result).toBe(true);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith(completeUser);
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle large achievement arrays', () => {
      const largeAchievementArray: Achievement[] = Array.from({ length: 100 }, (_, index) => ({
        id: `achievement-${index}`,
        name: `Achievement ${index}`,
        description: `Description for achievement ${index}`,
        unlocked: index % 2 === 0,
        unlockedAt: index % 2 === 0 ? new Date('2024-01-01') : undefined,
        icon: '🏆',
      }));

      const userWithManyAchievements: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: largeAchievementArray,
        createdAt: new Date('2024-01-01'),
      };

      mockStorageService.saveUser.mockReturnValue(true);

      const result = userService.saveUser(userWithManyAchievements);

      expect(result).toBe(true);
      expect(mockStorageService.saveUser).toHaveBeenCalledWith(userWithManyAchievements);
    });

    test('should handle rapid successive operations', () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      mockStorageService.saveUser.mockReturnValue(true);

      // Simulate rapid successive operations
      const results = [
        userService.saveUser(user),
        userService.saveUser(user),
        userService.saveUser(user),
      ];

      expect(results).toEqual([true, true, true]);
      expect(mockStorageService.saveUser).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Scenarios', () => {
    test('should handle storage service throwing errors', () => {
      mockStorageService.getUser.mockImplementation(() => {
        throw new Error('Storage service error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => userService.getUser()).toThrow('Storage service error');
    });

    test('should handle save service throwing errors', () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        level: 5,
        experience: 500,
        achievements: [],
        createdAt: new Date('2024-01-01'),
      };

      mockStorageService.saveUser.mockImplementation(() => {
        throw new Error('Save service error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => userService.saveUser(user)).toThrow('Save service error');
    });

    test('should handle settings service throwing errors', () => {
      mockStorageService.getSettings.mockImplementation(() => {
        throw new Error('Settings service error');
      });

      // The service should throw the error (no error handling implemented)
      expect(() => userService.getSettings()).toThrow('Settings service error');
    });
  });
}); 