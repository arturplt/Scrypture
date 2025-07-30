# 8-Bit Synthesizer - Dual Implementation

A fully-featured 8-bit synthesizer available in both React TypeScript and standalone HTML/JavaScript versions, designed for the Scrypture productivity application.

## 🎵 Features

### Core Functionality
- **Interactive Piano Keyboard**: Click or drag to play notes, keyboard shortcuts (A-K keys)
- **Real-time Status Display**: Shows current note and frequency with clean, minimal interface
- **Multiple Waveforms**: Sine, Square, Triangle, Sawtooth
- **Advanced Audio Controls**: Volume, Attack, Release, Detune, LFO, Reverb
- **Chord System**: Major, minor, diminished, and extended chords
- **Chord Progressions**: Classic progressions (I-IV-V, ii-V-I) and mood-based collections
- **Circle of Fifths**: Interactive music theory exploration
- **Step Sequencer**: 16-step sequencer with pattern presets
- **Scrypture Integration**: Game-themed sound presets for achievements and UI feedback
- **DataManager Integration**: Easy access through the DataManager's Tools section

### Technical Features
- **Dual Implementation**: React TypeScript + Standalone HTML/JavaScript
- **TypeScript**: Full type safety and better developer experience (React version)
- **React Hooks**: Custom `useSynthesizer` hook for state management
- **Web Audio API**: Modern audio processing with real-time synthesis
- **Anti-Clipping System**: Advanced audio protection with limiter and gain optimization
- **Responsive Design**: Works on desktop and mobile devices
- **CSS Modules**: Scoped styling with the Scrypture design system
- **Comprehensive Testing**: Unit tests with React Testing Library

## 🏗️ Architecture

### React TypeScript Version
```
src/
├── components/
│   ├── Synthesizer.tsx              # Main component
│   ├── Synthesizer.module.css       # Styles
│   ├── DataManager.tsx              # Component with synthesizer integration
│   ├── DataManager.module.css       # Styles for synthesizer container
│   └── __tests__/
│       └── Synthesizer.test.tsx     # Tests
├── hooks/
│   └── useSynthesizer.tsx           # Custom hook
├── types/
│   └── synthesizer.ts               # TypeScript interfaces
└── data/
    └── synthesizerData.ts           # Musical data constants
```


### Key Components

#### React Version: `useSynthesizer` Hook
The core of the synthesizer functionality, managing:
- Audio context and Web Audio API nodes
- Synthesizer state (waveform, volume, effects, etc.)
- Note playback and chord generation
- Sequencer logic and pattern management
- Keyboard and mouse event handling

#### React Version: `Synthesizer` Component
The main UI component featuring:
- Collapsible sections for organization
- Interactive controls with real-time updates
- Real-time status display (note name + frequency)
- Responsive design for all screen sizes
- Touch and mouse support

#### React Version: `DataManager` Integration
The synthesizer is integrated into the DataManager component:
- **Tools Section**: "Show/Hide Synthesizer" button in the DataManager
- **Bottom Placement**: Synthesizer appears at the bottom of the page when activated
- **Seamless Integration**: Maintains the Scrypture design system and styling
- **Easy Access**: Quick access to the synthesizer without leaving the main app

#### Sustain Pedal Behavior
The synthesizer now mimics a real piano sustain pedal:
- **Hold Shift**: Enables sustain mode (notes continue playing)
- **Release Shift**: Disables sustain and stops all playing notes
- **Realistic Feel**: Just like pressing and releasing a piano pedal
- **Visual Feedback**: Status bar shows sustain state
- **Panic Button**: ESC key stops all sounds immediately

#### Standalone Version: JavaScript Module
Complete synthesizer functionality in vanilla JavaScript:
- Audio context management
- Note generation and playback
- Chord and progression system
- Sequencer implementation
- UI event handling
- Status display updates

#### Type System (React Version)
Comprehensive TypeScript interfaces for:
- Musical data (notes, chords, progressions)
- Synthesizer state and parameters
- Audio processing nodes and connections
- Component props and event handlers

## 🎛️ Controls

### Basic Controls
- **Volume**: Master volume control (0-100%)
- **Attack**: Note attack time (0-100ms)
- **Release**: Note release time (0-100ms)
- **Detune**: Pitch detuning (-100 to +100 cents)
- **Reverb**: On/off reverb effect
- **LFO Rate**: Low-frequency oscillator rate (0-10Hz)
- **LFO Depth**: LFO modulation depth (0-50)
- **LFO Target**: Modulation target (pitch, volume, filter)
- **Sustain**: Momentary sustain mode (hold Shift key or use button)
- **Panic**: Stop all sounds (ESC key)

### Status Display
- **Real-time Note Display**: Shows current playing note (e.g., "A", "C#")
- **Frequency Display**: Shows frequency in Hz (e.g., "440 Hz")
- **Active Keys**: Shows all currently playing keys
- **Sustain Status**: Shows "Sustain: ON" when sustain mode is active
- **Playing Status**: Pulsing indicator when sequencer is active
- **Clean Design**: No background/border, minimal interface
- **Auto-hide**: Only displays when notes are playing

### Waveform Selection
- **Sine**: Pure, smooth tones
- **Square**: Rich harmonics, classic 8-bit sound
- **Triangle**: Warm, mellow tones
- **Sawtooth**: Bright, cutting tones

### Sequencer Controls
- **BPM**: Tempo control (60-200 BPM)
- **Steps**: Pattern length (4-16 steps)
- **Play/Stop**: Transport controls
- **Clear**: Reset pattern
- **Draw Mode**: Click to toggle step sequencer mode

## 🎼 Musical Features

### Chords
- **Basic Chords**: C, Dm, Em, F, G, Am, Bdim
- **Extended Chords**: Cmaj7, Dmin7, Emin7, Fmaj7, G7, Amin7, Bm7b5
- **Mood Collections**: Happy, Sad, Tense, Dreamy

### Progressions
- **Classic**: I-IV-V, ii-V-I, I-V-vi-IV, vi-IV-I-V
- **Mood-Based**: Happy, Sad, Tense, Dreamy, Jazz, Blues

### Circle of Fifths
Interactive circle showing:
- Major keys (green)
- Dominant chords (orange)
- Diminished chords (red)
- Click to play corresponding chords

## 🦫 Scrypture Integration

The synthesizer includes presets specifically designed for the Scrypture productivity app:

### Achievement Sounds
- **Common**: Simple, satisfying completion sound
- **Rare**: Enhanced with reverb and LFO
- **Legendary**: Complex, celebratory sound with arpeggiation

### UI Feedback
- **Task Complete**: Quick confirmation sound
- **Level Up**: Exciting progression sound
- **UI Click**: Subtle interface feedback
- **Form Submit**: Positive submission sound
- **Modal Open**: Attention-grabbing sound
- **XP Gain**: Rewarding experience sound

### Game Elements
- **Bóbr Greeting**: Friendly companion sound
- **Dam Build**: Construction progress sound
- **Streak Milestone**: Achievement celebration

## 🚀 Usage

### React TypeScript Version

#### Basic Implementation
```tsx
import { Synthesizer } from './components/Synthesizer';

function App() {
  return (
    <div>
      <h1>My Music App</h1>
      <Synthesizer />
    </div>
  );
}
```

#### Keyboard Controls
- **A-K**: Play piano keys (C through C)
- **Shift (hold)**: Sustain mode (like piano pedal - hold to sustain, release to stop)
- **ESC**: Stop all sounds immediately
- **Space**: Play/Stop sequencer
- **0-9**: Load sequencer patterns
- **Mouse**: Click and drag to play keys

#### DataManager Integration
The synthesizer is now integrated into the DataManager component for easy access:

```tsx
import { DataManager } from './components/DataManager';

function App() {
  return (
    <div>
      <DataManager />
      {/* Synthesizer can be accessed via the "Show Synthesizer" button */}
    </div>
  );
}
```

The synthesizer appears at the bottom of the page when activated through the DataManager's Tools section.

#### Custom Hook Usage
```tsx
import { useSynthesizer } from './hooks/useSynthesizer';

function CustomComponent() {
  const synth = useSynthesizer();
  
  const playNote = () => {
    synth.startNote(440); // Play A4
  };
  
  const playChord = () => {
    synth.playChord('Cmaj'); // Play C major
  };
  
  return (
    <div>
      <button onClick={playNote}>Play A</button>
      <button onClick={playChord}>Play C Major</button>
    </div>
  );
}
```

### Standalone HTML/JavaScript Version

#### Basic Setup
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="synthesizer.css">
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <h1>8-BIT SYNTHESIZER</h1>
        <!-- Synthesizer interface -->
    </div>
    
    <script src="synthesizer-data.js"></script>
    <script src="synthesizer.js"></script>
</body>
</html>
```

#### Direct JavaScript Usage
```javascript
// Access the synthesizer module
const synth = window.SynthesizerModule;

// Play a note
synth.startNote(440); // A4

// Play a chord
synth.playChord('Cmaj');

// Load a preset
synth.loadPreset('piano');

// Get current state
const state = synth.getState();
```

## 🧪 Testing

### React Version
Run tests with:
```bash
npm test Synthesizer
```

The test suite covers:
- Component rendering
- User interactions
- Audio functionality (mocked)
- State management
- Responsive design

### Standalone Version
Open `test-synthesizer.html` in a browser to test the standalone implementation.

## 🎨 Styling

### React Version
Uses CSS Modules with the Scrypture design system:
- **Color Palette**: Consistent with the main app
- **Typography**: Press Start 2P font for 8-bit aesthetic
- **Spacing**: Standardized spacing variables
- **Responsive**: Mobile-first design approach
- **Accessibility**: High contrast and keyboard navigation

### Standalone Version
Uses traditional CSS with the same design system:
- **8-bit Aesthetic**: Pixelated fonts and retro styling
- **Status Display**: Clean, minimal interface
- **Responsive**: Works on all screen sizes
- **Dark Theme**: Consistent with Scrypture design

## 🔧 Development

### Prerequisites
- **React Version**: React 18+, TypeScript 4.5+, Web Audio API support
- **Standalone Version**: Modern browser with Web Audio API support
- **Both**: Chrome, Firefox, Safari, Edge

### Audio Context
Both versions automatically initialize the Web Audio API context. Users may need to interact with the page first (click/tap) to enable audio playback due to browser autoplay policies.

### Performance
- Audio nodes are properly cleaned up to prevent memory leaks
- State updates are optimized (React version uses React.memo and useCallback)
- Audio processing is handled efficiently with Web Audio API
- Real-time status display updates without performance impact
- Anti-clipping protection prevents audio distortion and maintains quality

## 📁 File Descriptions

### React TypeScript Files
- **Synthesizer.tsx**: Main React component with status display
- **useSynthesizer.tsx**: Custom hook for audio logic
- **synthesizer.ts**: TypeScript type definitions
- **synthesizerData.ts**: Musical data (notes, chords, presets)
- **Synthesizer.module.css**: Scoped CSS styles
- **DataManager.tsx**: Component with synthesizer integration
- **DataManager.module.css**: Styles for synthesizer container

### Standalone Files
- **synthesizer.html**: Complete HTML interface
- **synthesizer.js**: Core JavaScript implementation (1400+ lines)
- **synthesizer.css**: Complete CSS styling
- **synthesizer-data.js**: Musical data as JavaScript objects
- **test-synthesizer.html**: Test page for standalone version

## 🛡️ Anti-Clipping System

The synthesizer includes a comprehensive anti-clipping system to prevent audio distortion:

### Dynamic Limiter
- **Hard Limiter**: Dynamics compressor with -1dB threshold and 20:1 ratio
- **Fast Response**: 1ms attack and 100ms release for immediate protection
- **Transparent Operation**: Minimal impact on normal audio levels

### Intelligent Gain Management
- **Note Count Optimization**: Gain automatically reduces based on number of simultaneous notes
- **Chord Protection**: Multi-note chords use logarithmic gain reduction
- **Volume Capping**: Master volume limited to 80% to maintain headroom

### Gain Reduction Algorithm
```
Single Note:    100% gain (0.8)
2 Notes:        85% gain (0.68)
3 Notes:        70% gain (0.56)
4 Notes:        60% gain (0.48)
5 Notes:        50% gain (0.4)
6 Notes:        45% gain (0.36)
7 Notes:        40% gain (0.32)
8+ Notes:       35% gain (0.28)
```

### Benefits
- **No Distortion**: Clean audio output at all volume levels
- **Chord Clarity**: Multi-note chords remain clear and undistorted
- **Dynamic Range**: Preserves musical dynamics while preventing clipping
- **Automatic Operation**: No user intervention required

## 🎯 Future Enhancements

Potential improvements and additions:
- **MIDI Support**: External MIDI device integration
- **Recording**: Audio recording and export
- **Effects**: More audio effects (delay, chorus, distortion)
- **Presets**: User-defined preset system
- **Collaboration**: Real-time collaborative jamming
- **Mobile**: Native mobile app integration
- **Status Display**: Additional visual feedback options
- **Advanced Compression**: Multi-band compression and limiting

## 📝 License

Part of the Scrypture project - a gamified productivity application.

## 🤝 Contributing

When contributing to the synthesizer:
1. Follow the existing TypeScript patterns (React version)
2. Maintain consistency between both implementations
3. Add tests for new functionality
4. Update documentation for both versions
5. Ensure audio performance is maintained
6. Test on multiple devices and browsers
7. Update status display for new features 