/**
 * CSP Security Tests for Scrypture
 * 
 * These tests verify that Content Security Policy headers are properly configured
 * and that the application follows security best practices.
 */

import { getCSPConfig, validateCSPConfig, generateNonce } from '../../csp-config';

describe('CSP Security Configuration', () => {
  describe('CSP Configuration Validation', () => {
    it('should have valid development CSP configuration', () => {
      const config = getCSPConfig('development');
      expect(validateCSPConfig(config)).toBe(true);
    });

    it('should have valid production CSP configuration', () => {
      const config = getCSPConfig('production');
      expect(validateCSPConfig(config)).toBe(true);
    });

    it('should have valid testing CSP configuration', () => {
      const config = getCSPConfig('testing');
      expect(validateCSPConfig(config)).toBe(true);
    });

    it('should include required CSP directives', () => {
      const config = getCSPConfig('production');
      const csp = config['Content-Security-Policy'];
      
      expect(csp).toContain('default-src');
      expect(csp).toContain('script-src');
      expect(csp).toContain('style-src');
      expect(csp).toContain('img-src');
      expect(csp).toContain('connect-src');
    });

    it('should block object-src for security', () => {
      const config = getCSPConfig('production');
      const csp = config['Content-Security-Policy'];
      
      expect(csp).toContain("object-src 'none'");
    });

    it('should include security headers', () => {
      const config = getCSPConfig('production');
      
      expect(config['X-Content-Type-Options']).toBe('nosniff');
      expect(config['X-Frame-Options']).toBe('DENY');
      expect(config['X-XSS-Protection']).toBe('1; mode=block');
      expect(config['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Environment-Specific Configurations', () => {
    it('should have different policies for development and production', () => {
      const devConfig = getCSPConfig('development');
      const prodConfig = getCSPConfig('production');
      
      expect(devConfig['Content-Security-Policy']).not.toBe(prodConfig['Content-Security-Policy']);
    });

    it('should allow WebSocket connections in development', () => {
      const config = getCSPConfig('development');
      const csp = config['Content-Security-Policy'];
      
      expect(csp).toContain('wss:');
      expect(csp).toContain('ws:');
    });

    it('should block WebSocket connections in production', () => {
      const config = getCSPConfig('production');
      const csp = config['Content-Security-Policy'];
      
      expect(csp).not.toContain('wss:');
      expect(csp).not.toContain('ws:');
    });

    it('should include HSTS in production', () => {
      const config = getCSPConfig('production');
      
      expect(config['Strict-Transport-Security']).toBeDefined();
      expect(config['Strict-Transport-Security']).toContain('max-age=31536000');
    });

    it('should not include HSTS in development', () => {
      const config = getCSPConfig('development');
      
      expect(config['Strict-Transport-Security']).toBeUndefined();
    });
  });

  describe('Nonce Generation', () => {
    it('should generate unique nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      
      expect(nonce1).toBeDefined();
      expect(nonce2).toBeDefined();
      expect(nonce1).not.toBe(nonce2);
    });

    it('should generate nonces with correct format', () => {
      const nonce = generateNonce();
      
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(10);
      expect(/^[a-z0-9]+$/i.test(nonce)).toBe(true);
    });

    it('should include nonce in production CSP', () => {
      const config = getCSPConfig('production');
      
      expect(config.nonce).toBeDefined();
      expect(config['Content-Security-Policy']).toMatch(/nonce-[a-z0-9]+/i);
      expect(config['Content-Security-Policy']).toContain('strict-dynamic');
    });
  });

  describe('Security Best Practices', () => {
    it('should use strict-dynamic in production', () => {
      const config = getCSPConfig('production');
      const csp = config['Content-Security-Policy'];
      
      expect(csp).toContain('strict-dynamic');
    });

    it('should upgrade insecure requests in production', () => {
      const config = getCSPConfig('production');
      const csp = config['Content-Security-Policy'];
      
      expect(csp).toContain('upgrade-insecure-requests');
    });

    it('should block frame embedding in production', () => {
      const config = getCSPConfig('production');
      const csp = config['Content-Security-Policy'];
      
      expect(csp).toContain("frame-src 'none'");
    });

    it('should allow frame embedding in development', () => {
      const config = getCSPConfig('development');
      const csp = config['Content-Security-Policy'];
      
      expect(csp).toContain("frame-src 'self'");
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid environment gracefully', () => {
      const config = getCSPConfig('invalid-env');
      
      expect(config).toBeDefined();
      expect(validateCSPConfig(config)).toBe(true);
    });

    it('should validate CSP configuration correctly', () => {
      const validConfig = {
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'"
      };
      
      const invalidConfig = {
        'Content-Security-Policy': "default-src 'self'"
      };
      
      expect(validateCSPConfig(validConfig)).toBe(true);
      expect(validateCSPConfig(invalidConfig)).toBe(false);
    });
  });
}); 