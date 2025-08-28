import { ATLAS_MAPPING, AtlasSprite } from './src/data/atlasMapping';

// Convert AtlasSprite to the format expected by the HTML
interface UIElement {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category: 'button' | 'frame' | 'bar' | 'break' | 'icon' | 'text';
  subcategory?: string;
  theme?: string;
  state?: 'normal' | 'active' | 'hover' | 'pressed';
  color?: string;
  variant?: string;
  usage?: string;
  cssClass?: string;
  borderSlice?: { top: number; right: number; bottom: number; left: number };
  description?: string;
}

// Convert AtlasSprite to UIElement format
function convertSpriteToUIElement(sprite: AtlasSprite): UIElement {
  return {
    id: sprite.id,
    name: sprite.name,
    x: sprite.x,
    y: sprite.y,
    width: sprite.width,
    height: sprite.height,
    category: sprite.category,
    theme: sprite.theme,
    state: sprite.state,
    color: sprite.color,
    variant: 'basic',
    usage: sprite.category === 'button' ? 'general' : 'container',
    cssClass: sprite.id.replace(/-/g, '-'),
    description: sprite.description,
    ...(sprite.category === 'frame' && {
      borderSlice: { top: 16, right: 16, bottom: 16, left: 16 }
    })
  };
}

// Export the converted data for use in the HTML
export const UI_ELEMENT_MAPPING = {
  buttons: ATLAS_MAPPING.sprites
    .filter(sprite => sprite.category === 'button')
    .map(convertSpriteToUIElement),
  frames: ATLAS_MAPPING.sprites
    .filter(sprite => sprite.category === 'frame')
    .map(convertSpriteToUIElement),
  bars: ATLAS_MAPPING.sprites
    .filter(sprite => sprite.category === 'bar')
    .map(convertSpriteToUIElement),
  breaks: ATLAS_MAPPING.sprites
    .filter(sprite => sprite.category === 'break')
    .map(convertSpriteToUIElement),
  icons: ATLAS_MAPPING.sprites
    .filter(sprite => sprite.category === 'icon')
    .map(convertSpriteToUIElement),
  texts: ATLAS_MAPPING.sprites
    .filter(sprite => sprite.category === 'text')
    .map(convertSpriteToUIElement)
};

// Export metadata
export const ATLAS_METADATA = ATLAS_MAPPING.metadata;

// Export utility functions
export const getElementById = (id: string): UIElement | undefined => {
  return [...UI_ELEMENT_MAPPING.buttons, ...UI_ELEMENT_MAPPING.frames, ...UI_ELEMENT_MAPPING.bars, ...UI_ELEMENT_MAPPING.breaks, ...UI_ELEMENT_MAPPING.icons, ...UI_ELEMENT_MAPPING.texts]
    .find(element => element.id === id);
};

export const getElementsByCategory = (category: 'button' | 'frame' | 'bar' | 'break' | 'icon' | 'text'): UIElement[] => {
  switch (category) {
    case 'button': return UI_ELEMENT_MAPPING.buttons;
    case 'frame': return UI_ELEMENT_MAPPING.frames;
    case 'bar': return UI_ELEMENT_MAPPING.bars;
    case 'break': return UI_ELEMENT_MAPPING.breaks;
    case 'icon': return UI_ELEMENT_MAPPING.icons;
    case 'text': return UI_ELEMENT_MAPPING.texts;
    default: return [];
  }
};

export const getElementsByTheme = (theme: string): UIElement[] => {
  return [...UI_ELEMENT_MAPPING.buttons, ...UI_ELEMENT_MAPPING.frames, ...UI_ELEMENT_MAPPING.bars, ...UI_ELEMENT_MAPPING.breaks, ...UI_ELEMENT_MAPPING.icons, ...UI_ELEMENT_MAPPING.texts]
    .filter(element => element.theme === theme);
};

export const getAvailableThemes = (): string[] => {
  const themes = new Set<string>();
  [...UI_ELEMENT_MAPPING.buttons, ...UI_ELEMENT_MAPPING.frames, ...UI_ELEMENT_MAPPING.bars, ...UI_ELEMENT_MAPPING.breaks, ...UI_ELEMENT_MAPPING.icons, ...UI_ELEMENT_MAPPING.texts].forEach(element => {
    if (element.theme) themes.add(element.theme);
  });
  return Array.from(themes).sort();
};

