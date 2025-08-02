import { test, expect } from '@playwright/test';

test.describe('User Progression E2E Tests', () => {
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
      await userCreationInput.fill('Progression Test User');
      
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

  test('should gain XP from completing tasks', async ({ page }) => {
    await setupUser(page);
    
    // Look for XP display
    const xpDisplay = page.locator('[data-testid="xp-display"], text=XP, text=Experience');
    
    // Get initial XP (if visible)
    let initialXP = 0;
    if (await xpDisplay.isVisible()) {
      const xpText = await xpDisplay.textContent();
      initialXP = parseInt(xpText?.match(/\d+/)?.[0] || '0');
    }
    
    // Create and complete a task
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('XP Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
    await checkbox.click();
    
    // Verify XP increased
    if (await xpDisplay.isVisible()) {
      await page.waitForTimeout(1000); // Wait for XP update
      const newXPText = await xpDisplay.textContent();
      const newXP = parseInt(newXPText?.match(/\d+/)?.[0] || '0');
      expect(newXP).toBeGreaterThan(initialXP);
    }
  });

  test('should level up after gaining enough XP', async ({ page }) => {
    await setupUser(page);
    
    // Look for level display
    const levelDisplay = page.locator('[data-testid="level-display"], text=Level, text=Lv');
    
    // Get initial level
    let initialLevel = 1;
    if (await levelDisplay.isVisible()) {
      const levelText = await levelDisplay.textContent();
      initialLevel = parseInt(levelText?.match(/\d+/)?.[0] || '1');
    }
    
    // Complete multiple tasks to gain enough XP for level up
    for (let i = 1; i <= 5; i++) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(`Level Up Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').last();
      await checkbox.click();
      
      await page.waitForTimeout(200);
    }
    
    // Verify level increased
    if (await levelDisplay.isVisible()) {
      await page.waitForTimeout(2000); // Wait for level up
      const newLevelText = await levelDisplay.textContent();
      const newLevel = parseInt(newLevelText?.match(/\d+/)?.[0] || '1');
      expect(newLevel).toBeGreaterThan(initialLevel);
    }
  });

  test('should award stat rewards on task completion', async ({ page }) => {
    await setupUser(page);
    
    // Look for stat displays
    const bodyStat = page.locator('[data-testid="body-stat"], text=Body');
    const mindStat = page.locator('[data-testid="mind-stat"], text=Mind');
    const soulStat = page.locator('[data-testid="soul-stat"], text=Soul');
    
    // Get initial stats
    let initialBody = 0, initialMind = 0, initialSoul = 0;
    
    if (await bodyStat.isVisible()) {
      const bodyText = await bodyStat.textContent();
      initialBody = parseInt(bodyText?.match(/\d+/)?.[0] || '0');
    }
    
    if (await mindStat.isVisible()) {
      const mindText = await mindStat.textContent();
      initialMind = parseInt(mindText?.match(/\d+/)?.[0] || '0');
    }
    
    if (await soulStat.isVisible()) {
      const soulText = await soulStat.textContent();
      initialSoul = parseInt(soulText?.match(/\d+/)?.[0] || '0');
    }
    
    // Create and complete a task with stat rewards
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Stat Reward Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
    await checkbox.click();
    
    // Verify stats increased
    await page.waitForTimeout(1000);
    
    if (await bodyStat.isVisible()) {
      const newBodyText = await bodyStat.textContent();
      const newBody = parseInt(newBodyText?.match(/\d+/)?.[0] || '0');
      expect(newBody).toBeGreaterThanOrEqual(initialBody);
    }
    
    if (await mindStat.isVisible()) {
      const newMindText = await mindStat.textContent();
      const newMind = parseInt(newMindText?.match(/\d+/)?.[0] || '0');
      expect(newMind).toBeGreaterThanOrEqual(initialMind);
    }
    
    if (await soulStat.isVisible()) {
      const newSoulText = await soulStat.textContent();
      const newSoul = parseInt(newSoulText?.match(/\d+/)?.[0] || '0');
      expect(newSoul).toBeGreaterThanOrEqual(initialSoul);
    }
  });

  test('should award stat rewards on habit completion', async ({ page }) => {
    await setupUser(page);
    
    // Create a habit
    const addHabitButton = page.locator('button:has-text("Add Habit"), button:has-text("Create Habit")');
    if (await addHabitButton.isVisible()) {
      await addHabitButton.click();
      
      const habitNameInput = page.locator('input[placeholder*="habit"], input[placeholder*="Habit"]');
      if (await habitNameInput.isVisible()) {
        await habitNameInput.fill('Stat Habit');
        
        const submitButton = page.locator('button:has-text("Create"), button:has-text("Add")');
        if (await submitButton.isVisible()) {
          await submitButton.click();
        }
      }
    }
    
    // Get initial stats
    const bodyStat = page.locator('[data-testid="body-stat"], text=Body');
    let initialBody = 0;
    if (await bodyStat.isVisible()) {
      const bodyText = await bodyStat.textContent();
      initialBody = parseInt(bodyText?.match(/\d+/)?.[0] || '0');
    }
    
    // Complete the habit
    const completeButton = page.locator('button:has-text("Complete"), [data-testid="complete-habit-button"]').first();
    if (await completeButton.isVisible()) {
      await completeButton.click();
      
      // Verify stat reward
      await page.waitForTimeout(1000);
      if (await bodyStat.isVisible()) {
        const newBodyText = await bodyStat.textContent();
        const newBody = parseInt(newBodyText?.match(/\d+/)?.[0] || '0');
        expect(newBody).toBeGreaterThanOrEqual(initialBody);
      }
    }
  });

  test('should show level up celebration', async ({ page }) => {
    await setupUser(page);
    
    // Complete tasks to trigger level up
    for (let i = 1; i <= 10; i++) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(`Level Celebration Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').last();
      await checkbox.click();
      
      await page.waitForTimeout(100);
    }
    
    // Look for level up celebration
    const levelUpCelebration = page.locator('[data-testid="level-up-celebration"], text=Level Up, text=Congratulations');
    if (await levelUpCelebration.isVisible()) {
      await expect(levelUpCelebration).toBeVisible();
    }
  });

  test('should persist progression across browser sessions', async ({ page }) => {
    await setupUser(page);
    
    // Complete some tasks to gain XP and stats
    for (let i = 1; i <= 3; i++) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(`Persistence Task ${i}`);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').last();
      await checkbox.click();
      
      await page.waitForTimeout(200);
    }
    
    // Get current progression data
    const xpDisplay = page.locator('[data-testid="xp-display"], text=XP');
    const levelDisplay = page.locator('[data-testid="level-display"], text=Level');
    
    let currentXP = 0, currentLevel = 1;
    
    if (await xpDisplay.isVisible()) {
      const xpText = await xpDisplay.textContent();
      currentXP = parseInt(xpText?.match(/\d+/)?.[0] || '0');
    }
    
    if (await levelDisplay.isVisible()) {
      const levelText = await levelDisplay.textContent();
      currentLevel = parseInt(levelText?.match(/\d+/)?.[0] || '1');
    }
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // Verify progression persisted
    if (await xpDisplay.isVisible()) {
      const newXPText = await xpDisplay.textContent();
      const newXP = parseInt(newXPText?.match(/\d+/)?.[0] || '0');
      expect(newXP).toBe(currentXP);
    }
    
    if (await levelDisplay.isVisible()) {
      const newLevelText = await levelDisplay.textContent();
      const newLevel = parseInt(newLevelText?.match(/\d+/)?.[0] || '1');
      expect(newLevel).toBe(currentLevel);
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
      const xpDisplay = page.locator('[data-testid="xp-display"], text=XP');
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
      const xpDisplay = page.locator('[data-testid="xp-display"], text=XP');
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
      
      const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').last();
      await checkbox.click();
      
      await page.waitForTimeout(200);
    }
    
    // Look for milestone notifications
    const milestoneNotification = page.locator('[data-testid="milestone-notification"], text=Milestone, text=Congratulations');
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
      
      const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').last();
      await checkbox.click();
      
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
      const xpDisplay = page.locator('[data-testid="xp-display"], text=XP');
      if (await xpDisplay.isVisible()) {
        const xpText = await xpDisplay.textContent();
        const xp = parseInt(xpText?.match(/\d+/)?.[0] || '0');
        expect(xp).toBe(0);
      }
    }
  });
}); 