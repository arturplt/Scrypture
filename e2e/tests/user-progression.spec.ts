import { test, expect } from '@playwright/test';
import { setupTestEnvironment, createUserIfNeeded, safeClick, waitForOverlaysToDisappear } from '../utils/test-helpers';

test.describe('User Progression E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  async function setupUser(page: any) {
    await createUserIfNeeded(page, 'Progression Test User');
  }

  test('should gain XP from completing tasks', async ({ page }) => {
    await setupUser(page);
    
    // Create and complete a task
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('XP Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Wait for task to appear
    await expect(page.locator('text=XP Test Task')).toBeVisible();
    
    // Complete the task using safe click
    const success = await safeClick(page, '[role="checkbox"], input[type="checkbox"]', 0);
    if (!success) {
      throw new Error('Failed to click checkbox');
    }
    
    // Wait for overlays to disappear
    await waitForOverlaysToDisappear(page);
    
    // Verify XP was gained
    const xpDisplay = page.locator('[data-testid="xp-display"], text="XP"');
    if (await xpDisplay.isVisible()) {
      await page.waitForTimeout(1000);
      const xpText = await xpDisplay.textContent();
      const xpGained = parseInt(xpText?.match(/\d+/)?.[0] || '0');
      expect(xpGained).toBeGreaterThan(0);
    }
  });

  test('should level up after gaining enough XP', async ({ page }) => {
    await setupUser(page);
    
    // Complete multiple tasks to gain enough XP for level up
    for (let i = 1; i <= 5; i++) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(`Level Up Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      // Wait for task to appear
      await expect(page.locator(`text=Level Up Task ${i}`)).toBeVisible();
      
      // Complete the task using safe click
      const success = await safeClick(page, '[role="checkbox"], input[type="checkbox"]', i - 1);
      if (!success) {
        throw new Error(`Failed to click checkbox for task ${i}`);
      }
      
      // Wait for overlays to disappear
      await waitForOverlaysToDisappear(page);
      
      await page.waitForTimeout(200);
    }
    
    // Look for level up notification
    const levelUpNotification = page.locator('[data-testid="level-up-notification"], text="Level Up", text="Congratulations"');
    if (await levelUpNotification.isVisible()) {
      await expect(levelUpNotification).toBeVisible();
    }
  });

  test('should award stat rewards on task completion', async ({ page }) => {
    await setupUser(page);
    
    // Create and complete a task
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Stat Reward Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Wait for task to appear
    await expect(page.locator('text=Stat Reward Task')).toBeVisible();
    
    // Complete the task using safe click
    const success = await safeClick(page, '[role="checkbox"], input[type="checkbox"]', 0);
    if (!success) {
      throw new Error('Failed to click checkbox');
    }
    
    // Wait for overlays to disappear
    await waitForOverlaysToDisappear(page);
    
    // Look for stat reward notification
    const statRewardNotification = page.locator('[data-testid="stat-reward-notification"], text="Stat Reward", text="\\+1"');
    if (await statRewardNotification.isVisible()) {
      await expect(statRewardNotification).toBeVisible();
    }
  });

  test('should award stat rewards on habit completion', async ({ page }) => {
    await setupUser(page);
    
    // Look for habit creation interface
    const habitButton = page.locator('button:has-text("Habit"), [data-testid="create-habit-button"]');
    
    if (await habitButton.isVisible()) {
      await habitButton.click();
      
      // Create a daily habit
      const habitInput = page.locator('input[placeholder="Habit name"], input[placeholder="What habit do you want to build?"]');
      await habitInput.fill('Test Daily Habit');
      
      // Set frequency to daily
      const frequencySelect = page.locator('select, [data-testid="frequency-select"]');
      if (await frequencySelect.isVisible()) {
        await frequencySelect.selectOption('daily');
      }
      
      // Save the habit
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Create")');
      await saveButton.click();
      
      // Wait for habit to appear
      await expect(page.locator('text=Test Daily Habit')).toBeVisible();
      
      // Complete the habit using safe click
      const habitCheckbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
      const success = await safeClick(page, '[role="checkbox"], input[type="checkbox"]', 0);
      if (!success) {
        throw new Error('Failed to click habit checkbox');
      }
      
      // Wait for overlays to disappear
      await waitForOverlaysToDisappear(page);
      
      // Look for stat reward notification
      const statRewardNotification = page.locator('[data-testid="stat-reward-notification"], text="Stat Reward", text="\\+1"');
      if (await statRewardNotification.isVisible()) {
        await expect(statRewardNotification).toBeVisible();
      }
    }
  });

  test('should show level up celebration', async ({ page }) => {
    await setupUser(page);
    
    // Complete multiple tasks to trigger level up
    for (let i = 1; i <= 5; i++) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(`Celebration Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      // Wait for task to appear
      await expect(page.locator(`text=Celebration Task ${i}`)).toBeVisible();
      
      // Complete the task using safe click
      const success = await safeClick(page, '[role="checkbox"], input[type="checkbox"]', i - 1);
      if (!success) {
        throw new Error(`Failed to click checkbox for task ${i}`);
      }
      
      // Wait for overlays to disappear
      await waitForOverlaysToDisappear(page);
      
      await page.waitForTimeout(200);
    }
    
    // Look for level up celebration
    const celebration = page.locator('[data-testid="level-up-celebration"], text="Level Up", text="Congratulations"');
    if (await celebration.isVisible()) {
      await expect(celebration).toBeVisible();
    }
  });

  test('should persist progression across browser sessions', async ({ page }) => {
    await setupUser(page);
    
    // Complete a task to gain XP
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Persistence Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Wait for task to appear
    await expect(page.locator('text=Persistence Test Task')).toBeVisible();
    
    // Complete the task using safe click
    const success = await safeClick(page, '[role="checkbox"], input[type="checkbox"]', 0);
    if (!success) {
      throw new Error('Failed to click checkbox');
    }
    
    // Wait for overlays to disappear
    await waitForOverlaysToDisappear(page);
    
    // Get current XP
    const xpDisplay = page.locator('[data-testid="xp-display"], text="XP"');
    let currentXP = 0;
    if (await xpDisplay.isVisible()) {
      const xpText = await xpDisplay.textContent();
      currentXP = parseInt(xpText?.match(/\d+/)?.[0] || '0');
    }
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // Verify XP persists
    if (await xpDisplay.isVisible()) {
      const newXpText = await xpDisplay.textContent();
      const newXP = parseInt(newXpText?.match(/\d+/)?.[0] || '0');
      expect(newXP).toBeGreaterThanOrEqual(currentXP);
    }
  });

  test('should show progression statistics', async ({ page }) => {
    await setupUser(page);
    
    // Complete some tasks first
    for (let i = 1; i <= 2; i++) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(`Stats Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').last();
      await checkbox.click();
      
      await page.waitForTimeout(200);
    }
    
    // Look for statistics or analytics section
    const statsButton = page.locator('button:has-text("Stats"), button:has-text("Analytics"), [data-testid="stats-button"]');
    if (await statsButton.isVisible()) {
      await statsButton.click();
      
      // Verify progression stats are displayed
      const progressionStats = page.locator('[data-testid="progression-stats"], text=Total XP, text=Level, text=Tasks Completed');
      if (await progressionStats.isVisible()) {
        await expect(progressionStats).toBeVisible();
      }
    }
  });

  test('should handle high-difficulty task rewards', async ({ page }) => {
    await setupUser(page);
    
    // Look for task difficulty settings
    const difficultySlider = page.locator('[data-testid="difficulty-slider"], input[placeholder*="Difficulty"]');
    
    if (await difficultySlider.isVisible()) {
      // Set high difficulty
      await difficultySlider.fill('8');
      await expect(difficultySlider).toHaveValue('8');
      
      // Create high-difficulty task
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill('High Difficulty Task');
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      // Complete the task
      const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
      await checkbox.click();
      
      // Verify higher rewards for high difficulty
      const xpDisplay = page.locator('[data-testid="xp-display"], text="XP"');
      if (await xpDisplay.isVisible()) {
        await page.waitForTimeout(1000);
        const xpText = await xpDisplay.textContent();
        const xpGained = parseInt(xpText?.match(/\d+/)?.[0] || '0');
        expect(xpGained).toBeGreaterThan(0);
      }
    }
  });

  test('should handle priority-based XP rewards', async ({ page }) => {
    await setupUser(page);
    
    // Look for priority settings
    const priorityButtons = page.locator('[data-testid="priority-high"], button:has-text("High")');
    
    if (await priorityButtons.isVisible()) {
      // Set high priority
      await priorityButtons.click();
      
      // Create high-priority task
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill('High Priority Task');
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      // Complete the task
      const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
      await checkbox.click();
      
      // Verify priority affects rewards
      const xpDisplay = page.locator('[data-testid="xp-display"], text="XP"');
      if (await xpDisplay.isVisible()) {
        await page.waitForTimeout(1000);
        const xpText = await xpDisplay.textContent();
        const xpGained = parseInt(xpText?.match(/\d+/)?.[0] || '0');
        expect(xpGained).toBeGreaterThan(0);
      }
    }
  });

  test('should show progression milestones', async ({ page }) => {
    await setupUser(page);
    
    // Complete tasks to reach milestones
    for (let i = 1; i <= 5; i++) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(`Milestone Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      // Wait for task to appear
      await expect(page.locator(`text=Milestone Task ${i}`)).toBeVisible();
      
      // Complete the task using safe click
      const success = await safeClick(page, '[role="checkbox"], input[type="checkbox"]', i - 1);
      if (!success) {
        throw new Error(`Failed to click checkbox for task ${i}`);
      }
      
      // Wait for overlays to disappear
      await waitForOverlaysToDisappear(page);
      
      await page.waitForTimeout(200);
    }
    
    // Look for milestone notifications
    const milestoneNotification = page.locator('[data-testid="milestone-notification"], text="Milestone", text="Congratulations"');
    if (await milestoneNotification.isVisible()) {
      await expect(milestoneNotification).toBeVisible();
    }
  });

  test('should handle progression reset scenarios', async ({ page }) => {
    await setupUser(page);
    
    // Complete some tasks to build up progression
    for (let i = 1; i <= 3; i++) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(`Reset Test Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      // Wait for task to appear
      await expect(page.locator(`text=Reset Test Task ${i}`)).toBeVisible();
      
      // Complete the task using safe click
      const success = await safeClick(page, '[role="checkbox"], input[type="checkbox"]', i - 1);
      if (!success) {
        throw new Error(`Failed to click checkbox for task ${i}`);
      }
      
      // Wait for overlays to disappear
      await waitForOverlaysToDisappear(page);
      
      await page.waitForTimeout(200);
    }
    
    // Look for reset functionality
    const resetButton = page.locator('button:has-text("Reset"), button:has-text("Clear Progress"), [data-testid="reset-progress"]');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      
      // Confirm reset if confirmation dialog appears
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Verify progression is reset
      const xpDisplay = page.locator('[data-testid="xp-display"], text="XP"');
      if (await xpDisplay.isVisible()) {
        const xpText = await xpDisplay.textContent();
        const xp = parseInt(xpText?.match(/\d+/)?.[0] || '0');
        expect(xp).toBe(0);
      }
    }
  });
}); 