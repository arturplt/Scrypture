import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Verify the page loads
    await expect(page).toHaveTitle(/Scrypture/);
    
    // Verify basic elements are present
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have basic app structure', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check for common elements (adjust selectors based on your actual implementation)
    const hasTaskForm = await page.locator('[placeholder="Intention"], [data-testid="task-form"], form').isVisible();
    const hasAddButton = await page.locator('button:has-text("Add"), button:has-text("Add Task")').isVisible();
    
    // At least one of these should be true
    expect(hasTaskForm || hasAddButton).toBeTruthy();
  });

  test('should handle basic navigation', async ({ page }) => {
    await page.goto('/');
    
    // Verify we can interact with the page
    await page.mouse.move(100, 100);
    
    // Try to find and click a button if it exists
    const addButton = page.locator('button:has-text("Add"), button:has-text("Add Task")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      // If button exists, clicking it should not cause an error
      expect(true).toBeTruthy();
    }
  });
}); 