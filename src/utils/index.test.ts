import { generateUUID } from './index';

describe('utils/index', () => {
  describe('generateUUID', () => {
    let originalCrypto: Crypto | undefined;
    let originalRandomUUID: (() => string) | undefined;

    beforeEach(() => {
      // Store original crypto object
      originalCrypto = global.crypto;
      if (global.crypto) {
        originalRandomUUID = global.crypto.randomUUID;
      }
    });

    afterEach(() => {
      // Restore original crypto object
      if (originalCrypto) {
        Object.defineProperty(global, 'crypto', {
          value: originalCrypto,
          writable: true,
          configurable: true
        });
      } else {
        delete (global as any).crypto;
      }
    });

    it('should generate a UUID using crypto.randomUUID when available', () => {
      // Mock crypto.randomUUID
      const mockRandomUUID = jest.fn(() => '12345678-1234-1234-1234-123456789abc');
      Object.defineProperty(global, 'crypto', {
        value: {
          randomUUID: mockRandomUUID,
        },
        writable: true,
        configurable: true
      });

      const result = generateUUID();
      
      expect(result).toBe('12345678-1234-1234-1234-123456789abc');
      expect(mockRandomUUID).toHaveBeenCalledTimes(1);
    });

    it('should use fallback implementation when crypto.randomUUID is not available', () => {
      // Mock crypto without randomUUID
      Object.defineProperty(global, 'crypto', {
        value: {},
        writable: true,
        configurable: true
      });

      const result = generateUUID();
      
      // Should match UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should use fallback implementation when crypto is not available', () => {
      // Remove crypto from global
      delete (global as any).crypto;

      const result = generateUUID();
      
      // Should match UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate different UUIDs on multiple calls', () => {
      // Mock crypto without randomUUID to use fallback
      Object.defineProperty(global, 'crypto', {
        value: {},
        writable: true,
        configurable: true
      });

      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      const uuid3 = generateUUID();
      
      expect(uuid1).not.toBe(uuid2);
      expect(uuid1).not.toBe(uuid3);
      expect(uuid2).not.toBe(uuid3);
    });

    it('should generate valid UUID v4 format with fallback implementation', () => {
      // Mock crypto without randomUUID to use fallback
      Object.defineProperty(global, 'crypto', {
        value: {},
        writable: true,
        configurable: true
      });

      const result = generateUUID();
      
      // Check UUID v4 format:
      // - 8 hex digits
      // - 4 hex digits  
      // - 4 hex digits (first digit must be 4)
      // - 4 hex digits (first digit must be 8, 9, a, or b)
      // - 12 hex digits
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
      expect(result).toMatch(uuidRegex);
    });

    it('should handle crypto.randomUUID returning different values', () => {
      // Mock crypto.randomUUID to return different values
      const mockRandomUUID = jest.fn()
        .mockReturnValueOnce('11111111-1111-1111-1111-111111111111')
        .mockReturnValueOnce('22222222-2222-2222-2222-222222222222');
      
      Object.defineProperty(global, 'crypto', {
        value: {
          randomUUID: mockRandomUUID,
        },
        writable: true,
        configurable: true
      });

      const result1 = generateUUID();
      const result2 = generateUUID();
      
      expect(result1).toBe('11111111-1111-1111-1111-111111111111');
      expect(result2).toBe('22222222-2222-2222-2222-222222222222');
      expect(mockRandomUUID).toHaveBeenCalledTimes(2);
    });

    it('should handle edge case where crypto.randomUUID returns empty string', () => {
      // Mock crypto.randomUUID to return empty string
      const mockRandomUUID = jest.fn(() => '');
      Object.defineProperty(global, 'crypto', {
        value: {
          randomUUID: mockRandomUUID,
        },
        writable: true,
        configurable: true
      });

      const result = generateUUID();
      
      // Should return empty string as-is (current behavior)
      expect(result).toBe('');
    });

    it('should handle edge case where crypto.randomUUID returns invalid UUID', () => {
      // Mock crypto.randomUUID to return invalid UUID
      const mockRandomUUID = jest.fn(() => 'invalid-uuid');
      Object.defineProperty(global, 'crypto', {
        value: {
          randomUUID: mockRandomUUID,
        },
        writable: true,
        configurable: true
      });

      const result = generateUUID();
      
      // Should return the invalid UUID as-is (this is the current behavior)
      expect(result).toBe('invalid-uuid');
    });
  });
}); 