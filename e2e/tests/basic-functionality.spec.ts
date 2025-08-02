import { test, expect } from '@playwright/test';

test.describe('Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  // Helper function to create a user if needed
  async function createUserIfNeeded(page: any) {
    // Check if we're on the user creation screen
    const userCreationInput = page.locator('input[placeholder="Enter your character\'s name"]');
    if (await userCreationInput.isVisible()) {
      await userCreationInput.fill('E2E Test User');
      
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

  test('should create a basic task', async ({ page }) => {
    await page.goto('/');
    
    // Create user if needed
    await createUserIfNeeded(page);
    
    // Create a simple task
    const taskTitle = 'Simple Test Task';
    await page.fill('input[placeholder="Intention"]', taskTitle);
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Verify task appears in the list
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
  });

  test('should handle multiple tasks', async ({ page }) => {
    await page.goto('/');
    
    // Create user if needed
    await createUserIfNeeded(page);
    
    // Create multiple tasks
    const tasks = ['Task 1', 'Task 2', 'Task 3'];
    
    for (const taskTitle of tasks) {
      await page.fill('input[placeholder="Intention"]', taskTitle);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      // Verify task appears
      await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
    }
    
    // Verify all tasks are present
    for (const taskTitle of tasks) {
      await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
    }
  });

  test('should persist data after reload', async ({ page }) => {
    await page.goto('/');
    
    // Create user if needed
    await createUserIfNeeded(page);
    
    // Create a task
    const taskTitle = 'Persistent Task';
    await page.fill('input[placeholder="Intention"]', taskTitle);
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Verify task is created
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
    
    // Reload the page
    await page.reload();
    
    // Wait for app to load again
    await page.waitForSelector('input[placeholder="Intention"]', { timeout: 10000 });
    
    // Verify task still exists
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
  });

  test('should handle app navigation', async ({ page }) => {
    await page.goto('/');
    
    // Create user if needed
    await createUserIfNeeded(page);
    
    // Verify we can interact with the form
    const input = page.locator('input[placeholder="Intention"]');
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    
    // Verify we can type in the input
    await input.fill('Navigation Test');
    await expect(input).toHaveValue('Navigation Test');
  });
}); 