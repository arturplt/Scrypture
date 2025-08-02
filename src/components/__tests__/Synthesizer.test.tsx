import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Synthesizer } from '../Synthesizer';

// Mock the Web Audio API
const mockAudioContext = {
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { value: 0.2, setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() }
  })),
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 440 },
    detune: { value: 0, setValueAtTime: jest.fn() },
    type: 'sine'
  })),
  createConvolver: jest.fn(() => ({
    connect: jest.fn(),
    buffer: null
  })),
  createBuffer: jest.fn(() => ({
    getChannelData: jest.fn(() => new Float32Array(1000))
  })),
  createDelay: jest.fn(() => ({
    connect: jest.fn(),
    delayTime: { value: 0.3 }
  })),
  createBiquadFilter: jest.fn(() => ({
    connect: jest.fn(),
    frequency: { value: 2000 },
    Q: { value: 1 },
    type: 'lowpass'
  })),
  createDynamicsCompressor: jest.fn(() => ({
    connect: jest.fn(),
    threshold: { value: -24 },
    ratio: { value: 4 },
    attack: { value: 0.003 },
    release: { value: 0.25 }
  })),
  createStereoPanner: jest.fn(() => ({
    connect: jest.fn(),
    pan: { value: 0 }
  })),
  createWaveShaper: jest.fn(() => ({
    connect: jest.fn(),
    curve: new Float32Array(44100)
  })),
  sampleRate: 44100,
  currentTime: 0,
  destination: {},
  state: 'running',
  close: jest.fn(),
  resume: jest.fn()
};

global.AudioContext = jest.fn(() => mockAudioContext) as any;
(global as any).webkitAudioContext = global.AudioContext;

// Mock the synthesizer hook
jest.mock('../../hooks/useSynthesizer', () => ({
  useSynthesizer: () => ({
    state: {
      waveform: 'sine',
      volume: 80,
      attack: 1,
      release: 10,
      detune: 0,
      reverbEnabled: false,
      lfoRate: 0,
      lfoDepth: 5,
      lfoTarget: 'pitch',
      sustainMode: false,
      bpm: 120,
      steps: 16,
      currentStep: 0,
      isPlaying: false,
      drawMode: false,
      isDraggingCircle: false,
      delayEnabled: false,
      delayTime: 0.5,
      delayFeedback: 0.3,
      delayMix: 0.5,
      chorusEnabled: false,
      chorusRate: 1.5,
      chorusDepth: 0.3,
      chorusMix: 0.5,
      distortionEnabled: false,
      distortionType: 'soft',
      distortionAmount: 0.5,
      filterEnabled: false,
      filterType: 'lowpass',
      filterFrequency: 1000,
      filterResonance: 1,
      compressionEnabled: false,
      compressionThreshold: -20,
      compressionRatio: 4,
      compressionAttack: 0.003,
      compressionRelease: 0.25,
      stereoWidth: 1,
      panningEnabled: false,
      panningAmount: 0,
      arpeggiatorMode: 'off',
      arpeggiatorRate: 8,
      trackState: {
        tracks: [
          {
            id: 'track-1',
            name: 'Melody',
            note: 'C',
            category: 'melody',
            instrument: 'sine',
            color: '#ff6b6b',
            volume: 100,
            pan: 0,
            muted: false,
            solo: false,
            sequence: new Array(16).fill(false),
            envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.5 },
            lfo: { enabled: false, rate: 1, depth: 0.1, waveform: 'sine' },
            effects: {
              delay: { enabled: false, time: 0.3, feedback: 0.3, mix: 0.5 },
              chorus: { enabled: false, rate: 1.5, depth: 0.002, mix: 0.5 },
              distortion: { enabled: false, amount: 0.3 }
            }
          }
        ],
        showTrackEditor: false
      }
    },
    activeNotes: {},
    startNote: jest.fn(),
    stopNote: jest.fn(),
    playChord: jest.fn(),
    playProgression: jest.fn(),
    updateState: jest.fn(),
    setWaveform: jest.fn(),
    toggleSustain: jest.fn(),
    resetVolume: jest.fn(),
    resetAttack: jest.fn(),
    resetRelease: jest.fn(),
    resetLfoRate: jest.fn(),
    resetLfoDepth: jest.fn(),
    resetArpeggiatorRate: jest.fn(),
    setArpeggiatorMode: jest.fn(),
    loadPreset: jest.fn(),
    loadPattern: jest.fn(),
    playSequence: jest.fn(),
    stopSequence: jest.fn(),
    clearSequence: jest.fn(),
    toggleDrawMode: jest.fn(),
    updateTrackSequence: jest.fn(),
    toggleTrackMute: jest.fn(),
    toggleTrackSolo: jest.fn(),
    updateTrack: jest.fn(),
    selectTrack: jest.fn(),
    toggleTrackEditor: jest.fn(),
    getSelectedTrack: jest.fn(() => ({
      id: 'track-1',
      name: 'Melody',
      note: 'C',
      category: 'melody',
      instrument: 'sine',
      color: '#ff6b6b',
      volume: 100,
      pan: 0,
      muted: false,
      solo: false,
      sequence: new Array(16).fill(false),
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.5 },
      lfo: { enabled: false, rate: 1, depth: 0.1, waveform: 'sine' },
      effects: {
        delay: { enabled: false, time: 0.3, feedback: 0.3, mix: 0.5 },
        chorus: { enabled: false, rate: 1.5, depth: 0.002, mix: 0.5 },
        distortion: { enabled: false, amount: 0.3 }
      }
    })),
    createTrack: jest.fn(),
    clearAllTracks: jest.fn(),
    loadTrackPreset: jest.fn(),
    duplicateTrack: jest.fn(),
    deleteTrack: jest.fn(),
    handleKeyDown: jest.fn(),
    handleKeyUp: jest.fn(),
    handleMouseDown: jest.fn(),
    handleMouseUp: jest.fn()
  })
}));

describe('Synthesizer', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<Synthesizer {...defaultProps} />);
    
    // Check for the header title specifically
    expect(screen.getByRole('heading', { level: 2, name: '8-BIT SYNTHESIZER' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '8-BIT SYNTHESIZER' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Synthesizer {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('heading', { name: '8-BIT SYNTHESIZER' })).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Synthesizer {...defaultProps} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('renders sequencer controls', () => {
    render(<Synthesizer {...defaultProps} />);
    
    expect(screen.getByText('BPM: 120')).toBeInTheDocument();
    expect(screen.getByText('Steps: 16')).toBeInTheDocument();
    expect(screen.getByText('▶️ Play')).toBeInTheDocument();
    expect(screen.getByText('🗑️ Clear')).toBeInTheDocument();
    expect(screen.getByText('✏️ Draw Mode')).toBeInTheDocument();
  });

  it('renders track management controls', () => {
    render(<Synthesizer {...defaultProps} />);
    
    expect(screen.getByText('🗑️ Clear All Tracks')).toBeInTheDocument();
    expect(screen.getByText('➕ Add Track')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Show Editor')).toBeInTheDocument();
  });

  it('renders basic controls', () => {
    render(<Synthesizer {...defaultProps} />);
    
    // Use getAllByText to handle multiple Volume elements
    expect(screen.getAllByText('Volume')).toHaveLength(2); // One in label, one in button
    expect(screen.getByText('Attack')).toBeInTheDocument();
    expect(screen.getByText('Release')).toBeInTheDocument();
    expect(screen.getByText('Waveform')).toBeInTheDocument();
  });

  it('renders waveform buttons', () => {
    render(<Synthesizer {...defaultProps} />);
    
    expect(screen.getByText('Sine')).toBeInTheDocument();
    expect(screen.getByText('Square')).toBeInTheDocument();
    expect(screen.getByText('Triangle')).toBeInTheDocument();
    expect(screen.getByText('Sawtooth')).toBeInTheDocument();
  });

  it('renders collapsible sections', () => {
    render(<Synthesizer {...defaultProps} />);
    
    expect(screen.getByText('🎹 Instrument Preset Library')).toBeInTheDocument();
    expect(screen.getByText('🎼 CHORD PROGRESSIONS SECTION')).toBeInTheDocument();
    expect(screen.getByText('🎯 Circle of Fifths')).toBeInTheDocument();
    expect(screen.getByText('😊 Mood Chords')).toBeInTheDocument();
    expect(screen.getByText('🎼 Plain Chords')).toBeInTheDocument();
  });

  it('renders pattern buttons', () => {
    render(<Synthesizer {...defaultProps} />);
    
    // Check for pattern buttons 0-9 - use getAllByText to handle duplicates
    for (let i = 0; i <= 9; i++) {
      expect(screen.getAllByText(i.toString()).length).toBeGreaterThan(0);
    }
  });

  it('renders track presets', () => {
    render(<Synthesizer {...defaultProps} />);
    
    expect(screen.getByText('🎵 Electronic Beat')).toBeInTheDocument();
    expect(screen.getByText('🌊 Ambient Pad')).toBeInTheDocument();
    expect(screen.getByText('🎷 Jazz Quartet')).toBeInTheDocument();
    expect(screen.getByText('🎼 Orchestral Suite')).toBeInTheDocument();
    expect(screen.getByText('🌆 Synthwave Dream')).toBeInTheDocument();
    expect(screen.getByText('☕ Lo-Fi Chill')).toBeInTheDocument();
    expect(screen.getByText('🎛️ Dubstep Bass')).toBeInTheDocument();
  });
}); 