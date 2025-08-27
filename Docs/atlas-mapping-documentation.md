# Atlas Mapping Documentation

**Version:** 2.0.0  
**Last Updated:** December 2024  
**Status:** Active Development  

---

## 📚 **Overview**

The Atlas Mapping system is the core data structure that defines all UI elements in Scrypture. This document provides detailed information about the dynamic sprite atlas organization, mapping structure, and how to work with the centralized asset system.

The system now uses a **dynamic generation approach** with 619 sprites across 30 color themes, organized into multiple categories and themes for maximum flexibility and maintainability.

---

## 🎯 **Atlas Structure**

### **Texture Sheet Specifications**
- **Dimensions**: 352x512 pixels (dynamically calculated)
- **Grid Size**: 16x16 pixel base units
- **Total Sprites**: 619 sprites across multiple categories
- **Format**: PNG with transparency support
- **File Location**: `/public/assets/Frames/Atlas.png`

### **Dynamic Theme System**

The atlas uses a **dynamic generation system** with 30 color themes organized into 4 rows:

#### **Row 1 (y: 0-96) - Main 4x7 Grid (8 themes)**
Each theme contains 28 sprites in a 4x7 grid layout:
- **green** (0,0)
- **dark-green** (64,0)
- **blue-stone** (128,0)
- **red** (192,0)
- **purple** (256,0)
- **orange** (320,0)
- **yellow** (384,0)
- **cyan** (448,0)

#### **Row 2 (y: 112-176) - 4x4 Frame System (8 themes)**
Each theme contains 16 sprites in a 4x4 frame system:
- **green-frame** (0,112)
- **red-frame** (64,112)
- **forest-green** (128,112)
- **burnt-red** (192,112)
- **silver** (256,112)
- **gold** (320,112)
- **pale-blue** (384,112)
- **green-ornate** (448,112)

#### **Row 3 (y: 176-240) - 4x4 Frame System (8 themes)**
Each theme contains 16 sprites in a 4x4 frame system:
- **green-button** (0,176)
- **red-button** (64,176)
- **green-button-activated** (128,176)
- **red-button-activated** (192,176)
- **grey-brown** (256,176)
- **purple-button** (320,176)
- **orange-button** (384,176)
- **blue-ornate** (448,176)

#### **Row 4 (y: 240-304) - 4x4 Frame System (6 themes)**
Each theme contains 16 sprites in a 4x4 frame system:
- **thick-gold** (0,240)
- **skinny-gold** (64,240)
- **turquoise** (128,240)
- **bronze** (192,240)
- **gunmetal** (256,240)
- **royal-blue** (320,240)

### **Additional UI Elements**

#### **Text Elements (y: 304-368)**
- **text-sanctuary** (0,304) 80x32 - Large title text
- **text-bober** (0,336) 64x32 - Medium subtitle text
- **text-dam** (0,368) 48x32 - Medium subtitle text

#### **Navigation Buttons (y: 400-432)**
- **button-large-previous** (0,400) 32x32 - Large previous button
- **button-large-next** (32,400) 32x32 - Large next button
- **button-back** (0,432) 48x16 - Back navigation button
- **button-next** (48,432) 48x16 - Next navigation button
- **button-wooden-wide** (96,432) 48x16 - Wide wooden button
- **button-small** (144,432) 16x16 - Small button

#### **Icons Row (y: 448)**
9 icons, each 16x16:
- **icon-save** (0,448) - Save icon
- **icon-stats** (16,448) - Stats icon
- **icon-lock** (32,448) - Lock icon
- **icon-book** (48,448) - Book icon
- **icon-crown** (64,448) - Crown icon
- **icon-trophy** (80,448) - Trophy icon
- **icon-edit** (96,448) - Edit icon
- **icon-target** (112,448) - Target icon
- **icon-lotus** (128,448) - Lotus icon

#### **Difficulty Numbers (y: 464)**
10 difficulty level indicators, each 16x16:
- **difficulty-0** through **difficulty-9** (0,464) to (144,464)

#### **Difficulty Level Buttons (y: 480)**
- **button-low** (0,480) 32x16 - Low difficulty button
- **button-medium** (32,480) 48x16 - Medium difficulty button
- **button-high** (80,480) 32x16 - High difficulty button

#### **Attribute Buttons (y: 496)**
- **button-body** (0,496) 32x16 - Body attribute button
- **button-mind** (32,496) 32x16 - Mind attribute button
- **button-soul** (64,496) 32x16 - Soul attribute button

#### **Action Buttons (y: 496)**
- **button-plus-large** (96,496) 16x16 - Large plus button
- **button-plus-small** (112,496) 16x16 - Small plus button
- **button-minus-large** (128,496) 16x16 - Large minus button
- **button-minus-small** (144,496) 16x16 - Small minus button

#### **Directional Buttons**
- **button-left** (160,480) 16x16 - Left direction button
- **button-up** (176,480) 16x16 - Up direction button
- **button-right** (192,480) 16x16 - Right direction button
- **button-down** (176,496) 16x16 - Down direction button

#### **Large Attribute Icons (y: 464)**
- **icon-fist** (208,464) 48x48 - Fist attribute icon
- **icon-brain** (256,464) 48x48 - Brain attribute icon
- **icon-soul** (304,464) 48x48 - Soul attribute icon

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
  category: 'frame' | 'bar' | 'button' | 'break' | 'text' | 'icon';
  theme: string;                 // Visual theme
  color: string;                 // Color variant
  state?: 'normal' | 'active';   // Interaction state
  description: string;           // Detailed description
}
```

### **Theme Configuration**
```typescript
interface ThemeConfig {
  name: string;                  // Theme name
  color: string;                 // Color variant
  xOffset: number;               // X offset in atlas
  yOffset: number;               // Y offset in atlas
  rowType: 'main' | 'frame';     // Row type for sprite generation
}
```

### **Atlas Metadata**
```typescript
interface AtlasMetadata {
  atlasWidth: number;    // Total atlas width (352)
  atlasHeight: number;   // Total atlas height (512)
  spriteSize: number;    // Base sprite size (16)
  totalSprites: number;  // Total number of sprites (619)
}
```

---

## 🔧 **Implementation**

### **File Structure**
```
src/data/
├── atlasMapping.ts          # Main atlas mapping with dynamic generation
├── asset-test.js            # JavaScript version for HTML preview
├── asset-test.ts            # TypeScript interfaces
└── asset-test.html          # Interactive preview
```

### **Dynamic Generation System**

The atlas mapping uses a dynamic generation system with:

1. **Base Sprite Definitions**: Predefined sprite templates for each row type
2. **Theme Configurations**: Array of 30 theme configurations
3. **Generator Function**: Creates sprites for each theme with proper offsets
4. **Automatic Metadata**: Calculates dimensions and sprite counts dynamically

### **Base Sprite Arrays**

#### **BASE_MAIN_SPRITES (28 sprites)**
Used for Row 1 and Row 4 themes, includes:
- Frame corners, edges, and backgrounds
- Horizontal and vertical bars
- Progress bars
- Break elements
- Buttons

#### **BASE_FRAME_SPRITES (16 sprites)**
Used for Row 2 and Row 3 themes, includes:
- 3x3 frame system (9 sprites)
- 3x1 horizontal bar (3 sprites)
- 1x3 vertical bar (3 sprites)
- 1x1 button (1 sprite)

---

## 🎨 **Categories and Themes**

### **Categories**
- **frame**: UI frames and borders
- **bar**: Progress bars and dividers
- **button**: Interactive buttons
- **break**: Page breaks and separators
- **text**: Text elements and labels
- **icon**: Decorative and functional icons

### **Themes**
- **corner**: Frame corner elements
- **edge**: Frame edge elements
- **background**: Background elements
- **horizontal**: Horizontal bars and elements
- **vertical**: Vertical bars and elements
- **progress**: Progress bar elements
- **navigation**: Navigation buttons
- **action**: Action buttons and icons
- **difficulty**: Difficulty-related elements
- **attribute**: Character attribute elements
- **direction**: Directional buttons
- **title**: Title text elements
- **subtitle**: Subtitle text elements
- **data**: Data-related icons
- **security**: Security-related icons
- **knowledge**: Knowledge-related icons
- **royalty**: Royalty-related icons
- **achievement**: Achievement-related icons
- **goal**: Goal-related icons
- **nature**: Nature-related icons
- **wooden**: Wooden-themed elements

### **Colors**
30 color variants including:
- green, dark-green, blue-stone, red, purple, orange, yellow, cyan
- forest-green, burnt-red, silver, gold, pale-blue, green-ornate
- grey-brown, blue-ornate, thick-gold, skinny-gold, turquoise
- bronze, gunmetal, royal-blue

---

## 🛠️ **Usage**

### **Getting Sprites by Category**
```typescript
// Get all button sprites
const buttons = ATLAS_MAPPING.sprites.filter(sprite => sprite.category === 'button');

// Get all frame sprites for a specific theme
const greenFrames = ATLAS_MAPPING.sprites.filter(sprite => 
  sprite.category === 'frame' && sprite.color === 'green'
);
```

### **Getting Sprites by Theme**
```typescript
// Get all navigation buttons
const navButtons = ATLAS_MAPPING.sprites.filter(sprite => sprite.theme === 'navigation');

// Get all difficulty elements
const difficultyElements = ATLAS_MAPPING.sprites.filter(sprite => sprite.theme === 'difficulty');
```

### **Getting Sprites by Color**
```typescript
// Get all green elements
const greenElements = ATLAS_MAPPING.sprites.filter(sprite => sprite.color === 'green');

// Get all gold elements
const goldElements = ATLAS_MAPPING.sprites.filter(sprite => sprite.color === 'gold');
```

---

## 🔍 **Preview and Testing**

### **Interactive HTML Preview**
The `asset-test.html` file provides an interactive preview of all atlas elements with:
- **Visual highlighting** of sprites on hover
- **Filtering** by category, theme, and color
- **Search functionality** by name or ID
- **Detailed information** display for each sprite
- **Zoom controls** for better visibility

### **Accessing the Preview**
1. Open `asset-test.html` in a web browser
2. Use the filter controls to explore different categories
3. Hover over sprites to see their details
4. Use the search box to find specific elements

---

## 📊 **Statistics**

### **Current Atlas Stats**
- **Total Sprites**: 619
- **Color Themes**: 30
- **Categories**: 6
- **Themes**: 21
- **Atlas Dimensions**: 352x512 pixels
- **Base Sprite Size**: 16x16 pixels

### **Breakdown by Category**
- **Frames**: 448 sprites (30 themes × 16 sprites + 8 themes × 28 sprites)
- **Buttons**: 89 sprites (various sizes and themes)
- **Icons**: 12 sprites (functional and decorative)
- **Text**: 13 sprites (labels and difficulty numbers)
- **Bars**: 42 sprites (progress and divider bars)
- **Breaks**: 15 sprites (page breaks and separators)

---

## 🔄 **Maintenance**

### **Adding New Themes**
1. Add theme configuration to `THEME_CONFIGS` array
2. Specify `name`, `color`, `xOffset`, `yOffset`, and `rowType`
3. The system will automatically generate all sprites for the new theme

### **Adding New Base Sprites**
1. Add sprite definition to appropriate base array
2. Update sprite count calculations
3. Regenerate atlas mapping

### **Modifying Existing Sprites**
1. Update base sprite definitions
2. All themes using that base sprite will be automatically updated
3. No manual coordinate adjustments needed

---

## 🚀 **Future Enhancements**

### **Planned Features**
- **Animation Support**: Multi-frame sprite sequences
- **State Variations**: More interaction states (hover, disabled, etc.)
- **Size Variants**: Additional size options for existing elements
- **Theme Presets**: Predefined theme combinations
- **Export Tools**: Automated sprite sheet generation

### **Performance Optimizations**
- **Sprite Batching**: Grouped rendering for better performance
- **Lazy Loading**: Load sprites on demand
- **Caching**: Cache frequently used sprite data
- **Compression**: Optimize sprite sheet file size

---

## 📝 **Changelog**

### **Version 2.0.0 (December 2024)**
- **Complete rewrite** of atlas mapping system
- **Dynamic generation** with 30 color themes
- **619 sprites** across 6 categories
- **Interactive HTML preview** with filtering
- **Modular architecture** for easy maintenance
- **Comprehensive documentation** update

### **Version 1.0.0 (July 2025)**
- Initial atlas mapping system
- 107 sprites across 12 rows
- Static coordinate-based mapping
- Basic categorization system

---

*This documentation is maintained as part of the Scrypture project. For questions or contributions, please refer to the project's development guidelines.*
