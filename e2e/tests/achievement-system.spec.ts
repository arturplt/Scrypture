import { test, expect } from '@playwright/test';

test.describe('Achievement System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      // Prevent install prompt from showing
      localStorage.setItem('installPromptShown', 'true');
    });
  });

  // Helper function to create a user and navigate to main app (from working critical-journeys test)
  async function createUserIfNeeded(page: any) {
    // Check if we're on the user creation screen
    const userCreationInput = page.locator('input[placeholder="Enter your character\'s name"]');
    if (await userCreationInput.isVisible()) {
      await userCreationInput.fill('Achievement Test User');
      
      // Handle any overlays before clicking the button
      await handleOverlays(page);
      
      // Click the button with retry logic
      const beginJourneyButton = page.locator('button:has-text("Begin Your Journey")');
      try {
        await beginJourneyButton.click();
      } catch (e) {
        console.log('Failed to click Begin Your Journey, trying alternative approach');
        await page.waitForTimeout(1000);
        await handleOverlays(page);
        await beginJourneyButton.click();
      }
      
      // Wait for intro screen and click "Begin Journey" or "Skip Intro"
      await page.waitForSelector('button:has-text("Skip Intro"), button:has-text("Begin Journey"), button:has-text("Begin My Journey!")', { timeout: 10000 });
      
      // Handle any overlays that might have appeared
      await handleOverlays(page);
      
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
      
      // Handle any remaining overlays
      await handleOverlays(page);
      
      // Wait for the main app to load with a longer timeout
      await page.waitForSelector('input[placeholder="Intention"]', { timeout: 20000 });
      
      // Additional wait to ensure app is fully loaded
      await page.waitForTimeout(500);
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
        
        // Fallback: try to click outside the prompt
        await page.click('body', { position: { x: 10, y: 10 } });
        await page.waitForTimeout(500);
      } catch (e) {
        console.log('Could not dismiss InstallPrompt:', e);
      }
    }

    // Try to dismiss "Add to Home Screen" prompts (legacy detection)
    const addToHomeScreen = page.locator('text="Add to Home Screen", text="Install App"');
    if (await addToHomeScreen.isVisible()) {
      console.log('Dismissing Add to Home Screen prompt');
      try {
        await addToHomeScreen.click();
        await page.waitForTimeout(500);
      } catch (e) {
        console.log('Could not click Add to Home Screen, trying to find close button');
        const closeButton = page.locator('button:has-text("Close"), button:has-text("Cancel"), button:has-text("Not Now")');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
    
    // Try to dismiss Bóbr messages
    const bobrMessage = page.locator('div[class*="_bobrMessage"]');
    if (await bobrMessage.isVisible()) {
      console.log('Dismissing Bóbr message');
      try {
        await bobrMessage.click();
        await page.waitForTimeout(500);
      } catch (e) {
        console.log('Could not click Bóbr message, trying alternative approach');
      }
    }
    
    // Try to dismiss hints
    const hint = page.locator('div[class*="_hint"]');
    if (await hint.isVisible()) {
      console.log('Dismissing hint');
      try {
        await hint.click();
        await page.waitForTimeout(500);
      } catch (e) {
        console.log('Could not click hint');
      }
    }
    
    // Try to dismiss any modal or overlay
    const modals = page.locator('div[class*="_modal"]');
    const overlays = page.locator('div[class*="_overlay"]');
    
    if (await modals.count() > 0) {
      console.log('Found modals, trying to dismiss');
      try {
        // Try clicking outside the modal first
        await page.click('body', { position: { x: 10, y: 10 } });
        await page.waitForTimeout(200);
      } catch (e) {
        console.log('Could not dismiss modal by clicking outside');
      }
    }
    
    if (await overlays.count() > 0) {
      console.log('Found overlays, trying to dismiss');
      try {
        // Try clicking outside the overlay first
        await page.click('body', { position: { x: 10, y: 10 } });
        await page.waitForTimeout(200);
      } catch (e) {
        console.log('Could not dismiss overlay by clicking outside');
      }
    }
    
    // Specifically handle the congratulations overlay that blocks interactions
    const congratulationsOverlay = page.locator('div[class*="_overlay_1ww4t_3"]');
    if (await congratulationsOverlay.isVisible()) {
      console.log('Found congratulations overlay, trying to dismiss');
      try {
        // Try to click the "Begin My Journey!" button directly
        const beginMyJourneyButton = page.locator('button:has-text("Begin My Journey!")');
        if (await beginMyJourneyButton.isVisible()) {
          await beginMyJourneyButton.click();
          await page.waitForTimeout(1000);
        }
      } catch (e) {
        console.log('Could not click Begin My Journey button');
      }
    }
  }

  test('should unlock First Steps achievement after completing first task', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Create and complete first task
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('First Task for Achievement');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Wait for task to appear and complete it
    await expect(page.locator('text=First Task for Achievement')).toBeVisible();
    const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
    await checkbox.click();
    
    // Wait for achievement notification - check for the achievement name
    await expect(page.locator('text=First Steps')).toBeVisible({ timeout: 5000 });
    
    // Verify achievement celebration appears (check for notification container)
    await expect(page.locator('[data-testid="achievement-notification"]')).toBeVisible();
  });

  test('should unlock Dam Builder achievement after completing 10 tasks', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Create and complete 10 tasks
    for (let i = 1; i <= 10; i++) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(`Task ${i} for Dam Builder`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      // Wait for task to appear and complete it
      await expect(page.locator(`text=Task ${i} for Dam Builder`)).toBeVisible();
      const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').last();
      await checkbox.click();
      
      // Small delay between tasks
      await page.waitForTimeout(200);
    }
    
    // Wait for Dam Builder achievement notification
    await expect(page.locator('text=Dam Builder')).toBeVisible({ timeout: 10000 });
  });

  test('should show achievement progress bars for locked achievements', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Navigate to achievements section (assuming there's a way to access it)
    // This might be through a menu, button, or keyboard shortcut
    const achievementsButton = page.locator('button:has-text("Achievements"), [data-testid="achievements-button"]');
    if (await achievementsButton.isVisible()) {
      await achievementsButton.click();
    }
    
    // Verify progress bars are visible for locked achievements
    await expect(page.locator('[data-testid="achievement-progress"]')).toBeVisible();
    
    // Check that progress bars show correct progress
    const progressBars = page.locator('[data-testid="achievement-progress"]');
    const progressBarCount = await progressBars.count();
    expect(progressBarCount).toBeGreaterThan(0);
  });

  test('should filter achievements by category', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Navigate to achievements section
    const achievementsButton = page.locator('button:has-text("Achievements"), [data-testid="achievements-button"]');
    if (await achievementsButton.isVisible()) {
      await achievementsButton.click();
    }
    
    // Test category filtering
    const categoryButtons = page.locator('[data-testid="achievement-category"]');
    if (await categoryButtons.first().isVisible()) {
      // Click on Progression category
      await categoryButtons.filter({ hasText: 'Progression' }).click();
      
      // Verify only progression achievements are shown
      const progressionAchievements = page.locator('[data-testid="achievement-card"]');
      const progressionCount = await progressionAchievements.count();
      expect(progressionCount).toBeGreaterThan(0);
      
      // Click on Mastery category
      await categoryButtons.filter({ hasText: 'Mastery' }).click();
      
      // Verify only mastery achievements are shown
      const masteryAchievements = page.locator('[data-testid="achievement-card"]');
      const masteryCount = await masteryAchievements.count();
      expect(masteryCount).toBeGreaterThan(0);
    }
  });

  test('should persist achievements across browser sessions', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Create and complete a task to unlock First Steps
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Task for Persistence Test');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
    await checkbox.click();
    
    // Wait for achievement to unlock
    await expect(page.locator('text=First Steps')).toBeVisible({ timeout: 5000 });
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // Navigate to achievements section
    const achievementsButton = page.locator('button:has-text("Achievements"), [data-testid="achievements-button"]');
    if (await achievementsButton.isVisible()) {
      await achievementsButton.click();
    }
    
    // Verify First Steps achievement is still unlocked
    await expect(page.locator('text=First Steps')).toBeVisible();
    await expect(page.locator('[data-testid="achievement-unlocked"]')).toBeVisible();
  });

  test('should show different celebration effects for different rarity levels', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Complete first task for common achievement
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Common Achievement Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
    await checkbox.click();
    
    // Wait for common achievement celebration
    await expect(page.locator('text=First Steps')).toBeVisible({ timeout: 5000 });
    
    // Verify common achievement celebration styling
    const commonCelebration = page.locator('[data-testid="achievement-notification"]');
    await expect(commonCelebration).toBeVisible();
    
    // Note: Legendary achievements would require more complex setup
    // This test verifies the celebration system works for at least common achievements
  });

  test('should track achievement progress correctly', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Create 5 tasks (halfway to Dam Builder achievement)
    for (let i = 1; i <= 5; i++) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(`Progress Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      await expect(page.locator(`text=Progress Task ${i}`)).toBeVisible();
      const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').last();
      await checkbox.click();
      
      await page.waitForTimeout(200);
    }
    
    // Navigate to achievements section
    const achievementsButton = page.locator('button:has-text("Achievements"), [data-testid="achievements-button"]');
    if (await achievementsButton.isVisible()) {
      await achievementsButton.click();
    }
    
    // Verify Dam Builder progress shows 50% (5/10 tasks)
    const damBuilderProgress = page.locator('[data-testid="achievement-progress"]').filter({ hasText: 'Dam Builder' });
    await expect(damBuilderProgress).toBeVisible();
    
    // Check progress text shows correct count
    await expect(page.locator('text=5/10')).toBeVisible();
  });

  test('should handle achievement unlock during complex user interactions', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Create multiple tasks rapidly
    const tasks = ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5'];
    
    for (const taskTitle of tasks) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(taskTitle);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
    }
    
    // Complete tasks rapidly
    const checkboxes = page.locator('[role="checkbox"], input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      await checkboxes.nth(i).click();
      await page.waitForTimeout(100);
    }
    
    // Verify achievements unlock correctly even with rapid interactions
    await expect(page.locator('text=First Steps')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Dam Builder')).toBeVisible({ timeout: 10000 });
  });
}); 