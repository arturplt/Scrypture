import { Page } from '@playwright/test';

// Global overlay handling utilities
export async function handleOverlays(page: Page) {
  // Try to dismiss InstallPrompt specifically
  const installPrompt = page.locator('[data-testid="install-prompt-overlay"], [data-testid="install-prompt"]');
  if (await installPrompt.isVisible()) {
    console.log('Dismissing InstallPrompt');
    try {
      // Try to click the close button first
      const closeButton = page.locator('[data-testid="install-prompt-close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
        return;
      }
      
      // Try to click the "Got it!" button
      const gotItButton = page.locator('[data-testid="install-prompt-got-it"]');
      if (await gotItButton.isVisible()) {
        await gotItButton.click();
        await page.waitForTimeout(500);
        return;
      }
      
      // Fallback: try to click outside the prompt
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('Could not dismiss InstallPrompt:', e);
    }
  }

  // Try to dismiss "Add to Home Screen" prompts (legacy detection)
  const addToHomeScreen = page.locator('text="Add to Home Screen", text="Install App"');
  if (await addToHomeScreen.isVisible()) {
    console.log('Dismissing Add to Home Screen prompt');
    try {
      await addToHomeScreen.click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('Could not click Add to Home Screen, trying to find close button');
      const closeButton = page.locator('button:has-text("Close"), button:has-text("Cancel"), button:has-text("Not Now")');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }
  }
  
  // Try to dismiss Bóbr messages - improved detection
  const bobrMessage = page.locator('div[class*="_bobrMessage"], div[class*="bobrMessage"], .bobrMessage');
  if (await bobrMessage.isVisible()) {
    console.log('Dismissing Bóbr message');
    try {
      // Try clicking the message itself
      await bobrMessage.click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('Could not click Bóbr message, trying alternative approach');
      // Try clicking outside the overlay
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);
    }
  }
  
  // Try to dismiss hints
  const hint = page.locator('div[class*="_hint"], div[class*="hint"], .hint');
  if (await hint.isVisible()) {
    console.log('Dismissing hint');
    try {
      await hint.click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('Could not click hint');
    }
  }
  
  // Specifically handle the congratulations overlay that blocks interactions
  const congratulationsOverlay = page.locator('div[class*="_overlay"], div[class*="overlay"], .overlay');
  if (await congratulationsOverlay.isVisible()) {
    console.log('Dismissing congratulations overlay');
    try {
      // First try to find and click the "Begin My Journey!" button
      const beginButton = page.locator('button:has-text("Begin My Journey!")');
      if (await beginButton.isVisible()) {
        console.log('Found Begin My Journey! button, clicking it');
        await beginButton.click();
        await page.waitForTimeout(1000);
        return;
      }
      
      // Try alternative button text variations
      const alternativeButtons = [
        'button:has-text("Begin My Journey")',
        'button:has-text("Begin Journey")',
        'button:has-text("Start My Journey")',
        'button:has-text("Continue")'
      ];
      
      for (const buttonSelector of alternativeButtons) {
        const button = page.locator(buttonSelector);
        if (await button.isVisible()) {
          console.log(`Found alternative button: ${buttonSelector}, clicking it`);
          await button.click();
          await page.waitForTimeout(1000);
          return;
        }
      }
      
      // Try clicking outside the overlay
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('Could not dismiss congratulations overlay');
    }
  }
  
  // Handle any remaining overlays that might be blocking interactions
  const anyOverlay = page.locator('div[class*="_overlay"], div[class*="overlay"], .overlay, div[class*="_bobrMessage"], div[class*="bobrMessage"]').first();
  if (await anyOverlay.isVisible()) {
    console.log('Dismissing remaining overlays');
    try {
      // Try clicking outside any overlay
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('Could not dismiss remaining overlays');
    }
  }
}

export async function waitForOverlaysToDisappear(page: Page) {
  // Wait for celebration and congratulations overlays to disappear
  const celebrationOverlay = page.locator('div[class*="_celebration_"]');
  const congratulationsOverlay = page.locator('div[class*="_overlay_"]');
  
  // Wait up to 10 seconds for overlays to disappear
  for (let i = 0; i < 20; i++) {
    const celebrationVisible = await celebrationOverlay.isVisible();
    const congratulationsVisible = await congratulationsOverlay.isVisible();
    
    if (!celebrationVisible && !congratulationsVisible) {
      console.log('Overlays disappeared');
      return;
    }
    
    console.log('Waiting for overlays to disappear...');
    await page.waitForTimeout(500);
  }
  
  console.log('Overlays did not disappear, continuing anyway');
}

export async function safeClick(page: Page, selector: string, index: number = 0) {
  // Handle overlays first
  await handleOverlays(page);
  
  try {
    // First try normal click with a shorter timeout
    const element = page.locator(selector).nth(index);
    await element.click({ timeout: 3000 });
    return true;
  } catch (e) {
    console.log('Normal click failed, trying JavaScript click');
    try {
      // Try JavaScript click to bypass overlay
      await page.evaluate(({ sel, idx }: { sel: string, idx: number }) => {
        const elements = document.querySelectorAll(sel);
        if (elements.length > idx) {
          (elements[idx] as HTMLElement).click();
        }
      }, { sel: selector, idx: index });
      
      // Wait a bit for any overlays to appear and disappear
      await page.waitForTimeout(500);
      
      return true;
    } catch (e2) {
      console.log('JavaScript click also failed:', e2);
      return false;
    }
  }
}

export async function createUserIfNeeded(page: Page, userName: string = 'Test User') {
  // Check if we're on the user creation screen
  const userCreationInput = page.locator('input[placeholder="Enter your character\'s name"]');
  if (await userCreationInput.isVisible()) {
    await userCreationInput.fill(userName);
    
    // Handle any overlays before clicking the button
    await handleOverlays(page);
    
    // Click the button with retry logic
    const beginJourneyButton = page.locator('button:has-text("Begin Your Journey")');
    try {
      await beginJourneyButton.click();
    } catch (e) {
      console.log('Failed to click Begin Your Journey, trying alternative approach');
      await page.waitForTimeout(1000);
      await handleOverlays(page);
      await beginJourneyButton.click();
    }
    
    // Wait for intro screen and click "Begin Journey" or "Skip Intro"
    await page.waitForSelector('button:has-text("Skip Intro"), button:has-text("Begin Journey"), button:has-text("Begin My Journey!")', { timeout: 10000 });
    
    // Handle any overlays that might have appeared
    await handleOverlays(page);
    
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
      
      // Wait for the button to be visible and clickable
      await page.waitForSelector('button:has-text("Begin My Journey!")', { timeout: 5000 });
      
      // Try multiple approaches to click the button
      try {
        const beginMyJourneyButton = page.locator('button:has-text("Begin My Journey!")');
        await beginMyJourneyButton.click();
      } catch (e) {
        console.log('Failed to click Begin My Journey! button, trying JavaScript click');
        // Try JavaScript click as fallback
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const beginButton = buttons.find(btn => btn.textContent?.includes('Begin My Journey!'));
          if (beginButton) {
            (beginButton as HTMLElement).click();
          }
        });
      }
      
      await page.waitForTimeout(2000);
    }
    
    // Handle any remaining overlays
    await handleOverlays(page);
    
    // Wait for the main app to load with a longer timeout
    await page.waitForSelector('input[placeholder="Intention"]', { timeout: 20000 });
    
    // Additional wait to ensure app is fully loaded
    await page.waitForTimeout(500);
  }
  
  // If we're already past user creation, still handle any overlays that might be blocking
  await handleOverlays(page);
  
  // Ensure the intention box is available
  const intentionInput = page.locator('input[placeholder="Intention"]');
  if (!(await intentionInput.isVisible())) {
    console.log('Intention box not visible, trying to handle overlays again');
    await handleOverlays(page);
    await page.waitForTimeout(1000);
  }
}

export async function setupTestEnvironment(page: Page) {
  // Clear localStorage before each test
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    // Prevent install prompt from showing
    localStorage.setItem('installPromptShown', 'true');
  });
} 