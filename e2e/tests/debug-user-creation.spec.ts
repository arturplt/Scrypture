import { test, expect } from '@playwright/test';

test.describe('Debug User Creation Flow', () => {
  test('should debug the user creation process', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check if we're on user creation screen
    const userCreationInput = page.locator('input[placeholder="Enter your character\'s name"]');
    if (await userCreationInput.isVisible()) {
      console.log('Found user creation screen');
      
      // Fill in the name
      await userCreationInput.fill('E2E Test User');
      
      // Take screenshot before clicking
      await page.screenshot({ path: 'before-journey-click.png' });
      
      // Click the button
      await page.click('button:has-text("Begin Your Journey")');
      
      // Wait a moment and take another screenshot
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'after-journey-click.png' });
      
      // Check what elements are now visible
      const inputs = await page.locator('input').all();
      console.log('Inputs after journey click:', inputs.length);
      for (let i = 0; i < inputs.length; i++) {
        const placeholder = await inputs[i].getAttribute('placeholder');
        const type = await inputs[i].getAttribute('type');
        console.log(`Input ${i}: type=${type}, placeholder=${placeholder}`);
      }
      
      const buttons = await page.locator('button').all();
      console.log('Buttons after journey click:', buttons.length);
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        console.log(`Button ${i}: text="${text}"`);
      }
      
      // Check for any text content
      const bodyText = await page.textContent('body');
      console.log('Body text after journey click (first 500 chars):', bodyText?.substring(0, 500));
      
      // Now try to click "Begin My Journey!" if it exists
      const beginMyJourneyButton = page.locator('button:has-text("Begin My Journey!")');
      if (await beginMyJourneyButton.isVisible()) {
        console.log('Found "Begin My Journey!" button, clicking it...');
        await beginMyJourneyButton.click();
        
        // Wait and take another screenshot
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'after-begin-my-journey.png' });
        
        // Check what's visible now
        const inputsAfter = await page.locator('input').all();
        console.log('Inputs after "Begin My Journey!":', inputsAfter.length);
        for (let i = 0; i < inputsAfter.length; i++) {
          const placeholder = await inputsAfter[i].getAttribute('placeholder');
          const type = await inputsAfter[i].getAttribute('type');
          console.log(`Input ${i}: type=${type}, placeholder=${placeholder}`);
        }
        
        const buttonsAfter = await page.locator('button').all();
        console.log('Buttons after "Begin My Journey!":', buttonsAfter.length);
        for (let i = 0; i < buttonsAfter.length; i++) {
          const text = await buttonsAfter[i].textContent();
          console.log(`Button ${i}: text="${text}"`);
        }
      }
      
    } else {
      console.log('No user creation screen found');
    }
    
    // Basic assertion
    expect(true).toBeTruthy();
  });
}); 