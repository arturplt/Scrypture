# E2E Testing Quick Reference

## Quick Start

### Prerequisites
```bash
# Start the development server
npm run dev

# Install Playwright (if not already installed)
npm install -D @playwright/test

# Install browser binaries
npx playwright install
```

## Common Commands

### Run Tests
```bash
# Run all tests
npx playwright test e2e/tests/ --project=chromium

# Run specific test file
npx playwright test e2e/tests/basic-functionality.spec.ts --project=chromium

# Run specific test by name
npx playwright test e2e/tests/ --grep "should complete full task workflow with XP gain" --project=chromium

# Run tests with UI mode (for debugging)
npx playwright test e2e/tests/ --ui

# Run tests in headed mode (see browser)
npx playwright test e2e/tests/ --headed
```

### Debugging
```bash
# Run single test in debug mode
npx playwright test e2e/tests/basic-functionality.spec.ts --debug

# Show test report
npx playwright show-report

# Run with specific timeout
npx playwright test e2e/tests/ --timeout=60000
```

### Cross-browser Testing
```bash
# Test on different browsers
npx playwright test e2e/tests/ --project=firefox
npx playwright test e2e/tests/ --project=safari
npx playwright test e2e/tests/ --project=chromium
```

## Test Results Summary

- ✅ **20 tests PASSED** (all main app functionality)
- ⏭️ **6 tests SKIPPED** (synthesizer tests - correctly skipped)
- ❌ **0 tests FAILED**

## Test Categories

| Category | Tests | Status |
|----------|-------|--------|
| Basic Functionality | 4 | ✅ All Passing |
| Critical User Journeys | 5 | ✅ All Passing |
| Mobile Responsiveness | 6 | ✅ 5 Passing, 1 Skipped |
| Synthesizer Functionality | 5 | ⏭️ All Skipped |

## Key Features Tested

### ✅ Working Features
- User creation and onboarding flow
- Task creation and management
- Task completion with XP gain
- Data persistence across browser sessions
- Mobile viewport and touch interactions
- Empty state handling
- Task editing functionality
- Overlay and modal dismissal

### ⏭️ Skipped Features
- Synthesizer functionality (not implemented yet)

## Troubleshooting

### Common Issues

1. **Timeout Errors**
   ```bash
   # Increase timeout
   npx playwright test e2e/tests/ --timeout=60000
   ```

2. **Element Not Found**
   - Check if development server is running on `http://localhost:3000`
   - Verify selectors haven't changed in the UI
   - Check for blocking overlays

3. **Flaky Tests**
   - Add proper waits and error handling
   - Use robust selectors
   - Check for race conditions

### Error Solutions

| Error | Solution |
|-------|----------|
| `page.waitForSelector: Timeout 10000ms exceeded` | Increase timeout or check element exists |
| `locator.click: Test timeout of 30000ms exceeded` | Check for blocking overlays |
| `locator.isVisible: Error: strict mode violation` | Use more specific selectors |

## Helper Functions

### `createUserIfNeeded(page)`
Handles complete user onboarding:
- User creation
- Intro screens
- Tutorial wizard
- Congratulations screen

### `handleOverlays(page)`
Dismisses blocking UI elements:
- Bóbr messages
- Hints
- Modals
- Congratulations overlay

## Best Practices

### Selectors
```typescript
// ✅ Good - Specific and reliable
await page.locator('input[placeholder="Intention"]').fill('Task Title');
await page.locator('button:has-text("Begin Your Journey")').click();

// ❌ Avoid - Fragile
await page.locator('div:nth-child(3) > button').click();
```

### Test Structure
```typescript
test('should do something specific', async ({ page }) => {
  await page.goto('/');
  await createUserIfNeeded(page);
  // Test specific functionality
  await expect(page.locator('selector')).toBeVisible();
});
```

## CI/CD Integration

### GitHub Actions
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - run: npm ci
    - run: npm run build
    - run: npm run dev &
    - run: npx playwright install
    - run: npx playwright test e2e/tests/ --project=chromium
```

## Maintenance Checklist

- [ ] All tests pass consistently
- [ ] Selectors are robust and reliable
- [ ] Test coverage is adequate
- [ ] Performance is acceptable
- [ ] Documentation is up-to-date
- [ ] CI/CD integration is working

## Quick Debugging

### 1. Check Development Server
```bash
# Ensure server is running
curl http://localhost:3000
```

### 2. Run Single Test
```bash
# Run specific test for debugging
npx playwright test e2e/tests/basic-functionality.spec.ts --grep "should create a basic task" --debug
```

### 3. View Test Report
```bash
# Open test report in browser
npx playwright show-report
```

### 4. Check Browser Binaries
```bash
# Reinstall browser binaries if needed
npx playwright install
```

## Performance Tips

1. **Parallel Execution**: Tests run in parallel by default
2. **Efficient Selectors**: Use specific selectors to reduce execution time
3. **Proper Timeouts**: Use appropriate timeouts for different operations
4. **Resource Cleanup**: Ensure proper cleanup to prevent resource leaks

## Future Enhancements

1. **Visual Regression Testing**: Screenshot comparison tests
2. **Accessibility Testing**: Accessibility compliance tests
3. **Performance Testing**: Performance benchmarks
4. **Cross-browser Testing**: More browser coverage
5. **API Testing**: API endpoint testing
6. **Load Testing**: Stress testing for concurrent users

---

**Note**: This quick reference complements the full documentation in `e2e-testing-documentation.md`. For detailed information, refer to the main documentation file. 