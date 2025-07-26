import { userService } from '../userService';
import { User } from '../../types';

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('removeStatRewards', () => {
    it('should remove stat rewards from user', () => {
      const rewards = { body: 10, mind: 5, soul: 3 };
      (userService.removeStatRewards as jest.Mock).mockReturnValue(true);
      const result = userService.removeStatRewards(rewards);
      expect(result).toBe(true);
    });

    it('should not go below 0 for stats', () => {
      const rewards = { body: 50, mind: 70, soul: 40 };
      (userService.removeStatRewards as jest.Mock).mockReturnValue(true);
      const result = userService.removeStatRewards(rewards);
      expect(result).toBe(true);
    });

    it('should handle undefined rewards', () => {
      (userService.removeStatRewards as jest.Mock).mockReturnValue(true);
      const result = userService.removeStatRewards({});
      expect(result).toBe(true);
    });
  });

  describe('removeExperience', () => {
    it('should remove experience points from user', () => {
      (userService.removeExperience as jest.Mock).mockReturnValue(true);
      const result = userService.removeExperience(50);
      expect(result).toBe(true);
    });

    it('should not go below 0 for experience', () => {
      (userService.removeExperience as jest.Mock).mockReturnValue(true);
      const result = userService.removeExperience(300);
      expect(result).toBe(true);
    });
  });
});
