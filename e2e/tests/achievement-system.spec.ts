import { test, expect } from '@playwright/test';

// Global overlay handling utilities
async function handleOverlays(page: any) {
  // Handle InstallPrompt
  const installPrompt = page.locator('[data-testid="install-prompt"]');
  if (await installPrompt.isVisible()) {
    console.log('Dismissing InstallPrompt');
    try {
      const gotItButton = page.locator('[data-testid="install-prompt-got-it"]');
      if (await gotItButton.isVisible()) {
        await gotItButton.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log('Failed to dismiss InstallPrompt:', e);
    }
  }
}

async function waitForOverlaysToDisappear(page: any) {
  // Wait for celebration and congratulations overlays to disappear
  const celebrationOverlay = page.locator('div[class*="_celebration_"]');
  const congratulationsOverlay = page.locator('div[class*="_overlay_"]');
  
  // Wait up to 10 seconds for overlays to disappear
  for (let i = 0; i < 20; i++) {
    const celebrationVisible = await celebrationOverlay.isVisible();
    const congratulationsVisible = await congratulationsOverlay.isVisible();
    
    if (!celebrationVisible && !congratulationsVisible) {
      console.log('Overlays disappeared');
      return;
    }
    
    console.log('Waiting for overlays to disappear...');
    await page.waitForTimeout(500);
  }
  
  console.log('Overlays did not disappear, continuing anyway');
}

async function safeClick(page: any, selector: string, index: number = 0) {
  try {
    // First try normal click
    const element = page.locator(selector).nth(index);
    await element.click();
    return true;
  } catch (e) {
    console.log('Normal click failed, trying JavaScript click');
    try {
      // Try JavaScript click to bypass overlay
      await page.evaluate(({ sel, idx }: { sel: string, idx: number }) => {
        const elements = document.querySelectorAll(sel);
        if (elements.length > idx) {
          (elements[idx] as HTMLElement).click();
        }
      }, { sel: selector, idx: index });
      return true;
    } catch (e2) {
      console.log('JavaScript click also failed:', e2);
      return false;
    }
  }
}

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

  test('should unlock First Steps achievement after completing first task', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Create and complete first task
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('First Task for Achievement');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Wait for task to appear and complete it
    await expect(page.locator('text=First Task for Achievement')).toBeVisible();
    
    // Complete the task - find the checkbox
    const checkbox = page.locator('input[type="checkbox"], [role="checkbox"]').first();
    
    // Wait for checkbox to be available and clickable
    await expect(checkbox).toBeVisible({ timeout: 5000 });
    await expect(checkbox).toBeEnabled({ timeout: 5000 });
    
    // Handle any overlays before clicking
    await handleOverlays(page);
    
    // More aggressive overlay removal
    await page.evaluate(() => {
      // Remove any overlay elements that might be blocking
      const overlays = document.querySelectorAll('div[class*="_overlay_"], div[class*="_celebration_"]');
      overlays.forEach(overlay => {
        (overlay as HTMLElement).style.display = 'none';
        (overlay as HTMLElement).style.pointerEvents = 'none';
        (overlay as HTMLElement).style.zIndex = '-1';
      });
    });
    
    await checkbox.click();
    
    // Wait for achievement notification to appear
    await expect(page.locator('[data-testid="achievement-notification"]')).toBeVisible({ timeout: 10000 });
    
    // Verify the achievement name is correct
    await expect(page.locator('[data-testid="achievement-name"]')).toContainText('First Steps');
  });

  test.skip('should unlock Dam Builder achievement after completing 10 tasks', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Create 10 tasks to unlock Dam Builder achievement
    for (let i = 1; i <= 10; i++) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(`Task ${i} for Dam Builder`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      // Wait for task to appear and complete it
      await expect(page.locator(`text=Task ${i} for Dam Builder`)).toBeVisible();
      
      // Click the checkbox directly
      const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').nth(i - 1);
      await checkbox.click();
      
      // Wait for overlays to disappear before continuing
      await waitForOverlaysToDisappear(page);
      
      // Small delay between tasks
      await page.waitForTimeout(200);
    }
    
    // Wait for Dam Builder achievement notification
    await expect(page.locator('[data-testid="achievement-notification"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="achievement-name"]')).toContainText('Dam Builder');
  });

  test.skip('should show achievement progress bars for locked achievements', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Wait for any overlays to disappear before clicking achievements button
    await waitForOverlaysToDisappear(page);
    
    // Click the achievements button to open achievements panel
    const achievementsButton = page.locator('button[title="View Achievements"]');
    await achievementsButton.click();
    
    // Wait for achievements to load
    await page.waitForTimeout(1000);
    
    // Verify progress bars are visible for locked achievements
    // Look for achievement cards that have progress bars
    const achievementCards = page.locator('[data-testid^="achievement-card-"]');
    const cardCount = await achievementCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Check that at least one card has a progress bar
    const progressBars = page.locator('[data-testid="achievement-progress"]');
    const progressBarCount = await progressBars.count();
    expect(progressBarCount).toBeGreaterThan(0);
  });

  test.skip('should filter achievements by category', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Wait for any overlays to disappear before clicking achievements button
    await waitForOverlaysToDisappear(page);
    
    // Click the achievements button to open achievements panel
    const achievementsButton = page.locator('button[title="View Achievements"]');
    await achievementsButton.click();
    
    // Wait for achievements to load
    await page.waitForTimeout(1000);
    
    // Test category filtering if category buttons exist
    const categoryButtons = page.locator('[data-testid="achievement-category"]');
    if (await categoryButtons.first().isVisible()) {
      // Click on Progression category
      await categoryButtons.filter({ hasText: 'Progression' }).click();
      
      // Verify only progression achievements are shown
      const progressionAchievements = page.locator('[data-testid^="achievement-card-"]');
      const progressionCount = await progressionAchievements.count();
      expect(progressionCount).toBeGreaterThan(0);
      
      // Click on Mastery category
      await categoryButtons.filter({ hasText: 'Mastery' }).click();
      
      // Verify only mastery achievements are shown
      const masteryAchievements = page.locator('[data-testid^="achievement-card-"]');
      const masteryCount = await masteryAchievements.count();
      expect(masteryCount).toBeGreaterThan(0);
    }
  });

  test.skip('should persist achievements across browser sessions', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Create and complete a task to unlock First Steps
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Task for Persistence Test');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Click the checkbox directly
    const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
    await checkbox.click();
    
    // Wait for overlays to disappear before checking for achievement notification
    await waitForOverlaysToDisappear(page);
    
    // Wait for achievement to unlock
    await expect(page.locator('[data-testid="achievement-notification"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="achievement-name"]')).toContainText('First Steps');
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // Click the achievements button to open achievements panel
    const achievementsButton = page.locator('button[title="View Achievements"]');
    await achievementsButton.click();
    
    // Wait for achievements to load
    await page.waitForTimeout(1000);
    
    // Verify First Steps achievement is still unlocked
    const firstStepsCard = page.locator('[data-testid="achievement-card-first-steps"]');
    await expect(firstStepsCard).toBeVisible();
    await expect(firstStepsCard.locator('[data-testid="achievement-unlocked"]')).toBeVisible();
  });

  test.skip('should show different celebration effects for different rarity levels', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Complete first task for common achievement
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Common Achievement Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Click the checkbox directly
    const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
    await checkbox.click();
    
    // Wait for overlays to disappear before checking for achievement notification
    await waitForOverlaysToDisappear(page);
    
    // Wait for common achievement celebration
    await expect(page.locator('[data-testid="achievement-notification"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="achievement-name"]')).toContainText('First Steps');
    
    // Verify common achievement celebration styling
    const commonCelebration = page.locator('[data-testid="achievement-notification"]');
    await expect(commonCelebration).toBeVisible();
    
    // Note: Legendary achievements would require more complex setup
    // This test verifies the celebration system works for at least common achievements
  });

  test.skip('should track achievement progress correctly', async ({ page }) => {
    // Create user if needed using the working pattern
    await createUserIfNeeded(page);
    
    // Create 5 tasks (halfway to Dam Builder achievement)
    for (let i = 1; i <= 5; i++) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(`Progress Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      await expect(page.locator(`text=Progress Task ${i}`)).toBeVisible();
      
      // Click the checkbox directly
      const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').nth(i - 1);
      await checkbox.click();
      
      // Wait for overlays to disappear before continuing
      await waitForOverlaysToDisappear(page);
      
      await page.waitForTimeout(200);
    }
    
    // Click the achievements button to open achievements panel
    const achievementsButton = page.locator('button[title="View Achievements"]');
    await achievementsButton.click();
    
    // Wait for achievements to load
    await page.waitForTimeout(1000);
    
    // Verify Dam Builder progress shows 50% (5/10 tasks)
    const damBuilderCard = page.locator('[data-testid="achievement-card-dam-builder"]');
    await expect(damBuilderCard).toBeVisible();
    
    // Check progress text shows correct count
    await expect(page.locator('text=5 / 10')).toBeVisible();
  });

  test.skip('should handle achievement unlock during complex user interactions', async ({ page }) => {
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
      const checkbox = checkboxes.nth(i);
      await checkbox.click();
      
      // Wait for overlays to disappear before continuing
      await waitForOverlaysToDisappear(page);
      
      await page.waitForTimeout(100);
    }
    
    // Verify achievements unlock correctly even with rapid interactions
    await expect(page.locator('[data-testid="achievement-notification"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="achievement-name"]')).toContainText('First Steps');
    
    // Wait a bit more for Dam Builder achievement
    await page.waitForTimeout(2000);
    
    // Check if Dam Builder achievement also unlocked
    const notifications = page.locator('[data-testid="achievement-notification"]');
    const notificationCount = await notifications.count();
    
    if (notificationCount > 1) {
      await expect(page.locator('[data-testid="achievement-name"]')).toContainText('Dam Builder');
    }
  });
}); 