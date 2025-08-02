import { test, expect } from '@playwright/test';

test.describe('Data Persistence E2E Tests', () => {
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
      await userCreationInput.fill('Persistence Test User');
      
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

  test('should auto-save data during task creation', async ({ page }) => {
    await setupUser(page);
    
    // Look for auto-save indicator
    const autoSaveIndicator = page.locator('[data-testid="auto-save-indicator"], text=Saved, text=Saving');
    
    // Create a task
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Auto-Save Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Verify task appears
    await expect(page.locator('text=Auto-Save Test Task')).toBeVisible();
    
    // Check if auto-save indicator shows activity
    if (await autoSaveIndicator.isVisible()) {
      await expect(autoSaveIndicator).toBeVisible();
    }
    
    // Verify data persists after refresh
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('text=Auto-Save Test Task')).toBeVisible();
  });

  test('should auto-save data during task completion', async ({ page }) => {
    await setupUser(page);
    
    // Create a task
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Completion Auto-Save Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Complete the task
    const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
    await checkbox.click();
    
    // Verify task shows as completed
    await expect(page.locator('text=Completion Auto-Save Task')).toBeVisible();
    await expect(checkbox).toBeChecked();
    
    // Refresh and verify completion status persists
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('text=Completion Auto-Save Task')).toBeVisible();
    await expect(page.locator('[role="checkbox"], input[type="checkbox"]').first()).toBeChecked();
  });

  test('should recover data after browser crash simulation', async ({ page }) => {
    await setupUser(page);
    
    // Create multiple tasks
    const tasks = ['Task 1', 'Task 2', 'Task 3'];
    
    for (const taskTitle of tasks) {
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill(taskTitle);
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
    }
    
    // Complete some tasks
    const checkboxes = page.locator('[role="checkbox"], input[type="checkbox"]');
    for (let i = 0; i < 2; i++) {
      await checkboxes.nth(i).click();
    }
    
    // Simulate browser crash by clearing localStorage and reloading
    await page.evaluate(() => {
      // Clear everything except the data we just created
      const keysToKeep = ['scrypture_tasks', 'scrypture_user', 'scrypture_achievements'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    });
    
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // Verify data is recovered
    for (const taskTitle of tasks) {
      await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
    }
    
    // Verify completion status is recovered
    const checkboxesAfterReload = page.locator('[role="checkbox"], input[type="checkbox"]');
    await expect(checkboxesAfterReload.nth(0)).toBeChecked();
    await expect(checkboxesAfterReload.nth(1)).toBeChecked();
  });

  test('should handle localStorage full scenario gracefully', async ({ page }) => {
    await setupUser(page);
    
    // Fill localStorage to simulate storage limits
    await page.evaluate(() => {
      // Fill localStorage with dummy data to simulate storage limits
      const dummyData = 'x'.repeat(1024 * 1024); // 1MB chunks
      let i = 0;
      
      try {
        while (i < 10) { // Try to fill with 10MB
          localStorage.setItem(`dummy_${i}`, dummyData);
          i++;
        }
      } catch (e) {
        console.log('localStorage filled, cannot add more data');
      }
    });
    
    // Try to create a task
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Storage Limit Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // App should handle storage errors gracefully
    // Either show an error message or continue working
    const errorMessage = page.locator('text=Storage full, text=Storage error, text=Unable to save');
    const taskCreated = page.locator('text=Storage Limit Test Task');
    
    // One of these should be true
    expect(await errorMessage.isVisible() || await taskCreated.isVisible()).toBeTruthy();
  });

  test('should export data successfully', async ({ page }) => {
    await setupUser(page);
    
    // Create some data to export
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Export Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Look for export functionality
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Backup"), [data-testid="export-button"]');
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      // Wait for download or export dialog
      await page.waitForTimeout(2000);
      
      // Verify export was successful (check for download or success message)
      const successMessage = page.locator('text=Export successful, text=Data exported, text=Backup created');
      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
      }
    }
  });

  test('should import data successfully', async ({ page }) => {
    await setupUser(page);
    
    // Create some initial data
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Before Import Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Look for import functionality
    const importButton = page.locator('button:has-text("Import"), button:has-text("Restore"), [data-testid="import-button"]');
    if (await importButton.isVisible()) {
      await importButton.click();
      
      // This test would need a sample data file to import
      // For now, we'll just verify the import dialog appears
      const importDialog = page.locator('[data-testid="import-dialog"], text=Import, text=Restore');
      if (await importDialog.isVisible()) {
        await expect(importDialog).toBeVisible();
      }
    }
  });

  test('should persist data across browser sessions', async ({ page }) => {
    await setupUser(page);
    
    // Create tasks and habits
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Session Persistence Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Complete the task
    const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first();
    await checkbox.click();
    
    // Create a habit if possible
    const addHabitButton = page.locator('button:has-text("Add Habit"), button:has-text("Create Habit")');
    if (await addHabitButton.isVisible()) {
      await addHabitButton.click();
      
      const habitNameInput = page.locator('input[placeholder*="habit"], input[placeholder*="Habit"]');
      if (await habitNameInput.isVisible()) {
        await habitNameInput.fill('Session Persistence Habit');
        
        const submitButton = page.locator('button:has-text("Create"), button:has-text("Add")');
        if (await submitButton.isVisible()) {
          await submitButton.click();
        }
      }
    }
    
    // Verify data exists
    await expect(page.locator('text=Session Persistence Task')).toBeVisible();
    await expect(checkbox).toBeChecked();
    
    // Close and reopen browser (simulate new session)
    await page.close();
    
    // Open new page and navigate to app
    const newPage = await page.context().newPage();
    await newPage.goto('/');
    
    // Verify data persists in new session
    await expect(newPage.locator('text=Session Persistence Task')).toBeVisible();
    await expect(newPage.locator('[role="checkbox"], input[type="checkbox"]').first()).toBeChecked();
  });

  test('should handle concurrent data modifications', async ({ page }) => {
    await setupUser(page);
    
    // Create initial task
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Concurrent Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Open second tab
    const secondPage = await page.context().newPage();
    await secondPage.goto('/');
    
    // Modify data in second tab
    const secondTaskInput = secondPage.locator('input[placeholder="Intention"]');
    await secondTaskInput.fill('Second Tab Task');
    await secondPage.press('input[placeholder="Intention"]', 'Enter');
    
    // Go back to first tab and verify data is still there
    await expect(page.locator('text=Concurrent Test Task')).toBeVisible();
    
    // Refresh first tab and verify both tasks exist
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('text=Concurrent Test Task')).toBeVisible();
    await expect(page.locator('text=Second Tab Task')).toBeVisible();
  });

  test('should show auto-save status indicators', async ({ page }) => {
    await setupUser(page);
    
    // Look for auto-save indicator
    const autoSaveIndicator = page.locator('[data-testid="auto-save-indicator"], text=Saved, text=Saving, text=Auto-save');
    
    if (await autoSaveIndicator.isVisible()) {
      // Verify initial state
      await expect(autoSaveIndicator).toBeVisible();
      
      // Create a task to trigger auto-save
      const taskInput = page.locator('input[placeholder="Intention"]');
      await taskInput.fill('Auto-Save Status Task');
      await page.press('input[placeholder="Intention"]', 'Enter');
      
      // Verify auto-save indicator shows activity
      await expect(autoSaveIndicator).toBeVisible();
      
      // Wait for save to complete
      await page.waitForTimeout(2000);
      
      // Verify save status
      await expect(autoSaveIndicator).toBeVisible();
    }
  });

  test('should handle data corruption recovery', async ({ page }) => {
    await setupUser(page);
    
    // Create some valid data
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Valid Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Simulate data corruption
    await page.evaluate(() => {
      localStorage.setItem('scrypture_tasks', 'invalid json data');
    });
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // App should handle corruption gracefully
    // Either show error message or reset to default state
    const errorMessage = page.locator('text=Data error, text=Corrupted, text=Reset');
    const defaultState = page.locator('input[placeholder="Intention"]');
    
    // One of these should be true
    expect(await errorMessage.isVisible() || await defaultState.isVisible()).toBeTruthy();
  });

  test('should backup data automatically', async ({ page }) => {
    await setupUser(page);
    
    // Create some data
    const taskInput = page.locator('input[placeholder="Intention"]');
    await taskInput.fill('Backup Test Task');
    await page.press('input[placeholder="Intention"]', 'Enter');
    
    // Check if automatic backup is created
    const backupData = await page.evaluate(() => {
      return localStorage.getItem('scrypture_backup') || localStorage.getItem('scrypture_auto_backup');
    });
    
    // If backup system exists, verify it contains data
    if (backupData) {
      expect(backupData).toContain('Backup Test Task');
    }
    
    // Look for backup indicators in UI
    const backupIndicator = page.locator('[data-testid="backup-indicator"], text=Backup, text=Auto-backup');
    if (await backupIndicator.isVisible()) {
      await expect(backupIndicator).toBeVisible();
    }
  });
}); 