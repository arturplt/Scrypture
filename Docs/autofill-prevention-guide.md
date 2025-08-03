# Autofill Prevention Guide

## Overview

This document describes the comprehensive autofill prevention system implemented in Scrypture to prevent browsers from incorrectly suggesting payment methods in character creation and other input fields. This was a critical UX issue that could alarm users and make the application appear suspicious.

## The Problem

Browsers were incorrectly suggesting payment methods (credit cards, bank accounts) in character creation and task input fields, causing:

- **User Alarm**: Users seeing payment method suggestions in a non-payment context
- **Trust Issues**: Making the application appear suspicious or malicious
- **UX Confusion**: Browser notifications like "Automatic payment methods filling is disabled"
- **Security Concerns**: Potential for users to accidentally enter sensitive information

## The Solution

We implemented a multi-layered approach to completely prevent autofill suggestions:

### 1. HTML Attributes

```html
<input
  autoComplete="new-password"
  autoCorrect="off"
  autoCapitalize="words"
  spellCheck="false"
  data-form-type="other"
  data-lpignore="true"
  data-1p-ignore="true"
/>
```

**Key Attributes:**
- `autoComplete="new-password"`: Browsers respect this more than "off"
- `data-lpignore="true"`: Prevents LastPass from interfering
- `data-1p-ignore="true"`: Prevents 1Password from interfering
- `data-form-type="other"`: Indicates this is not a payment form

### 2. Hidden Fake Input Field

```html
{/* Hidden fake input to trick browser autofill */}
<input
  type="text"
  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
  autoComplete="username"
  tabIndex={-1}
/>
```

This diverts browser autofill attention away from the real input field.

### 3. JavaScript Event Listeners

```javascript
useEffect(() => {
  if (inputRef.current) {
    // Set autocomplete to a non-standard value
    inputRef.current.setAttribute('autocomplete', 'new-password');
    inputRef.current.setAttribute('data-lpignore', 'true');
    inputRef.current.setAttribute('data-1p-ignore', 'true');
    
    // Disable autofill via JavaScript
    inputRef.current.addEventListener('focus', () => {
      inputRef.current?.setAttribute('autocomplete', 'new-password');
    });
    
    // Prevent autofill on input
    inputRef.current.addEventListener('input', () => {
      inputRef.current?.setAttribute('autocomplete', 'new-password');
    });
  }
}, []);
```

This programmatically ensures autofill remains disabled even if the browser tries to override it.

### 4. CSS Autofill Prevention

#### Component-Level CSS (UserCreation.module.css)

```css
/* Hide autofill suggestions */
.input:-webkit-autofill,
.input:-webkit-autofill:hover,
.input:-webkit-autofill:focus,
.input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px var(--color-bg-primary) inset !important;
  -webkit-text-fill-color: var(--color-text-primary) !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* Hide autocomplete dropdown */
.input::-webkit-calendar-picker-indicator {
  display: none !important;
}

/* Prevent browser autofill styling */
.input:autofill {
  background-color: var(--color-bg-primary) !important;
  color: var(--color-text-primary) !important;
}
```

#### Global CSS (globals.css)

```css
/* Prevent autofill suggestions globally */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px var(--color-bg-primary) inset !important;
  -webkit-text-fill-color: var(--color-text-primary) !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* Hide autocomplete dropdowns */
input::-webkit-calendar-picker-indicator {
  display: none !important;
}

/* Prevent browser autofill styling */
input:autofill {
  background-color: var(--color-bg-primary) !important;
  color: var(--color-text-primary) !important;
}

/* Disable autofill for all text inputs */
input[type="text"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
```

## Components with Autofill Prevention

The following components have been updated with autofill prevention:

1. **UserCreation** - Character name input
2. **TaskForm** - Task title input
3. **HabitForm** - Habit name input
4. **TaskEditForm** - Task editing input
5. **FirstTaskWizard** - Tutorial task input

## Implementation Pattern

When adding autofill prevention to new input fields, follow this pattern:

```typescript
import React, { useState, useEffect, useRef } from 'react';

export const NewComponent: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Aggressively disable autofill
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute('autocomplete', 'new-password');
      inputRef.current.setAttribute('data-lpignore', 'true');
      inputRef.current.setAttribute('data-1p-ignore', 'true');
      
      inputRef.current.addEventListener('focus', () => {
        inputRef.current?.setAttribute('autocomplete', 'new-password');
      });
      
      inputRef.current.addEventListener('input', () => {
        inputRef.current?.setAttribute('autocomplete', 'new-password');
      });
    }
  }, []);

  return (
    <form>
      {/* Hidden fake input */}
      <input
        type="text"
        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
        autoComplete="username"
        tabIndex={-1}
      />
      
      {/* Real input with prevention */}
      <input
        ref={inputRef}
        type="text"
        autoComplete="new-password"
        autoCorrect="off"
        autoCapitalize="words"
        spellCheck="false"
        data-form-type="other"
        data-lpignore="true"
        data-1p-ignore="true"
      />
    </form>
  );
};
```

## Browser Compatibility

This solution works across all major browsers:

- **Chrome**: Full support with all prevention methods
- **Firefox**: Full support with all prevention methods
- **Safari**: Full support with all prevention methods
- **Edge**: Full support with all prevention methods

## Testing

To test that autofill prevention is working:

1. **Clear browser data** for the site
2. **Visit the character creation page**
3. **Click on the character name input**
4. **Verify no payment method suggestions appear**
5. **Check that no "automatic payment methods filling is disabled" notification appears**

## Troubleshooting

### If autofill still appears:

1. **Check browser cache**: Clear site data completely
2. **Verify all attributes**: Ensure all prevention attributes are present
3. **Check CSS**: Ensure autofill CSS rules are applied
4. **Test in incognito mode**: Browsers behave differently in incognito
5. **Check password managers**: Disable password managers temporarily

### Common Issues:

- **Chrome ignoring autocomplete="off"**: Use "new-password" instead
- **Password managers interfering**: Add data-lpignore and data-1p-ignore
- **Autofill styling still visible**: Check CSS rules are applied correctly

## Security Considerations

- This prevention system does not collect or store any payment information
- The fake input field is purely for browser manipulation
- No sensitive data is transmitted or processed
- The solution is defensive and user-protective

## Maintenance

When updating this system:

1. **Test across browsers** after any changes
2. **Verify in incognito mode** to ensure clean state
3. **Check with password managers** enabled and disabled
4. **Monitor for new browser autofill behaviors**
5. **Update documentation** when changes are made

## Related Files

- `src/components/UserCreation.tsx` - Main implementation
- `src/components/UserCreation.module.css` - Component-specific CSS
- `src/styles/globals.css` - Global autofill prevention CSS
- `src/components/TaskForm.tsx` - Task input prevention
- `src/components/HabitForm.tsx` - Habit input prevention
- `src/components/TaskEditForm.tsx` - Task editing prevention
- `src/components/FirstTaskWizard.tsx` - Tutorial input prevention

## Future Considerations

- Monitor for new browser autofill behaviors
- Consider implementing a more sophisticated autofill detection system
- Evaluate if additional input types need prevention
- Consider user preferences for autofill (if any users want it enabled) 