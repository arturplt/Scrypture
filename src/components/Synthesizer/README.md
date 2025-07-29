# 8-Bit Synthesizer - React TypeScript Refactor

A fully-featured synthesizer component refactored from vanilla HTML/JavaScript to modern React with TypeScript.

## 🎵 Features

### Core Functionality
- **Interactive Piano Keyboard**: Click or drag to play notes, keyboard shortcuts (A-K keys)
- **Multiple Waveforms**: Sine, Square, Triangle, Sawtooth
- **Advanced Audio Controls**: Volume, Attack, Release, Detune, LFO, Reverb
- **Chord System**: Major, minor, diminished, and extended chords
- **Chord Progressions**: Classic progressions (I-IV-V, ii-V-I) and mood-based collections
- **Circle of Fifths**: Interactive music theory exploration
- **Step Sequencer**: 16-step sequencer with pattern presets
- **Scrypture Integration**: Game-themed sound presets for achievements and UI feedback

### Technical Features
- **TypeScript**: Full type safety and better developer experience
- **React Hooks**: Custom `useSynthesizer` hook for state management
- **Web Audio API**: Modern audio processing with real-time synthesis
- **Responsive Design**: Works on desktop and mobile devices
- **CSS Modules**: Scoped styling with the Scrypture design system
- **Comprehensive Testing**: Unit tests with React Testing Library

## 🏗️ Architecture

### File Structure
```
src/
├── components/
│   ├── Synthesizer.tsx              # Main component
│   ├── Synthesizer.module.css       # Styles
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

#### `useSynthesizer` Hook
The core of the synthesizer functionality, managing:
- Audio context and Web Audio API nodes
- Synthesizer state (waveform, volume, effects, etc.)
- Note playback and chord generation
- Sequencer logic and pattern management
- Keyboard and mouse event handling

#### `Synthesizer` Component
The main UI component featuring:
- Collapsible sections for organization
- Interactive controls with real-time updates
- Responsive design for all screen sizes
- Touch and mouse support

#### Type System
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

### Basic Implementation
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

### With Demo Page
```tsx
import { SynthesizerDemo } from './components/SynthesizerDemo';

function App() {
  return <SynthesizerDemo />;
}
```

### Custom Hook Usage
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

## 🧪 Testing

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

## 🎨 Styling

The synthesizer uses CSS Modules with the Scrypture design system:
- **Color Palette**: Consistent with the main app
- **Typography**: Press Start 2P font for 8-bit aesthetic
- **Spacing**: Standardized spacing variables
- **Responsive**: Mobile-first design approach
- **Accessibility**: High contrast and keyboard navigation

## 🔧 Development

### Prerequisites
- React 18+
- TypeScript 4.5+
- Web Audio API support
- Modern browser (Chrome, Firefox, Safari, Edge)

### Audio Context
The synthesizer automatically initializes the Web Audio API context. Users may need to interact with the page first (click/tap) to enable audio playback due to browser autoplay policies.

### Performance
- Audio nodes are properly cleaned up to prevent memory leaks
- State updates are optimized with React.memo and useCallback
- Audio processing is handled efficiently with Web Audio API

## 🎯 Future Enhancements

Potential improvements and additions:
- **MIDI Support**: External MIDI device integration
- **Recording**: Audio recording and export
- **Effects**: More audio effects (delay, chorus, distortion)
- **Presets**: User-defined preset system
- **Collaboration**: Real-time collaborative jamming
- **Mobile**: Native mobile app integration

## 📝 License

Part of the Scrypture project - a gamified productivity application.

## 🤝 Contributing

When contributing to the synthesizer:
1. Follow the existing TypeScript patterns
2. Add tests for new functionality
3. Update documentation
4. Ensure audio performance is maintained
5. Test on multiple devices and browsers 