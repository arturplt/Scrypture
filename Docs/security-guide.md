# 🔒 Security Guide - Scrypture

## Content Security Policy (CSP) Headers

### What are CSP Headers?

Content Security Policy (CSP) headers are HTTP response headers that help protect websites from various types of attacks, particularly:

- **XSS (Cross-Site Scripting)** attacks
- **Data injection** attacks
- **Resource hijacking**
- **Clickjacking** attempts

### How CSP Works

CSP headers tell the browser which resources are allowed to be loaded and executed on a webpage. They act as a "whitelist" of trusted sources.

#### Basic Structure:
```
Content-Security-Policy: directive source-list
```

#### Example CSP Header:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
```

### CSP Directives Used in Scrypture

| Directive | Purpose | Scrypture Configuration |
|-----------|---------|------------------------|
| `default-src` | Default policy for all resource types | `'self'` (same-origin only) |
| `script-src` | Controls JavaScript sources | `'self' 'unsafe-inline' 'unsafe-eval'` |
| `style-src` | Controls CSS sources | `'self' 'unsafe-inline'` |
| `img-src` | Controls image sources | `'self' data: https: blob:` |
| `font-src` | Controls font sources | `'self' data:` |
| `connect-src` | Controls AJAX/fetch requests | `'self' https: wss:` |
| `object-src` | Controls plugin sources | `'none'` (blocked for security) |
| `frame-src` | Controls iframe sources | `'self'` (development) / `'none'` (production) |

### Environment-Specific CSP Configurations

#### Development Environment
```javascript
// More permissive for debugging
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
].join('; ')
```

#### Production Environment
```javascript
// Strict security policies
'Content-Security-Policy': [
  "default-src 'self'",
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
].join('; ')
```

### Additional Security Headers

#### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
Prevents MIME type sniffing attacks.

#### X-Frame-Options
```
X-Frame-Options: DENY
```
Prevents clickjacking by blocking iframe embedding.

#### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
Enables browser's XSS protection (legacy, but still useful).

#### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
Controls how much referrer information is sent.

#### Permissions-Policy
```
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
```
Restricts browser features and APIs.

#### Strict-Transport-Security (Production Only)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
Forces HTTPS connections.

### CSP Nonces (Production Security)

For maximum security in production, CSP nonces can be used:

```javascript
// Generate a unique nonce for each request
const nonce = generateNonce();

// Add nonce to CSP header
"script-src 'self' 'nonce-${nonce}' 'strict-dynamic'"

// Use nonce in script tags
<script nonce="${nonce}">
  // Inline script content
</script>
```

### Testing CSP Configuration

#### Manual Testing
1. Open browser developer tools
2. Check Console for CSP violations
3. Verify all resources load correctly
4. Test functionality that requires external resources

#### Automated Testing
```javascript
// Test CSP headers are present
test('should have CSP headers', () => {
  const response = await fetch('/');
  expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
});

// Test CSP configuration is valid
test('should have valid CSP configuration', () => {
  const config = getCSPConfig('production');
  expect(validateCSPConfig(config)).toBe(true);
});
```

### Common CSP Violations and Solutions

#### 1. Inline Scripts Blocked
**Problem:** React's inline scripts are blocked
**Solution:** Use `'unsafe-inline'` for development, nonces for production

#### 2. External Resources Blocked
**Problem:** CDN resources or APIs blocked
**Solution:** Add trusted domains to appropriate directives

#### 3. WebSocket Connections Blocked
**Problem:** Real-time features don't work
**Solution:** Add `wss:` to `connect-src` directive

#### 4. Data URIs Blocked
**Problem:** Base64 encoded images don't load
**Solution:** Add `data:` to `img-src` directive

### Security Best Practices

#### 1. Principle of Least Privilege
- Start with restrictive policies
- Gradually add permissions as needed
- Use `'self'` instead of `*` when possible

#### 2. Regular Security Audits
- Monitor CSP violation reports
- Review and update policies regularly
- Test with security tools

#### 3. Environment-Specific Policies
- Use different policies for dev/staging/production
- More permissive in development for debugging
- Strict policies in production

#### 4. Monitoring and Reporting
```javascript
// Add CSP violation reporting
'Content-Security-Policy-Report-Only': '...; report-uri /csp-violation-report'
```

### Integration with Scrypture

#### Current Implementation
- CSP headers configured in `vite.config.ts`
- Environment-specific configurations in `csp-config.js`
- Security tests in test suite

#### Future Enhancements
- CSP violation monitoring
- Dynamic nonce generation
- Automated security scanning
- Security headers validation

### Resources

- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [CSP Level 3 Specification](https://www.w3.org/TR/CSP3/)
- [Security Headers](https://securityheaders.com/)

---

*This security guide is part of the Scrypture documentation. For questions or contributions, please refer to the main documentation.* 