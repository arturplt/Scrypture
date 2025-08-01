/**
 * Content Security Policy Configuration for Scrypture
 * 
 * This file contains CSP configurations for different environments:
 * - Development: More permissive for debugging
 * - Production: Strict security policies
 * - Testing: Balanced security for testing
 */

const CSP_CONFIGS = {
  // Development CSP - More permissive for debugging
  development: {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss: ws:",
      "media-src 'self' data:",
      "object-src 'none'",
      "frame-src 'self'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "form-action 'self'",
      "base-uri 'self'"
    ].join('; '),
    
    // Additional security headers for development
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  },

  // Production CSP - Strict security policies
  production: {
    'Content-Security-Policy': [
      "default-src 'self'",
      // Use nonces for inline scripts in production
      "script-src 'self' 'strict-dynamic'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "media-src 'self' data:",
      "object-src 'none'",
      "frame-src 'none'",
      "worker-src 'self'",
      "manifest-src 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests"
    ].join('; '),
    
    // Comprehensive security headers for production
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  },

  // Testing CSP - Balanced security for testing
  testing: {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "media-src 'self' data:",
      "object-src 'none'",
      "frame-src 'self'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "form-action 'self'",
      "base-uri 'self'"
    ].join('; '),
    
    // Security headers for testing
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
};

/**
 * Generate CSP nonce for production use
 * @returns {string} Random nonce string
 */
function generateNonce() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Get CSP configuration for environment
 * @param {string} env - Environment ('development', 'production', 'testing')
 * @returns {Object} CSP headers configuration
 */
function getCSPConfig(env = 'development') {
  const config = CSP_CONFIGS[env] || CSP_CONFIGS.development;
  
  // For production, add nonce to script-src
  if (env === 'production') {
    const nonce = generateNonce();
    config['Content-Security-Policy'] = config['Content-Security-Policy']
      .replace("script-src 'self' 'strict-dynamic'", `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`);
    config.nonce = nonce;
  }
  
  return config;
}

/**
 * Validate CSP configuration
 * @param {Object} config - CSP configuration to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateCSPConfig(config) {
  const requiredHeaders = ['Content-Security-Policy'];
  const requiredDirectives = ['default-src', 'script-src', 'style-src'];
  
  // Check required headers
  for (const header of requiredHeaders) {
    if (!config[header]) {
      console.error(`Missing required CSP header: ${header}`);
      return false;
    }
  }
  
  // Check required directives
  const csp = config['Content-Security-Policy'];
  for (const directive of requiredDirectives) {
    if (!csp.includes(directive)) {
      console.error(`Missing required CSP directive: ${directive}`);
      return false;
    }
  }
  
  return true;
}

module.exports = {
  CSP_CONFIGS,
  getCSPConfig,
  generateNonce,
  validateCSPConfig
}; 