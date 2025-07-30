export interface Note {
  freq: number;
  key: string;
  black?: boolean;
  note?: string;
}

export interface Chord {
  name: string;
  frequencies: number[];
  type: 'major' | 'minor' | 'diminished' | 'dominant' | 'maj7' | 'min7' | '7' | 'm7b5';
}

export interface ChordProgression {
  name: string;
  chords: string[];
  mood?: 'happy' | 'sad' | 'tense' | 'dreamy' | 'jazz' | 'blues';
}

export interface CircleKey {
  key: string;
  type: 'major' | 'dominant' | 'diminished';
  angle: number;
  chordType: 'major' | 'dominant' | 'diminished';
}

export interface Preset {
  name: string;
  waveform: WaveformType;
  volume: number;
  attack: number;
  release: number;
  detune: number;
  reverb: 'on' | 'off';
  arpeggiator: 'off' | 'up' | 'down';
  lfoRate: number;
  lfoDepth: number;
  lfoTarget: 'pitch' | 'volume' | 'filter';
  
  // New Effects
  delayEnabled?: boolean;
  delayTime?: number;
  delayFeedback?: number;
  delayMix?: number;
  
  chorusEnabled?: boolean;
  chorusRate?: number;
  chorusDepth?: number;
  chorusMix?: number;
  
  distortionEnabled?: boolean;
  distortionAmount?: number;
  distortionType?: 'soft' | 'hard' | 'bitcrusher';
  
  filterEnabled?: boolean;
  filterType?: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
  filterFrequency?: number;
  filterResonance?: number;
  
  compressionEnabled?: boolean;
  compressionThreshold?: number;
  compressionRatio?: number;
  compressionAttack?: number;
  compressionRelease?: number;
  
  stereoWidth?: number;
  panningEnabled?: boolean;
  panningAmount?: number;
}

export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export interface SynthesizerState {
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
  arpeggiatorMode: 'off' | 'up' | 'down' | 'updown' | 'random';
  arpeggiatorRate: number;
  
  // New Effects
  delayEnabled: boolean;
  delayTime: number;
  delayFeedback: number;
  delayMix: number;
  
  chorusEnabled: boolean;
  chorusRate: number;
  chorusDepth: number;
  chorusMix: number;
  
  distortionEnabled: boolean;
  distortionAmount: number;
  distortionType: 'soft' | 'hard' | 'bitcrusher';
  
  filterEnabled: boolean;
  filterType: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
  filterFrequency: number;
  filterResonance: number;
  filterEnvelopeEnabled: boolean;
  filterAttack: number;
  filterDecay: number;
  filterSustain: number;
  filterRelease: number;
  
  compressionEnabled: boolean;
  compressionThreshold: number;
  compressionRatio: number;
  compressionAttack: number;
  compressionRelease: number;
  
  stereoWidth: number;
  panningEnabled: boolean;
  panningAmount: number;
  
  // Sequencer improvements
  isBpmSliding: boolean;
  pendingBpmChange: number | null;
  gridAlignment: 'quantize' | 'free';
}

export interface SequencerStep {
  note: string;
  step: number;
  active: boolean;
  playing?: boolean;
}

export interface SequencerTrack {
  note: string;
  frequency: number;
  steps: boolean[];
}

export interface ActiveNote {
  osc: OscillatorNode;
  gain: GainNode;
  lfo: OscillatorNode;
  freq: number;
}

export interface NumberKeyPattern {
  [key: number]: number[];
}

export interface RhythmPattern {
  [trackIndex: number]: number[];
}

export interface ScryptureRhythmPattern {
  [trackIndex: number]: number[];
}

// New interfaces from Synth.html implementation

export interface AudioNodes {
  dryGain: GainNode;
  wetGain: GainNode;
  convolver: ConvolverNode;
}

export interface SequencerState {
  isPlaying: boolean;
  currentStep: number;
  sequenceInterval: number | null;
  drawMode: boolean;
  isDrawing: boolean;
}

export interface KeyboardState {
  isDragging: boolean;
  lastPlayedKey: HTMLElement | null;
  pressed: Set<number>;
}

export interface CircleOfFifthsState {
  isDraggingCircle: boolean;
}

export interface AudioPreset {
  waveform: WaveformType;
  volume: number;
  attack: number;
  release: number;
  detune: number;
  reverb: 'on' | 'off';
  arpeggiator: 'off' | 'up' | 'down';
  lfoRate: number;
  lfoDepth: number;
  lfoTarget: 'pitch' | 'volume' | 'filter';
}

export interface ScryptureSoundPreset extends AudioPreset {
  name: string;
  category: 'achievement' | 'task' | 'ui' | 'gameplay';
  rarity?: 'common' | 'rare' | 'legendary';
}

export interface SequencerPattern {
  name: string;
  steps: number[];
  description: string;
}

export interface TimelineDisplay {
  stepIndicators: HTMLElement[];
  timelineTracks: HTMLElement[];
  tracks: SequencerTrack[];
}

export interface AudioContextState {
  context: AudioContext;
  masterGain: GainNode;
  audioNodes: AudioNodes;
  state: 'suspended' | 'running' | 'closed';
}

export interface NoteEvent {
  frequency: number;
  element?: HTMLElement | null;
  timestamp: number;
  duration?: number;
}

export interface ChordEvent {
  chordName: string;
  frequencies: number[];
  duration: number;
  highlightKeys: HTMLElement[];
}

export interface ProgressionEvent {
  progressionName: string;
  chords: string[];
  currentChord: number;
  interval: number;
}

export interface SequencerEvent {
  step: number;
  notes: string[];
  frequencies: number[];
  stepTime: number;
}

export interface LFOConfig {
  rate: number;
  depth: number;
  target: 'pitch' | 'volume' | 'filter';
  oscillator: OscillatorNode;
  gain: GainNode;
}

export interface FilterConfig {
  type: BiquadFilterType;
  frequency: number;
  Q: number;
  enabled: boolean;
}

export interface EnvelopeConfig {
  attack: number;
  release: number;
  sustain: number;
  decay: number;
}

export interface ReverbConfig {
  enabled: boolean;
  wet: number;
  dry: number;
  impulseResponse: AudioBuffer;
}

export interface ArpeggiatorConfig {
  mode: 'off' | 'up' | 'down' | 'updown' | 'random';
  rate: number;
  octaves: number;
  enabled: boolean;
}

export interface SynthesizerContextType {
  state: SynthesizerState;
  audioContext: AudioContext | null;
  masterGain: GainNode | null;
  activeNotes: Record<string, ActiveNote>;
  sequence: Record<string, boolean[]>;
  
  // Update functions
  updateState: (updates: Partial<SynthesizerState>) => void;
  
  // Audio functions
  startNote: (freq: number, element?: HTMLElement | null) => void;
  stopNote: (freq: number, element?: HTMLElement | null) => void;
  playChord: (chordName: string) => void;
  playProgression: (progressionName: string) => void;
  loadPreset: (presetName: string) => void;
  
  // Sequencer functions
  playSequence: () => void;
  stopSequence: () => void;
  clearSequence: () => void;
  toggleDrawMode: () => void;
  loadPattern: (number: number) => void;
  loadRhythmPattern: (patternName: string) => void;
  loadScryptureRhythmPattern: (patternName: string) => void;
  
  // Control functions
  resetDetune: () => void;
  resetVolume: () => void;
  resetAttack: () => void;
  resetRelease: () => void;
  resetLfoRate: () => void;
  resetLfoDepth: () => void;
  resetArpeggiatorRate: () => void;
  resetDelayTime: () => void;
  resetDelayFeedback: () => void;
  resetDelayMix: () => void;
  resetChorusRate: () => void;
  resetChorusDepth: () => void;
  resetChorusMix: () => void;
  resetDistortionAmount: () => void;
  resetFilterFrequency: () => void;
  resetFilterResonance: () => void;
  resetCompressionThreshold: () => void;
  resetCompressionRatio: () => void;
  resetCompressionAttack: () => void;
  resetCompressionRelease: () => void;
  resetStereoWidth: () => void;
  resetPanningAmount: () => void;
  resetBpm: () => void;
  resetSteps: () => void;
  toggleSustain: () => void;
  setWaveform: (waveform: WaveformType) => void;
  setArpeggiatorMode: (mode: 'off' | 'up' | 'down' | 'updown' | 'random') => void;
  
  // Sequencer improvement functions
  startBpmSlide: () => void;
  endBpmSlide: (newBpm: number) => void;
  setGridAlignment: (alignment: 'quantize' | 'free') => void;
  
  // Keyboard functions
  handleKeyDown: (event: KeyboardEvent) => void;
  handleKeyUp: (event: KeyboardEvent) => void;
  handleMouseDown: (event: MouseEvent) => void;
  handleMouseUp: (event: MouseEvent) => void;
} 