import { test, expect } from '@playwright/test';

test.describe('Debug App Structure', () => {
  test('should see what elements are available', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    
    // Log the page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for common elements
    const bodyText = await page.textContent('body');
    console.log('Body text (first 500 chars):', bodyText?.substring(0, 500));
    
    // Look for any input elements
    const inputs = await page.locator('input').all();
    console.log('Found input elements:', inputs.length);
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const type = await inputs[i].getAttribute('type');
      console.log(`Input ${i}: type=${type}, placeholder=${placeholder}`);
    }
    
    // Look for any buttons
    const buttons = await page.locator('button').all();
    console.log('Found button elements:', buttons.length);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`Button ${i}: text="${text}"`);
    }
    
    // Look for forms
    const forms = await page.locator('form').all();
    console.log('Found form elements:', forms.length);
    
    // Check if there's a welcome screen or user creation
    const welcomeText = await page.locator('text=Welcome, text=Create, text=Start').all();
    console.log('Found welcome/start elements:', welcomeText.length);
    
    // Basic assertion to make the test pass
    expect(true).toBeTruthy();
  });
}); 