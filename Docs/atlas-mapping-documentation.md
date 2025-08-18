# Atlas Mapping Documentation

**Version:** 1.0.0  
**Last Updated:** July 27, 2025  
**Status:** Active Development  

---

## 📚 **Overview**

The Atlas Mapping system is the core data structure that defines all UI elements in Scrypture. This document provides detailed information about the sprite atlas organization, mapping structure, and how to work with the centralized asset system.

---

## 🎯 **Atlas Structure**

### **Texture Sheet Specifications**
- **Dimensions**: 960x576 pixels
- **Grid Size**: 64x64 pixel base units
- **Total Sprites**: 107 sprites across 12 rows
- **Format**: PNG with transparency support
- **File Location**: `/public/assets/Frames/Framesandbuttonsatlas.png`

### **Row Organization**

#### **Row 1 (y: 0-15) - Small Frames (16x16)**
Default state frames for compact UI elements:
- **frame-wood-small** (0,0)
- **frame-wood-ornate** (16,0)
- **frame-birch** (32,0) and (48,0)
- **frame-moss-stone2** (64,0)
- **frame-moss-stone3** (80,0)
- **frame-moss-stone** (96,0)

#### **Row 2 (y: 16-31) - Small Frames Activated (16x16)**
Active/hover states for small frames:
- **frame-wood-small-blue** (0,16)
- **frame-wood-ornate-activated** (16,16)
- **frame-birch-activated** (32,16) and (48,16)
- **frame-moss-stone2-activated** (64,16)
- **frame-moss-stone3-activated** (80,16)
- **frame-moss-stone-activated** (96,16)

#### **Row 3 (y: 32-47) - Wide Buttons Default (32x16)**
Horizontal buttons in normal state:
- **button-wide-body-default** (0,32)
- **button-wide-mind-default** (32,32)
- **button-wide-soul-default** (64,32)
- **button-wide-ice-default** (96,32)
- **button-wide-stone-default** (128,32)
- **button-wide-gold-default** (160,32)
- **button-wide-wood-default** (192,32)
- **button-wide-metal-default** (224,32)
- **button-wide-ore-default** (256,32)

#### **Row 4 (y: 48-63) - Wide Buttons Active (32x16)**
Horizontal buttons in active/hover state:
- **button-wide-body-active** (0,48)
- **button-wide-mind-active** (32,48)
- **button-wide-soul-active** (64,48)
- **button-wide-ice-active** (96,48)
- **button-wide-stone-active** (128,48)
- **button-wide-gold-active** (160,48)

#### **Row 5 (y: 64-95) - Square Buttons Default (32x32)**
Standard action buttons in normal state:
- **button-square-stone-default** (0,64)
- **button-square-rune-default** (32,64)
- **button-square-neon-default** (64,64)
- **button-square-digi1-default** (96,64)
- **button-square-digi2-default** (128,64)
- **button-square-digiblue1-default** (160,64)
- **button-square-digiblue2-default** (192,64)

#### **Row 6 (y: 96-127) - Square Buttons Active (32x32)**
Standard action buttons in active state:
- **button-square-stone-active** (0,96)
- **button-square-rune-active** (32,96)
- **button-square-neon-active** (64,96)
- **button-square-digi1-active** (96,96)
- **button-square-digi2-active** (128,96)
- **button-square-digiblue1-active** (160,96)
- **button-square-digiblue2-active** (192,96)

#### **Row 7 (y: 128-159) - Large Buttons Default (64x32)**
Prominent call-to-action buttons in normal state:
- **button-large-1** (0,128)
- **button-large-2** (64,128)
- **button-large-3** (128,128)
- **button-large-4** (192,128)
- **button-large-5** (256,128)
- **button-large-6** (320,128)

#### **Row 8 (y: 160-191) - Large Buttons Active (64x32)**
Prominent call-to-action buttons in active state:
- **button-large-1-active** (0,160)
- **button-large-2-active** (64,160)
- **button-large-3-active** (128,160)
- **button-large-4-active** (192,160)
- **button-large-5-active** (256,160)

#### **Row 9 (y: 192-255) - Frames Row 1 (64x64)**
First row of full-size frames (15 frames):
- **frame-woodsmall** (0,192)
- **frame-wood-ornate** (64,192)
- **frame-birch** (128,192)
- **frame-moss-stone** (192,192)
- **frame-moss-stone2** (256,192)
- **frame-moss-stone3** (320,192)
- **frame-fancy-card** (384,192)
- **frame-water-card** (448,192)
- **frame-plain** (512,192)
- **frame-plain2** (576,192)
- **frame-warning** (640,192)
- **frame-dark-red** (704,192)
- **frame-notification** (768,192)
- **frame-simple-ornate** (832,192)
- **frame-gold-ornate** (896,192)

#### **Row 10 (y: 256-319) - Frames Row 2 (64x64)**
Second row of full-size frames (14 frames):
- **frame-stone** (0,256)
- **frame-mossy-stone** (64,256)
- **frame-rune1** (128,256)
- **frame-rune2** (192,256)
- **frame-skull** (256,256)
- **frame-witch** (320,256)
- **frame-slav** (384,256)
- **frame-pumpkin** (448,256)
- **frame-birch** (512,256)
- **frame-compas** (576,256)
- **frame-leag** (640,256)
- **frame-starred** (704,256)
- **frame-book** (768,256)
- **frame-eq** (832,256)

#### **Row 11 (y: 320-383) - Frames Row 3 (64x64)**
Third row of full-size frames (9 frames):
- **frame-stone-ornate** (0,320)
- **frame-stone-uranium** (64,320)
- **frame-tech** (128,320)
- **frame-red-tech** (192,320)
- **frame-stone-red-crack** (256,320)
- **frame-rune3** (320,320)
- **frame-cross** (384,320)
- **frame-rune4** (448,320)
- **frame-slavic2** (512,320)

#### **Row 12 (y: 384-447) - Frames Row 4 (64x64)**
Fourth row of full-size frames (7 frames):
- **frame-ice** (0,384)
- **frame-ice1** (64,384)
- **frame-ice2** (128,384)
- **frame-star** (192,384)
- **frame-neon-stars** (256,384)
- **frame-neon-orange** (320,384)
- **frame-metal-block** (384,384)

#### **Row 13 (y: 448-511) - Frames Row 5 (64x64)**
Fifth row of full-size frames (9 frames):
- **frame-script** (0,448)
- **frame-diy** (64,448)
- **frame-goo** (128,448)
- **frame-fossil** (192,448)
- **frame-simple-leaf** (256,448)
- **frame-pretzel** (320,448)
- **frame-antlers** (384,448)
- **frame-dark-metal** (448,448)
- **frame-runic-dark** (512,448)

---

## 🏗️ **Data Structure**

### **AtlasSprite Interface**
```typescript
interface AtlasSprite {
  id: string;                    // Unique identifier
  name: string;                  // Human-readable name
  x: number;                     // X position in atlas
  y: number;                     // Y position in atlas
  width: number;                 // Sprite width
  height: number;                // Sprite height
  category: 'frame' | 'button';  // Element type
  subcategory?: string;          // Size variant (wide, square, large)
  theme: string;                 // Visual theme
  state?: 'normal' | 'active' | 'hover'; // Interaction state
  description: string;           // Detailed description
}
```

### **Atlas Metadata**
```typescript
interface AtlasMetadata {
  atlasWidth: number;    // Total atlas width (960)
  atlasHeight: number;   // Total atlas height (576)
  spriteSize: number;    // Base sprite size (64)
  totalSprites: number;  // Total number of sprites (107)
}
```

### **Complete Atlas Structure**
```typescript
const ATLAS_MAPPING = {
  sprites: AtlasSprite[],    // Array of all sprites
  metadata: AtlasMetadata    // Atlas metadata
};
```

---

## 🎨 **Theme Categories**

### **Frame Themes**

#### **Natural Materials**
- **wood**: Natural wooden frames with grain texture
- **birch**: Light birch wood with natural grain
- **stone**: Rock and stone-based frames
- **moss-stone**: Organic stone with moss growth
- **mossy-stone**: Alternative moss stone variant

#### **Decorative**
- **ornate**: Decorative frames with intricate details
- **simple-ornate**: Basic ornate variant
- **gold-ornate**: Luxurious gold ornate frames
- **stone-ornate**: Ornate stone frames

#### **Mystical & Magical**
- **rune**: Mystical frames with magical symbols
- **runic-dark**: Dark runic frames
- **witch**: Witch-themed magical frames
- **skull**: Bone and skull-themed frames

#### **Technological**
- **tech**: High-tech futuristic frames
- **red-tech**: Red-themed tech frames
- **digi1/digi2**: Digital pattern variants
- **digiblue1/digiblue2**: Blue digital variants

#### **Elemental**
- **ice**: Crystalline and frost-themed frames
- **ice1/ice2**: Ice frame variants
- **water-card**: Water-themed flowing frames

#### **Cultural & Thematic**
- **slav/slavic2**: Slavic cultural frames
- **pumpkin**: Harvest and seasonal frames
- **cross**: Religious and spiritual frames
- **compass**: Navigation and exploration frames
- **book**: Literary and knowledge frames
- **equipment**: Gear and mechanical frames

#### **Special Effects**
- **neon-stars**: Glowing celestial frames
- **neon-orange**: Bright orange neon frames
- **star/starred**: Star-themed frames
- **metal-block**: Industrial metal frames

#### **Organic & Unique**
- **script**: Handwritten text frames
- **diy**: Handmade and craft frames
- **goo**: Organic slimy frames
- **fossil**: Ancient bone frames
- **simple-leaf**: Natural leaf frames
- **pretzel**: Twisted organic frames
- **antlers**: Horn and antler frames

#### **Status & Alert**
- **warning**: Alert and caution frames
- **notification**: Information frames
- **dark-red**: Ominous dark red frames
- **plain/plain2**: Simple plain frames
- **fancy-card**: Elegant card frames

### **Button Themes**

#### **Core Attributes**
- **body**: Red-themed for physical attributes
- **mind**: Green-themed for mental attributes
- **soul**: Brown-themed for spiritual attributes

#### **Materials**
- **stone**: Grey stone with natural texture
- **metal**: Dark metallic with rivets
- **wood**: Dark wooden with grain
- **gold**: Golden-yellow with metallic shine
- **ore**: Metallic ore texture

#### **Elements**
- **ice**: Light blue crystalline
- **tech**: Digital and technological

---

## 🛠️ **Usage Examples**

### **Getting a Specific Sprite**
```typescript
import { ATLAS_MAPPING } from '../data/atlasMapping';

// Find a specific sprite by ID
const woodFrame = ATLAS_MAPPING.sprites.find(sprite => sprite.id === 'frame-wood-small');

// Find sprites by category and theme
const stoneFrames = ATLAS_MAPPING.sprites.filter(sprite => 
  sprite.category === 'frame' && sprite.theme === 'stone'
);

// Find buttons by size and state
const activeWideButtons = ATLAS_MAPPING.sprites.filter(sprite => 
  sprite.category === 'button' && 
  sprite.subcategory === 'wide' && 
  sprite.state === 'active'
);
```

### **Converting to UI Elements**
```typescript
import { convertSpriteToUIElement } from '../data/uiElementMapping';

// Convert a sprite to UI element format
const sprite = ATLAS_MAPPING.sprites[0];
const uiElement = convertSpriteToUIElement(sprite);

// Convert all sprites
const uiElements = ATLAS_MAPPING.sprites.map(convertSpriteToUIElement);
```

### **CSS Background Positioning**
```typescript
// Calculate CSS background position
function getBackgroundPosition(sprite: AtlasSprite) {
  return `-${sprite.x}px -${sprite.y}px`;
}

// Example usage
const woodFrame = ATLAS_MAPPING.sprites.find(s => s.id === 'frame-wood-small');
const backgroundPosition = getBackgroundPosition(woodFrame);
// Result: "-0px -0px"
```

---

## 🔧 **Development Tools**

### **Sprite Validation**
```typescript
// Validate sprite positioning
function validateAtlasMapping() {
  const positions = new Set();
  const errors = [];

  ATLAS_MAPPING.sprites.forEach(sprite => {
    const key = `${sprite.x},${sprite.y}`;
    if (positions.has(key)) {
      errors.push(`Duplicate position: ${key} for sprite ${sprite.id}`);
    }
    positions.add(key);

    // Check bounds
    if (sprite.x + sprite.width > ATLAS_MAPPING.metadata.atlasWidth) {
      errors.push(`Sprite ${sprite.id} exceeds atlas width`);
    }
    if (sprite.y + sprite.height > ATLAS_MAPPING.metadata.atlasHeight) {
      errors.push(`Sprite ${sprite.id} exceeds atlas height`);
    }
  });

  return errors;
}
```

### **Sprite Statistics**
```typescript
// Generate sprite statistics
function getAtlasStatistics() {
  const stats = {
    totalSprites: ATLAS_MAPPING.sprites.length,
    categories: {},
    themes: {},
    sizes: {}
  };

  ATLAS_MAPPING.sprites.forEach(sprite => {
    // Count by category
    stats.categories[sprite.category] = (stats.categories[sprite.category] || 0) + 1;
    
    // Count by theme
    stats.themes[sprite.theme] = (stats.themes[sprite.theme] || 0) + 1;
    
    // Count by size
    const size = `${sprite.width}x${sprite.height}`;
    stats.sizes[size] = (stats.sizes[size] || 0) + 1;
  });

  return stats;
}
```

### **Export Functions**
```typescript
// Export to different formats
function exportToCSS() {
  return ATLAS_MAPPING.sprites.map(sprite => `
.${sprite.id} {
  background-position: -${sprite.x}px -${sprite.y}px;
  width: ${sprite.width}px;
  height: ${sprite.height}px;
}`).join('\n');
}

function exportToJSON() {
  return JSON.stringify(ATLAS_MAPPING, null, 2);
}
```

---

## 📊 **Performance Considerations**

### **Memory Usage**
- **Single texture**: All sprites in one 960x576 texture
- **Efficient loading**: One HTTP request vs. 107 individual requests
- **GPU optimization**: Reduced draw calls through texture batching

### **Rendering Performance**
- **CSS background positioning**: Hardware-accelerated
- **Border image slicing**: Efficient 9-slice scaling for frames
- **Sprite caching**: Browser caches single texture file

### **Development Performance**
- **Type safety**: TypeScript interfaces prevent errors
- **Centralized data**: Single source of truth for all sprites
- **Automated validation**: Catch positioning conflicts early

---

## 🔄 **Maintenance & Updates**

### **Adding New Sprites**
1. **Update texture atlas**: Add new sprites to the PNG file
2. **Add sprite data**: Include new sprite in `ATLAS_MAPPING.sprites`
3. **Update metadata**: Adjust `atlasHeight` and `totalSprites` if needed
4. **Validate positioning**: Run validation to check for conflicts
5. **Update documentation**: Document new sprites and themes

### **Version Control**
- **Atlas versions**: Track changes to the texture file
- **Mapping versions**: Version control for sprite data
- **Breaking changes**: Document incompatible updates

### **Quality Assurance**
- **Visual testing**: Verify sprite alignment and appearance
- **Performance testing**: Monitor loading and rendering performance
- **Cross-browser testing**: Ensure compatibility across browsers

---

## 📚 **Cross-References**

### **Related Documentation**
- **[asset-management-guide.md](asset-management-guide.md)** - Complete asset management system
- **[10-color-system.md](10-color-system.md)** - Color palette and theming
- **[11-ui-enhancements.md](11-ui-enhancements.md)** - UI component improvements

### **Implementation Files**
- `src/data/atlasMapping.ts` - TypeScript atlas mapping
- `src/data/uiElementMapping.ts` - UI element conversions
- `asset-test.js` - JavaScript export for HTML usage
- `public/assets/Frames/Framesandbuttonsatlas.png` - Texture atlas file

---

*"In the precise grid of the atlas, every pixel finds its purpose, every sprite its position, creating a harmonious visual language that speaks to the soul of Scrypture."* 🎨✨
