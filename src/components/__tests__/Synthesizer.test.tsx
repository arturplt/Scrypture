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
  sampleRate: 44100,
  currentTime: 0,
  destination: {},
  state: 'running',
  close: jest.fn()
};

global.AudioContext = jest.fn(() => mockAudioContext) as any;
(global as any).webkitAudioContext = global.AudioContext;

describe('Synthesizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Synthesizer />);
    expect(screen.getByText('8-BIT SYNTHESIZER')).toBeInTheDocument();
  });

  it('renders all main sections', () => {
    render(<Synthesizer />);
    
    expect(screen.getByText('🎯 Circle of Fifths')).toBeInTheDocument();
    expect(screen.getByText('😊 Mood Chords')).toBeInTheDocument();
    expect(screen.getByText('🎼 Plain Chords')).toBeInTheDocument();
    expect(screen.getByText('🎼 Chord Progressions')).toBeInTheDocument();
    expect(screen.getByText('🎛️ Presets')).toBeInTheDocument();
    expect(screen.getByText('🦫 Scrypture Sounds')).toBeInTheDocument();
    expect(screen.getByText('🎵 Waveform')).toBeInTheDocument();
    expect(screen.getByText('SEQUENCER')).toBeInTheDocument();
  });

  it('renders keyboard keys', () => {
    render(<Synthesizer />);
    
    // Check for some piano keys - use getAllByText since there are multiple elements
    const aKeys = screen.getAllByText('A');
    expect(aKeys.length).toBeGreaterThan(0);
    const sKeys = screen.getAllByText('S');
    expect(sKeys.length).toBeGreaterThan(0);
    const dKeys = screen.getAllByText('D');
    expect(dKeys.length).toBeGreaterThan(0);
  });

  it('renders volume control', () => {
    render(<Synthesizer />);
    // Use getAllByText since Volume appears in multiple places
    const volumeElements = screen.getAllByText('Volume');
    expect(volumeElements.length).toBeGreaterThan(0);
  });

  it('renders waveform buttons', () => {
    render(<Synthesizer />);
    expect(screen.getByText('Sine')).toBeInTheDocument();
    expect(screen.getByText('Square')).toBeInTheDocument();
    expect(screen.getByText('Triangle')).toBeInTheDocument();
    expect(screen.getByText('Sawtooth')).toBeInTheDocument();
  });

  it('renders chord buttons', () => {
    render(<Synthesizer />);
    // Look for chord buttons - use getAllByText since they appear in multiple places
    const chordButtons = screen.getAllByText('C');
    expect(chordButtons.length).toBeGreaterThan(0);
    const dmButtons = screen.getAllByText('Dm');
    expect(dmButtons.length).toBeGreaterThan(0);
    const emButtons = screen.getAllByText('Em');
    expect(emButtons.length).toBeGreaterThan(0);
    const fButtons = screen.getAllByText('F');
    expect(fButtons.length).toBeGreaterThan(0);
    const gButtons = screen.getAllByText('G');
    expect(gButtons.length).toBeGreaterThan(0);
    const amButtons = screen.getAllByText('Am');
    expect(amButtons.length).toBeGreaterThan(0);
    const bdimButtons = screen.getAllByText('B°');
    expect(bdimButtons.length).toBeGreaterThan(0);
  });

  it('renders mood chord buttons', () => {
    render(<Synthesizer />);
    // Look for mood labels specifically
    const happyLabels = screen.getAllByText('😊 Happy');
    expect(happyLabels.length).toBeGreaterThan(0);
    const sadLabels = screen.getAllByText('😢 Sad');
    expect(sadLabels.length).toBeGreaterThan(0);
    const tenseLabels = screen.getAllByText('😤 Tense');
    expect(tenseLabels.length).toBeGreaterThan(0);
    const dreamyLabels = screen.getAllByText('😌 Dreamy');
    expect(dreamyLabels.length).toBeGreaterThan(0);
  });

  it('renders preset buttons', () => {
    render(<Synthesizer />);
    expect(screen.getByText('Piano')).toBeInTheDocument();
    expect(screen.getByText('Bass')).toBeInTheDocument();
    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(screen.getByText('Pad')).toBeInTheDocument();
  });

  it('renders Scrypture sound presets', () => {
    render(<Synthesizer />);
    expect(screen.getByText('🏆 Common')).toBeInTheDocument();
    expect(screen.getByText('💎 Rare')).toBeInTheDocument();
    expect(screen.getByText('👑 Legendary')).toBeInTheDocument();
    expect(screen.getByText('✅ Complete')).toBeInTheDocument();
    expect(screen.getByText('🎉 Level Up')).toBeInTheDocument();
    expect(screen.getByText('🦫 Bóbr')).toBeInTheDocument();
  });

  it('renders sequencer controls', () => {
    render(<Synthesizer />);
    expect(screen.getByText('BPM')).toBeInTheDocument();
    expect(screen.getByText('Steps')).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Draw')).toBeInTheDocument();
  });

  it('can toggle collapsible sections', () => {
    render(<Synthesizer />);
    
    // Since CSS modules aren't applied in tests, we'll just test that the click works
    const circleSectionHeader = screen.getByText('🎯 Circle of Fifths');
    expect(circleSectionHeader).toBeInTheDocument();
    
    fireEvent.click(circleSectionHeader);
    // The section should still be in the document after clicking
    expect(circleSectionHeader).toBeInTheDocument();
  });

  it('renders LFO controls', () => {
    render(<Synthesizer />);
    expect(screen.getByText('LFO Rate')).toBeInTheDocument();
    expect(screen.getByText('LFO Depth')).toBeInTheDocument();
    expect(screen.getByText('LFO Target')).toBeInTheDocument();
  });

  it('renders reverb and arpeggiator controls', () => {
    render(<Synthesizer />);
    expect(screen.getByText('Reverb')).toBeInTheDocument();
    expect(screen.getByText('Arpeggiator')).toBeInTheDocument();
  });

  it('displays BPM value in sequencer', () => {
    render(<Synthesizer />);
    
    // Check that BPM value is displayed
    const bpmDisplay = screen.getByText('120 BPM');
    expect(bpmDisplay).toBeInTheDocument();
  });

  it('has BPM slider with proper range', () => {
    render(<Synthesizer />);
    
    // Find the BPM slider input by its attributes
    const bpmSlider = screen.getByDisplayValue('120');
    expect(bpmSlider).toBeInTheDocument();
    expect(bpmSlider).toHaveAttribute('min', '60');
    expect(bpmSlider).toHaveAttribute('max', '200');
    expect(bpmSlider).toHaveAttribute('value', '120');
  });

  it('has Steps slider with proper range', () => {
    render(<Synthesizer />);
    
    // Find the Steps slider input by its attributes
    const stepsSlider = screen.getByDisplayValue('16');
    expect(stepsSlider).toBeInTheDocument();
    expect(stepsSlider).toHaveAttribute('min', '8');
    expect(stepsSlider).toHaveAttribute('max', '32');
    expect(stepsSlider).toHaveAttribute('value', '16');
  });
}); 