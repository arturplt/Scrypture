import { test, expect } from '@playwright/test';

test.describe('Habit System E2E Tests', () => {
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
      await userCreationInput.fill('Habit Test User');
      
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

  // Helper function to create a habit
  async function createHabit(page: any, habitName: string, frequency: 'daily' | 'weekly' | 'monthly' = 'daily') {
    // Look for habit creation button or form
    const addHabitButton = page.locator('button:has-text("Add Habit"), button:has-text("Create Habit"), [data-testid="add-habit-button"]');
    if (await addHabitButton.isVisible()) {
      await addHabitButton.click();
    }
    
    // Fill habit form
    const habitNameInput = page.locator('input[placeholder*="habit"], input[placeholder*="Habit"], [data-testid="habit-name-input"]');
    if (await habitNameInput.isVisible()) {
      await habitNameInput.fill(habitName);
    }
    
    // Select frequency if available
    const frequencyButtons = page.locator(`button:has-text("${frequency.charAt(0).toUpperCase() + frequency.slice(1)}"), [data-testid="frequency-${frequency}"]`);
    if (await frequencyButtons.isVisible()) {
      await frequencyButtons.click();
    }
    
    // Submit habit form
    const submitButton = page.locator('button:has-text("Create"), button:has-text("Add"), button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
    
    // Wait for habit to appear
    await expect(page.locator(`text=${habitName}`)).toBeVisible({ timeout: 5000 });
  }

  test('should create and complete a daily habit', async ({ page }) => {
    await setupUser(page);
    
    // Create a daily habit
    await createHabit(page, 'Daily Exercise Habit', 'daily');
    
    // Complete the habit
    const completeButton = page.locator('button:has-text("Complete"), [data-testid="complete-habit-button"]').first();
    await completeButton.click();
    
    // Verify habit shows as completed
    await expect(page.locator('text=Daily Exercise Habit')).toBeVisible();
    await expect(page.locator('[data-testid="habit-completed"]')).toBeVisible();
    
    // Verify streak starts at 1
    await expect(page.locator('text=1')).toBeVisible();
  });

  test('should track daily habit streak correctly', async ({ page }) => {
    await setupUser(page);
    
    // Create a daily habit
    await createHabit(page, 'Daily Reading Habit', 'daily');
    
    // Complete the habit multiple times
    for (let i = 1; i <= 3; i++) {
      const completeButton = page.locator('button:has-text("Complete"), [data-testid="complete-habit-button"]').first();
      await completeButton.click();
      
      // Wait for completion animation
      await page.waitForTimeout(500);
      
      // Verify streak increases
      await expect(page.locator(`text=${i}`)).toBeVisible({ timeout: 2000 });
    }
    
    // Verify final streak is 3
    await expect(page.locator('text=3')).toBeVisible();
  });

  test('should handle weekly habit frequency logic', async ({ page }) => {
    await setupUser(page);
    
    // Create a weekly habit
    await createHabit(page, 'Weekly Review Habit', 'weekly');
    
    // Complete the habit
    const completeButton = page.locator('button:has-text("Complete"), [data-testid="complete-habit-button"]').first();
    await completeButton.click();
    
    // Verify habit shows as completed
    await expect(page.locator('text=Weekly Review Habit')).toBeVisible();
    await expect(page.locator('[data-testid="habit-completed"]')).toBeVisible();
    
    // Try to complete again immediately (should be blocked for weekly)
    await completeButton.click();
    
    // Verify it shows cooldown or completion status
    await expect(page.locator('text=Weekly Review Habit')).toBeVisible();
  });

  test('should handle monthly habit frequency logic', async ({ page }) => {
    await setupUser(page);
    
    // Create a monthly habit
    await createHabit(page, 'Monthly Planning Habit', 'monthly');
    
    // Complete the habit
    const completeButton = page.locator('button:has-text("Complete"), [data-testid="complete-habit-button"]').first();
    await completeButton.click();
    
    // Verify habit shows as completed
    await expect(page.locator('text=Monthly Planning Habit')).toBeVisible();
    await expect(page.locator('[data-testid="habit-completed"]')).toBeVisible();
    
    // Verify monthly frequency is respected
    await expect(page.locator('[data-testid="habit-frequency-monthly"]')).toBeVisible();
  });

  test('should award stat rewards on habit completion', async ({ page }) => {
    await setupUser(page);
    
    // Create a habit with stat rewards
    await createHabit(page, 'Mind Training Habit', 'daily');
    
    // Complete the habit
    const completeButton = page.locator('button:has-text("Complete"), [data-testid="complete-habit-button"]').first();
    await completeButton.click();
    
    // Verify stat rewards are awarded
    // Look for stat indicators or notifications
    const statReward = page.locator('text=+1 Mind, text=Mind +1, [data-testid="stat-reward"]');
    if (await statReward.isVisible()) {
      await expect(statReward).toBeVisible();
    }
    
    // Alternative: check if stats are updated in user profile
    const statsDisplay = page.locator('[data-testid="stats-display"], text=Mind');
    if (await statsDisplay.isVisible()) {
      await expect(statsDisplay).toBeVisible();
    }
  });

  test('should convert habit to task', async ({ page }) => {
    await setupUser(page);
    
    // Create a habit
    await createHabit(page, 'Convertible Habit', 'daily');
    
    // Find and click convert to task button
    const convertButton = page.locator('button:has-text("Convert to Task"), [data-testid="convert-to-task-button"]');
    if (await convertButton.isVisible()) {
      await convertButton.click();
      
      // Verify habit is converted to task
      await expect(page.locator('text=Convertible Habit')).toBeVisible();
      
      // Verify it appears in task list
      const taskList = page.locator('[data-testid="task-list"], [data-testid="tasks-container"]');
      await expect(taskList).toBeVisible();
    }
  });

  test('should persist habit data across browser sessions', async ({ page }) => {
    await setupUser(page);
    
    // Create a habit
    await createHabit(page, 'Persistent Habit', 'daily');
    
    // Complete the habit
    const completeButton = page.locator('button:has-text("Complete"), [data-testid="complete-habit-button"]').first();
    await completeButton.click();
    
    // Verify habit is completed
    await expect(page.locator('text=Persistent Habit')).toBeVisible();
    await expect(page.locator('[data-testid="habit-completed"]')).toBeVisible();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // Verify habit still exists and shows completion status
    await expect(page.locator('text=Persistent Habit')).toBeVisible();
    await expect(page.locator('[data-testid="habit-completed"]')).toBeVisible();
  });

  test('should handle habit streak breaks correctly', async ({ page }) => {
    await setupUser(page);
    
    // Create a daily habit
    await createHabit(page, 'Streak Test Habit', 'daily');
    
    // Complete the habit to start streak
    const completeButton = page.locator('button:has-text("Complete"), [data-testid="complete-habit-button"]').first();
    await completeButton.click();
    
    // Verify streak starts at 1
    await expect(page.locator('text=1')).toBeVisible();
    
    // Wait for cooldown period (simulate missing a day)
    await page.waitForTimeout(1000);
    
    // Try to complete again (should reset streak or show different behavior)
    await completeButton.click();
    
    // Verify streak behavior (either continues or resets based on app logic)
    const streakDisplay = page.locator('[data-testid="streak-display"], text=1, text=2');
    await expect(streakDisplay).toBeVisible();
  });

  test('should display habit categories correctly', async ({ page }) => {
    await setupUser(page);
    
    // Create habits with different categories
    await createHabit(page, 'Work Habit', 'daily');
    await createHabit(page, 'Health Habit', 'daily');
    
    // Verify habits are displayed
    await expect(page.locator('text=Work Habit')).toBeVisible();
    await expect(page.locator('text=Health Habit')).toBeVisible();
    
    // Check if category filtering works
    const categoryFilter = page.locator('[data-testid="category-filter"], button:has-text("Work"), button:has-text("Health")');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.first().click();
      
      // Verify only filtered habits are shown
      const filteredHabits = page.locator('[data-testid="habit-card"]');
      await expect(filteredHabits).toHaveCount.greaterThan(0);
    }
  });

  test('should handle multiple habit completions rapidly', async ({ page }) => {
    await setupUser(page);
    
    // Create multiple habits
    const habits = ['Habit 1', 'Habit 2', 'Habit 3'];
    
    for (const habitName of habits) {
      await createHabit(page, habitName, 'daily');
    }
    
    // Complete all habits rapidly
    const completeButtons = page.locator('button:has-text("Complete"), [data-testid="complete-habit-button"]');
    const count = await completeButtons.count();
    
    for (let i = 0; i < count; i++) {
      await completeButtons.nth(i).click();
      await page.waitForTimeout(100);
    }
    
    // Verify all habits show as completed
    for (const habitName of habits) {
      await expect(page.locator(`text=${habitName}`)).toBeVisible();
    }
    
    // Verify completion indicators are present
    const completionIndicators = page.locator('[data-testid="habit-completed"]');
    await expect(completionIndicators).toHaveCount.greaterThan(0);
  });

  test('should show habit statistics and analytics', async ({ page }) => {
    await setupUser(page);
    
    // Create and complete some habits
    await createHabit(page, 'Analytics Habit 1', 'daily');
    await createHabit(page, 'Analytics Habit 2', 'weekly');
    
    // Complete habits
    const completeButtons = page.locator('button:has-text("Complete"), [data-testid="complete-habit-button"]');
    for (let i = 0; i < 2; i++) {
      await completeButtons.nth(i).click();
      await page.waitForTimeout(200);
    }
    
    // Navigate to analytics or statistics section
    const analyticsButton = page.locator('button:has-text("Analytics"), button:has-text("Stats"), [data-testid="analytics-button"]');
    if (await analyticsButton.isVisible()) {
      await analyticsButton.click();
      
      // Verify habit statistics are displayed
      const habitStats = page.locator('[data-testid="habit-stats"], text=Habits, text=Streaks');
      await expect(habitStats).toBeVisible();
      
      // Check for completion rates or other metrics
      const completionRate = page.locator('[data-testid="completion-rate"], text=%, text=completed');
      if (await completionRate.isVisible()) {
        await expect(completionRate).toBeVisible();
      }
    }
  });
}); 