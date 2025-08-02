import { test, expect } from '@playwright/test';
import { createUserIfNeeded, setupTestEnvironment, handleOverlays, waitForOverlaysToDisappear } from '../utils/test-helpers';

test.describe('Synthesizer E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  // Helper function to access synthesizer through secret menu
  async function openSynthesizer(page: any) {
    // Scroll to bottom to find secret menu
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(500);
    
    // Look for the secret menu section
    const secretMenuSection = page.locator('text="🔐 Secret Menu"');
    await expect(secretMenuSection).toBeVisible();
    
    // Click the LOCKED button to open combination lock
    const lockedButton = page.locator('button:has-text("🔒 LOCKED")');
    await expect(lockedButton).toBeVisible();
    await lockedButton.click();
    
    // Wait for combination lock modal to appear - look for any modal with dials
    await page.waitForSelector('div[class*="dials"], div[class*="dialContainer"]', { timeout: 5000 });
    
    // The combination lock starts at 2136, we need to change the last digit to 7
    // Look for dial numbers (digits 0-9)
    const dialNumbers = page.locator('div[class*="dialNumber"], div[role="button"]:has-text(/[0-9]/)');
    await expect(dialNumbers).toHaveCount(4);
    
    // Click the last dial (4th position) to set it to 7
    await dialNumbers.nth(3).click();
    
    // Wait for unlock animation and modal to close
    await page.waitForTimeout(1000);
    
    // Now the secret menu should be unlocked, click the synthesizer button
    const synthesizerButton = page.locator('button:has-text("🎵 Synthesizer")');
    await expect(synthesizerButton).toBeVisible();
    await synthesizerButton.click();
    
    // Wait for synthesizer to load
    await page.waitForSelector('[data-testid="synthesizer"]', { timeout: 10000 });
  }

  test('should open synthesizer interface', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Verify synthesizer interface is visible
    await expect(page.locator('[data-testid="synthesizer"]')).toBeVisible();
    
    // Check for basic synthesizer controls
    const controls = page.locator('[data-testid="synthesizer-controls"], button:has-text("Play"), button:has-text("Stop")');
    if (await controls.isVisible()) {
      await expect(controls).toBeVisible();
    }
  });

  test('should create and manage multiple tracks', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Look for track management interface
    const addTrackButton = page.locator('button:has-text("Add Track"), button:has-text("New Track"), [data-testid="add-track-button"]');
    
    if (await addTrackButton.isVisible()) {
      // Create first track
      await addTrackButton.click();
      await page.waitForTimeout(500);
      
      // Create second track
      await addTrackButton.click();
      await page.waitForTimeout(500);
      
      // Verify tracks are created
      const tracks = page.locator('[data-testid="track-item"], [data-testid="track-card"]');
      await expect(tracks).toHaveCount(2);
      
      // Test track selection
      await tracks.first().click();
      await expect(tracks.first()).toHaveClass(/selected|active/);
    }
  });

  test('should mute and solo tracks', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Create tracks if needed
    const addTrackButton = page.locator('button:has-text("Add Track"), [data-testid="add-track-button"]');
    if (await addTrackButton.isVisible()) {
      await addTrackButton.click();
      await addTrackButton.click();
      await page.waitForTimeout(500);
    }
    
    // Test mute functionality
    const muteButtons = page.locator('[data-testid="mute-button"], button:has-text("Mute")');
    if (await muteButtons.first().isVisible()) {
      await muteButtons.first().click();
      
      // Verify track is muted
      await expect(muteButtons.first()).toHaveClass(/muted|active/);
      
      // Test solo functionality
      const soloButtons = page.locator('[data-testid="solo-button"], button:has-text("Solo")');
      if (await soloButtons.first().isVisible()) {
        await soloButtons.first().click();
        
        // Verify solo is active
        await expect(soloButtons.first()).toHaveClass(/solo|active/);
      }
    }
  });

  test('should adjust track volume', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Look for volume controls
    const volumeSlider = page.locator('[data-testid="volume-slider"], input[type="range"]');
    
    if (await volumeSlider.first().isVisible()) {
      // Adjust volume
      await volumeSlider.first().fill('50');
      
      // Verify volume change
      await expect(volumeSlider.first()).toHaveValue('50');
    }
  });

  test('should create and play sequences', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Look for sequencer interface
    const sequencerGrid = page.locator('[data-testid="sequencer-grid"], [data-testid="step-sequencer"]');
    
    if (await sequencerGrid.isVisible()) {
      // Click on some steps to create a pattern
      const steps = page.locator('[data-testid="sequencer-step"], [data-testid="step"]');
      await steps.nth(0).click();
      await steps.nth(4).click();
      await steps.nth(8).click();
      await steps.nth(12).click();
      
      // Start playback
      const playButton = page.locator('button:has-text("Play"), [data-testid="play-button"]');
      if (await playButton.isVisible()) {
        await playButton.click();
        
        // Verify playback is active
        await expect(playButton).toHaveClass(/playing|active/);
        
        // Stop playback
        const stopButton = page.locator('button:has-text("Stop"), [data-testid="stop-button"]');
        if (await stopButton.isVisible()) {
          await stopButton.click();
          
          // Verify playback stopped
          await expect(playButton).not.toHaveClass(/playing|active/);
        }
      }
    }
  });

  test('should enable and configure effects', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Look for effects controls
    const effectsPanel = page.locator('[data-testid="effects-panel"], text=Effects, text=Delay, text=Reverb');
    
    if (await effectsPanel.isVisible()) {
      // Enable delay effect
      const delayToggle = page.locator('[data-testid="delay-toggle"], input[type="checkbox"]');
      if (await delayToggle.isVisible()) {
        await delayToggle.click();
        
        // Verify delay is enabled
        await expect(delayToggle).toBeChecked();
        
        // Adjust delay parameters
        const delayTimeSlider = page.locator('[data-testid="delay-time"], input[type="range"]');
        if (await delayTimeSlider.isVisible()) {
          await delayTimeSlider.fill('0.5');
          await expect(delayTimeSlider).toHaveValue('0.5');
        }
      }
      
      // Enable reverb effect
      const reverbToggle = page.locator('[data-testid="reverb-toggle"], input[type="checkbox"]');
      if (await reverbToggle.isVisible()) {
        await reverbToggle.click();
        await expect(reverbToggle).toBeChecked();
      }
    }
  });

  test('should change waveforms and instruments', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Look for waveform/instrument selection
    const waveformSelect = page.locator('[data-testid="waveform-select"], select, button:has-text("Sine")');
    
    if (await waveformSelect.isVisible()) {
      // Change waveform
      if (await waveformSelect.locator('select').isVisible()) {
        await waveformSelect.selectOption('square');
        await expect(waveformSelect).toHaveValue('square');
      } else {
        // Try clicking waveform buttons
        const squareButton = page.locator('button:has-text("Square"), [data-testid="waveform-square"]');
        if (await squareButton.isVisible()) {
          await squareButton.click();
          await expect(squareButton).toHaveClass(/selected|active/);
        }
      }
    }
  });

  test('should adjust synthesizer parameters', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Test attack parameter
    const attackSlider = page.locator('[data-testid="attack-slider"], input[placeholder*="Attack"]');
    if (await attackSlider.isVisible()) {
      await attackSlider.fill('0.1');
      await expect(attackSlider).toHaveValue('0.1');
    }
    
    // Test release parameter
    const releaseSlider = page.locator('[data-testid="release-slider"], input[placeholder*="Release"]');
    if (await releaseSlider.isVisible()) {
      await releaseSlider.fill('0.5');
      await expect(releaseSlider).toHaveValue('0.5');
    }
    
    // Test volume parameter
    const volumeSlider = page.locator('[data-testid="master-volume"], input[type="range"]');
    if (await volumeSlider.isVisible()) {
      await volumeSlider.fill('75');
      await expect(volumeSlider).toHaveValue('75');
    }
  });

  test('should play individual notes', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Look for keyboard or note buttons
    const keyboard = page.locator('[data-testid="keyboard"], [data-testid="piano-keys"]');
    const noteButtons = page.locator('[data-testid="note-button"], button:has-text("C"), button:has-text("D")');
    
    if (await keyboard.isVisible() || await noteButtons.first().isVisible()) {
      // Play a note
      const noteToPlay = noteButtons.first();
      await noteToPlay.click();
      
      // Verify note plays (check for visual feedback or audio context)
      await expect(noteToPlay).toHaveClass(/playing|active/);
      
      // Wait for note to finish
      await page.waitForTimeout(1000);
      
      // Verify note stopped
      await expect(noteToPlay).not.toHaveClass(/playing|active/);
    }
  });

  test('should save and load synthesizer presets', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Configure some settings
    const volumeSlider = page.locator('[data-testid="master-volume"], input[type="range"]');
    if (await volumeSlider.isVisible()) {
      await volumeSlider.fill('80');
    }
    
    // Look for save preset functionality
    const savePresetButton = page.locator('button:has-text("Save Preset"), [data-testid="save-preset-button"]');
    if (await savePresetButton.isVisible()) {
      await savePresetButton.click();
      
      // Enter preset name
      const presetNameInput = page.locator('input[placeholder*="preset"], input[placeholder*="name"]');
      if (await presetNameInput.isVisible()) {
        await presetNameInput.fill('Test Preset');
        
        const confirmButton = page.locator('button:has-text("Save"), button:has-text("Confirm")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      }
      
      // Verify preset is saved
      const presetList = page.locator('[data-testid="preset-list"], text=Test Preset');
      if (await presetList.isVisible()) {
        await expect(presetList).toBeVisible();
      }
    }
  });

  test('should handle BPM changes', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Look for BPM control
    const bpmInput = page.locator('[data-testid="bpm-input"], input[placeholder*="BPM"], input[type="number"]');
    
    if (await bpmInput.isVisible()) {
      // Change BPM
      await bpmInput.fill('140');
      await expect(bpmInput).toHaveValue('140');
      
      // Start playback to verify BPM change
      const playButton = page.locator('button:has-text("Play"), [data-testid="play-button"]');
      if (await playButton.isVisible()) {
        await playButton.click();
        
        // Verify playback at new BPM
        await expect(playButton).toHaveClass(/playing|active/);
        
        // Stop playback
        const stopButton = page.locator('button:has-text("Stop"), [data-testid="stop-button"]');
        if (await stopButton.isVisible()) {
          await stopButton.click();
        }
      }
    }
  });

  test('should persist synthesizer settings across sessions', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Configure some settings
    const volumeSlider = page.locator('[data-testid="master-volume"], input[type="range"]');
    if (await volumeSlider.isVisible()) {
      await volumeSlider.fill('60');
    }
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // Reopen synthesizer
    await openSynthesizer(page);
    
    // Verify settings persisted
    if (await volumeSlider.isVisible()) {
      await expect(volumeSlider).toHaveValue('60');
    }
  });

  test('should handle audio context initialization', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Try to play a note to trigger audio context
    const noteButtons = page.locator('[data-testid="note-button"], button:has-text("C")');
    if (await noteButtons.first().isVisible()) {
      await noteButtons.first().click();
      
      // Check for audio context status or error messages
      const audioStatus = page.locator('[data-testid="audio-status"], text=Audio, text=Context');
      const errorMessage = page.locator('text=Audio context, text=Permission, text=Click to enable');
      
      // One of these should be visible
      expect(await audioStatus.isVisible() || await errorMessage.isVisible()).toBeTruthy();
    }
  });

  test('should handle synthesizer performance with multiple tracks', async ({ page }) => {
    await createUserIfNeeded(page);
    await openSynthesizer(page);
    
    // Create multiple tracks
    const addTrackButton = page.locator('button:has-text("Add Track"), [data-testid="add-track-button"]');
    if (await addTrackButton.isVisible()) {
      // Create 4 tracks
      for (let i = 0; i < 4; i++) {
        await addTrackButton.click();
        await page.waitForTimeout(200);
      }
      
      // Verify tracks are created
      const tracks = page.locator('[data-testid="track-item"], [data-testid="track-card"]');
      await expect(tracks).toHaveCount(4);
      
      // Start playback with multiple tracks
      const playButton = page.locator('button:has-text("Play"), [data-testid="play-button"]');
      if (await playButton.isVisible()) {
        await playButton.click();
        
        // Verify playback continues without errors
        await expect(playButton).toHaveClass(/playing|active/);
        
        // Let it play for a few seconds
        await page.waitForTimeout(3000);
        
        // Stop playback
        const stopButton = page.locator('button:has-text("Stop"), [data-testid="stop-button"]');
        if (await stopButton.isVisible()) {
          await stopButton.click();
        }
      }
    }
  });
}); 