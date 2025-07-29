# Synthesizer Sound Engine Documentation

## Overview

The Synthesizer is a comprehensive 8-bit sound engine integrated into the Scrypture productivity application. It provides real-time audio synthesis, musical composition tools, and gamified sound feedback for user interactions. Built with modern Web Audio API and React TypeScript, it serves both as a standalone musical instrument and as an integrated sound system for the application.

## 🎵 Core Features

### Audio Synthesis
- **Real-time Synthesis**: Web Audio API-based sound generation
- **Multiple Waveforms**: Sine, Square, Triangle, Sawtooth
- **Advanced Controls**: Volume, Attack, Release, Detune, LFO, Reverb
- **Polyphonic Playback**: Support for multiple simultaneous notes

### Musical Tools
- **Interactive Piano Keyboard**: Click/drag interface with keyboard shortcuts
- **Chord System**: Major, minor, diminished, and extended chords
- **Chord Progressions**: Classic and mood-based progression collections
- **Circle of Fifths**: Interactive music theory exploration
- **Step Sequencer**: 16-step sequencer with pattern presets

### Scrypture Integration
- **Achievement Sounds**: Rarity-based audio feedback
- **UI Feedback**: Task completion, level up, form submission sounds
- **Game Elements**: Bóbr companion sounds, dam building audio
- **Custom Presets**: Application-specific sound configurations

## 🏗️ Architecture

### File Structure
```
src/
├── components/
│   ├── Synthesizer.tsx              # Main component
│   ├── Synthesizer.module.css       # Styled components
│   └── __tests__/
│       └── Synthesizer.test.tsx     # Component tests
├── hooks/
│   └── useSynthesizer.tsx           # Core audio logic
├── types/
│   └── synthesizer.ts               # TypeScript interfaces
└── data/
    └── synthesizerData.ts           # Musical data constants
```

### Core Components

#### `useSynthesizer` Hook
The central audio engine managing:
- **Audio Context**: Web Audio API initialization and management
- **State Management**: Synthesizer parameters and UI state
- **Note Playback**: Real-time note generation and cleanup
- **Effects Processing**: Reverb, LFO, and audio routing
- **Event Handling**: Keyboard, mouse, and touch interactions

#### `Synthesizer` Component
The main UI featuring:
- **Collapsible Sections**: Organized interface for different features
- **Interactive Controls**: Real-time parameter adjustment
- **Responsive Design**: Mobile and desktop compatibility
- **Accessibility**: Keyboard navigation and screen reader support

### Audio Processing Chain
```
Input → Oscillator → LFO → Filter → Envelope → Reverb → Output
```

## 🎛️ Controls & Parameters

### Basic Audio Controls
| Parameter | Range | Description |
|-----------|-------|-------------|
| Volume | 0-100% | Master volume control |
| Attack | 0-100ms | Note attack time |
| Release | 0-100ms | Note release time |
| Detune | -100 to +100 cents | Pitch detuning |
| Reverb | On/Off | Reverb effect toggle |

### LFO (Low-Frequency Oscillator)
| Parameter | Range | Description |
|-----------|-------|-------------|
| Rate | 0-10Hz | LFO frequency |
| Depth | 0-50 | Modulation intensity |
| Target | Pitch/Volume/Filter | Modulation destination |

### Waveform Types
- **Sine**: Pure, smooth tones - ideal for pads and ambient sounds
- **Square**: Rich harmonics, classic 8-bit sound - great for leads
- **Triangle**: Warm, mellow tones - good for bass and soft leads
- **Sawtooth**: Bright, cutting tones - perfect for aggressive sounds

## 🎼 Musical Features

### Note System
```typescript
interface Note {
  freq: number;      // Frequency in Hz
  key: string;       // Keyboard shortcut
  black?: boolean;   // Black key indicator
}
```

### Chord System
```typescript
interface Chord {
  name: string;                    // Chord name (e.g., "Cmaj")
  frequencies: number[];           // Note frequencies
  type: 'major' | 'minor' | 'diminished' | 'dominant' | 'maj7' | 'min7' | '7' | 'm7b5';
}
```

Available Chords:
- **Basic**: Cmaj, Dmin, Emin, Fmaj, Gmaj, Amin, Bdim
- **Extended**: Cmaj7, Dmin7, Emin7, Fmaj7, G7, Amin7, Bm7b5

### Chord Progressions
```typescript
interface ChordProgression {
  name: string;
  chords: string[];
  mood?: 'happy' | 'sad' | 'tense' | 'dreamy' | 'jazz' | 'blues';
}
```

Classic Progressions:
- **I-IV-V**: Cmaj → Fmaj → Gmaj (Pop/Rock)
- **ii-V-I**: Dmin → Gmaj → Cmaj (Jazz)
- **I-V-vi-IV**: Cmaj → Gmaj → Amin → Fmaj (Pop)

Mood-Based Collections:
- **Happy**: Upbeat major progressions
- **Sad**: Minor key melancholic sequences
- **Tense**: Diminished and dominant 7th chords
- **Dreamy**: Extended jazz harmonies

### Circle of Fifths
Interactive circular interface showing:
- **Major Keys** (green): Primary tonal centers
- **Dominant Chords** (orange): Secondary dominants
- **Diminished Chords** (red): Passing diminished chords

## 🦫 Scrypture Integration

### Achievement Sound System
```typescript
interface ScryptureSoundPreset extends AudioPreset {
  name: string;
  category: 'achievement' | 'task' | 'ui' | 'gameplay';
  rarity?: 'common' | 'rare' | 'legendary';
}
```

#### Achievement Categories
- **Common**: Simple completion sounds (sine wave, short duration)
- **Rare**: Enhanced with reverb and LFO modulation
- **Legendary**: Complex sounds with arpeggiation and multiple layers

#### UI Feedback Sounds
- **Task Complete**: Quick confirmation (200ms sine wave)
- **Level Up**: Exciting progression (ascending arpeggio)
- **Form Submit**: Positive feedback (major chord)
- **Modal Open**: Attention grabber (bright sawtooth)
- **XP Gain**: Rewarding experience (chord progression)

### Game Element Sounds
- **Bóbr Greeting**: Friendly companion sound (warm triangle wave)
- **Dam Build**: Construction progress (rhythmic pattern)
- **Streak Milestone**: Achievement celebration (complex chord sequence)

## 🎚️ Sequencer System

### Step Sequencer
```typescript
interface SequencerTrack {
  note: string;
  frequency: number;
  steps: boolean[];
}
```

Features:
- **16 Steps**: Configurable pattern length
- **Multiple Tracks**: Independent note sequences
- **Real-time Playback**: Synchronized with BPM
- **Pattern Presets**: Pre-built rhythmic patterns
- **Draw Mode**: Click-to-toggle step programming

### Pattern Presets
```typescript
const NUMBER_KEY_PATTERNS = {
  1: [0, 4, 8, 12],           // Basic 4/4 beat
  2: [0, 2, 4, 6, 8, 10, 12, 14], // Double time
  3: [0, 3, 6, 9, 12, 15],    // Triplet feel
  4: [0, 4, 8, 12, 1, 5, 9, 13], // Two-track pattern
  5: [0, 2, 4, 6, 8, 10, 12, 14, 1, 3, 5, 7, 9, 11, 13, 15], // Full pattern
};
```

## 🔧 Technical Implementation

### Audio Context Management
```typescript
const initAudio = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const masterGain = audioContext.createGain();
  const dryGain = audioContext.createGain();
  const wetGain = audioContext.createGain();
  const convolver = audioContext.createConvolver();
  
  // Audio routing setup
  masterGain.connect(audioContext.destination);
  dryGain.connect(masterGain);
  wetGain.connect(masterGain);
  convolver.connect(wetGain);
};
```

### Note Generation
```typescript
const startNote = (freq: number, element?: HTMLElement | null) => {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const lfo = audioContext.createOscillator();
  
  // Configure oscillator
  osc.frequency.value = freq;
  osc.type = state.waveform;
  
  // Apply effects and routing
  osc.connect(gain);
  gain.connect(dryGain);
  if (state.reverbEnabled) gain.connect(wetGain);
  
  // Start playback
  osc.start();
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(state.volume / 100, audioContext.currentTime + state.attack / 1000);
};
```

### State Management
```typescript
interface SynthesizerState {
  waveform: WaveformType;
  volume: number;
  attack: number;
  release: number;
  detune: number;
  reverbEnabled: boolean;
  lfoRate: number;
  lfoDepth: number;
  lfoTarget: 'pitch' | 'volume' | 'filter';
  sustainMode: boolean;
  bpm: number;
  steps: number;
  isPlaying: boolean;
  currentStep: number;
  drawMode: boolean;
  isDrawing: boolean;
  isDraggingCircle: boolean;
}
```

## 🎨 UI/UX Design

### Design Principles
- **8-Bit Aesthetic**: Retro gaming visual style
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: High contrast and keyboard navigation
- **Performance**: Optimized rendering and audio processing

### Color System
- **Primary**: Scrypture brand colors
- **Secondary**: Musical theory color coding
- **Accent**: Interactive element highlighting
- **Background**: Dark theme for reduced eye strain

### Typography
- **Font**: Press Start 2P (8-bit aesthetic)
- **Hierarchy**: Clear visual information architecture
- **Readability**: Optimized for small screens

## 🧪 Testing Strategy

### Test Coverage
- **Component Rendering**: UI element display and interaction
- **Audio Functionality**: Mocked Web Audio API testing
- **State Management**: Hook behavior and state updates
- **User Interactions**: Keyboard, mouse, and touch events
- **Integration**: Scrypture app integration testing

### Test Categories
```typescript
// Component tests
describe('Synthesizer Component', () => {
  test('renders all sections correctly');
  test('handles user interactions');
  test('updates state on parameter changes');
});

// Hook tests
describe('useSynthesizer Hook', () => {
  test('initializes audio context');
  test('manages note playback');
  test('handles state updates');
});

// Integration tests
describe('Scrypture Integration', () => {
  test('plays achievement sounds');
  test('responds to UI events');
  test('maintains audio context');
});
```

## 🚀 Performance Optimization

### Audio Performance
- **Node Cleanup**: Proper disposal of audio nodes
- **Memory Management**: Efficient note tracking and cleanup
- **Context Suspension**: Smart audio context management
- **Buffer Optimization**: Pre-computed impulse responses

### React Performance
- **Memoization**: React.memo for expensive components
- **Callback Optimization**: useCallback for event handlers
- **State Batching**: Efficient state updates
- **Render Optimization**: Minimal re-renders

### Mobile Optimization
- **Touch Events**: Optimized touch handling
- **Battery Life**: Efficient audio processing
- **Memory Usage**: Minimal memory footprint
- **Network**: No external audio dependencies

## 🔮 Future Enhancements

### Planned Features
- **MIDI Support**: External MIDI device integration
- **Audio Recording**: Capture and export functionality
- **Advanced Effects**: Delay, chorus, distortion
- **Preset System**: User-defined sound presets
- **Collaboration**: Real-time collaborative features
- **Mobile App**: Native mobile integration

### Technical Improvements
- **WebAssembly**: Performance-critical audio processing
- **Web Workers**: Background audio processing
- **Service Workers**: Offline audio capabilities
- **Web Audio Modules**: Modular audio processing

## 📚 API Reference

### Hook Methods
```typescript
const synth = useSynthesizer();

// Audio control
synth.startNote(frequency, element);
synth.stopNote(frequency, element);
synth.playChord(chordName);
synth.playProgression(progressionName);

// State management
synth.updateState({ volume: 50, waveform: 'square' });
synth.setWaveform('triangle');
synth.toggleSustain();

// Sequencer control
synth.playSequence();
synth.stopSequence();
synth.clearSequence();
synth.toggleDrawMode();
```

### Component Props
```typescript
interface SynthesizerProps {
  initialPreset?: string;
  autoPlay?: boolean;
  showTutorial?: boolean;
  onSoundPlay?: (soundType: string) => void;
  onStateChange?: (state: SynthesizerState) => void;
}
```

## 🛠️ Development Guide

### Setup Requirements
- **Node.js**: 16+ for development
- **React**: 18+ for component features
- **TypeScript**: 4.5+ for type safety
- **Web Audio API**: Modern browser support

### Development Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test Synthesizer

# Build for production
npm run build
```

### Browser Compatibility
- **Chrome**: 66+ (Full support)
- **Firefox**: 60+ (Full support)
- **Safari**: 14+ (Full support)
- **Edge**: 79+ (Full support)

### Audio Context Policies
Due to browser autoplay policies, users must interact with the page before audio playback is enabled. The synthesizer automatically handles this with user interaction detection.

## 📝 Contributing

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting
- **Testing**: Comprehensive test coverage

### Audio Guidelines
- **Performance**: Optimize for real-time processing
- **Memory**: Proper cleanup of audio resources
- **Compatibility**: Support for all target browsers
- **Accessibility**: Screen reader and keyboard support

### Documentation
- **Code Comments**: Clear inline documentation
- **Type Definitions**: Comprehensive TypeScript interfaces
- **Examples**: Usage examples and demos
- **Changelog**: Track feature additions and changes

---

*This synthesizer is a core component of the Scrypture sound engine, providing both musical creativity tools and gamified audio feedback for the productivity application.* 