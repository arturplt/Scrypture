import { test, expect } from '@playwright/test';

test.describe('Debug Complete User Flow', () => {
  test('should trace the complete user creation flow', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Step 1: User creation screen
    const userCreationInput = page.locator('input[placeholder="Enter your character\'s name"]');
    if (await userCreationInput.isVisible()) {
      console.log('Step 1: User creation screen');
      await userCreationInput.fill('E2E Test User');
      await page.screenshot({ path: 'step1-user-creation.png' });
      
      // Click "Begin Your Journey"
      await page.click('button:has-text("Begin Your Journey")');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'step2-after-begin-your-journey.png' });
      
      // Step 2: Intro screen
      const skipIntroButton = page.locator('button:has-text("Skip Intro")');
      if (await skipIntroButton.isVisible()) {
        console.log('Step 2: Intro screen - clicking Skip Intro');
        await skipIntroButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'step3-after-skip-intro.png' });
        
        // Step 3: Check for main app
        const intentionInput = page.locator('input[placeholder="Intention"]');
        if (await intentionInput.isVisible()) {
          console.log('Step 3: Main app loaded successfully');
          await page.screenshot({ path: 'step4-main-app.png' });
        } else {
          console.log('Step 3: Main app not loaded yet');
          
          // Check what buttons are available
          const buttons = await page.locator('button').all();
          console.log('Available buttons:', buttons.length);
          for (let i = 0; i < buttons.length; i++) {
            const text = await buttons[i].textContent();
            console.log(`Button ${i}: text="${text}"`);
          }
          
          // Check for any overlays or modals
          const overlays = await page.locator('[class*="overlay"], [class*="modal"]').all();
          console.log('Overlays/modals found:', overlays.length);
          
          // Check body text for clues
          const bodyText = await page.textContent('body');
          console.log('Body text (first 300 chars):', bodyText?.substring(0, 300));
        }
      } else {
        console.log('Step 2: Skip Intro button not found');
        await page.screenshot({ path: 'step2-no-skip-intro.png' });
      }
    } else {
      console.log('Step 1: User creation screen not found');
      await page.screenshot({ path: 'step1-no-user-creation.png' });
    }
    
    // Basic assertion
    expect(true).toBeTruthy();
  });
}); 