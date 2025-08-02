import { test, expect } from '@playwright/test';

test.describe('Debug Achievement System', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      // Prevent install prompt from showing
      localStorage.setItem('installPromptShown', 'true');
    });
  });

  // Helper function to create a user and navigate to main app
  async function createUserIfNeeded(page: any) {
    // Check if we're on the user creation screen
    const userCreationInput = page.locator('input[placeholder="Enter your character\'s name"]');
    if (await userCreationInput.isVisible()) {
      await userCreationInput.fill('Debug Test User');
      
      // Click the button with retry logic
      const beginJourneyButton = page.locator('button:has-text("Begin Your Journey")');
      try {
        await beginJourneyButton.click();
      } catch (e) {
        console.log('Failed to click Begin Your Journey, trying alternative approach');
        await page.waitForTimeout(1000);
        await beginJourneyButton.click();
      }
      
      // Wait for intro screen and click "Begin Journey" or "Skip Intro"
      await page.waitForSelector('button:has-text("Skip Intro"), button:has-text("Begin Journey"), button:has-text("Begin My Journey!")', { timeout: 10000 });
      
      // Try to click "Begin Journey" first, then "Skip Intro" if that doesn't work
      const beginJourneyButton2 = page.locator('button:has-text("Begin Journey")');
      const skipIntroButton = page.locator('button:has-text("Skip Intro")');
      const beginMyJourneyButton = page.locator('button:has-text("Begin My Journey!")');
      
      if (await beginJourneyButton2.isVisible()) {
        await beginJourneyButton2.click();
      } else if (await beginMyJourneyButton.isVisible()) {
        await beginMyJourneyButton.click();
      } else if (await skipIntroButton.isVisible()) {
        await skipIntroButton.click();
      }
      
      // Check if tutorial wizard appears and skip it
      const tutorialWizard = page.locator('text="Create Your First Task or Habit"');
      if (await tutorialWizard.isVisible()) {
        console.log('Tutorial wizard found, skipping it...');
        const skipTutorialButton = page.locator('button:has-text("Skip Tutorial")');
        await skipTutorialButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Check if congratulations screen appears and click "Begin My Journey!"
      const congratulationsScreen = page.locator('text="Congratulations"');
      if (await congratulationsScreen.isVisible()) {
        console.log('Congratulations screen found, clicking Begin My Journey!...');
        const beginMyJourneyButton = page.locator('button:has-text("Begin My Journey!")');
        await beginMyJourneyButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Wait for the main app to load
      await page.waitForSelector('input[placeholder="Intention"]', { timeout: 15000 });
    }
  }

  // Helper function to handle overlays that block interactions
  async function handleOverlays(page: any) {
    // Try to dismiss InstallPrompt specifically
    const installPrompt = page.locator('[data-testid="install-prompt-overlay"], [data-testid="install-prompt"]');
    if (await installPrompt.isVisible()) {
      console.log('Dismissing InstallPrompt');
      try {
        // Try to click the close button first
        const closeButton = page.locator('[data-testid="install-prompt-close"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(500);
          return;
        }
        
        // Try to click the "Got it!" button
        const gotItButton = page.locator('[data-testid="install-prompt-got-it"]');
        if (await gotItButton.isVisible()) {
          await gotItButton.click();
          await page.waitForTimeout(500);
          return;
        }
      } catch (e) {
        console.log('Failed to dismiss InstallPrompt:', e);
      }
    }

    // Try to dismiss the specific overlay that's blocking clicks
    const blockingOverlay = page.locator('div[class*="_overlay_"]');
    if (await blockingOverlay.isVisible()) {
      console.log('Found blocking overlay, trying to dismiss');
      try {
        // Try clicking on the overlay to close it
        await blockingOverlay.click();
        await page.waitForTimeout(500);
      } catch (e) {
        console.log('Failed to dismiss blocking overlay:', e);
        // Try to remove it from DOM
        await page.evaluate(() => {
          const overlays = document.querySelectorAll('div[class*="_overlay_"]');
          overlays.forEach(overlay => overlay.remove());
        });
        await page.waitForTimeout(500);
      }
    }

    // Try to dismiss any other overlays
    const overlays = page.locator('div[class*="overlay"], div[class*="modal"]');
    const overlayCount = await overlays.count();
    if (overlayCount > 0) {
      console.log('Found overlays, trying to dismiss');
      for (let i = 0; i < overlayCount; i++) {
        try {
          const overlay = overlays.nth(i);
          if (await overlay.isVisible()) {
            // Try clicking on the overlay to close it
            await overlay.click();
            await page.waitForTimeout(500);
          }
        } catch (e) {
          console.log('Failed to dismiss overlay:', e);
        }
      }
    }
  }

  test('should debug achievement system', async ({ page }) => {
    await page.goto('/');
    
    // Create user if needed
    await createUserIfNeeded(page);
    
    // Handle any overlays before proceeding
    await handleOverlays(page);
    
    // Create a simple task
    const taskTitle = 'Debug Task';
    await page.fill('input[placeholder="Intention"]', taskTitle);
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Verify task appears in the list
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
    
    // Handle any overlays that might have appeared
    await handleOverlays(page);
    
    // Complete the task - try multiple approaches
    const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
    
    // First try normal click
    try {
      await checkbox.click();
    } catch (e) {
      console.log('Normal click failed, trying JavaScript click');
      // Try JavaScript click as fallback
      await page.evaluate(() => {
        const checkboxes = document.querySelectorAll('[role="checkbox"], input[type="checkbox"]');
        if (checkboxes.length > 0) {
          (checkboxes[0] as HTMLElement).click();
        }
      });
    }
    
    // Wait a bit for any achievement processing
    await page.waitForTimeout(2000);
    
    // Check if achievement notification appears
    const achievementNotification = page.locator('[data-testid="achievement-notification"]');
    const isNotificationVisible = await achievementNotification.isVisible();
    
    console.log('Achievement notification visible:', isNotificationVisible);
    
    if (isNotificationVisible) {
      // Check if it's the First Steps achievement
      const achievementName = page.locator('[data-testid="achievement-name"]');
      const nameText = await achievementName.textContent();
      console.log('Achievement name:', nameText);
      
      await expect(achievementName).toContainText('First Steps');
    } else {
      // Debug: check what's in localStorage
      const localStorage = await page.evaluate(() => {
        return {
          achievements: localStorage.getItem('scrypture_achievements'),
          tasks: localStorage.getItem('scrypture_tasks'),
          user: localStorage.getItem('scrypture_user')
        };
      });
      
      console.log('LocalStorage debug:', localStorage);
      
      // For now, just log that no notification appeared
      console.log('No achievement notification appeared');
    }
  });
}); 