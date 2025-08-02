import { test, expect } from '@playwright/test';

test.describe('Error Handling E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  // Helper function to create a user and navigate to main app
  async function setupUser(page: any) {
    const userCreationInput = page.locator('input[placeholder="Enter your character\'s name"]');
    if (await userCreationInput.isVisible()) {
      await userCreationInput.fill('Error Test User');
      
      const beginJourneyButton = page.locator('button:has-text("Begin Your Journey")');
      await beginJourneyButton.click();
      
      // Handle intro screens
      await page.waitForSelector('button:has-text("Skip Intro"), button:has-text("Begin Journey"), button:has-text("Begin My Journey!")', { timeout: 10000 });
      
      const skipIntroButton = page.locator('button:has-text("Skip Intro")');
      const beginJourneyButton2 = page.locator('button:has-text("Begin Journey")');
      const beginMyJourneyButton = page.locator('button:has-text("Begin My Journey!")');
      
      if (await beginJourneyButton2.isVisible()) {
        await beginJourneyButton2.click();
      } else if (await beginMyJourneyButton.isVisible()) {
        await beginMyJourneyButton.click();
      } else if (await skipIntroButton.isVisible()) {
        await skipIntroButton.click();
      }
      
      // Skip tutorial if it appears
      const tutorialWizard = page.locator('text="Create Your First Task or Habit"');
      if (await tutorialWizard.isVisible()) {
        const skipTutorialButton = page.locator('button:has-text("Skip Tutorial")');
        await skipTutorialButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Handle congratulations screen
      const congratulationsScreen = page.locator('text="Congratulations"');
      if (await congratulationsScreen.isVisible()) {
        const beginMyJourneyButton = page.locator('button:has-text("Begin My Journey!")');
        await beginMyJourneyButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Wait for main app to load
      await page.waitForSelector('input[placeholder="Intention"]', { timeout: 20000 });
      await page.waitForTimeout(500);
    }
  }

  test('should handle offline functionality gracefully', async ({ page }) => {
    await setupUser(page);
    
    // Simulate offline mode by blocking network requests
    await page.route('**/*', route => {
      route.abort();
    });
    
    // Try to create a task while offline
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Offline Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // App should handle offline state gracefully
    // Either show offline indicator or continue working with local storage
    const offlineIndicator = page.locator('[data-testid="offline-indicator"], text=Offline, text=No connection');
    const taskCreated = page.locator('text=Offline Test Task');
    const errorMessage = page.locator('text=Network error, text=Connection lost');
    
    // One of these should be true
    expect(await offlineIndicator.isVisible() || await taskCreated.isVisible() || await errorMessage.isVisible()).toBeTruthy();
    
    // Restore network connection
    await page.unroute('**/*');
  });

  test('should handle localStorage errors gracefully', async ({ page }) => {
    await setupUser(page);
    
    // Simulate localStorage errors by filling it up
    await page.evaluate(() => {
      try {
        // Fill localStorage with large data to trigger quota exceeded error
        const largeData = 'x'.repeat(1024 * 1024); // 1MB chunks
        let i = 0;
        while (i < 20) { // Try to fill with 20MB
          localStorage.setItem(`test_${i}`, largeData);
          i++;
        }
      } catch (e) {
        console.log('localStorage filled, cannot add more data');
      }
    });
    
    // Try to create a task
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Storage Error Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // App should handle storage errors gracefully
    const storageError = page.locator('text=Storage full, text=Storage error, text=Unable to save');
    const taskCreated = page.locator('text=Storage Error Test Task');
    const warningMessage = page.locator('text=Warning, text=Storage limit');
    
    // One of these should be true
    expect(await storageError.isVisible() || await taskCreated.isVisible() || await warningMessage.isVisible()).toBeTruthy();
  });

  test('should recover from corrupted data', async ({ page }) => {
    await setupUser(page);
    
    // Create some valid data first
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Valid Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Corrupt the data
    await page.evaluate(() => {
      localStorage.setItem('scrypture_tasks', 'invalid json data');
      localStorage.setItem('scrypture_user', 'corrupted user data');
    });
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // App should handle corruption gracefully
    const corruptionError = page.locator('text=Data corrupted, text=Invalid data, text=Reset required');
    const defaultState = page.locator('input[placeholder="Intention"]');
    const recoveryMessage = page.locator('text=Recovering, text=Data recovery');
    
    // One of these should be true
    expect(await corruptionError.isVisible() || await defaultState.isVisible() || await recoveryMessage.isVisible()).toBeTruthy();
  });

  test('should handle invalid user input gracefully', async ({ page }) => {
    await setupUser(page);
    
    // Try to create a task with invalid input
    const taskInput = page.locator('input[placeholder="Intention"]');
    
    // Test with very long input
    const longInput = 'a'.repeat(1000);
    await taskInput.fill(longInput);
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // App should handle long input gracefully
    const validationError = page.locator('text=Too long, text=Invalid input, text=Character limit');
    const taskCreated = page.locator(`text=${longInput.substring(0, 50)}`);
    
    // One of these should be true
    expect(await validationError.isVisible() || await taskCreated.isVisible()).toBeTruthy();
    
    // Test with empty input
    await taskInput.clear();
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // App should handle empty input gracefully
    const emptyError = page.locator('text=Required, text=Empty, text=Please enter');
    const noTaskCreated = page.locator('[data-testid="task-item"]').count();
    
    // Either show error or don't create task
    expect(await emptyError.isVisible() || (await noTaskCreated) === 0).toBeTruthy();
  });

  test('should handle rapid user interactions gracefully', async ({ page }) => {
    await setupUser(page);
    
    // Rapidly create multiple tasks
    const taskInput = page.locator('input[placeholder="Intention"]');
    
    for (let i = 1; i <= 10; i++) {
      await taskInput.fill(`Rapid Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      await page.waitForTimeout(50); // Very fast interactions
    }
    
    // App should handle rapid interactions without crashing
    await expect(page.locator('body')).toBeVisible();
    
    // Verify tasks were created (at least some of them)
    const tasks = page.locator('[data-testid="task-item"], text=Rapid Task');
    const taskCount = await tasks.count();
    expect(taskCount).toBeGreaterThan(0);
  });

  test('should handle browser compatibility issues', async ({ page }) => {
    await setupUser(page);
    
    // Simulate missing browser features
    await page.evaluate(() => {
      // Mock localStorage as undefined to simulate older browsers
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });
      
      // Restore after a short delay
      setTimeout(() => {
        Object.defineProperty(window, 'localStorage', {
          value: originalLocalStorage,
          writable: true
        });
      }, 1000);
    });
    
    // Try to create a task
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Compatibility Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // App should handle missing features gracefully
    const compatibilityError = page.locator('text=Browser not supported, text=Update browser, text=Compatibility');
    const fallbackMessage = page.locator('text=Limited functionality, text=Some features unavailable');
    const taskCreated = page.locator('text=Compatibility Test Task');
    
    // One of these should be true
    expect(await compatibilityError.isVisible() || await fallbackMessage.isVisible() || await taskCreated.isVisible()).toBeTruthy();
  });

  test('should handle memory pressure gracefully', async ({ page }) => {
    await setupUser(page);
    
    // Create many tasks to simulate memory pressure
    const taskInput = page.locator('input[placeholder="Intention"]');
    
    for (let i = 1; i <= 50; i++) {
      await taskInput.fill(`Memory Test Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      await page.waitForTimeout(100);
    }
    
    // App should continue working under memory pressure
    await expect(page.locator('body')).toBeVisible();
    
    // Verify app is still responsive
    const newTaskInput = page.locator('input[placeholder="Intention"]');
    await expect(newTaskInput).toBeVisible();
    await expect(newTaskInput).toBeEnabled();
  });

  test('should handle concurrent data access gracefully', async ({ page }) => {
    await setupUser(page);
    
    // Open multiple tabs
    const secondPage = await page.context().newPage();
    await secondPage.goto('/');
    
    // Create data in first tab
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Tab 1 Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Create data in second tab
    const secondTaskInput = secondPage.locator('input[placeholder="Intention"]');
    await secondTaskInput.fill('Tab 2 Task');
    await secondPage.press('input[placeholder="Intention"]', 'Enter');
    
    // Both tabs should work without conflicts
    await expect(page.locator('text=Tab 1 Task')).toBeVisible();
    await expect(secondPage.locator('text=Tab 2 Task')).toBeVisible();
    
    // Close second tab
    await secondPage.close();
  });

  test('should handle service worker errors gracefully', async ({ page }) => {
    await setupUser(page);
    
    // Simulate service worker errors
    await page.evaluate(() => {
      // Mock service worker as undefined
      const originalServiceWorker = window.navigator.serviceWorker;
      Object.defineProperty(window.navigator, 'serviceWorker', {
        value: undefined,
        writable: true
      });
      
      // Restore after a short delay
      setTimeout(() => {
        Object.defineProperty(window.navigator, 'serviceWorker', {
          value: originalServiceWorker,
          writable: true
        });
      }, 1000);
    });
    
    // App should work without service worker
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Service Worker Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Verify task was created
    await expect(page.locator('text=Service Worker Test Task')).toBeVisible();
  });

  test('should handle audio context errors gracefully', async ({ page }) => {
    await setupUser(page);
    
    // Try to access synthesizer (which uses audio context)
    const synthesizerButton = page.locator('button:has-text("Synthesizer"), [data-testid="synthesizer-button"]');
    if (await synthesizerButton.isVisible()) {
      await synthesizerButton.click();
      
      // Simulate audio context errors
      await page.evaluate(() => {
        // Mock AudioContext to throw errors
        const originalAudioContext = window.AudioContext;
        window.AudioContext = class MockAudioContext {
          constructor() {
            throw new Error('Audio context not supported');
          }
        };
        
        // Restore after a short delay
        setTimeout(() => {
          window.AudioContext = originalAudioContext;
        }, 1000);
      });
      
      // Try to play a note
      const noteButton = page.locator('[data-testid="note-button"], button:has-text("C")');
      if (await noteButton.first().isVisible()) {
        await noteButton.first().click();
        
        // App should handle audio errors gracefully
        const audioError = page.locator('text=Audio not supported, text=Audio error, text=Click to enable');
        const fallbackMessage = page.locator('text=Audio disabled, text=No audio');
        
        // One of these should be true
        expect(await audioError.isVisible() || await fallbackMessage.isVisible()).toBeTruthy();
      }
    }
  });

  test('should handle network timeout gracefully', async ({ page }) => {
    await setupUser(page);
    
    // Simulate slow network by adding delays to requests
    await page.route('**/*', route => {
      // Add artificial delay to simulate slow network
      setTimeout(() => {
        route.continue();
      }, 5000); // 5 second delay
    });
    
    // Try to perform an action that might require network
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Network Timeout Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // App should handle timeouts gracefully
    const timeoutError = page.locator('text=Timeout, text=Slow connection, text=Retry');
    const taskCreated = page.locator('text=Network Timeout Test Task');
    const loadingIndicator = page.locator('[data-testid="loading"], text=Loading');
    
    // One of these should be true
    expect(await timeoutError.isVisible() || await taskCreated.isVisible() || await loadingIndicator.isVisible()).toBeTruthy();
    
    // Restore normal network
    await page.unroute('**/*');
  });

  test('should handle permission errors gracefully', async ({ page }) => {
    await setupUser(page);
    
    // Simulate permission denied for notifications
    await page.evaluate(() => {
      // Mock Notification permission as denied
      Object.defineProperty(Notification, 'permission', {
        value: 'denied',
        writable: true
      });
    });
    
    // Try to trigger a notification (if the app has this feature)
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Permission Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // App should handle permission errors gracefully
    const permissionError = page.locator('text=Permission denied, text=Notifications blocked');
    const taskCreated = page.locator('text=Permission Test Task');
    
    // One of these should be true
    expect(await permissionError.isVisible() || await taskCreated.isVisible()).toBeTruthy();
  });
}); 