import { userService } from '../userService';
import { storageService } from '../storageService';

// Mock the storage service
jest.mock('../storageService', () => ({
  storageService: {
    getUser: jest.fn(),
    saveUser: jest.fn(),
  },
}));

describe('userService', () => {
  const mockUser = {
    id: 'user_1',
    name: 'Test User',
    level: 5,
    experience: 250,
    body: 45,
    mind: 60,
    soul: 30,
    achievements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (storageService.getUser as jest.Mock).mockReturnValue(mockUser);
    (storageService.saveUser as jest.Mock).mockReturnValue(true);
  });

  describe('removeStatRewards', () => {
    it('should remove stat rewards from user', () => {
      const rewards = { body: 10, mind: 5, soul: 3, xp: 20 };
      const result = userService.removeStatRewards(rewards);

      expect(result).toBe(true);
      expect(storageService.saveUser).toHaveBeenCalledWith({
        ...mockUser,
        body: 35, // 45 - 10
        mind: 55, // 60 - 5
        soul: 27, // 30 - 3
        updatedAt: expect.any(Date),
      });
    });

    it('should not go below 0 for stats', () => {
      const rewards = { body: 50, mind: 70, soul: 40 };
      const result = userService.removeStatRewards(rewards);

      expect(result).toBe(true);
      expect(storageService.saveUser).toHaveBeenCalledWith({
        ...mockUser,
        body: 0, // 45 - 50 = 0 (clamped)
        mind: 0, // 60 - 70 = 0 (clamped)
        soul: 0, // 30 - 40 = 0 (clamped)
        updatedAt: expect.any(Date),
      });
    });

    it('should handle undefined rewards', () => {
      const rewards = { body: undefined, mind: undefined, soul: undefined };
      const result = userService.removeStatRewards(rewards);

      expect(result).toBe(true);
      expect(storageService.saveUser).toHaveBeenCalledWith({
        ...mockUser,
        body: 45, // unchanged
        mind: 60, // unchanged
        soul: 30, // unchanged
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('removeExperience', () => {
    it('should remove experience points from user', () => {
      const result = userService.removeExperience(50);

      expect(result).toBe(true);
      expect(storageService.saveUser).toHaveBeenCalledWith({
        ...mockUser,
        experience: 200, // 250 - 50
        level: 3, // Math.floor(200 / 100) + 1
        updatedAt: expect.any(Date),
      });
    });

    it('should not go below 0 for experience', () => {
      const result = userService.removeExperience(300);

      expect(result).toBe(true);
      expect(storageService.saveUser).toHaveBeenCalledWith({
        ...mockUser,
        experience: 0, // 250 - 300 = 0 (clamped)
        level: 1, // Math.floor(0 / 100) + 1
        updatedAt: expect.any(Date),
      });
    });
  });
}); 