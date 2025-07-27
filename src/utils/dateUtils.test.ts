import { formatRelativeTime } from './dateUtils';

describe('dateUtils', () => {
  describe('formatRelativeTime', () => {
    let originalDate: typeof Date;
    let mockNow: Date;

    beforeEach(() => {
      // Store the original Date constructor
      originalDate = global.Date;
      mockNow = new Date('2024-01-15T12:00:00.000Z');
      
      // Mock Date constructor to return our mock date when called with no arguments
      const MockDate = function(...args: any[]) {
        if (args.length === 0) {
          return mockNow;
        }
        return new originalDate(...(args as [any]));
      } as any;
      
      // Copy static methods
      MockDate.now = jest.fn(() => mockNow.getTime());
      MockDate.parse = originalDate.parse;
      MockDate.UTC = originalDate.UTC;
      MockDate.prototype = originalDate.prototype;
      
      global.Date = MockDate;
    });

    afterEach(() => {
      // Restore the original Date constructor
      global.Date = originalDate;
    });

    it('should return "just now" for dates less than 60 seconds ago', () => {
      const date = new Date('2024-01-15T11:59:30.000Z'); // 30 seconds ago
      expect(formatRelativeTime(date)).toBe('just now');
    });

    it('should return "just now" for dates exactly 59 seconds ago', () => {
      const date = new Date('2024-01-15T11:59:01.000Z'); // 59 seconds ago
      expect(formatRelativeTime(date)).toBe('just now');
    });

    it('should return "1 minute ago" for dates exactly 60 seconds ago', () => {
      const date = new Date('2024-01-15T11:59:00.000Z'); // 1 minute ago
      expect(formatRelativeTime(date)).toBe('1 minute ago');
    });

    it('should return "2 minutes ago" for dates 2 minutes ago', () => {
      const date = new Date('2024-01-15T11:58:00.000Z'); // 2 minutes ago
      expect(formatRelativeTime(date)).toBe('2 minutes ago');
    });

    it('should return "59 minutes ago" for dates just under 1 hour ago', () => {
      const date = new Date('2024-01-15T11:01:00.000Z'); // 59 minutes ago
      expect(formatRelativeTime(date)).toBe('59 minutes ago');
    });

    it('should return "1 hour ago" for dates exactly 1 hour ago', () => {
      const date = new Date('2024-01-15T11:00:00.000Z'); // 1 hour ago
      expect(formatRelativeTime(date)).toBe('1 hour ago');
    });

    it('should return "2 hours ago" for dates 2 hours ago', () => {
      const date = new Date('2024-01-15T10:00:00.000Z'); // 2 hours ago
      expect(formatRelativeTime(date)).toBe('2 hours ago');
    });

    it('should return "23 hours ago" for dates just under 1 day ago', () => {
      const date = new Date('2024-01-14T13:00:00.000Z'); // 23 hours ago
      expect(formatRelativeTime(date)).toBe('23 hours ago');
    });

    it('should return "1 day ago" for dates exactly 1 day ago', () => {
      const date = new Date('2024-01-14T12:00:00.000Z'); // 1 day ago
      expect(formatRelativeTime(date)).toBe('1 day ago');
    });

    it('should return "2 days ago" for dates 2 days ago', () => {
      const date = new Date('2024-01-13T12:00:00.000Z'); // 2 days ago
      expect(formatRelativeTime(date)).toBe('2 days ago');
    });

    it('should return "6 days ago" for dates just under 1 week ago', () => {
      const date = new Date('2024-01-09T12:00:00.000Z'); // 6 days ago
      expect(formatRelativeTime(date)).toBe('6 days ago');
    });

    it('should return "1 week ago" for dates exactly 1 week ago', () => {
      const date = new Date('2024-01-08T12:00:00.000Z'); // 1 week ago
      expect(formatRelativeTime(date)).toBe('1 week ago');
    });

    it('should return "2 weeks ago" for dates 2 weeks ago', () => {
      const date = new Date('2024-01-01T12:00:00.000Z'); // 2 weeks ago
      expect(formatRelativeTime(date)).toBe('2 weeks ago');
    });

    it('should return "3 weeks ago" for dates just under 1 month ago', () => {
      const date = new Date('2023-12-25T12:00:00.000Z'); // 3 weeks ago
      expect(formatRelativeTime(date)).toBe('3 weeks ago');
    });

    it('should return "1 month ago" for dates approximately 1 month ago', () => {
      const date = new Date('2023-12-15T12:00:00.000Z'); // 1 month ago
      expect(formatRelativeTime(date)).toBe('1 month ago');
    });

    it('should return "2 months ago" for dates 2 months ago', () => {
      const date = new Date('2023-11-15T12:00:00.000Z'); // 2 months ago
      expect(formatRelativeTime(date)).toBe('2 months ago');
    });

    it('should return "11 months ago" for dates just under 1 year ago', () => {
      const date = new Date('2023-02-15T12:00:00.000Z'); // 11 months ago
      expect(formatRelativeTime(date)).toBe('11 months ago');
    });

    it('should return "1 year ago" for dates approximately 1 year ago', () => {
      const date = new Date('2023-01-15T12:00:00.000Z'); // 1 year ago
      expect(formatRelativeTime(date)).toBe('1 year ago');
    });

    it('should return "2 years ago" for dates 2 years ago', () => {
      const date = new Date('2022-01-15T12:00:00.000Z'); // 2 years ago
      expect(formatRelativeTime(date)).toBe('2 years ago');
    });

    it('should return "5 years ago" for dates 5 years ago', () => {
      const date = new Date('2019-01-15T12:00:00.000Z'); // 5 years ago
      expect(formatRelativeTime(date)).toBe('5 years ago');
    });

    it('should handle future dates correctly', () => {
      const date = new Date('2024-01-16T12:00:00.000Z'); // 1 day in the future
      expect(formatRelativeTime(date)).toBe('just now');
    });

    it('should handle edge case of same timestamp', () => {
      const date = new Date('2024-01-15T12:00:00.000Z'); // Same as mock date
      expect(formatRelativeTime(date)).toBe('just now');
    });
  });
}); 