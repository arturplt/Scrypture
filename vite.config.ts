import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isDevelopment = command === 'serve'
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true, // Allow external access
      https: false, // Disable HTTPS in development
          headers: {
        // Content Security Policy Headers - more permissive in development
        'Content-Security-Policy': isDevelopment ? [
          // Development CSP - more permissive
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: http: https:",
          "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com",
          "connect-src 'self' http: https: ws: wss:",
          "media-src 'self' data: blob:",
          "object-src 'none'",
          "frame-src 'self'",
          "worker-src 'self' blob:",
          "manifest-src 'self'",
          "form-action 'self'",
          "base-uri 'self'"
        ].join('; ') : [
          // Production CSP - more restrictive
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: https: blob:",
          "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com",
          "connect-src 'self' https: wss:",
          "media-src 'self' data:",
          "object-src 'none'",
          "frame-src 'self'",
          "worker-src 'self' blob:",
          "manifest-src 'self'",
          "form-action 'self'",
          "base-uri 'self'",
          "upgrade-insecure-requests"
        ].join('; '),
      
      // Additional Security Headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  base: '/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  }
}) 