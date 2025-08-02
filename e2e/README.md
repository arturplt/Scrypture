# E2E Testing with Playwright

This directory contains end-to-end tests for the Scrypture application using Playwright.

## 🎯 Overview

E2E tests validate complete user workflows and ensure the application works correctly across different browsers and devices.

## 📁 Structurenpm run test:e2e:report

```
e2e/
├── tests/
│   ├── critical-journeys.spec.ts    # Core user workflows
│   ├── synthesizer.spec.ts          # Audio/synthesizer functionality
│   └── mobile.spec.ts               # Mobile responsiveness
├── fixtures/
│   └── test-data.ts                 # Test data and interfaces
└── README.md                        # This file
```

## 🚀 Quick Start

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run with debug mode
npm run test:e2e:debug

# Run only mobile tests
npm run test:e2e:mobile

# Show test report

```

### Running Specific Tests

```bash
# Run specific test file
npx playwright test critical-journeys.spec.ts

# Run specific test by name
npx playwright test -g "should complete full task workflow"

# Run tests on specific browser
npx playwright test --project=chromium
```

## 🧪 Test Categories

### 1. Critical User Journeys (`critical-journeys.spec.ts`)

Tests the most important user workflows:

- **Task Creation → Completion → XP Gain**: Full task lifecycle
- **Habit Management**: Creating and tracking habits
- **Data Persistence**: Data survives browser sessions
- **Empty State Handling**: App behavior with no data
- **Task Editing**: Modifying existing tasks

### 2. Synthesizer Functionality (`synthesizer.spec.ts`)

Tests the audio synthesizer component:

- **Modal Opening/Closing**: Synthesizer interface
- **Audio Playback**: Basic sound generation
- **Multi-track Sequencing**: Creating complex patterns
- **Control Interactions**: Volume, tempo, etc.
- **Touch Interactions**: Mobile audio controls

### 3. Mobile Responsiveness (`mobile.spec.ts`)

Tests mobile-specific functionality:

- **Mobile Viewport**: Layout on small screens
- **Touch Interactions**: Tap, swipe, scroll
- **Mobile Navigation**: Menu and navigation
- **Form Interactions**: Mobile keyboard input
- **Scrolling**: Long content handling

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Devices**: Desktop and mobile viewports
- **Timeouts**: 30s test timeout, 10s expect timeout
- **Web Server**: Auto-starts dev server on port 5173
- **Reporting**: HTML reports with screenshots/videos on failure

### Test Data (`fixtures/test-data.ts`)

Contains sample data for tests:

```typescript
export const sampleTasks: TestTask[] = [
  {
    title: 'Complete E2E testing setup',
    description: 'Set up Playwright for end-to-end testing',
    category: 'development',
    completed: false,
  },
  // ... more sample data
];
```

## 🎯 Writing Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Setup code
  });

  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.fill('[placeholder="Input"]', 'test value');
    
    // Act
    await page.click('button:has-text("Submit")');
    
    // Assert
    await expect(page.locator('.result')).toContainText('expected');
  });
});
```

### Best Practices

1. **Use Semantic Selectors**
   ```typescript
   // Good
   await page.click('[data-testid="add-task-button"]');
   await page.fill('[placeholder="Task title"]', 'New Task');
   
   // Avoid
   await page.click('.btn-primary');
   await page.fill('input:nth-child(2)', 'New Task');
   ```

2. **Handle Async Operations**
   ```typescript
   // Wait for elements to be ready
   await page.waitForSelector('[data-testid="task-list"]');
   
   // Wait for network requests
   await page.waitForResponse(response => response.url().includes('/api/tasks'));
   ```

3. **Test User Behavior, Not Implementation**
   ```typescript
   // Good - tests user workflow
   await page.fill('[placeholder="Intention"]', 'New Task');
   await page.click('button:has-text("Add Task")');
   await expect(page.locator('text=New Task')).toBeVisible();
   
   // Avoid - tests implementation details
   await page.evaluate(() => addTask('New Task'));
   ```

4. **Handle Conditional Elements**
   ```typescript
   const element = page.locator('[data-testid="optional-element"]');
   if (await element.isVisible()) {
     await element.click();
   }
   ```

## 🔍 Debugging Tests

### Debug Mode

```bash
npm run test:e2e:debug
```

This opens Playwright Inspector where you can:
- Step through tests
- Inspect elements
- Modify selectors
- View screenshots/videos

### Common Issues

1. **Element Not Found**
   ```typescript
   // Add longer timeout for slow-loading elements
   await page.waitForSelector('[data-testid="slow-element"]', { timeout: 15000 });
   ```

2. **Flaky Tests**
   ```typescript
   // Wait for stable state
   await page.waitForLoadState('networkidle');
   await expect(page.locator('.content')).toBeVisible();
   ```

3. **Mobile Issues**
   ```typescript
   // Set mobile viewport
   await page.setViewportSize({ width: 375, height: 667 });
   ```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

The report includes:
- Test results and timing
- Screenshots of failures
- Video recordings
- Trace files for debugging

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🎯 Next Steps

1. **Add More Test Coverage**
   - Achievement system tests
   - Data backup/restore tests
   - Offline functionality tests
   - Performance regression tests

2. **Improve Test Reliability**
   - Add more robust selectors
   - Handle edge cases
   - Optimize test execution time

3. **Visual Regression Testing**
   - Screenshot comparison tests
   - UI consistency validation

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors Guide](https://playwright.dev/docs/locators)
- [Debugging Guide](https://playwright.dev/docs/debug) 