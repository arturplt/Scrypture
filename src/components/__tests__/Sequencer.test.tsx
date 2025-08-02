import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

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
    activeNotes: {}, // Add this to prevent the error
    playSequence: jest.fn(),
    stopSequence: jest.fn(),
    clearSequence: jest.fn(),
    toggleDrawMode: jest.fn(),
    updateState: jest.fn(),
    updateTrackSequence: jest.fn(),
    loadPattern: jest.fn(),
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
    startNote: jest.fn(),
    stopNote: jest.fn(),
    playChord: jest.fn(),
    playProgression: jest.fn(),
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
    toggleTrackMute: jest.fn(),
    toggleTrackSolo: jest.fn(),
    updateTrack: jest.fn(),
    selectTrack: jest.fn(),
    toggleTrackEditor: jest.fn(),
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

// Import the MultiTrackSequencer component from Synthesizer
import { Synthesizer } from '../Synthesizer';

describe('Sequencer', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sequencer controls', () => {
    render(<Synthesizer {...defaultProps} />);
    
    // Check for BPM control
    expect(screen.getByText('BPM: 120')).toBeInTheDocument();
    const bpmSlider = screen.getAllByRole('slider')[0]; // Get the first slider (BPM)
    expect(bpmSlider).toBeInTheDocument();
    expect(bpmSlider).toHaveValue('120');
    
    // Check for Steps control
    expect(screen.getByText('Steps: 16')).toBeInTheDocument();
    const stepsSelect = screen.getByRole('combobox');
    expect(stepsSelect).toBeInTheDocument();
    expect(stepsSelect).toHaveValue('16');
  });

  it('renders sequencer buttons', () => {
    render(<Synthesizer {...defaultProps} />);
    
    expect(screen.getByText('▶️ Play')).toBeInTheDocument();
    expect(screen.getByText('🗑️ Clear')).toBeInTheDocument();
    expect(screen.getByText('✏️ Draw Mode')).toBeInTheDocument();
  });

  it('renders pattern buttons', () => {
    render(<Synthesizer {...defaultProps} />);
    
    expect(screen.getByText('Quick Patterns (Press 0-9):')).toBeInTheDocument();
    
    // Check for pattern buttons 0-9
    for (let i = 0; i <= 9; i++) {
      expect(screen.getAllByText(i.toString()).length).toBeGreaterThan(0);
    }
  });

  it('renders step numbers', () => {
    render(<Synthesizer {...defaultProps} />);
    
    // Check for step numbers 1-16
    for (let i = 1; i <= 16; i++) {
      expect(screen.getAllByText(i.toString()).length).toBeGreaterThan(0);
    }
  });

  it('renders track information', () => {
    render(<Synthesizer {...defaultProps} />);
    
    // Check for track name - use getAllByText to handle duplicates
    expect(screen.getAllByText('Melody').length).toBeGreaterThan(0);
    
    // Check for track note - use getAllByText to handle duplicates
    expect(screen.getAllByText('C').length).toBeGreaterThan(0);
    
    // Check for track category
    expect(screen.getByText('melody')).toBeInTheDocument();
  });

  it('renders track management controls', () => {
    render(<Synthesizer {...defaultProps} />);
    
    expect(screen.getByText('🗑️ Clear All Tracks')).toBeInTheDocument();
    expect(screen.getByText('➕ Add Track')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Show Editor')).toBeInTheDocument();
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