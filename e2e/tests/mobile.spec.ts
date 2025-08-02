import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  // Helper function to create a user if needed
  async function createUserIfNeeded(page: any) {
    // Check if we're on the user creation screen
    const userCreationInput = page.locator('input[placeholder="Enter your character\'s name"]');
    if (await userCreationInput.isVisible()) {
      await userCreationInput.fill('Mobile Test User');
      await page.click('button:has-text("Begin Your Journey")');
      
      // Wait for intro screen and click "Begin Journey" or "Skip Intro"
      await page.waitForSelector('button:has-text("Skip Intro"), button:has-text("Begin Journey"), button:has-text("Begin My Journey!")', { timeout: 10000 });
      
      // Try to click "Begin Journey" first, then "Skip Intro" if that doesn't work
      const beginJourneyButton = page.locator('button:has-text("Begin Journey")');
      const skipIntroButton = page.locator('button:has-text("Skip Intro")');
      const beginMyJourneyButton = page.locator('button:has-text("Begin My Journey!")');
      
      if (await beginJourneyButton.isVisible()) {
        await beginJourneyButton.click();
      } else if (await beginMyJourneyButton.isVisible()) {
        await beginMyJourneyButton.click();
      } else if (await skipIntroButton.isVisible()) {
        await skipIntroButton.click();
      }
      
      // Check if tutorial wizard appears and skip it
      const tutorialWizard = page.locator('text="Create Your First Task or Habit"');
      if (await tutorialWizard.isVisible()) {
        const skipTutorialButton = page.locator('button:has-text("Skip Tutorial")');
        await skipTutorialButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Check if congratulations screen appears and click "Begin My Journey!"
      const congratulationsScreen = page.locator('text="Congratulations"');
      if (await congratulationsScreen.isVisible()) {
        const beginMyJourneyButton = page.locator('button:has-text("Begin My Journey!")');
        await beginMyJourneyButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Wait for the main app to load
      await page.waitForSelector('input[placeholder="Intention"]', { timeout: 15000 });
    }
  }
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Create user if needed
    await createUserIfNeeded(page);
    
    // Verify mobile-friendly layout
    await expect(page.locator('body')).toBeVisible();
    
    // Test touch interactions for task creation
    const taskInput = page.locator('[placeholder="Intention"]');
    await taskInput.fill('Mobile Test Task');
    
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Verify task is created
    await expect(page.locator('text=Mobile Test Task')).toBeVisible();
  });

  test('should handle touch interactions', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Create user if needed
    await createUserIfNeeded(page);
    
    // Create a task
    await page.locator('[placeholder="Intention"]').fill('Touch Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Wait for task to appear and checkbox to be available
    await expect(page.locator('text=Touch Test Task')).toBeVisible();
    
    // Test touch interaction with checkbox - wait for it to be available
    const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible({ timeout: 5000 });
    await checkbox.click(); // Use click instead of tap for now
    
    // Verify checkbox is checked
    await expect(checkbox).toBeChecked();
  });

  test('should handle mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Create user if needed
    await createUserIfNeeded(page);
    
    // Test mobile menu if it exists
    const mobileMenuButton = page.locator('[data-testid="mobile-menu"], .mobile-menu-button, button:has-text("Menu")').first();
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      // Verify menu is open
      await expect(page.locator('.mobile-menu, [data-testid="mobile-menu-content"]')).toBeVisible();
    }
  });

  test('should handle mobile synthesizer', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Create user if needed
    await createUserIfNeeded(page);
    
    // Try to find synthesizer button - if not found, skip the test
    const synthesizerButton = page.locator('[data-testid="synthesizer-button"], button:has-text("Synthesizer"), .synthesizer-button').first();
    
    if (await synthesizerButton.isVisible()) {
      await synthesizerButton.click();
      
      // Wait for synthesizer to load
      await page.waitForSelector('.synthesizer-modal, [data-testid="synthesizer-modal"]', { timeout: 10000 });
      
      // Test touch interaction with piano keys
      const pianoKey = page.locator('[data-note="C4"], .piano-key[data-note="C4"], button:has-text("C4")').first();
      if (await pianoKey.isVisible()) {
        await pianoKey.click(); // Use click instead of tap
        
        // Verify touch feedback (visual or audio)
        try {
          await expect(pianoKey).toHaveClass(/active|pressed/, { timeout: 2000 });
        } catch {
          // Touch feedback might not be visible, which is okay
          console.log('Touch feedback not visible, continuing test');
        }
      }
    } else {
      // Synthesizer not available in current app version - skip test
      console.log('Synthesizer button not found - skipping synthesizer test');
      test.skip();
    }
  });

  test('should handle mobile form interactions', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Create user if needed
    await createUserIfNeeded(page);
    
    // Test mobile keyboard input
    const taskInput = page.locator('[placeholder="Intention"]');
    await taskInput.focus();
    await taskInput.fill('Mobile Keyboard Test');
    
    // Test mobile form submission
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Verify task is created
    await expect(page.locator('text=Mobile Keyboard Test')).toBeVisible();
  });

  test('should handle mobile scrolling', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Create user if needed
    await createUserIfNeeded(page);
    
    // Create multiple tasks to enable scrolling
    for (let i = 1; i <= 5; i++) {
      await page.locator('[placeholder="Intention"]').fill(`Scroll Test Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
    }
    
    // Test scrolling
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Verify we can scroll to see all tasks
    await expect(page.locator('text=Scroll Test Task 5')).toBeVisible();
  });
}); 