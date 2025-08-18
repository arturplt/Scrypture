// JavaScript version of the centralized atlas mapping data
// This can be loaded directly in HTML without ES6 modules

// Convert AtlasSprite data to UIElement format
function convertSpriteToUIElement(sprite) {
  return {
    id: sprite.id,
    name: sprite.name,
    x: sprite.x,
    y: sprite.y,
    width: sprite.width,
    height: sprite.height,
    category: sprite.category,
    subcategory: sprite.subcategory,
    theme: sprite.theme,
    state: sprite.state,
    variant: 'basic',
    usage: sprite.category === 'button' ? 'general' : 'container',
    cssClass: sprite.id.replace(/-/g, '-'),
    ...(sprite.category === 'frame' && {
      borderSlice: { top: 16, right: 16, bottom: 16, left: 16 }
    })
  };
}

// Atlas mapping data (copied from atlasMapping.ts)
const ATLAS_MAPPING = {
  sprites: [
    // ===== FRAMES (16x16) - ROW 1: DEFAULT STATE =====
    {
      id: 'frame-wood-small',
      name: 'Wood Small Frame',
      x: 0,
      y: 0,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'wood',
      description: 'Small wooden frame with natural grain - 9-slice design'
    },
    {
      id: 'frame-wood-ornate',
      name: 'Wood Ornate Frame',
      x: 16,
      y: 0,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'wood',
      description: 'Ornate wooden frame with decorative elements - 9-slice design'
    },
    {
      id: 'frame-birch',
      name: 'Birch Frame',
      x: 32,
      y: 0,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'birch',
      description: 'Birch wood frame with natural grain - 9-slice design'
    },
    {
      id: 'frame-birch',
      name: 'Birch Frame',
      x: 48,
      y: 0,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'birch',
      description: 'Birch wood frame with natural grain - 9-slice design'
    },
    {
      id: 'frame-moss-stone2',
      name: 'Moss Stone Frame 2',
      x: 64,
      y: 0,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'moss-stone',
      description: 'Second moss stone frame variant - 9-slice design'
    },
    {
      id: 'frame-moss-stone3',
      name: 'Moss Stone Frame 3',
      x: 80,
      y: 0,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'moss-stone',
      description: 'Third moss stone frame variant - 9-slice design'
    },
    {
      id: 'frame-moss-stone',
      name: 'Moss Stone Frame',
      x: 96,
      y: 0,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'moss-stone',
      description: 'Moss stone frame with organic growth - 9-slice design'
    },
    // ===== FRAMES (16x16) - ROW 2: ACTIVATED STATE =====
    {
      id: 'frame-wood-small-blue',
      name: 'Wood Small Blue Frame',
      x: 0,
      y: 16,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'wood-blue',
      description: 'Small wooden frame with blue tint - 9-slice design'
    },
    {
      id: 'frame-wood-ornate-activated',
      name: 'Wood Ornate Activated Frame',
      x: 16,
      y: 16,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'wood',
      description: 'Ornate wooden frame in activated state - 9-slice design'
    },
    {
      id: 'frame-birch-activated',
      name: 'Birch Activated Frame',
      x: 32,
      y: 16,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'birch',
      description: 'Birch wood frame in activated state - 9-slice design'
    },
    {
      id: 'frame-birch-activated',
      name: 'Birch Activated Frame',
      x: 48,
      y: 16,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'birch',
      description: 'Birch wood frame in activated state - 9-slice design'
    },
    {
      id: 'frame-moss-stone2-activated',
      name: 'Moss Stone 2 Activated Frame',
      x: 64,
      y: 16,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'moss-stone',
      description: 'Second moss stone frame in activated state - 9-slice design'
    },
    {
      id: 'frame-moss-stone3-activated',
      name: 'Moss Stone 3 Activated Frame',
      x: 80,
      y: 16,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'moss-stone',
      description: 'Third moss stone frame in activated state - 9-slice design'
    },
    {
      id: 'frame-moss-stone-activated',
      name: 'Moss Stone Activated Frame',
      x: 96,
      y: 16,
      width: 16,
      height: 16,
      category: 'frame',
      theme: 'moss-stone',
      description: 'Moss stone frame in activated state - 9-slice design'
    },
    // ===== WIDE BUTTONS (32x16) - ROW 3: DEFAULT STATE =====
     {
       id: 'button-wide-body-default',
       name: 'Body Button (Wide)',
       x: 0,
       y: 32,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'body',
       state: 'normal',
       description: 'Red-themed wide button for physical attributes'
     },
     {
       id: 'button-wide-mind-default',
       name: 'Mind Button (Wide)',
       x: 32,
       y: 32,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'mind',
       state: 'normal',
       description: 'Green-themed wide button for mental attributes'
     },
     {
       id: 'button-wide-soul-default',
       name: 'Soul Button (Wide)',
       x: 64,
       y: 32,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'soul',
       state: 'normal',
       description: 'Brown-themed wide button for spiritual attributes'
     },
     {
       id: 'button-wide-ice-default',
       name: 'Ice Button (Wide)',
       x: 96,
       y: 32,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'ice',
       state: 'normal',
       description: 'Light blue crystalline wide button'
     },
     {
       id: 'button-wide-stone-default',
       name: 'Stone Button (Wide)',
       x: 128,
       y: 32,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'stone',
       state: 'normal',
       description: 'Grey stone wide button with natural texture'
     },
     {
       id: 'button-wide-gold-default',
       name: 'Gold Button (Wide)',
       x: 160,
       y: 32,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'gold',
       state: 'normal',
       description: 'Golden-yellow wide button with metallic shine'
     },
     {
       id: 'button-wide-wood-default',
       name: 'Wood Button (Wide)',
       x: 192,
       y: 32,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'wood',
       state: 'normal',
       description: 'Dark wooden wide button with grain texture'
     },
     {
       id: 'button-wide-metal-default',
       name: 'Metal Button (Wide)',
       x: 224,
       y: 32,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'metal',
       state: 'normal',
       description: 'Dark metallic wide button with rivets'
     },
    {
      id: 'button-wide-ore-default',
      name: 'Ore Button (Wide)',
      x: 256,
      y: 32,
      width: 32,
      height: 16,
      category: 'button',
      subcategory: 'wide',
      theme: 'ore',
      state: 'normal',
      description: 'Ore-themed wide button with metallic texture'
    },

         // ===== WIDE BUTTONS (32x16) - ROW 4: ACTIVE/HOVER/PRESSED STATE =====
     {
       id: 'button-wide-body-active',
       name: 'Body Button (Wide) - Active',
       x: 0,
       y: 48,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'body',
       state: 'active',
       description: 'Red-themed wide button in active/hover state'
     },
     {
       id: 'button-wide-mind-active',
       name: 'Mind Button (Wide) - Active',
       x: 32,
       y: 48,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'mind',
       state: 'active',
       description: 'Green-themed wide button in active/hover state'
     },
     {
       id: 'button-wide-soul-active',
       name: 'Soul Button (Wide) - Active',
       x: 64,
       y: 48,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'soul',
       state: 'active',
       description: 'Brown-themed wide button in active/hover state'
     },
     {
       id: 'button-wide-ice-active',
       name: 'Ice Button (Wide) - Active',
       x: 96,
       y: 48,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'ice',
       state: 'active',
       description: 'Ice wide button with glowing cyan outline'
     },
     {
       id: 'button-wide-stone-active',
       name: 'Stone Button (Wide) - Active',
       x: 128,
       y: 48,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'stone',
       state: 'active',
       description: 'Stone wide button with glowing magenta outline'
     },
     {
       id: 'button-wide-gold-active',
       name: 'Gold Button (Wide) - Active',
       x: 160,
       y: 48,
       width: 32,
       height: 16,
       category: 'button',
       subcategory: 'wide',
       theme: 'gold',
       state: 'active',
       description: 'Gold wide button with glowing purple outline'
     },

    // ===== SQUARE BUTTONS (32x32) - ROW 4: DEFAULT STATE =====
    {
      id: 'button-square-stone-default',
      name: 'Stone Button (Square)',
      x: 0,
      y: 64,
      width: 32,
      height: 32,
      category: 'button',
      subcategory: 'square',
      theme: 'stone',
      state: 'normal',
      description: 'Stone-themed square button with natural texture'
    },
    {
      id: 'button-square-rune-default',
      name: 'Rune Button (Square)',
      x: 32,
      y: 64,
      width: 32,
      height: 32,
      category: 'button',
      subcategory: 'square',
      theme: 'rune',
      state: 'normal',
      description: 'Rune-themed square button with mystical symbols'
    },
    {
      id: 'button-square-neon-default',
      name: 'Neon Button (Square)',
      x: 64,
      y: 64,
      width: 32,
      height: 32,
      category: 'button',
      subcategory: 'square',
      theme: 'neon',
      state: 'normal',
      description: 'Neon-themed square button with glowing effects'
    },
    {
      id: 'button-square-digi1-default',
      name: 'Digi1 Button (Square)',
      x: 96,
      y: 64,
      width: 32,
      height: 32,
      category: 'button',
      subcategory: 'square',
      theme: 'digi1',
      state: 'normal',
      description: 'Digital-themed square button with tech pattern 1'
    },
    {
      id: 'button-square-digi2-default',
      name: 'Digi2 Button (Square)',
      x: 128,
      y: 64,
      width: 32,
      height: 32,
      category: 'button',
      subcategory: 'square',
      theme: 'digi2',
      state: 'normal',
      description: 'Digital-themed square button with tech pattern 2'
    },
    {
      id: 'button-square-digiblue1-default',
      name: 'Digiblue1 Button (Square)',
      x: 160,
      y: 64,
      width: 32,
      height: 32,
      category: 'button',
      subcategory: 'square',
      theme: 'digiblue1',
      state: 'normal',
      description: 'Blue digital-themed square button with tech pattern 1'
    },
    {
      id: 'button-square-digiblue2-default',
      name: 'Digiblue2 Button (Square)',
       x: 192,
      y: 64,
       width: 32,
      height: 32,
       category: 'button',
      subcategory: 'square',
      theme: 'digiblue2',
      state: 'normal',
      description: 'Blue digital-themed square button with tech pattern 2'
    },

    // ===== SQUARE BUTTONS (32x32) - ROW 5: ACTIVE STATE =====
    {
      id: 'button-square-stone-active',
      name: 'Stone Button (Square) - Active',
      x: 0,
      y: 96,
      width: 32,
      height: 32,
      category: 'button',
      subcategory: 'square',
      theme: 'stone',
       state: 'active',
      description: 'Stone-themed square button in active state'
    },
    {
      id: 'button-square-rune-active',
      name: 'Rune Button (Square) - Active',
      x: 32,
      y: 96,
       width: 32,
      height: 32,
       category: 'button',
      subcategory: 'square',
      theme: 'rune',
       state: 'active',
      description: 'Rune-themed square button in active state'
    },
    {
      id: 'button-square-neon-active',
      name: 'Neon Button (Square) - Active',
      x: 64,
      y: 96,
      width: 32,
      height: 32,
      category: 'button',
      subcategory: 'square',
      theme: 'neon',
      state: 'active',
      description: 'Neon-themed square button in active state'
    },
    {
      id: 'button-square-digi1-active',
      name: 'Digi1 Button (Square) - Active',
      x: 96,
      y: 96,
      width: 32,
      height: 32,
      category: 'button',
      subcategory: 'square',
      theme: 'digi1',
      state: 'active',
      description: 'Digital-themed square button in active state'
    },
    {
      id: 'button-square-digi2-active',
      name: 'Digi2 Button (Square) - Active',
      x: 128,
      y: 96,
      width: 32,
      height: 32,
      category: 'button',
      subcategory: 'square',
      theme: 'digi2',
      state: 'active',
      description: 'Digital-themed square button in active state'
    },
    {
      id: 'button-square-digiblue1-active',
      name: 'Digiblue1 Button (Square) - Active',
      x: 160,
      y: 96,
      width: 32,
      height: 32,
      category: 'button',
      subcategory: 'square',
      theme: 'digiblue1',
      state: 'active',
      description: 'Blue digital-themed square button in active state'
    },
    {
      id: 'button-square-digiblue2-active',
      name: 'Digiblue2 Button (Square) - Active',
      x: 192,
      y: 96,
      width: 32,
      height: 32,
      category: 'button',
      subcategory: 'square',
      theme: 'digiblue2',
      state: 'active',
      description: 'Blue digital-themed square button in active state'
    },

    // ===== LARGE BUTTONS (64x32) - ROW 6: DEFAULT STATE =====
    {
      id: 'button-large-1',
      name: 'Large Button 1',
      x: 0,
      y: 128,
      width: 64,
      height: 32,
      category: 'button',
      subcategory: 'large',
      theme: 'default',
      state: 'normal',
      description: 'Large button with dark grey stone/metal frame'
    },
    {
      id: 'button-large-2',
      name: 'Large Button 2',
      x: 64,
      y: 128,
      width: 64,
      height: 32,
      category: 'button',
      subcategory: 'large',
      theme: 'default',
      state: 'normal',
      description: 'Large button with dark blue/purple sci-fi frame'
    },
    {
      id: 'button-large-3',
      name: 'Large Button 3',
      x: 128,
      y: 128,
      width: 64,
      height: 32,
      category: 'button',
      subcategory: 'large',
      theme: 'default',
      state: 'normal',
      description: 'Large button with light grey/blue sci-fi frame'
    },
    {
      id: 'button-large-4',
      name: 'Large Button 4',
      x: 192,
      y: 128,
      width: 64,
      height: 32,
      category: 'button',
      subcategory: 'large',
      theme: 'default',
      state: 'normal',
      description: 'Large button with brown wood/stone frame'
    },
    {
      id: 'button-large-5',
      name: 'Large Button 5',
      x: 256,
      y: 128,
      width: 64,
      height: 32,
      category: 'button',
      subcategory: 'large',
      theme: 'default',
      state: 'normal',
      description: 'Large button with dark blue rounded frame'
    },
    {
      id: 'button-large-6',
      name: 'Large Button 6',
      x: 320,
      y: 128,
      width: 64,
      height: 32,
      category: 'button',
      subcategory: 'large',
      theme: 'default',
      state: 'normal',
      description: 'Large button with ice/crystal frame'
    },

    // ===== FRAMES (64x64) - ROW 8: ALL 15 FRAMES IN ONE ROW =====
    {
      id: 'frame-woodsmall',
      name: 'Wood Small Frame',
      x: 0,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'wood',
      description: 'Small wooden frame with natural grain - 9-slice design'
    },
    {
      id: 'frame-wood-ornate',
      name: 'Wood Ornate Frame',
      x: 64,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'wood',
      description: 'Ornate wooden frame with decorative elements - 9-slice design'
    },
    {
      id: 'frame-birch',
      name: 'Birch Frame',
      x: 128,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'birch',
      description: 'Birch wood frame with natural grain - 9-slice design'
    },
    {
      id: 'frame-moss-stone',
      name: 'Moss Stone Frame',
      x: 192,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'moss-stone',
      description: 'Moss stone frame with organic growth - 9-slice design'
    },
    {
      id: 'frame-moss-stone2',
      name: 'Moss Stone Frame 2',
      x: 256,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'moss-stone',
      description: 'Second moss stone frame variant - 9-slice design'
    },
    {
      id: 'frame-moss-stone3',
      name: 'Moss Stone Frame 3',
      x: 320,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'moss-stone',
      description: 'Third moss stone frame variant - 9-slice design'
    },
    {
      id: 'frame-fancy-card',
      name: 'Fancy Card Frame',
      x: 384,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'card',
      description: 'Fancy card-style frame with elegant design - 9-slice design'
    },
    {
      id: 'frame-water-card',
      name: 'Water Card Frame',
      x: 448,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'card',
      description: 'Water-themed card frame with flowing elements - 9-slice design'
    },
    {
      id: 'frame-plain',
      name: 'Plain Frame',
      x: 512,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'plain',
      description: 'Simple plain frame design - 9-slice design'
    },
    {
      id: 'frame-plain2',
      name: 'Plain Frame 2',
      x: 576,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'plain',
      description: 'Alternative plain frame design - 9-slice design'
    },
    {
      id: 'frame-warning',
      name: 'Warning Frame',
      x: 640,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'warning',
      description: 'Warning-themed frame with alert elements - 9-slice design'
    },
    {
      id: 'frame-dark-red',
      name: 'Dark Red Frame',
      x: 704,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'dark-red',
      description: 'Dark red frame with ominous appearance - 9-slice design'
    },
    {
      id: 'frame-notification',
      name: 'Notification Frame',
      x: 768,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'notification',
      description: 'Notification-themed frame with alert design - 9-slice design'
    },
    {
      id: 'frame-simple-ornate',
      name: 'Simple Ornate Frame',
      x: 832,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'ornate',
      description: 'Simple ornate frame with basic decorative elements - 9-slice design'
    },
    {
      id: 'frame-gold-ornate',
      name: 'Gold Ornate Frame',
      x: 896,
      y: 192,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'ornate',
      description: 'Gold ornate frame with luxurious decorative elements - 9-slice design'
    },
    // ===== FRAMES (64x64) - ROW 9: 14 NEW FRAMES =====
    {
      id: 'frame-stone',
      name: 'Stone Frame',
      x: 0,
      y: 256,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'stone',
      description: 'Stone frame with natural rock texture - 9-slice design'
     },
         {
      id: 'frame-mossy-stone',
      name: 'Mossy Stone Frame',
       x: 64,
      y: 256,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'mossy-stone',
      description: 'Mossy stone frame with organic growth - 9-slice design'
     },
     {
      id: 'frame-rune1',
      name: 'Rune Frame 1',
       x: 128,
      y: 256,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'rune',
      description: 'Rune frame with mystical symbols - 9-slice design'
     },
     {
      id: 'frame-rune2',
      name: 'Rune Frame 2',
       x: 192,
      y: 256,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'rune',
      description: 'Alternative rune frame with different symbols - 9-slice design'
     },
     {
      id: 'frame-skull',
      name: 'Skull Frame',
       x: 256,
      y: 256,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'skull',
      description: 'Skull-themed frame with bone elements - 9-slice design'
     },
     {
      id: 'frame-witch',
      name: 'Witch Frame',
       x: 320,
      y: 256,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'witch',
      description: 'Witch-themed frame with magical elements - 9-slice design'
     },
     {
      id: 'frame-slav',
      name: 'Slav Frame',
       x: 384,
      y: 256,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'slav',
      description: 'Slavic-themed frame with cultural elements - 9-slice design'
    },
    {
      id: 'frame-pumpkin',
      name: 'Pumpkin Frame',
      x: 448,
      y: 256,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'pumpkin',
      description: 'Pumpkin-themed frame with harvest elements - 9-slice design'
    },
    {
      id: 'frame-birch',
      name: 'Birch Frame',
      x: 512,
      y: 256,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'birch',
      description: 'Birch wood frame with natural grain - 9-slice design'
    },
    {
      id: 'frame-compas',
      name: 'Compass Frame',
      x: 576,
      y: 256,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'compass',
      description: 'Compass-themed frame with navigation elements - 9-slice design'
    },
    {
      id: 'frame-leag',
      name: 'League Frame',
      x: 640,
      y: 256,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'league',
      description: 'League-themed frame with competitive elements - 9-slice design'
    },
    {
      id: 'frame-starred',
      name: 'Starred Frame',
      x: 704,
      y: 256,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'starred',
      description: 'Starred frame with celestial elements - 9-slice design'
    },
    {
      id: 'frame-book',
      name: 'Book Frame',
      x: 768,
      y: 256,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'book',
      description: 'Book-themed frame with literary elements - 9-slice design'
    },
    {
      id: 'frame-eq',
      name: 'Equipment Frame',
      x: 832,
      y: 256,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'equipment',
      description: 'Equipment-themed frame with gear elements - 9-slice design'
    },
    // ===== FRAMES (64x64) - ROW 10: 9 NEW FRAMES =====
    {
      id: 'frame-stone-ornate',
      name: 'Stone Ornate Frame',
      x: 0,
      y: 320,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'stone-ornate',
      description: 'Ornate stone frame with decorative elements - 9-slice design'
     },
     {
      id: 'frame-stone-uranium',
      name: 'Stone Uranium Frame',
       x: 64,
      y: 320,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'stone-uranium',
      description: 'Stone frame with uranium/radioactive elements - 9-slice design'
     },
     {
      id: 'frame-tech',
      name: 'Tech Frame',
       x: 128,
      y: 320,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'tech',
      description: 'High-tech frame with futuristic elements - 9-slice design'
     },
     {
      id: 'frame-red-tech',
      name: 'Red Tech Frame',
       x: 192,
      y: 320,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'red-tech',
      description: 'Red-themed tech frame with warning elements - 9-slice design'
     },
     {
      id: 'frame-stone-red-crack',
      name: 'Stone Red Crack Frame',
       x: 256,
      y: 320,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'stone-red-crack',
      description: 'Stone frame with red crack patterns - 9-slice design'
     },
     {
      id: 'frame-rune3',
      name: 'Rune Frame 3',
       x: 320,
      y: 320,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'rune',
      description: 'Third rune frame with different mystical symbols - 9-slice design'
     },
     {
      id: 'frame-cross',
      name: 'Cross Frame',
       x: 384,
      y: 320,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'cross',
      description: 'Cross-themed frame with religious elements - 9-slice design'
    },
    {
      id: 'frame-rune4',
      name: 'Rune Frame 4',
      x: 448,
      y: 320,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'rune',
      description: 'Fourth rune frame with advanced mystical symbols - 9-slice design'
    },
    {
      id: 'frame-slavic2',
      name: 'Slavic Frame 2',
      x: 512,
      y: 320,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'slavic',
      description: 'Second Slavic-themed frame with different cultural elements - 9-slice design'
    },
    // ===== FRAMES (64x64) - ROW 11: 7 NEW FRAMES =====
     {
       id: 'frame-ice',
       name: 'Ice Frame',
      x: 0,
      y: 384,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'ice',
      description: 'Ice frame with crystalline elements - 9-slice design'
    },
    {
      id: 'frame-ice1',
      name: 'Ice Frame 1',
       x: 64,
      y: 384,
       width: 64,
       height: 64,
       category: 'frame',
       theme: 'ice',
      description: 'First ice frame variant with frost patterns - 9-slice design'
     },
     {
      id: 'frame-ice2',
      name: 'Ice Frame 2',
       x: 128,
      y: 384,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'ice',
      description: 'Second ice frame variant with snowflake elements - 9-slice design'
     },
     {
      id: 'frame-star',
      name: 'Star Frame',
       x: 192,
      y: 384,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'star',
      description: 'Star-themed frame with celestial elements - 9-slice design'
     },
     {
      id: 'frame-neon-stars',
      name: 'Neon Stars Frame',
       x: 256,
      y: 384,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'neon-stars',
      description: 'Neon stars frame with glowing celestial elements - 9-slice design'
     },
     {
      id: 'frame-neon-orange',
      name: 'Neon Orange Frame',
       x: 320,
      y: 384,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'neon-orange',
      description: 'Neon orange frame with bright glowing elements - 9-slice design'
     },
     {
      id: 'frame-metal-block',
      name: 'Metal Block Frame',
       x: 384,
      y: 384,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'metal-block',
      description: 'Metal block frame with industrial elements - 9-slice design'
     },
    // ===== FRAMES (64x64) - ROW 12: 9 NEW FRAMES =====
     {
      id: 'frame-script',
      name: 'Script Frame',
       x: 0,
      y: 448,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'script',
      description: 'Script frame with handwritten elements - 9-slice design'
     },
     {
      id: 'frame-diy',
      name: 'DIY Frame',
       x: 64,
      y: 448,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'diy',
      description: 'DIY frame with handmade elements - 9-slice design'
     },
     {
      id: 'frame-goo',
      name: 'Goo Frame',
       x: 128,
      y: 448,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'goo',
      description: 'Goo frame with organic slimy elements - 9-slice design'
     },
     {
      id: 'frame-fossil',
      name: 'Fossil Frame',
       x: 192,
      y: 448,
       width: 64,
       height: 64,
       category: 'frame',
      theme: 'fossil',
      description: 'Fossil frame with ancient bone elements - 9-slice design'
    },
    {
      id: 'frame-simple-leaf',
      name: 'Simple Leaf Frame',
      x: 256,
      y: 448,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'simple-leaf',
      description: 'Simple leaf frame with natural elements - 9-slice design'
    },
    {
      id: 'frame-pretzel',
      name: 'Pretzel Frame',
      x: 320,
      y: 448,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'pretzel',
      description: 'Pretzel frame with twisted elements - 9-slice design'
    },
    {
      id: 'frame-antlers',
      name: 'Antlers Frame',
      x: 384,
      y: 448,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'antlers',
      description: 'Antlers frame with horn elements - 9-slice design'
    },
    {
      id: 'frame-dark-metal',
      name: 'Dark Metal Frame',
      x: 448,
      y: 448,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'dark-metal',
      description: 'Dark metal frame with shadowy elements - 9-slice design'
    },
    {
      id: 'frame-runic-dark',
      name: 'Runic Dark Frame',
      x: 512,
      y: 448,
      width: 64,
      height: 64,
      category: 'frame',
      theme: 'runic-dark',
      description: 'Dark runic frame with shadowy mystical elements - 9-slice design'
    },

    // ===== LARGE BUTTONS (64x32) - ROW 7: ACTIVE STATE =====
    {
      id: 'button-large-1-active',
      name: 'Large Button 1 (Active)',
      x: 0,
      y: 160,
      width: 64,
      height: 32,
      category: 'button',
      subcategory: 'large',
      theme: 'default',
      state: 'active',
      description: 'Large button with dark grey stone/metal frame (active)'
    },
    {
      id: 'button-large-2-active',
      name: 'Large Button 2 (Active)',
      x: 64,
      y: 160,
      width: 64,
      height: 32,
      category: 'button',
      subcategory: 'large',
      theme: 'default',
      state: 'active',
      description: 'Large button with dark blue/purple sci-fi frame (active)'
    },
    {
      id: 'button-large-3-active',
      name: 'Large Button 3 (Active)',
      x: 128,
      y: 160,
      width: 64,
      height: 32,
      category: 'button',
      subcategory: 'large',
      theme: 'default',
      state: 'active',
      description: 'Large button with light grey/blue sci-fi frame (active)'
    },
    {
      id: 'button-large-4-active',
      name: 'Large Button 4 (Active)',
      x: 192,
      y: 160,
      width: 64,
      height: 32,
      category: 'button',
      subcategory: 'large',
      theme: 'default',
      state: 'active',
      description: 'Large button with brown wood/stone frame (active)'
    },
    {
      id: 'button-large-5-active',
      name: 'Large Button 5 (Active)',
      x: 256,
      y: 160,
      width: 64,
      height: 32,
      category: 'button',
      subcategory: 'large',
      theme: 'default',
      state: 'active',
      description: 'Large button with dark blue rounded frame (active)'
     }
  ],
       metadata: {
    atlasWidth: 960, // 15 sprites wide at 64px each for frames row
    atlasHeight: 576, // 12 rows: 2 rows of new frames (32px) + 2 rows of wide buttons (32px) + 2 rows of square buttons (64px) + 2 rows of large buttons (64px) + 6 rows of frames (384px)
    spriteSize: 64,
    totalSprites: 107 // 107 sprites (14 new frames + 15 wide + 14 square + 10 large + 54 frames)
  }
};

// Export the converted data for use in the HTML
const UI_ELEMENT_MAPPING = {
  buttons: ATLAS_MAPPING.sprites
    .filter(sprite => sprite.category === 'button')
    .map(convertSpriteToUIElement),
  frames: ATLAS_MAPPING.sprites
    .filter(sprite => sprite.category === 'frame')
    .map(convertSpriteToUIElement)
};

// Export metadata
const ATLAS_METADATA = ATLAS_MAPPING.metadata;

// Make these available globally for the HTML script
window.UI_ELEMENT_MAPPING = UI_ELEMENT_MAPPING;
window.ATLAS_METADATA = ATLAS_METADATA;
