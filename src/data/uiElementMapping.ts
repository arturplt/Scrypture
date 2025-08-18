/**
 * UI Element Mapping for Framesandbuttonsatlas.png
 * Comprehensive coordinate and metadata mapping for all UI elements
 * Used by AssetManager, Frame, Button, and other UI components
 */

export interface UIElement {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category: 'button' | 'frame';
  subcategory: string;
  theme: string;
  state?: 'normal' | 'active' | 'hover' | 'pressed';
  variant?: string;
  description: string;
  usage: string[];
  cssClass?: string;
  borderSlice?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface UIElementMapping {
  elements: UIElement[];
  metadata: {
    atlasWidth: number;
    atlasHeight: number;
    totalElements: number;
    buttonCount: number;
    frameCount: number;
    themes: string[];
  };
}

/**
 * Complete UI Element Mapping for Framesandbuttonsatlas.png
 * Organized by category with exact coordinates and metadata
 */
export const UI_ELEMENT_MAPPING: UIElementMapping = {
  elements: [
    // ===== BUTTON ELEMENTS (32 total) =====
    
    // Small Buttons (16x16) - Row 1: Default State
    {
      id: 'btn-small-body-default',
      name: 'Body Button (Small)',
      x: 0,
      y: 0,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'body',
      state: 'normal',
      variant: 'default',
      description: 'Red-themed small button for physical attributes',
      usage: ['SmallButton', 'BodyButton', 'IconButton'],
      cssClass: 'btn-small-body'
    },
    {
      id: 'btn-small-mind-default',
      name: 'Mind Button (Small)',
      x: 16,
      y: 0,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'mind',
      state: 'normal',
      variant: 'default',
      description: 'Green-themed small button for mental attributes',
      usage: ['SmallButton', 'MindButton', 'IconButton'],
      cssClass: 'btn-small-mind'
    },
    {
      id: 'btn-small-soul-default',
      name: 'Soul Button (Small)',
      x: 32,
      y: 0,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'soul',
      state: 'normal',
      variant: 'default',
      description: 'Brown-themed small button for spiritual attributes',
      usage: ['SmallButton', 'SoulButton', 'IconButton'],
      cssClass: 'btn-small-soul'
    },
    {
      id: 'btn-small-stone-default',
      name: 'Stone Button (Small)',
      x: 48,
      y: 0,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'stone',
      state: 'normal',
      variant: 'default',
      description: 'Grey stone small button with natural texture',
      usage: ['SmallButton', 'StoneButton', 'IconButton'],
      cssClass: 'btn-small-stone'
    },
    {
      id: 'btn-small-ice-default',
      name: 'Ice Button (Small)',
      x: 64,
      y: 0,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'ice',
      state: 'normal',
      variant: 'default',
      description: 'Light blue crystalline small button',
      usage: ['SmallButton', 'IceButton', 'IconButton'],
      cssClass: 'btn-small-ice'
    },
    {
      id: 'btn-small-gold-default',
      name: 'Gold Button (Small)',
      x: 80,
      y: 0,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'gold',
      state: 'normal',
      variant: 'default',
      description: 'Golden-yellow small button with metallic shine',
      usage: ['SmallButton', 'GoldButton', 'IconButton'],
      cssClass: 'btn-small-gold'
    },
    {
      id: 'btn-small-wood-default',
      name: 'Wood Button (Small)',
      x: 96,
      y: 0,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'wood',
      state: 'normal',
      variant: 'default',
      description: 'Dark wooden small button with grain texture',
      usage: ['SmallButton', 'WoodButton', 'IconButton'],
      cssClass: 'btn-small-wood'
    },
    {
      id: 'btn-small-metal-default',
      name: 'Metal Button (Small)',
      x: 112,
      y: 0,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'metal',
      state: 'normal',
      variant: 'default',
      description: 'Dark metallic small button with rivets',
      usage: ['SmallButton', 'MetalButton', 'IconButton'],
      cssClass: 'btn-small-metal'
    },

    // Small Buttons (16x16) - Row 2: Active/Hover/Pressed State
    {
      id: 'btn-small-body-active',
      name: 'Body Button (Small) - Active',
      x: 0,
      y: 16,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'body',
      state: 'active',
      variant: 'active',
      description: 'Red-themed small button in active/hover state',
      usage: ['SmallButton', 'BodyButton', 'IconButton'],
      cssClass: 'btn-small-body-active'
    },
    {
      id: 'btn-small-mind-active',
      name: 'Mind Button (Small) - Active',
      x: 16,
      y: 16,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'mind',
      state: 'active',
      variant: 'active',
      description: 'Green-themed small button in active/hover state',
      usage: ['SmallButton', 'MindButton', 'IconButton'],
      cssClass: 'btn-small-mind-active'
    },
    {
      id: 'btn-small-soul-active',
      name: 'Soul Button (Small) - Active',
      x: 32,
      y: 16,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'soul',
      state: 'active',
      variant: 'active',
      description: 'Brown-themed small button in active/hover state',
      usage: ['SmallButton', 'SoulButton', 'IconButton'],
      cssClass: 'btn-small-soul-active'
    },
    {
      id: 'btn-small-stone-active',
      name: 'Stone Button (Small) - Active',
      x: 48,
      y: 16,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'stone',
      state: 'active',
      variant: 'active',
      description: 'Stone small button with glowing cyan outline',
      usage: ['SmallButton', 'StoneButton', 'IconButton'],
      cssClass: 'btn-small-stone-active'
    },
    {
      id: 'btn-small-ice-active',
      name: 'Ice Button (Small) - Active',
      x: 64,
      y: 16,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'ice',
      state: 'active',
      variant: 'active',
      description: 'Ice small button with glowing magenta outline',
      usage: ['SmallButton', 'IceButton', 'IconButton'],
      cssClass: 'btn-small-ice-active'
    },
    {
      id: 'btn-small-gold-active',
      name: 'Gold Button (Small) - Active',
      x: 80,
      y: 16,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'gold',
      state: 'active',
      variant: 'active',
      description: 'Gold small button with glowing purple outline',
      usage: ['SmallButton', 'GoldButton', 'IconButton'],
      cssClass: 'btn-small-gold-active'
    },
    {
      id: 'btn-small-wood-active',
      name: 'Wood Button (Small) - Active',
      x: 96,
      y: 16,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'wood',
      state: 'active',
      variant: 'active',
      description: 'Wood small button with darker shade',
      usage: ['SmallButton', 'WoodButton', 'IconButton'],
      cssClass: 'btn-small-wood-active'
    },
    {
      id: 'btn-small-metal-active',
      name: 'Metal Button (Small) - Active',
      x: 112,
      y: 16,
      width: 16,
      height: 16,
      category: 'button',
      subcategory: 'small',
      theme: 'metal',
      state: 'active',
      variant: 'active',
      description: 'Metal small button with lighter shade',
      usage: ['SmallButton', 'MetalButton', 'IconButton'],
      cssClass: 'btn-small-metal-active'
    },

    // Wide Buttons (16x32) - Row 3: Default State
    {
      id: 'btn-wide-body-default',
      name: 'Body Button (Wide)',
      x: 0,
      y: 32,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'body',
      state: 'normal',
      variant: 'default',
      description: 'Red-themed wide button for physical attributes',
      usage: ['WideButton', 'BodyButton', 'TextButton'],
      cssClass: 'btn-wide-body'
    },
    {
      id: 'btn-wide-mind-default',
      name: 'Mind Button (Wide)',
      x: 16,
      y: 32,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'mind',
      state: 'normal',
      variant: 'default',
      description: 'Green-themed wide button for mental attributes',
      usage: ['WideButton', 'MindButton', 'TextButton'],
      cssClass: 'btn-wide-mind'
    },
    {
      id: 'btn-wide-soul-default',
      name: 'Soul Button (Wide)',
      x: 32,
      y: 32,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'soul',
      state: 'normal',
      variant: 'default',
      description: 'Brown-themed wide button for spiritual attributes',
      usage: ['WideButton', 'SoulButton', 'TextButton'],
      cssClass: 'btn-wide-soul'
    },
    {
      id: 'btn-wide-ice-default',
      name: 'Ice Button (Wide)',
      x: 48,
      y: 32,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'ice',
      state: 'normal',
      variant: 'default',
      description: 'Light blue crystalline wide button',
      usage: ['WideButton', 'IceButton', 'TextButton'],
      cssClass: 'btn-wide-ice'
    },
    {
      id: 'btn-wide-stone-default',
      name: 'Stone Button (Wide)',
      x: 64,
      y: 32,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'stone',
      state: 'normal',
      variant: 'default',
      description: 'Grey stone wide button with natural texture',
      usage: ['WideButton', 'StoneButton', 'TextButton'],
      cssClass: 'btn-wide-stone'
    },
    {
      id: 'btn-wide-gold-default',
      name: 'Gold Button (Wide)',
      x: 80,
      y: 32,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'gold',
      state: 'normal',
      variant: 'default',
      description: 'Golden-yellow wide button with metallic shine',
      usage: ['WideButton', 'GoldButton', 'TextButton'],
      cssClass: 'btn-wide-gold'
    },
    {
      id: 'btn-wide-wood-default',
      name: 'Wood Button (Wide)',
      x: 96,
      y: 32,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'wood',
      state: 'normal',
      variant: 'default',
      description: 'Dark wooden wide button with grain texture',
      usage: ['WideButton', 'WoodButton', 'TextButton'],
      cssClass: 'btn-wide-wood'
    },
    {
      id: 'btn-wide-metal-default',
      name: 'Metal Button (Wide)',
      x: 112,
      y: 32,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'metal',
      state: 'normal',
      variant: 'default',
      description: 'Dark metallic wide button with rivets',
      usage: ['WideButton', 'MetalButton', 'TextButton'],
      cssClass: 'btn-wide-metal'
    },

    // Wide Buttons (16x32) - Row 4: Active/Hover/Pressed State
    {
      id: 'btn-wide-body-active',
      name: 'Body Button (Wide) - Active',
      x: 0,
      y: 64,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'body',
      state: 'active',
      variant: 'active',
      description: 'Red-themed wide button in active/hover state',
      usage: ['WideButton', 'BodyButton', 'TextButton'],
      cssClass: 'btn-wide-body-active'
    },
    {
      id: 'btn-wide-mind-active',
      name: 'Mind Button (Wide) - Active',
      x: 16,
      y: 64,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'mind',
      state: 'active',
      variant: 'active',
      description: 'Green-themed wide button in active/hover state',
      usage: ['WideButton', 'MindButton', 'TextButton'],
      cssClass: 'btn-wide-mind-active'
    },
    {
      id: 'btn-wide-soul-active',
      name: 'Soul Button (Wide) - Active',
      x: 32,
      y: 64,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'soul',
      state: 'active',
      variant: 'active',
      description: 'Brown-themed wide button in active/hover state',
      usage: ['WideButton', 'SoulButton', 'TextButton'],
      cssClass: 'btn-wide-soul-active'
    },
    {
      id: 'btn-wide-ice-active',
      name: 'Ice Button (Wide) - Active',
      x: 48,
      y: 64,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'ice',
      state: 'active',
      variant: 'active',
      description: 'Ice wide button with glowing cyan outline',
      usage: ['WideButton', 'IceButton', 'TextButton'],
      cssClass: 'btn-wide-ice-active'
    },
    {
      id: 'btn-wide-stone-active',
      name: 'Stone Button (Wide) - Active',
      x: 64,
      y: 64,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'stone',
      state: 'active',
      variant: 'active',
      description: 'Stone wide button with glowing magenta outline',
      usage: ['WideButton', 'StoneButton', 'TextButton'],
      cssClass: 'btn-wide-stone-active'
    },
    {
      id: 'btn-wide-gold-active',
      name: 'Gold Button (Wide) - Active',
      x: 80,
      y: 64,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'gold',
      state: 'active',
      variant: 'active',
      description: 'Gold wide button with glowing purple outline',
      usage: ['WideButton', 'GoldButton', 'TextButton'],
      cssClass: 'btn-wide-gold-active'
    },
    {
      id: 'btn-wide-wood-active',
      name: 'Wood Button (Wide) - Active',
      x: 96,
      y: 64,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'wood',
      state: 'active',
      variant: 'active',
      description: 'Wood wide button with darker shade',
      usage: ['WideButton', 'WoodButton', 'TextButton'],
      cssClass: 'btn-wide-wood-active'
    },
    {
      id: 'btn-wide-metal-active',
      name: 'Metal Button (Wide) - Active',
      x: 112,
      y: 64,
      width: 16,
      height: 32,
      category: 'button',
      subcategory: 'wide',
      theme: 'metal',
      state: 'active',
      variant: 'active',
      description: 'Metal wide button with lighter shade',
      usage: ['WideButton', 'MetalButton', 'TextButton'],
      cssClass: 'btn-wide-metal-active'
    },

    // ===== FRAME ELEMENTS (45 total) =====
    
    // Natural/Organic Themes - Row 5
    {
      id: 'frame-wood-plain',
      name: 'Plain Wood Frame',
      x: 0,
      y: 96,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'natural',
      theme: 'wood',
      variant: 'plain',
      description: 'Simple wooden frame with natural grain',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-wood-plain',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-wood-blue-metal',
      name: 'Wood Frame with Blue Metal',
      x: 64,
      y: 96,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'natural',
      theme: 'wood',
      variant: 'blue-metal',
      description: 'Wooden frame with blue metal accents',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-wood-blue-metal',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-wood-ornate',
      name: 'Ornate Wood Frame',
      x: 128,
      y: 96,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'natural',
      theme: 'wood',
      variant: 'ornate',
      description: 'Dark, ornate wooden frame with decorative elements',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-wood-ornate',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-leafy',
      name: 'Leafy Frame',
      x: 192,
      y: 96,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'natural',
      theme: 'leafy',
      variant: 'default',
      description: 'Dark green frame adorned with leafy vines and red berries',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-leafy',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-parchment',
      name: 'Parchment Frame',
      x: 256,
      y: 96,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'natural',
      theme: 'parchment',
      variant: 'default',
      description: 'Light brown textured frame resembling old parchment',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-parchment',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-scroll',
      name: 'Scroll Frame',
      x: 320,
      y: 96,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'natural',
      theme: 'scroll',
      variant: 'default',
      description: 'Frame designed to look like a rolled-up scroll',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-scroll',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-goo',
      name: 'Goo Frame',
      x: 384,
      y: 96,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'natural',
      theme: 'goo',
      variant: 'default',
      description: 'Vibrant green frame with dripping, gooey texture',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-goo',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },

    // Stone/Industrial Themes - Row 6
    {
      id: 'frame-stone-plain',
      name: 'Plain Stone Frame',
      x: 0,
      y: 160,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'industrial',
      theme: 'stone',
      variant: 'plain',
      description: 'Basic grey stone frame',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-stone-plain',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-stone-moss',
      name: 'Mossy Stone Frame',
      x: 64,
      y: 160,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'industrial',
      theme: 'stone',
      variant: 'moss',
      description: 'Grey stone frame with moss growth',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-stone-moss',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-stone-cracked',
      name: 'Cracked Stone Frame',
      x: 128,
      y: 160,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'industrial',
      theme: 'stone',
      variant: 'cracked',
      description: 'Stone frame with visible cracks and damage',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-stone-cracked',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-stone-circular',
      name: 'Circular Stone Frame',
      x: 192,
      y: 160,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'industrial',
      theme: 'stone',
      variant: 'circular',
      description: 'Dark stone frame with circular opening',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-stone-circular',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-metal-rivets',
      name: 'Metal Frame with Rivets',
      x: 256,
      y: 160,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'industrial',
      theme: 'metal',
      variant: 'rivets',
      description: 'Dark grey metallic frame with rivets',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-metal-rivets',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-metal-circuit-green',
      name: 'Green Circuit Metal Frame',
      x: 320,
      y: 160,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'industrial',
      theme: 'metal',
      variant: 'circuit-green',
      description: 'Metallic frame with glowing green circuitry lines',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-metal-circuit-green',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-metal-circuit-blue',
      name: 'Blue Circuit Metal Frame',
      x: 384,
      y: 160,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'industrial',
      theme: 'metal',
      variant: 'circuit-blue',
      description: 'Metallic frame with glowing blue circuitry lines',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-metal-circuit-blue',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },

    // Fantasy/Mystical Themes - Row 7
    {
      id: 'frame-crystal',
      name: 'Crystal Frame',
      x: 0,
      y: 224,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'fantasy',
      theme: 'crystal',
      variant: 'default',
      description: 'Light blue frame with sharp crystalline formations',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-crystal',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-ice',
      name: 'Ice Frame',
      x: 64,
      y: 224,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'fantasy',
      theme: 'ice',
      variant: 'default',
      description: 'Crystalline ice frame with frosty appearance',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-ice',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-galactic',
      name: 'Galactic Frame',
      x: 128,
      y: 224,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'fantasy',
      theme: 'galactic',
      variant: 'default',
      description: 'Dark frame with swirling blue and purple nebulae and stars',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-galactic',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-runic',
      name: 'Runic Frame',
      x: 192,
      y: 224,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'fantasy',
      theme: 'runic',
      variant: 'default',
      description: 'Dark frame with glowing red runic symbols',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-runic',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-skull-vines',
      name: 'Skull and Vines Frame',
      x: 256,
      y: 224,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'fantasy',
      theme: 'skull',
      variant: 'vines',
      description: 'Dark green frame with skull motifs and vines',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-skull-vines',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-skull-wood',
      name: 'Skull Wood Frame',
      x: 320,
      y: 224,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'fantasy',
      theme: 'skull',
      variant: 'wood',
      description: 'Dark wooden frame incorporating skull and bone motifs',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-skull-wood',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-lava',
      name: 'Lava Frame',
      x: 384,
      y: 224,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'fantasy',
      theme: 'lava',
      variant: 'default',
      description: 'Dark frame with glowing orange and red cracks like molten lava',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-lava',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },

    // Ornate/Decorative Themes - Row 8
    {
      id: 'frame-gold-plain',
      name: 'Plain Gold Frame',
      x: 0,
      y: 288,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'ornate',
      theme: 'gold',
      variant: 'plain',
      description: 'Simple golden frame with metallic shine',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-gold-plain',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-gold-celtic',
      name: 'Celtic Gold Frame',
      x: 64,
      y: 288,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'ornate',
      theme: 'gold',
      variant: 'celtic',
      description: 'Elaborate golden frame with Celtic knot patterns',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-gold-celtic',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-gold-filigree',
      name: 'Gold Filigree Frame',
      x: 128,
      y: 288,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'ornate',
      theme: 'gold',
      variant: 'filigree',
      description: 'Golden frame with decorative filigree patterns',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-gold-filigree',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    {
      id: 'frame-diy',
      name: 'DIY Frame',
      x: 192,
      y: 288,
      width: 64,
      height: 64,
      category: 'frame',
      subcategory: 'ornate',
      theme: 'diy',
      variant: 'default',
      description: 'Unique frame with red and white pixelated cross-stitch pattern',
      usage: ['Frame', 'Modal', 'Panel', 'Card'],
      cssClass: 'frame-diy',
      borderSlice: { top: 8, right: 8, bottom: 8, left: 8 }
    }
  ],
  metadata: {
    atlasWidth: 448,
    atlasHeight: 352,
    totalElements: 77,
    buttonCount: 32,
    frameCount: 45,
    themes: ['body', 'mind', 'soul', 'stone', 'ice', 'gold', 'wood', 'metal', 'leafy', 'parchment', 'scroll', 'goo', 'crystal', 'galactic', 'runic', 'skull', 'lava', 'diy']
  }
};

/**
 * Utility functions for working with UI elements
 */
export const getUIElementById = (id: string): UIElement | undefined => {
  return UI_ELEMENT_MAPPING.elements.find(element => element.id === id);
};

export const getUIElementsByCategory = (category: 'button' | 'frame'): UIElement[] => {
  return UI_ELEMENT_MAPPING.elements.filter(element => element.category === category);
};

export const getUIElementsByTheme = (theme: string): UIElement[] => {
  return UI_ELEMENT_MAPPING.elements.filter(element => element.theme === theme);
};

export const getUIElementsBySubcategory = (subcategory: string): UIElement[] => {
  return UI_ELEMENT_MAPPING.elements.filter(element => element.subcategory === subcategory);
};

export const getButtonElements = (size?: 'small' | 'wide', theme?: string, state?: string): UIElement[] => {
  return UI_ELEMENT_MAPPING.elements.filter(element => {
    if (element.category !== 'button') return false;
    if (size && element.subcategory !== size) return false;
    if (theme && element.theme !== theme) return false;
    if (state && element.state !== state) return false;
    return true;
  });
};

export const getFrameElements = (theme?: string, variant?: string): UIElement[] => {
  return UI_ELEMENT_MAPPING.elements.filter(element => {
    if (element.category !== 'frame') return false;
    if (theme && element.theme !== theme) return false;
    if (variant && element.variant !== variant) return false;
    return true;
  });
};

export const getAvailableThemes = (): string[] => {
  return UI_ELEMENT_MAPPING.metadata.themes;
};

export const getAvailableButtonThemes = (): string[] => {
  const themes = new Set<string>();
  UI_ELEMENT_MAPPING.elements.forEach(element => {
    if (element.category === 'button' && element.theme) {
      themes.add(element.theme);
    }
  });
  return Array.from(themes).sort();
};

export const getAvailableFrameThemes = (): string[] => {
  const themes = new Set<string>();
  UI_ELEMENT_MAPPING.elements.forEach(element => {
    if (element.category === 'frame' && element.theme) {
      themes.add(element.theme);
    }
  });
  return Array.from(themes).sort();
};

export const getUIElementsByUsage = (usage: string): UIElement[] => {
  return UI_ELEMENT_MAPPING.elements.filter(element => 
    element.usage.includes(usage)
  );
};

export const getCSSClassForElement = (id: string): string | undefined => {
  const element = getUIElementById(id);
  return element?.cssClass;
};

export const getBorderSliceForElement = (id: string): { top: number; right: number; bottom: number; left: number } | undefined => {
  const element = getUIElementById(id);
  return element?.borderSlice;
};

export type { UIElement, UIElementMapping };
