# 8-Bit Synthesizer - Dual Implementation

A fully-featured 8-bit synthesizer available in both React TypeScript and standalone HTML/JavaScript versions, designed for the Scrypture productivity application.

## 🎵 Features

### Core Functionality
- **Interactive Piano Keyboard**: Click or drag to play notes, keyboard shortcuts (A-K keys)
- **Real-time Status Display**: Shows current note and frequency with clean, minimal interface
- **Multiple Waveforms**: Sine, Square, Triangle, Sawtooth
- **Advanced Audio Controls**: Volume, Attack, Release, Detune, LFO, Reverb
- **Chord System**: Major, minor, diminished, and extended chords
- **Comprehensive Chord Progressions**: 50+ progressions across 11 categories (Classic, Jazz, Blues, Pop, Rock, Folk, Country, Electronic, Mood-Based, Advanced, Modal)
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
- Comprehensive chord progression library organized by genre and mood
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

### Chord Progression Organization
The chord progressions are organized into logical sections for easy navigation:

#### Genre-Based Sections
- **🎵 Classic Progressions**: Fundamental music theory progressions
- **🎷 Jazz Progressions**: Jazz standards and complex harmonies
- **🎸 Blues Progressions**: Traditional blues patterns
- **🎵 Pop Progressions**: Popular music progressions
- **🤘 Rock Progressions**: Rock and power chord patterns
- **🌿 Folk Progressions**: Traditional folk music patterns
- **🤠 Country Progressions**: Country and western patterns
- **🎛️ Electronic Progressions**: Electronic and ambient patterns

#### Mood-Based Sections
- **😊 Mood-Based Progressions**: Emotional and atmospheric progressions
- **🎼 Advanced Progressions**: Complex and extended harmonies
- **🎵 Modal Progressions**: Modal music theory progressions

Each section contains multiple variations and complexity levels, making it easy to find the perfect progression for any musical style or mood.

## 🎼 Musical Features

### Chords
- **Basic Chords**: C, Dm, Em, F, G, Am, Bdim
- **Extended Chords**: Cmaj7, Dmin7, Emin7, Fmaj7, G7, Amin7, Bm7b5
- **Mood Collections**: Happy, Sad, Tense, Dreamy

### Chord Progressions
The synthesizer includes **50+ chord progressions** organized into 11 categories:

- **6 Classic Progressions**: Fundamental music theory patterns
- **5 Jazz Progressions**: Jazz standards and complex harmonies  
- **3 Blues Progressions**: Traditional blues patterns
- **4 Pop Progressions**: Popular music progressions
- **3 Rock Progressions**: Rock and power chord patterns
- **3 Folk Progressions**: Traditional folk music patterns
- **3 Country Progressions**: Country and western patterns
- **3 Electronic Progressions**: Electronic and ambient patterns
- **8 Mood-Based Progressions**: Emotional and atmospheric progressions
- **6 Advanced Progressions**: Complex and extended harmonies
- **3 Modal Progressions**: Modal music theory progressions

Each progression is carefully crafted to provide authentic musical patterns for composition, learning, and creative exploration.

### Progressions
The synthesizer includes an extensive collection of chord progressions organized by genre, mood, and complexity:

#### Classic Progressions
- **I-IV-V**: The most fundamental progression (C-F-G)
- **ii-V-I**: Jazz standard progression (Dm-G-C)
- **I-V-vi-IV**: Popular music progression (C-G-Am-F)
- **vi-IV-I-V**: Sad/melancholic progression (Am-F-C-G)
- **I-vi-ii-V**: Extended classic progression (C-Am-Dm-G)
- **ii-vi-I-V**: Alternative classic progression (Dm-Am-C-G)

#### Extended Classic Progressions
- **I-IV-V-IV**: Extended I-IV-V with repetition (C-F-G-F)
- **I-V-vi-iii**: Modal progression (C-G-Am-Em)
- **I-vi-IV-V**: Alternative pop progression (C-Am-F-G)
- **vi-V-IV-III**: Descending progression (Am-G-F-Em)

#### Jazz Progressions
- **Jazz**: Standard jazz progression (Dm7-G7-Cmaj7-Fmaj7)
- **Jazz II-V-I**: Essential jazz progression (Dm7-G7-Cmaj7)
- **Jazz Turnaround**: Classic turnaround (Cmaj7-Am7-Dm7-G7)
- **Jazz Minor**: Minor jazz progression (Am7-Dm7-G7-Cmaj7)
- **Jazz Blues**: Jazz blues progression (Cmaj7-Fmaj7-G7-Cmaj7)

#### Blues Progressions
- **Blues**: Basic blues progression (C-F-G7-C)
- **Blues 12-Bar**: Extended 12-bar blues (C-F-C-G7-F-C)
- **Blues Minor**: Minor blues progression (Am-Dm-Am-E7-Dm-Am)

#### Pop Progressions
- **Pop**: Standard pop progression (C-G-Am-F)
- **Pop Rock**: Rock-influenced pop (C-F-G-Am)
- **Pop Ballad**: Ballad-style pop (C-Am-F-G)
- **Pop Upbeat**: Upbeat pop progression (C-F-G-C)

#### Rock Progressions
- **Rock**: Classic rock progression (C-F-G-C)
- **Rock Minor**: Minor rock progression (Am-Dm-Em-Am)
- **Rock Power**: Power chord progression (C-F-G-Am)

#### Folk Progressions
- **Folk**: Traditional folk progression (C-F-G-Am)
- **Folk Minor**: Minor folk progression (Am-Dm-G-Am)
- **Folk Ballad**: Folk ballad progression (C-Am-F-G)

#### Country Progressions
- **Country**: Classic country progression (C-F-G-C)
- **Country Ballad**: Country ballad progression (C-Am-F-G)
- **Country Rock**: Country rock progression (C-F-G-Am)

#### Electronic Progressions
- **Electronic**: Electronic music progression (C-Am-F-G)
- **House**: House music progression (C-F-G-Am)
- **Ambient**: Ambient music progression (Cmaj7-Fmaj7-Am7-Gmaj7)

#### Mood-Based Progressions
- **😊 Happy**: Bright, uplifting progression (C-F-G-C)
- **😢 Sad**: Melancholic progression (Am-Dm-Em-Am)
- **😤 Tense**: Suspenseful progression (G7-Bdim-Dm7-G7)
- **😌 Dreamy**: Ethereal progression (Fmaj7-Em7-Cmaj7-Am7)
- **🔮 Mysterious**: Mysterious progression (Am-Em-Dm-Am)
- **🕊️ Peaceful**: Calming progression (Cmaj7-Fmaj7-Gmaj7-Cmaj7)
- **⚡ Energetic**: High-energy progression (C-G-F-G)
- **🌧️ Melancholic**: Deeply sad progression (Am-F-C-G)

#### Advanced Progressions
- **Advanced Jazz**: Complex jazz progression (Dm7-G7-Cmaj7-Am7-Dm7-G7)
- **Advanced Pop**: Extended pop progression (C-Am-F-G-C-F-G-C)
- **Advanced Blues**: Extended blues progression (C-F-C-G7-F-C-G7-C)
- **Extended Harmony**: Rich harmony progression (Cmaj7-Dm7-Em7-Fmaj7)
- **Rich Harmony**: Complex harmony progression (Cmaj7-Am7-Fmaj7-G7)
- **Complex Jazz**: Advanced jazz progression (Dm7-G7-Cmaj7-Fmaj7-Bm7-E7)

#### Modal Progressions
- **Dorian**: Dorian mode progression (Dm-G-C-Dm)
- **Mixolydian**: Mixolydian mode progression (G-F-C-G)
- **Lydian**: Lydian mode progression (F-G-C-F)

### Circle of Fifths
Interactive circle showing:
- Major keys (green)
- Dominant chords (orange)
- Diminished chords (red)
- Click to play corresponding chords

## 🦫 Scrypture Integration

The synthesizer includes enhanced presets specifically designed for the Scrypture productivity app, featuring advanced audio effects for a more engaging and polished user experience:

### 🎛️ Enhanced Audio Effects
All Scrypture presets now utilize modern audio processing techniques:

#### **Filter Effects**
- **High-pass filters** (600-2000Hz) for crisp, focused sounds
- **Low-pass filters** (2500-4000Hz) for warm, mellow tones
- **Bandpass filters** (1500-2000Hz) for unique, focused frequencies
- **Resonance control** (0.5-2.0) for filter character

#### **Compression Effects**
- **Threshold control** (-20 to -8dB) for dynamic range control
- **Ratio control** (1.1-2.0) for compression intensity
- **Fast attack** (0.001-0.02s) for transient control
- **Quick release** (0.02-0.15s) for natural dynamics

#### **Delay Effects**
- **Short delays** (0.05-0.3s) for spatial depth and echo
- **Feedback control** (0.1-0.4) for echo decay
- **Mix control** (0.1-0.3) for wet/dry balance

#### **Chorus Effects**
- **Rate control** (0.6-1.2Hz) for modulation speed
- **Depth control** (0.002-0.006) for modulation intensity
- **Mix control** (0.2-0.5) for chorus presence

#### **Distortion Effects**
- **Soft distortion** for warm, musical saturation
- **Amount control** (0.2-0.3) for harmonic richness

#### **Stereo Effects**
- **Stereo width** (1.1-1.5x) for spatial enhancement
- **Panning control** for stereo positioning

### Achievement Sounds
- **🏆 Common**: Clean sine wave with high-pass filter (800Hz), compression (-20dB), and short delay (0.1s)
- **💎 Rare**: Rich triangle wave with low-pass filter (3000Hz), chorus (1.2Hz), delay (0.2s), and stereo width (1.3x)
- **👑 Legendary**: Complex sawtooth wave with bandpass filter (2000Hz), chorus (0.8Hz), delay (0.3s), distortion (30%), and stereo width (1.5x)

### UI Feedback
- **✅ Task Complete**: Quick sine wave with high-pass filter (1200Hz) and compression (-15dB)
- **⭐ Level Up**: Exciting square wave with low-pass filter (4000Hz), chorus (1.0Hz), delay (0.15s), and stereo width (1.2x)
- **🖱️ UI Click**: Subtle sine wave with high-pass filter (2000Hz) and compression (-10dB)
- **📝 Form Submit**: Positive triangle wave with low-pass filter (3500Hz), chorus (0.9Hz), and compression (-12dB)
- **🔲 Modal Open**: Attention-grabbing sine wave with high-pass filter (1000Hz), short delay (0.05s), and compression (-8dB)
- **📈 XP Gain**: Rewarding triangle wave with low-pass filter (2800Hz), chorus (1.0Hz), and compression (-14dB)

### Game Elements
- **🦫 Bóbr Greeting**: Friendly triangle wave with low-pass filter (2500Hz), chorus (0.6Hz), delay (0.25s), and stereo width (1.1x)
- **🏗️ Dam Build**: Construction square wave with high-pass filter (600Hz), distortion (20%), compression (-18dB), and delay (0.1s)
- **🔥 Streak Milestone**: Achievement sine wave with bandpass filter (1500Hz), chorus (1.1Hz), delay (0.2s), and stereo width (1.25x)

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