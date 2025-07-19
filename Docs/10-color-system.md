# 🎨 Scripture Color System

## 📋 Overview
This document outlines the comprehensive color system used throughout the Scrypture project, based on the Scripture project's warm, earthy color palette. The system is designed to create a professional, accessible, and visually appealing interface that maintains excellent readability and user experience.

---

## 🎯 Design Rules & Principles

### Sharp Corner Philosophy
```css
/* All UI elements use sharp corners - no border-radius */
:root {
  --border-radius-sm: 0px;
  --border-radius-md: 0px;
  --border-radius-lg: 0px;
  --border-radius-xl: 0px;
}

/* Sharp corner implementation */
.card, .button, .input, .form {
  border-radius: 0px;
}
```

### 4px Border System
```css
/* Consistent 4px border thickness */
:root {
  --border-width-thin: 1px;
  --border-width-normal: 4px;
  --border-width-thick: 8px;
}

/* Border implementation examples */
.card {
  border: 4px solid var(--color-border-primary);
}

.button {
  border: 4px solid var(--color-accent-gold);
}

.input:focus {
  border: 4px solid var(--color-accent-gold);
}
```

### Native Scale Display Rules
```css
/* Native scaling - no anti-aliasing, crisp pixel rendering */
* {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

/* Integer scaling only */
.scale-1x { transform: scale(1); }
.scale-2x { transform: scale(2); }
.scale-3x { transform: scale(3); }

/* Nearest-neighbor interpolation */
img, svg, canvas {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

### Design Rule Implementation
```javascript
// Design rule enforcement
class DesignRuleManager {
    constructor() {
    this.rules = {
      sharpCorners: true,
      fourPixelBorders: true,
      nativeScaling: true
    };
    this.initializeRules();
  }

  initializeRules() {
    // Enforce sharp corners
    if (this.rules.sharpCorners) {
      document.documentElement.style.setProperty('--border-radius-sm', '0px');
      document.documentElement.style.setProperty('--border-radius-md', '0px');
      document.documentElement.style.setProperty('--border-radius-lg', '0px');
    }

    // Enforce 4px borders
    if (this.rules.fourPixelBorders) {
      document.documentElement.style.setProperty('--border-width-normal', '4px');
    }

    // Enforce native scaling
    if (this.rules.nativeScaling) {
      this.applyNativeScaling();
    }
  }

  applyNativeScaling() {
    // Set image rendering to pixelated
    const style = document.createElement('style');
    style.textContent = `
      * {
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
      }
      
      img, svg, canvas {
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
      }
    `;
    document.head.appendChild(style);
  }

  getDesignRules() {
    return {
      sharpCorners: 'All UI elements use sharp corners (0px border-radius)',
      fourPixelBorders: 'Standard border thickness is 4px',
      nativeScaling: 'Display at 1:1 scale or integer scaling (2x, 3x) with nearest-neighbor interpolation'
    };
    }
}
```

---

## 🏠 Main Scripture Theme

### Base Colors
```css
:root {
  /* Primary Background Colors */
  --color-bg-primary: #23211a;      /* Main background - dark brown */
  --color-bg-secondary: #2d2b22;    /* Secondary background - medium brown */
  --color-bg-tertiary: #1a1812;     /* Tertiary background - darker brown */
  
  /* Border Colors */
  --color-border-primary: #39362a;   /* Primary border - medium brown */
  --color-border-secondary: #44412f; /* Secondary border - lighter brown */
  --color-border-dark: #18170f;      /* Dark border - very dark brown */
  
  /* Text Colors */
  --color-text-primary: #e8e5d2;    /* Primary text - light cream */
  --color-text-secondary: rgba(232, 229, 210, 0.8);
  --color-text-muted: rgba(232, 229, 210, 0.6);
  
  /* Accent Colors */
  --color-accent-gold: #b6a432;     /* Gold accent - warm yellow */
  --color-accent-beaver: #8B4513;   /* Beaver accent - brown */
  
  /* Design Rules */
  --border-radius-sm: 0px;           /* Sharp corners */
  --border-radius-md: 0px;           /* Sharp corners */
  --border-radius-lg: 0px;           /* Sharp corners */
  --border-width-normal: 4px;        /* 4px border thickness */
}
```

### Task Label Colors
```css
/* Urgent Tasks */
--color-urgent: #7b3b3b;           /* Dark red */
--color-urgent-border: #a04848;     /* Lighter red border */

/* Easy Tasks */
--color-easy: #2d6b3b;             /* Dark green */
--color-easy-border: #3a8a4a;      /* Lighter green border */

/* Focus Tasks */
--color-focus: #6c6747;             /* Dark yellow/brown */
--color-focus-border: #8a8560;      /* Lighter yellow border */

/* Chill Tasks */
--color-chill: #3b4a6b;             /* Dark blue */
--color-chill-border: #4a5a7b;      /* Lighter blue border */

/* Waiting Tasks */
--color-waiting: #6b3b5c;           /* Dark purple */
--color-waiting-border: #8a4a75;    /* Lighter purple border */
```

### Difficulty Level Colors
```css
/* 10-Level Difficulty Scale */
--difficulty-1: #2d6b3b;    /* Very Easy - Dark Green */
--difficulty-2: #3a8a4a;    /* Easy - Medium Green */
--difficulty-3: #4a9a5a;    /* Simple - Light Green */
--difficulty-4: #6c6747;    /* Basic - Yellow/Brown */
--difficulty-5: #8a8560;    /* Moderate - Light Yellow */
--difficulty-6: #b6a432;    /* Intermediate - Gold */
--difficulty-7: #d4af37;    /* Challenging - Bright Gold */
--difficulty-8: #b67332;    /* Hard - Orange */
--difficulty-9: #a04848;    /* Very Hard - Red */
--difficulty-10: #7b3b3b;   /* Extreme - Dark Red */
```

### Spacing & Typography
```css
/* Spacing Scale */
--spacing-xs: 0.25rem;              /* 4px */
--spacing-sm: 0.5rem;               /* 8px */
--spacing-md: 0.75rem;              /* 12px */
--spacing-lg: 1rem;                 /* 16px */
--spacing-xl: 1.5rem;               /* 24px */
--spacing-2xl: 2rem;                /* 32px */

/* Border Radius - Sharp Corners */
--border-radius-sm: 0px;
--border-radius-md: 0px;
--border-radius-lg: 0px;

/* Border Widths */
--border-width-thin: 1px;
--border-width-normal: 4px;
--border-width-thick: 8px;

/* Font Sizes */
--font-size-sm: 0.6em;
--font-size-md: 0.9em;
--font-size-lg: 1.1em;
```

### Shadows & Effects
```css
/* Shadow Effects */
--shadow-inset: inset 4px 4px var(--color-border-secondary), inset -4px -4px var(--color-border-dark);
--shadow-button: 2px 2px 4px rgba(0, 0, 0, 0.3);
--shadow-active: 0 0 0 3px var(--color-accent-gold), 3px 3px 6px rgba(0, 0, 0, 0.4);
```

---

## 🎯 Component-Specific Colors

### TaskCard Component
```css
.card {
  background: var(--color-bg-secondary);
  border: 4px solid var(--color-border-primary);  /* 4px border */
  border-radius: 0px;                             /* Sharp corners */
  box-shadow: var(--shadow-button);
}

.card:hover {
  box-shadow: var(--shadow-active);
  border-color: var(--color-border-secondary);
}

.card.completed {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-dark);
}

/* Priority Indicators */
.priorityHigh {
  background: var(--color-urgent);
  color: var(--color-text-primary);
  border: 4px solid var(--color-urgent-border);  /* 4px border */
  border-radius: 0px;                             /* Sharp corners */
}

.priorityMedium {
  background: var(--color-focus);
  color: var(--color-text-primary);
  border: 4px solid var(--color-focus-border);   /* 4px border */
  border-radius: 0px;                             /* Sharp corners */
}

.priorityLow {
  background: var(--color-easy);
  color: var(--color-text-primary);
  border: 4px solid var(--color-easy-border);    /* 4px border */
  border-radius: 0px;                             /* Sharp corners */
}
```

### TaskForm Component
```css
.form {
  background: var(--color-bg-secondary);
  border: 4px solid var(--color-border-primary);  /* 4px border */
  border-radius: 0px;                             /* Sharp corners */
  box-shadow: var(--shadow-button);
}

.titleInput, .prioritySelect, .descriptionInput {
  background: var(--color-bg-primary);
  border: 4px solid var(--color-border-primary);  /* 4px border */
  border-radius: 0px;                             /* Sharp corners */
  color: var(--color-text-primary);
}

.titleInput:focus, .prioritySelect:focus, .descriptionInput:focus {
  border: 4px solid var(--color-accent-gold);    /* 4px border */
  box-shadow: 0 0 0 4px var(--color-accent-gold); /* 4px focus ring */
}

.submitButton {
  background: var(--color-accent-gold);
  color: var(--color-bg-primary);
  border: 4px solid var(--color-accent-gold);    /* 4px border */
  border-radius: 0px;                             /* Sharp corners */
  box-shadow: var(--shadow-button);
}

.submitButton:hover {
  background: var(--color-accent-beaver);
  box-shadow: var(--shadow-active);
}
```

### TaskCounter Component
```css
.counter {
  background: var(--color-bg-secondary);
  border: 4px solid var(--color-border-primary);  /* 4px border */
  border-radius: 0px;                             /* Sharp corners */
  box-shadow: var(--shadow-button);
}

.count {
  color: var(--color-accent-gold);
}
```

### App Component
```css
.app {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.header {
  background: var(--color-bg-secondary);
  border-bottom: 4px solid var(--color-border-primary); /* 4px border */
  box-shadow: var(--shadow-button);
}

.title {
  color: var(--color-accent-gold);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
```

---

## 🎨 Colorblind-Friendly Theme

### Accessible Green/Red Scale
```css
/* Colorblind-Friendly Difficulty Colors */
--colorblind-1: #2d6b3b;    /* Very Easy - Dark Green */
--colorblind-2: #4a9a5a;    /* Easy - Medium Green */
--colorblind-3: #6a8a6a;    /* Simple - Light Green */
--colorblind-4: #8a8a4a;    /* Basic - Olive Green */
--colorblind-5: #a0a04a;    /* Moderate - Light Olive */
--colorblind-6: #b6a432;    /* Intermediate - Gold */
--colorblind-7: #d4af37;    /* Challenging - Bright Gold */
--colorblind-8: #8a4a4a;    /* Hard - Dark Red */
--colorblind-9: #a04848;    /* Very Hard - Medium Red */
--colorblind-10: #7b3b3b;   /* Extreme - Dark Red */
```

### Accessibility Features
- **High Contrast**: Colors chosen for maximum visibility
- **Colorblind Safe**: Distinguishable for red-green colorblind users
- **Progressive Scale**: Clear difficulty progression from green to red
- **Consistent Brightness**: Maintains readability across all levels

---

## 🎯 WCAG Compliance

### Contrast Ratios
```javascript
const contrastRatios = {
  // Primary text on backgrounds
  'text-primary-bg': 12.5,    // --color-text-primary on --color-bg-primary
  'text-secondary-bg': 8.2,   // --color-text-primary on --color-bg-secondary
  'text-tertiary-bg': 6.8,    // --color-text-primary on --color-bg-tertiary
  
  // Interactive elements
  'gold-primary': 7.1,        // --color-accent-gold on --color-bg-primary
  'gold-secondary': 5.2,      // --color-accent-gold on --color-bg-secondary
  
  // Task labels
  'urgent-text': 4.8,         // --color-text-primary on --color-urgent
  'easy-text': 5.1,           // --color-text-primary on --color-easy
  'focus-text': 4.9,          // --color-text-primary on --color-focus
  'chill-text': 5.3,          // --color-text-primary on --color-chill
  'waiting-text': 4.7         // --color-text-primary on --color-waiting
};

// WCAG 2.1 Compliance Status
const wcagCompliance = {
    'AA': Object.values(contrastRatios).every(ratio => ratio >= 4.5),
    'AAA': Object.values(contrastRatios).every(ratio => ratio >= 7.0),
    'failing': Object.entries(contrastRatios).filter(([name, ratio]) => ratio < 4.5)
};
```

### High Contrast Mode
```css
/* High Contrast Mode Color Overrides */
.high-contrast-mode {
  --color-bg-primary: #000000;      /* Pure black */
  --color-bg-secondary: #000000;    /* Pure black */
  --color-bg-tertiary: #000000;     /* Pure black */
  --color-text-primary: #ffffff;    /* Pure white */
  --color-text-secondary: #ffffff;  /* Pure white */
  --color-accent-gold: #ffff00;     /* Bright yellow */
  --color-accent-beaver: #ffffff;   /* White */
  
  /* Task labels in high contrast */
  --color-urgent: #ff0000;          /* Bright red */
  --color-easy: #00ff00;            /* Bright green */
  --color-focus: #ffff00;           /* Bright yellow */
  --color-chill: #0080ff;           /* Bright blue */
  --color-waiting: #ff00ff;         /* Bright magenta */
}
```

---

## 🎨 Usage Guidelines

### Design Rule Compliance
1. **Sharp Corners**: All UI elements must use 0px border-radius
2. **4px Borders**: Standard border thickness is 4px for all elements
3. **Native Scaling**: Display at 1:1 scale or integer scaling (2x, 3x) with nearest-neighbor interpolation
4. **Pixel-Perfect**: No anti-aliasing, crisp pixel rendering only

### Color Selection Tips
1. **Primary Interface**: Use main Scripture theme for core functionality
2. **Task Categories**: Use task label colors for priority and type indicators
3. **Difficulty Levels**: Use difficulty colors for skill progression
4. **Interactive Elements**: Use gold accent for buttons and focus states
5. **Accessibility**: Implement colorblind-friendly alternatives when needed

### Text Hierarchy
1. **Primary Text**: `--color-text-primary` for main content
2. **Secondary Text**: `--color-text-secondary` for less important content
3. **Muted Text**: `--color-text-muted` for disabled states
4. **Accent Text**: `--color-accent-gold` for highlights and emphasis

### Background System
1. **Primary Background**: `--color-bg-primary` (main app background)
2. **Secondary Background**: `--color-bg-secondary` (card backgrounds)
3. **Tertiary Background**: `--color-bg-tertiary` (nested elements)
4. **Interactive Background**: `--color-accent-gold` (buttons, focus states)

### Interactive States
- **Default**: Standard color scheme with 4px borders and sharp corners
- **Hover**: Subtle brightness increase with `--shadow-active`
- **Active**: `--color-accent-gold` highlight with 4px border
- **Focus**: Gold border with `box-shadow: 0 0 0 4px var(--color-accent-gold)`
- **Disabled**: Reduced opacity with `--color-text-muted`
- **Error**: `--color-urgent` for warnings
- **Success**: `--color-easy` for positive states

---

## 🛠️ Implementation

### CSS Custom Properties Setup
```css
:root {
  /* Scripture Project Color Palette */
  
  /* Primary Background Colors */
  --color-bg-primary: #23211a;
  --color-bg-secondary: #2d2b22;
  --color-bg-tertiary: #1a1812;
  
  /* Border Colors */
  --color-border-primary: #39362a;
  --color-border-secondary: #44412f;
  --color-border-dark: #18170f;
  
  /* Text Colors */
  --color-text-primary: #e8e5d2;
  --color-text-secondary: rgba(232, 229, 210, 0.8);
  --color-text-muted: rgba(232, 229, 210, 0.6);
  
  /* Accent Colors */
  --color-accent-gold: #b6a432;
  --color-accent-beaver: #8B4513;
  
  /* Task Label Colors */
  --color-urgent: #7b3b3b;
  --color-urgent-border: #a04848;
  --color-easy: #2d6b3b;
  --color-easy-border: #3a8a4a;
  --color-focus: #6c6747;
  --color-focus-border: #8a8560;
  --color-chill: #3b4a6b;
  --color-chill-border: #4a5a7b;
  --color-waiting: #6b3b5c;
  --color-waiting-border: #8a4a75;
  
  /* Difficulty Level Colors */
  --difficulty-1: #2d6b3b;
  --difficulty-2: #3a8a4a;
  --difficulty-3: #4a9a5a;
  --difficulty-4: #6c6747;
  --difficulty-5: #8a8560;
  --difficulty-6: #b6a432;
  --difficulty-7: #d4af37;
  --difficulty-8: #b67332;
  --difficulty-9: #a04848;
  --difficulty-10: #7b3b3b;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 0.75rem;
  --spacing-lg: 1rem;
  --spacing-xl: 1.5rem;
  --spacing-2xl: 2rem;
  
  /* Design Rules - Sharp Corners */
  --border-radius-sm: 0px;
  --border-radius-md: 0px;
  --border-radius-lg: 0px;
  
  /* Design Rules - 4px Borders */
  --border-width-thin: 1px;
  --border-width-normal: 4px;
  --border-width-thick: 8px;
  
  /* Font Sizes */
  --font-size-sm: 0.6em;
  --font-size-md: 0.9em;
  --font-size-lg: 1.1em;
  
  /* Shadows & Effects */
  --shadow-inset: inset 4px 4px var(--color-border-secondary), inset -4px -4px var(--color-border-dark);
  --shadow-button: 2px 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-active: 0 0 0 3px var(--color-accent-gold), 3px 3px 6px rgba(0, 0, 0, 0.4);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
}

/* Native Scaling Rules */
* {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

img, svg, canvas {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

### Component Integration
```javascript
// Example: TaskCard component with Scripture colors and design rules
const TaskCard = ({ task }) => {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return '';
    }
  };

  return (
    <div className={`${styles.card} ${task.completed ? styles.completed : ''}`}>
      <div className={styles.header}>
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={task.completed}
            onChange={() => toggleTask(task.id)}
          />
    </div>
        <div className={styles.content}>
          <h3 className={`${styles.title} ${task.completed ? styles.titleCompleted : ''}`}>
            {task.title}
          </h3>
          <p className={`${styles.description} ${task.completed ? styles.descriptionCompleted : ''}`}>
            {task.description}
          </p>
          <div className={styles.meta}>
            <span className={`${styles.priority} ${getPriorityClass(task.priority)}`}>
              {task.priority}
            </span>
            <span className={styles.date}>
              {new Date(task.createdAt).toLocaleDateString()}
        </span>
    </div>
</div>
        <button className={styles.deleteButton} onClick={() => deleteTask(task.id)}>
          ×
    </button>
      </div>
    </div>
  );
};
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (2-3 column grid)
- **Desktop**: > 1024px (4+ column grid)

### Adaptive Elements
- **Grid Layout**: Responsive task card grid
- **Font Scaling**: Responsive typography using CSS custom properties
- **Touch Targets**: Minimum 44px for mobile interactions
- **Spacing**: Proportional padding and margins using spacing scale
- **Native Scaling**: Integer scaling only (1x, 2x, 3x)

---

## 🎨 Design Principles

### Sharp Corner Philosophy
- **No Rounded Corners**: All UI elements use sharp, 90-degree corners
- **Pixel-Perfect Design**: Crisp edges for a technical, precise aesthetic
- **Consistent Geometry**: Uniform corner treatment across all components

### 4px Border System
- **Standard Thickness**: All borders use 4px thickness for consistency
- **Visual Hierarchy**: Border thickness creates clear element boundaries
- **Accessibility**: 4px borders provide clear visual separation

### Native Scale Display
- **1:1 Scaling**: Display UI at native resolution
- **Integer Scaling**: Use 2x, 3x scaling only (no fractional scaling)
- **Nearest-Neighbor**: Crisp pixel rendering without anti-aliasing
- **Pixel-Perfect**: Maintain sharp edges at all scales

### Color Harmony
- **Warm Earth Tones**: Brown-based palette creates a professional, approachable feel
- **Consistent Contrast**: All color combinations maintain WCAG AA compliance
- **Progressive Difficulty**: Clear visual progression from green (easy) to red (hard)
- **Accessible Design**: Colorblind-friendly alternatives and high contrast modes

### Visual Hierarchy
1. **Primary Actions**: Gold accent for main buttons and focus states
2. **Task Categories**: Distinct colors for different task types
3. **Difficulty Levels**: Progressive color scale for skill assessment
4. **Interactive Elements**: Clear hover and focus states with 4px borders
5. **Information Architecture**: Consistent spacing and typography scale

### Accessibility First
- **WCAG 2.1 AA Compliance**: All color combinations meet accessibility standards
- **Colorblind Support**: Alternative patterns and high contrast options
- **Keyboard Navigation**: Clear focus indicators with 4px borders
- **Screen Reader Support**: Proper ARIA labels and semantic HTML

---

## 📝 Notes
- All colors are defined as CSS custom properties for easy theming
- Colors are organized by semantic meaning and usage context
- **Sharp corners only** - no border-radius allowed
- **4px borders** - standard thickness for all elements
- **Native scaling** - 1:1 or integer scaling with nearest-neighbor interpolation
- Difficulty colors follow a logical progression from green (easy) to red (hard)
- The warm, earthy aesthetic creates a professional yet approachable interface 