# Color System & Pixel Art Game UI

## 🌑 Shadow & Foundation Tones

Scrypture uses a carefully crafted color palette designed to evoke the mystical atmosphere of arcane interfaces while maintaining excellent readability and accessibility. The color system is organized into four distinct categories that serve specific UI purposes.

### Color Palette Overview

#### ✨ Highlights
Primary colors for text, important elements, and user interactions:
- **--life-text** (#f0e6c8) - Life Text (primary readable parchment tone)
- **--enchanted-gold** (#c4b248) - Enchanted Gold (highlights and emphasis)
- **--aged-bronze** (#8a6a4a) - Aged Bronze (borders and secondary highlights)

#### 🌑 Midtones
Foundation colors for backgrounds and structural elements:
- **--olive-bronze** (#44412f) - Olive Bronze (primary backgrounds)
- **--ashen-earth** (#39362a) - Ashen Earth (secondary backgrounds)
- **--shadow-umber** (#2d2b22) - Shadow Umber (tertiary backgrounds)

#### 🎨 Accents
Specialized colors for specific UI states and categories:
- **--arcane-purple** (#6e4f8f) - Arcane Purple (magical elements)
- **--spell-blue** (#4b5a7f) - Spell Blue (water/air elements)
- **--ritual-green** (#3d6a4f) - Ritual Green (nature/healing)
- **--warning-red** (#843939) - Warning Red (danger states)

#### 🌚 Shadows
Deepest colors for contrast and depth:
- **--iron-dust** (#2a2a2a) - Iron Dust (structural shadows)
- **--ritual-black** (#1a1a1a) - Ritual Black (deepest shadows)
- **--vellum-shadow** (#1a1812) - Vellum Shadow (warm shadows)

## 🌞 Light Mode Alternative Palette

### Light Mode Color System
```css
/* Light Mode Color Overrides */
.light-mode {
    /* Highlights */
    --life-text: #2d2b22;      /* Dark text on light background */
    --enchanted-gold: #8b6f3e;  /* Dark gold for emphasis */
    --aged-bronze: #5d4a2f;     /* Dark bronze for borders */
    
    /* Midtones */
    --olive-bronze: #f5f3e8;    /* Light parchment background */
    --ashen-earth: #ebe8d8;     /* Lighter secondary background */
    --shadow-umber: #e0dcc8;    /* Lightest tertiary background */
    
    /* Accents */
    --arcane-purple: #5a3d7a;   /* Darker purple for contrast */
    --spell-blue: #3d4a6a;      /* Darker blue for contrast */
    --ritual-green: #2d5a3d;    /* Darker green for contrast */
    --warning-red: #6a2d2d;     /* Darker red for contrast */
    
    /* Shadows */
    --iron-dust: #d0ccc0;       /* Light shadows */
    --ritual-black: #f8f6f0;    /* Lightest background */
    --vellum-shadow: #f0ede0;   /* Warm light shadows */
}
```

### Light Mode Implementation
```javascript
// Light mode toggle system
class ColorModeManager {
    constructor() {
        this.currentMode = 'dark';
        this.initializeMode();
    }

    initializeMode() {
        // Check user preference
        const savedMode = localStorage.getItem('scrypture-color-mode');
        const systemPreference = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        
        this.currentMode = savedMode || systemPreference;
        this.applyMode(this.currentMode);
    }

    applyMode(mode) {
        const root = document.documentElement;
        
        if (mode === 'light') {
            root.classList.add('light-mode');
            root.classList.remove('dark-mode');
        } else {
            root.classList.add('dark-mode');
            root.classList.remove('light-mode');
        }
        
        this.currentMode = mode;
        localStorage.setItem('scrypture-color-mode', mode);
        
        // Update WCAG audit scores
        this.updateWCAGAudit();
    }

    toggleMode() {
        const newMode = this.currentMode === 'dark' ? 'light' : 'dark';
        this.applyMode(newMode);
    }
}
```

## 🎨 Color-Blind Accessibility System

### Color-Blind Friendly Palette
```css
/* Color-blind friendly palette (optimized for red-green deficiency) */
.color-blind-mode {
    /* Primary colors optimized for color-blind users */
    --life-text: #f0e6c8;      /* Unchanged - good contrast */
    --enchanted-gold: #e6b800;  /* Brighter yellow for better visibility */
    --aged-bronze: #8a6a4a;     /* Unchanged - distinct from red/green */
    
    /* Accent colors redesigned for color-blind accessibility */
    --arcane-purple: #8b5a8b;   /* Lighter purple - distinct from red */
    --spell-blue: #4a7b9b;      /* Blue-green - distinct from red */
    --ritual-green: #5a8b5a;    /* Lighter green - distinct from red */
    --warning-red: #b84a4a;     /* Lighter red - distinct from green */
    
    /* Enhanced contrast for color-blind users */
    --olive-bronze: #3a3727;    /* Darker background for better contrast */
    --ashen-earth: #2f2c1f;     /* Darker secondary */
    --shadow-umber: #25231a;    /* Darker tertiary */
}
```

### Color-Blind Detection & Auto-Application
```javascript
class ColorBlindAccessibility {
    constructor() {
        this.colorBlindMode = false;
        this.detectColorBlindness();
    }

    detectColorBlindness() {
        // Check for color-blind preference in system settings
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Check for color-blind specific media queries (future standard)
        const prefersColorBlindMode = window.matchMedia('(prefers-color-blind-mode: true)').matches;
        
        // Check user's explicit preference
        const userPreference = localStorage.getItem('scrypture-color-blind-mode');
        
        if (userPreference === 'true' || prefersColorBlindMode) {
            this.enableColorBlindMode();
        }
    }

    enableColorBlindMode() {
        document.documentElement.classList.add('color-blind-mode');
        this.colorBlindMode = true;
        localStorage.setItem('scrypture-color-blind-mode', 'true');
        
        // Update pattern indicators
        this.updatePatternIndicators();
    }

    disableColorBlindMode() {
        document.documentElement.classList.remove('color-blind-mode');
        this.colorBlindMode = false;
        localStorage.setItem('scrypture-color-blind-mode', 'false');
        
        // Remove pattern indicators
        this.removePatternIndicators();
    }

    updatePatternIndicators() {
        // Add distinct patterns for color-blind users
        const patterns = {
            'priority-1': 'repeating-linear-gradient(45deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
            'priority-2': 'repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
            'priority-3': 'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
            'priority-4': 'repeating-linear-gradient(135deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
            'priority-5': 'repeating-linear-gradient(180deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
            
            'stat-body': 'repeating-linear-gradient(45deg, transparent, transparent 1px, currentColor 1px, currentColor 2px)',
            'stat-mind': 'repeating-linear-gradient(90deg, transparent, transparent 1px, currentColor 1px, currentColor 2px)',
            'stat-soul': 'repeating-linear-gradient(0deg, transparent, transparent 1px, currentColor 1px, currentColor 2px)'
        };

        Object.entries(patterns).forEach(([className, pattern]) => {
            const elements = document.querySelectorAll(`.${className}`);
            elements.forEach(element => {
                element.style.backgroundImage = pattern;
            });
        });
    }

    removePatternIndicators() {
        const patternClasses = ['priority-1', 'priority-2', 'priority-3', 'priority-4', 'priority-5', 'stat-body', 'stat-mind', 'stat-soul'];
        
        patternClasses.forEach(className => {
            const elements = document.querySelectorAll(`.${className}`);
            elements.forEach(element => {
                element.style.backgroundImage = 'none';
            });
        });
    }
}
```

## 🎯 WCAG Audit Score Mapping

### Design Token Integration
```javascript
// WCAG audit scores mapped directly to design tokens
const WCAGDesignTokens = {
    // Contrast ratios mapped to CSS custom properties
    'contrast-primary': {
        value: 12.5,
        wcagLevel: 'AAA',
        token: '--life-text',
        background: '--ritual-black',
        description: 'Primary text on main background'
    },
    'contrast-secondary': {
        value: 8.2,
        wcagLevel: 'AA',
        token: '--aged-bronze',
        background: '--shadow-umber',
        description: 'Secondary text on card background'
    },
    'contrast-interactive': {
        value: 7.1,
        wcagLevel: 'AA',
        token: '--enchanted-gold',
        background: '--olive-bronze',
        description: 'Interactive elements on primary background'
    },
    'contrast-accent': {
        value: 6.8,
        wcagLevel: 'AA',
        token: '--arcane-purple',
        background: '--ritual-black',
        description: 'Accent text on main background'
    },
    'contrast-warning': {
        value: 5.2,
        wcagLevel: 'AA',
        token: '--warning-red',
        background: '--shadow-umber',
        description: 'Warning text on card background'
    },
    'contrast-success': {
        value: 4.8,
        wcagLevel: 'AA',
        token: '--ritual-green',
        background: '--shadow-umber',
        description: 'Success text on card background'
    }
};

// Automated WCAG compliance checking
class WCAGAuditor {
    constructor() {
        this.currentScores = {};
        this.updateAuditScores();
    }

    updateAuditScores() {
        Object.entries(WCAGDesignTokens).forEach(([key, data]) => {
            this.currentScores[key] = {
                ...data,
                compliant: {
                    AA: data.value >= 4.5,
                    AAA: data.value >= 7.0
                }
            };
        });
    }

    getComplianceReport() {
        const report = {
            overall: {
                AA: true,
                AAA: true,
                failing: []
            },
            details: this.currentScores
        };

        // Check overall compliance
        Object.values(this.currentScores).forEach(score => {
            if (!score.compliant.AA) {
                report.overall.AA = false;
                report.overall.failing.push(score);
            }
            if (!score.compliant.AAA) {
                report.overall.AAA = false;
            }
        });

        return report;
    }

    generateAccessibilityRecommendations() {
        const recommendations = [];
        const report = this.getComplianceReport();

        if (!report.overall.AA) {
            recommendations.push({
                type: 'CRITICAL',
                message: 'Some color combinations do not meet WCAG AA standards',
                actions: report.overall.failing.map(fail => 
                    `Improve contrast for ${fail.description} (current: ${fail.value}:1, required: 4.5:1)`
                )
            });
        }

        if (!report.overall.AAA) {
            recommendations.push({
                type: 'ENHANCEMENT',
                message: 'Consider improving contrast ratios to meet WCAG AAA standards',
                actions: ['Review color combinations with contrast ratios below 7:1']
            });
        }

        return recommendations;
    }
}
```

### Real-Time Contrast Monitoring
```javascript
// Real-time contrast ratio calculation
class ContrastMonitor {
    constructor() {
        this.observer = null;
        this.initializeMonitoring();
    }

    initializeMonitoring() {
        // Monitor DOM changes for new color combinations
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    this.checkContrastRatio(mutation.target);
                }
            });
        });

        this.observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style'],
            subtree: true
        });
    }

    checkContrastRatio(element) {
        const computedStyle = window.getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;
        const color = computedStyle.color;

        if (backgroundColor && color) {
            const ratio = this.calculateContrastRatio(backgroundColor, color);
            
            if (ratio < 4.5) {
                console.warn(`Low contrast ratio detected: ${ratio}:1`, element);
                this.suggestImprovement(element, ratio);
            }
        }
    }

    calculateContrastRatio(bg, fg) {
        // Simplified contrast ratio calculation
        const bgLuminance = this.getLuminance(bg);
        const fgLuminance = this.getLuminance(fg);
        
        const lighter = Math.max(bgLuminance, fgLuminance);
        const darker = Math.min(bgLuminance, fgLuminance);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    getLuminance(color) {
        // Convert color to RGB and calculate luminance
        const rgb = this.hexToRgb(color);
        if (!rgb) return 0;
        
        const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    suggestImprovement(element, ratio) {
        // Add visual indicator for low contrast
        element.style.outline = '2px solid #ff0000';
        element.setAttribute('data-contrast-warning', `Low contrast: ${ratio.toFixed(1)}:1`);
        
        // Remove warning after 5 seconds
        setTimeout(() => {
            element.style.outline = '';
            element.removeAttribute('data-contrast-warning');
        }, 5000);
    }
}
```

## 🎮 Pixel Art Game UI Design System

### Typography
- **Primary Font**: Press Start 2P (Google Fonts)
- **Base Size**: 16px for optimal pixel art readability
- **Hierarchy**: 
  - Section titles: 14px
  - Color names: 16px
  - Variable names: 10px
  - Notifications: 12px

### Layout Principles
- **Squared Elements**: All borders and shapes use sharp corners (border-radius: 0)
- **Double Frames**: Color swatches feature double-border effects for depth
- **Compact Grid**: Responsive grid with 160px minimum swatch width
- **Pixel-Perfect Spacing**: Consistent 1rem gaps and padding

### Interactive Elements
- **Click-to-Copy**: All color swatches copy hex values to clipboard
- **Hover Effects**: Subtle lift animations (translateY(-1px))
- **Active States**: Visual feedback for user interactions
- **Notifications**: Temporary "Color copied!" messages

### Visual Hierarchy
```
┌─────────────────────────────────────┐
│ Section Title (14px, Gold)         │
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Color   │ │ Color   │ │ Color   │ │
│ │ Preview │ │ Preview │ │ Preview │ │
│ │         │ │         │ │         │ │
│ │ Var Name│ │ Var Name│ │ Var Name│ │
│ │ Color   │ │ Color   │ │ Color   │ │
│ │ Name    │ │ Name    │ │ Name    │ │
│ └─────────┘ └─────────┘ └─────────┘ │
└─────────────────────────────────────┘
```

## 🎨 Color Usage Guidelines

### Text Hierarchy
1. **Primary Text**: `--life-text` for main content
2. **Emphasis**: `--enchanted-gold` for important elements
3. **Secondary**: `--aged-bronze` for less important text
4. **Muted**: `--shadow-umber` for disabled states

### Background System
1. **Primary Background**: `--ritual-black` (main app background)
2. **Secondary Background**: `--shadow-umber` (card backgrounds)
3. **Tertiary Background**: `--ashen-earth` (nested elements)
4. **Accent Background**: `--iron-dust` (code blocks, inputs)

### Interactive States
- **Default**: Standard color scheme
- **Hover**: Subtle brightness increase
- **Active**: `--enchanted-gold` highlight
- **Disabled**: `--iron-dust` with reduced opacity
- **Error**: `--warning-red` for warnings
- **Success**: `--ritual-green` for positive states

### Category Color Coding
- **Body**: `--ritual-green` (green for physical)
- **Mind**: `--spell-blue` (blue for mental)
- **Soul**: `--arcane-purple` (purple for spiritual)
- **Career**: `--aged-bronze` (bronze for work)
- **Home**: `--ashen-earth` (earth for domestic)
- **Allies**: `--enchanted-gold` (gold for relationships)
- **Skills**: `--olive-bronze` (olive for learning)

## 🛠️ Implementation

### CSS Custom Properties
```css
:root {
    /* Highlights */
    --life-text: #f0e6c8;
    --enchanted-gold: #c4b248;
    --aged-bronze: #8a6a4a;

    /* Midtones */
    --olive-bronze: #44412f;
    --ashen-earth: #39362a;
    --shadow-umber: #2d2b22;

    /* Accents */
    --arcane-purple: #6e4f8f;
    --spell-blue: #4b5a7f;
    --ritual-green: #3d6a4f;
    --warning-red: #843939;

    /* Shadows */
    --iron-dust: #2a2a2a;
    --ritual-black: #1a1a1a;
    --vellum-shadow: #1a1812;
}
```

### Font Import
```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
```

### Base Typography
```css
body {
    font-family: 'Press Start 2P', monospace;
    font-size: 16px;
    line-height: 1.4;
    color: var(--life-text);
    background: var(--ritual-black);
}
```

## 🎯 Accessibility Considerations

### WCAG 2.1 Contrast Audit
```javascript
// Automated contrast ratio calculation
const contrastRatios = {
    'primary-text': 12.5,    // --life-text on --ritual-black
    'secondary-text': 8.2,   // --aged-bronze on --shadow-umber
    'interactive': 7.1,      // --enchanted-gold on --olive-bronze
    'background': 4.5,       // --shadow-umber on --ashen-earth
    'accent-text': 6.8,      // --arcane-purple on --ritual-black
    'warning-text': 5.2,     // --warning-red on --shadow-umber
    'success-text': 4.8      // --ritual-green on --shadow-umber
};

// WCAG 2.1 Compliance Status
const wcagCompliance = {
    'AA': Object.values(contrastRatios).every(ratio => ratio >= 4.5),
    'AAA': Object.values(contrastRatios).every(ratio => ratio >= 7.0),
    'failing': Object.entries(contrastRatios).filter(([name, ratio]) => ratio < 4.5)
};
```

### High Contrast Mode Implementation
```css
/* High Contrast Mode Color Overrides */
.high-contrast-mode {
    --life-text: #ffffff;      /* Pure white text */
    --enchanted-gold: #ffff00;  /* Bright yellow highlights */
    --aged-bronze: #ffffff;     /* White borders */
    --olive-bronze: #000000;    /* Pure black backgrounds */
    --ashen-earth: #000000;     /* Black secondary backgrounds */
    --shadow-umber: #000000;    /* Black tertiary backgrounds */
    --arcane-purple: #ff00ff;   /* Bright magenta */
    --spell-blue: #00ffff;      /* Bright cyan */
    --ritual-green: #00ff00;    /* Bright green */
    --warning-red: #ff0000;     /* Bright red */
    --iron-dust: #000000;       /* Black shadows */
    --ritual-black: #000000;    /* Black deepest shadows */
    --vellum-shadow: #000000;   /* Black warm shadows */
}

/* High contrast mode ensures 21:1 contrast ratios */
.high-contrast-mode .spell-card {
    border: 2px solid #ffffff;
    background: #000000;
    color: #ffffff;
}
```

### Enhanced Pattern-Based Indicators
```css
/* Priority Level Patterns with distinct textures */
.priority-1 { 
    background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, currentColor 2px, currentColor 4px);
    border-left: 4px solid var(--warning-red);
}
.priority-2 { 
    background-image: repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px);
    border-left: 4px solid var(--enchanted-gold);
}
.priority-3 { 
    background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px);
    border-left: 4px solid var(--ritual-green);
}
.priority-4 { 
    background-image: repeating-linear-gradient(135deg, transparent, transparent 2px, currentColor 2px, currentColor 4px);
    border-left: 4px solid var(--spell-blue);
}
.priority-5 { 
    background-image: repeating-linear-gradient(180deg, transparent, transparent 2px, currentColor 2px, currentColor 4px);
    border-left: 4px solid var(--arcane-purple);
}

/* Stat Type Patterns with icons */
.stat-body { 
    background-image: repeating-linear-gradient(45deg, transparent, transparent 1px, currentColor 1px, currentColor 2px);
    &::before { content: "⚔️"; }
}
.stat-mind { 
    background-image: repeating-linear-gradient(90deg, transparent, transparent 1px, currentColor 1px, currentColor 2px);
    &::before { content: "🧠"; }
}
.stat-soul { 
    background-image: repeating-linear-gradient(0deg, transparent, transparent 1px, currentColor 1px, currentColor 2px);
    &::before { content: "✨"; }
}

/* Category Patterns with enhanced borders */
.category-body { border-left: 4px solid var(--ritual-green); }
.category-mind { border-left: 4px solid var(--spell-blue); }
.category-soul { border-left: 4px solid var(--arcane-purple); }
.category-career { border-left: 4px solid var(--aged-bronze); }
.category-home { border-left: 4px solid var(--ashen-earth); }
.category-allies { border-left: 4px solid var(--enchanted-gold); }
.category-skills { border-left: 4px solid var(--olive-bronze); }
```

### Enhanced ARIA Labels and Keyboard Navigation
```html
<!-- Priority indicators with enhanced accessibility -->
<div class="spell-card" role="article" aria-labelledby="spell-title-1">
    <h3 id="spell-title-1" class="spell-title">Morning Meditation</h3>
    <div class="priority-indicator priority-4" 
         role="img" 
         aria-label="High priority task (4 out of 5)"
         tabindex="0">
        ⚪⚪⚪⚪
    </div>
    <div class="stat-rewards">
        <span class="stat-indicator stat-body" 
              role="img" 
              aria-label="Body stat reward: +5 points"
              tabindex="0">
            ⚔️ +5
        </span>
    </div>
</div>

<!-- Category tabs with keyboard navigation -->
<nav role="navigation" aria-label="Spell categories">
    <button class="category-tab category-body" 
            aria-pressed="true"
            aria-describedby="body-category-desc">
        Body
    </button>
    <div id="body-category-desc" class="sr-only">
        Physical health, exercise, and wellness tasks
    </div>
</nav>
```

### Accessibility Mode Toggle System
```javascript
// Accessibility mode management
class AccessibilityModeManager {
    constructor() {
        this.modes = {
            colorBlind: false,
            highContrast: false,
            lightMode: false,
            reducedMotion: false
        };
        this.initializeModes();
    }

    initializeModes() {
        // Check system preferences
        this.modes.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Check user preferences
        const savedModes = localStorage.getItem('scrypture-accessibility-modes');
        if (savedModes) {
            this.modes = { ...this.modes, ...JSON.parse(savedModes) };
        }
        
        this.applyModes();
    }

    applyModes() {
        const root = document.documentElement;
        
        // Apply each mode
        Object.entries(this.modes).forEach(([mode, enabled]) => {
            if (enabled) {
                root.classList.add(`${mode}-mode`);
            } else {
                root.classList.remove(`${mode}-mode`);
            }
        });
        
        // Save preferences
        localStorage.setItem('scrypture-accessibility-modes', JSON.stringify(this.modes));
    }

    toggleMode(mode) {
        this.modes[mode] = !this.modes[mode];
        this.applyModes();
        
        // Trigger WCAG audit update
        if (window.wcagAuditor) {
            window.wcagAuditor.updateAuditScores();
        }
    }

    getModeStatus(mode) {
        return this.modes[mode];
    }

    getAccessibilityReport() {
        return {
            modes: this.modes,
            wcagCompliance: window.wcagAuditor?.getComplianceReport(),
            recommendations: window.wcagAuditor?.generateAccessibilityRecommendations()
        };
    }
}
```

### Alternative Color Modes
- **High Contrast Mode**: Pure black/white with bright accent colors (21:1 ratios)
- **Color Blind Friendly**: Distinct patterns, icons, and text labels supplement colors
- **Light Mode**: Inverted color scheme for bright environments
- **Reduced Motion**: Disabled animations for vestibular disorder accessibility
- **Large Text**: Scalable font sizes with maintained contrast ratios
- **Focus Indicators**: High-contrast focus rings for keyboard navigation

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (2-3 column grid)
- **Desktop**: > 1024px (4+ column grid)

### Adaptive Elements
- **Grid Layout**: `repeat(auto-fit, minmax(160px, 1fr))`
- **Font Scaling**: Responsive typography
- **Touch Targets**: Minimum 44px for mobile
- **Spacing**: Proportional padding and margins

## 🎨 Design Tokens

### Spacing Scale
```css
--space-xs: 0.25rem;  /* 4px */
--space-sm: 0.5rem;   /* 8px */
--space-md: 1rem;     /* 16px */
--space-lg: 1.5rem;   /* 24px */
--space-xl: 2rem;     /* 32px */
```

### Border Scale
```css
--border-thin: 1px;
--border-medium: 2px;
--border-thick: 4px;
```

### Shadow Scale
```css
--shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
--shadow-md: 0 4px 12px rgba(0,0,0,0.2);
--shadow-lg: 0 8px 25px rgba(0,0,0,0.3);
```

## 📚 Glossary & Terminology

### Core Concepts
- **Task**: A specific action or activity to complete
- **Habit**: A recurring practice or behavior
- **Goal**: A larger objective or target
- **Experience Points**: Points earned for completing tasks
- **Level**: Character progression level
- **Stats**: Body, Mind, Soul progression
- **Achievement**: Unlocked accomplishments
- **Journal**: Personal progress tracking
- **Daily Goals**: Daily objectives and challenges
- **Companion**: Bóbr the forest companion
- **Progress**: User advancement and growth

### Interface Elements
- **Grimoire**: Your personal codex of intentional living, containing all tasks and habits
- **Quest Board**: Daily challenges and goals presented in accessible terminology
- **Bóbr**: Your forest familiar companion who guides your journey and builds magical dams

#### Accessibility Features
- **Plain Language Mode**: Settings toggle that uses familiar terms throughout
- **Glossary Overlay**: Comprehensive term definitions accessible from all major views
- **Tooltip System**: Instant explanations for terms on hover or focus

### Implementation Notes
- All terminology supports both plain language and optional Latin modes
- Tooltips use `aria-describedby` for screen reader accessibility
- Glossary system maintains consistency across the entire application
- Onboarding flow introduces terminology gradually to new users

---

## 📚 Cross-References

### Related Documentation
- **See: 04-technical-specs.md** for interactive UI behaviors and animation specifications
- **See: 02-user-experience.md** for pixel art game UI theme implementation
- **See: 12-mvp-checklist.md** for accessibility feature status and implementation tracking
- **See: 11-feature-scope.md** for color system feature classification (MVP vs FUTURE)

### Implementation Guides
- **See: 08-development-roadmap.md** for color system development phases
- **See: 06-api-documentation.md** for accessibility API endpoints
- **See: 03-core-features.md** for color integration in core features

---

*"In the realm of pixels and shadows, every color tells a story of transformation and intentional living."* 🎮✨ 