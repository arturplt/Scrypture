/**
 * UI Components Index
 * Export all UI components for easy importing
 */

// Frame components
export { Frame, FRAME_THEMES } from './Frame';
export type { FrameProps, FrameTheme } from './Frame';
export { FrameTest } from './FrameTest';

// Button components
export { 
  Button, 
  SmallButton, 
  WideButton, 
  ThemedButton,
  BodyButton,
  MindButton,
  SoulButton
} from './Button';
export type { ButtonProps, ButtonSize, ButtonTheme, ButtonState } from './Button';
export { ButtonTest } from './ButtonTest';

// Theme system components
export { ThemeSelector } from './ThemeSelector';
export type { ThemeSelectorProps } from './ThemeSelector';
export { ThemeTest } from './ThemeTest';
export type { ThemeTestProps } from './ThemeTest';

// Asset management
export { useAssetManager } from '../../hooks/useAssetManager';
export { assetManager } from '../../utils/assetManager';
export type { 
  AssetConfig, 
  ButtonConfig, 
  FrameConfig, 
  AssetManagerState
} from '../../utils/assetManager';

// Theme management
export { useThemeManager } from '../../hooks/useThemeManager';
export { themeManager } from '../../utils/themeManager';
export type { 
  ThemeConfig, 
  ThemePreferences, 
  ThemeManagerState 
} from '../../utils/themeManager';

// Atlas mapping
export { AtlasMappingTest } from './AtlasMappingTest';
export type { AtlasMappingTestProps } from './AtlasMappingTest';
export { 
  ATLAS_MAPPING,
  getSpriteById,
  getSpritesByCategory,
  getSpritesByTheme,
  getButtonSprites,
  getFrameSprites,
  getAvailableThemes,
  getAvailableButtonThemes,
  getAvailableFrameThemes
} from '../../data/atlasMapping';
export type { AtlasSprite, AtlasMapping } from '../../data/atlasMapping';

// UI Element mapping
export { UIElementMappingTest } from './UIElementMappingTest';
export type { UIElementMappingTestProps } from './UIElementMappingTest';
export { 
  UI_ELEMENT_MAPPING,
  getUIElementById,
  getUIElementsByCategory,
  getUIElementsByTheme,
  getUIElementsBySubcategory,
  getButtonElements,
  getFrameElements,
  getUIElementsByUsage,
  getCSSClassForElement,
  getBorderSliceForElement
} from '../../data/uiElementMapping';
export type { UIElement, UIElementMapping } from '../../data/uiElementMapping';

// Modal system components
export { Modal } from './Modal';
export type { ModalProps } from './Modal';
export { ConfirmationModal } from './ConfirmationModal';
export type { ConfirmationModalProps } from './ConfirmationModal';
export { ModalTest } from './ModalTest';
export type { ModalTestProps } from './ModalTest';
