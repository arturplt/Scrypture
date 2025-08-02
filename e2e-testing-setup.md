# E2E Testing Setup Guide for Scrypture

## 🎯 Why E2E Testing?

Scrypture has complex user workflows that benefit from end-to-end testing:
- Multi-track synthesizer with real-time audio
- Habit tracking with XP progression
- Achievement system
- Auto-save functionality
- Mobile responsiveness

## 🛠️ Recommended Tool: Playwright

**Why Playwright over Cypress:**
- Better audio context testing support
- Superior mobile browser simulation
- Faster test execution
- Native TypeScript support
- More reliable for complex interactions

## 📦 Installation

```bash
npm install --save-dev @playwright/test
npx playwright install
```

## 🏗️ Project Structure

```
e2e/
├── tests/
│   ├── critical-journeys.spec.ts
│   ├── synthesizer.spec.ts
│   ├── habit-tracking.spec.ts
│   └── mobile.spec.ts
├── playwright.config.ts
└── fixtures/
    └── test-data.ts
```

## 🧪 Test Examples

### Critical User Journey
```typescript
// e2e/tests/critical-journeys.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {
  test('complete task workflow with XP gain', async ({ page }) => {
    await page.goto('/');
    
    // Create task
    await page.fill('[placeholder="Intention"]', 'Test Task');
    await page.click('button:has-text("Add Task")');
    
    // Complete task
    await page.click('[role="checkbox"]');
    
    // Verify XP gain
    await expect(page.locator('.xp-display')).toContainText('+10');
  });
});
```

### Synthesizer Testing
```typescript
// e2e/tests/synthesizer.spec.ts
test('synthesizer basic functionality', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="synthesizer-button"]');
  
  // Create track
  await page.click('button:has-text("Add Track")');
  
  // Add note
  await page.click('[data-note="C4"]');
  
  // Verify audio context
  await expect(page.locator('.audio-status')).toContainText('Ready');
});
```

## ⚙️ Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 🚀 Running Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test critical-journeys.spec.ts

# Run with UI
npx playwright test --ui

# Run on specific browser
npx playwright test --project=chromium
```

## 📋 Priority Test Cases

### High Priority
1. **Task Creation → Completion → XP Gain**
2. **Basic Synthesizer Functionality**
3. **Data Persistence Across Sessions**
4. **Mobile Responsiveness**

### Medium Priority
1. **Habit Streak Tracking**
2. **Achievement Unlocking**
3. **Data Backup/Restore**
4. **Offline Functionality**

### Low Priority
1. **Advanced Synthesizer Features**
2. **Performance Under Load**
3. **Cross-browser Compatibility**

## 🔧 Integration with CI/CD

```yaml
# .github/workflows/e2e.yml
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
      - run: npm run dev &
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🎯 Next Steps

1. **Start with 2-3 critical tests**
2. **Focus on user workflows, not technical implementation**
3. **Use data-testid attributes for reliable selectors**
4. **Test on mobile devices early**
5. **Integrate with existing CI/CD pipeline**

## 💡 Best Practices

- **Use semantic selectors** (data-testid, role, label)
- **Test user behavior, not implementation**
- **Keep tests independent and isolated**
- **Use realistic test data**
- **Test error scenarios and edge cases**
- **Monitor test execution time** 