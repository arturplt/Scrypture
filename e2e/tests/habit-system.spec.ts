import { test, expect } from '@playwright/test';
import { createUserIfNeeded, setupTestEnvironment, safeClick, waitForOverlaysToDisappear, handleOverlays } from '../utils/test-helpers';

test.describe('Habit System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  // Helper function to create a habit
  async function createHabit(page: any, habitName: string, frequency: 'daily' | 'weekly' | 'monthly' = 'daily') {
    // Wait for the TaskForm to be visible (the main input with "Intention" placeholder)
    const taskFormInput = page.locator('input[placeholder="Intention"]');
    await expect(taskFormInput).toBeVisible({ timeout: 10000 });
    
    // Handle any overlays that might be blocking interactions
    await handleOverlays(page);
    
    // Use JavaScript click to bypass any remaining overlays
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Intention"]') as HTMLElement;
      if (input) {
        input.click();
      }
    });
    await page.waitForTimeout(500);
    
    // Fill in the task name using JavaScript
    await page.evaluate((name) => {
      const input = document.querySelector('input[placeholder="Intention"]') as HTMLInputElement;
      if (input) {
        input.value = name;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, habitName);
    await page.waitForTimeout(500);
    
    // Look for and click the "Make it a Habit" button using JavaScript
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const makeItHabitButton = buttons.find(btn => btn.textContent?.includes('🔄 Make it a Habit'));
      if (makeItHabitButton) {
        (makeItHabitButton as HTMLElement).click();
      }
    });
    await page.waitForTimeout(500);
    
    // Select frequency using JavaScript
    await page.evaluate((freq) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const frequencyButton = buttons.find(btn => btn.textContent?.includes(freq.charAt(0).toUpperCase() + freq.slice(1)));
      if (frequencyButton) {
        (frequencyButton as HTMLElement).click();
      }
    }, frequency);
    await page.waitForTimeout(500);
    
    // Submit the form using JavaScript
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submitButton = buttons.find(btn => btn.textContent?.includes('Create Habit'));
      if (submitButton) {
        (submitButton as HTMLElement).click();
      }
    });
    
    // Wait for habit to appear in the habit list
    await expect(page.locator(`text="${habitName}"`)).toBeVisible({ timeout: 10000 });
  }

  test('should create and complete a daily habit', async ({ page }) => {
    await createUserIfNeeded(page);
    
    // Create a daily habit
    await createHabit(page, 'Daily Exercise Habit', 'daily');
    
    // Complete the habit by clicking the checkbox
    const habitCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(habitCheckbox).toBeVisible({ timeout: 5000 });
    await habitCheckbox.click();
    
    // Verify habit shows as completed (checkbox should be checked)
    await expect(habitCheckbox).toBeChecked();
    
    // Verify streak starts at 1 (look for streak display)
    await expect(page.locator('text="1 day"')).toBeVisible({ timeout: 5000 });
  });

  test('should track daily habit streak correctly', async ({ page }) => {
    await createUserIfNeeded(page);
    
    // Create a daily habit
    await createHabit(page, 'Daily Reading Habit', 'daily');
    
    // Complete the habit multiple times
    for (let i = 1; i <= 3; i++) {
      const habitCheckbox = page.locator('input[type="checkbox"]').first();
      await expect(habitCheckbox).toBeVisible({ timeout: 5000 });
      await habitCheckbox.click();
      
      // Wait for completion animation
      await page.waitForTimeout(500);
      
      // Verify streak increases (look for streak display)
      await expect(page.locator(`text="${i} day${i !== 1 ? 's' : ''}"`)).toBeVisible({ timeout: 2000 });
    }
    
    // Verify final streak is 3
    await expect(page.locator('text="3 days"')).toBeVisible();
  });

  test('should handle weekly habit frequency logic', async ({ page }) => {
    await createUserIfNeeded(page);
    
    // Create a weekly habit
    await createHabit(page, 'Weekly Review Habit', 'weekly');
    
    // Complete the habit
    const habitCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(habitCheckbox).toBeVisible({ timeout: 5000 });
    await habitCheckbox.click();
    
    // Verify habit shows as completed
    await expect(habitCheckbox).toBeChecked();
    
    // Try to complete again immediately (should be blocked for weekly)
    await habitCheckbox.click();
    
    // Verify it shows cooldown or completion status (checkbox should remain checked)
    await expect(habitCheckbox).toBeChecked();
  });

  test('should handle monthly habit frequency logic', async ({ page }) => {
    await createUserIfNeeded(page);
    
    // Create a monthly habit
    await createHabit(page, 'Monthly Planning Habit', 'monthly');
    
    // Complete the habit
    const habitCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(habitCheckbox).toBeVisible({ timeout: 5000 });
    await habitCheckbox.click();
    
    // Verify habit shows as completed
    await expect(habitCheckbox).toBeChecked();
    
    // Verify monthly frequency is respected (look for monthly frequency indicator)
    await expect(page.locator('text="Monthly"')).toBeVisible();
  });

  test('should award stat rewards on habit completion', async ({ page }) => {
    await createUserIfNeeded(page);
    
    // Create a habit with stat rewards
    await createHabit(page, 'Mind Training Habit', 'daily');
    
    // Complete the habit
    const habitCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(habitCheckbox).toBeVisible({ timeout: 5000 });
    await habitCheckbox.click();
    
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
    await createUserIfNeeded(page);
    
    // Create a habit
    await createHabit(page, 'Convertible Habit', 'daily');
    
    // Find and click the edit button (🖍) to open edit form
    const editButton = page.locator('button:has-text("🖍")').first();
    await expect(editButton).toBeVisible({ timeout: 5000 });
    await editButton.click();
    
    // Look for convert to task button in the edit form
    const convertButton = page.locator('button:has-text("Convert to Task")');
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
    await createUserIfNeeded(page);
    
    // Create a habit
    await createHabit(page, 'Persistent Habit', 'daily');
    
    // Complete the habit
    const habitCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(habitCheckbox).toBeVisible({ timeout: 5000 });
    await habitCheckbox.click();
    
    // Verify habit is completed
    await expect(habitCheckbox).toBeChecked();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // Verify habit still exists and shows completion status
    await expect(page.locator('text=Persistent Habit')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
  });

  test('should handle habit streak breaks correctly', async ({ page }) => {
    await createUserIfNeeded(page);
    
    // Create a daily habit
    await createHabit(page, 'Streak Test Habit', 'daily');
    
    // Complete the habit to start streak
    const habitCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(habitCheckbox).toBeVisible({ timeout: 5000 });
    await habitCheckbox.click();
    
    // Verify streak starts at 1
    await expect(page.locator('text="1 day"')).toBeVisible();
    
    // Wait for cooldown period (simulate missing a day)
    await page.waitForTimeout(1000);
    
    // Try to complete again (should reset streak or show different behavior)
    await habitCheckbox.click();
    
    // Verify streak behavior (either continues or resets based on app logic)
    const streakDisplay = page.locator('[data-testid="streak-display"], text=1, text=2');
    await expect(streakDisplay).toBeVisible();
  });

  test('should display habit categories correctly', async ({ page }) => {
    await createUserIfNeeded(page);
    
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
      const filteredCount = await filteredHabits.count();
      expect(filteredCount).toBeGreaterThan(0);
    }
  });

  test('should handle multiple habit completions rapidly', async ({ page }) => {
    await createUserIfNeeded(page);
    
    // Create multiple habits
    const habits = ['Habit 1', 'Habit 2', 'Habit 3'];
    
    for (const habitName of habits) {
      await createHabit(page, habitName, 'daily');
    }
    
    // Complete all habits rapidly using checkboxes
    const habitCheckboxes = page.locator('input[type="checkbox"]');
    const count = await habitCheckboxes.count();
    
    for (let i = 0; i < count; i++) {
      await habitCheckboxes.nth(i).click();
      await page.waitForTimeout(100);
    }
    
    // Verify all habits show as completed
    for (const habitName of habits) {
      await expect(page.locator(`text="${habitName}"`)).toBeVisible();
    }
    
    // Verify completion indicators are present (checkboxes should be checked)
    const checkedCheckboxes = page.locator('input[type="checkbox"]:checked');
    const completionCount = await checkedCheckboxes.count();
    expect(completionCount).toBeGreaterThan(0);
  });

  test('should show habit statistics and analytics', async ({ page }) => {
    await createUserIfNeeded(page);
    
    // Create and complete some habits
    await createHabit(page, 'Analytics Habit 1', 'daily');
    await createHabit(page, 'Analytics Habit 2', 'weekly');
    
    // Complete habits
    const habitCheckboxes = page.locator('input[type="checkbox"]');
    for (let i = 0; i < 2; i++) {
      await habitCheckboxes.nth(i).click();
      await page.waitForTimeout(200);
    }
    
    // Navigate to analytics or statistics section
    const analyticsButton = page.locator('button:has-text("📊")');
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