export interface Note {
  freq: number;
  key: string;
  black?: boolean;
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
  
  // Audio state
  audioNodes: AudioNodes | null;
  audioContextState: AudioContextState | null;
  
  // Sequencer state
  sequencerState: SequencerState;
  
  // Keyboard state
  keyboardState: KeyboardState;
  
  // Circle of fifths state
  circleState: CircleOfFifthsState;
  
  // Timeline display
  timelineDisplay: TimelineDisplay | null;
  
  // Update functions
  updateState: (updates: Partial<SynthesizerState>) => void;
  updateAudioContext: (state: 'suspended' | 'running' | 'closed') => void;
  updateSequencerState: (updates: Partial<SequencerState>) => void;
  updateKeyboardState: (updates: Partial<KeyboardState>) => void;
  updateCircleState: (updates: Partial<CircleOfFifthsState>) => void;
  
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
  createTimeline: () => void;
  updateTimelineDisplay: () => void;
  
  // Control functions
  resetDetune: () => void;
  toggleSustain: () => void;
  setWaveform: (waveform: WaveformType) => void;
  adjustParameter: (param: keyof SynthesizerState, delta: number) => void;
  
  // Circle of fifths functions
  createCircleOfFifths: () => void;
  playCircleKey: (key: CircleKey) => void;
  
  // Keyboard functions
  handleKeyDown: (event: KeyboardEvent) => void;
  handleKeyUp: (event: KeyboardEvent) => void;
  handleMouseDown: (event: MouseEvent) => void;
  handleMouseUp: (event: MouseEvent) => void;
  handleMouseEnter: (event: MouseEvent) => void;
  handleMouseLeave: (event: MouseEvent) => void;
  handleTouchStart: (event: TouchEvent) => void;
  handleTouchEnd: (event: TouchEvent) => void;
  handleTouchMove: (event: TouchEvent) => void;
  
  // Audio processing functions
  createLFO: (config: LFOConfig) => LFOConfig;
  createFilter: (config: FilterConfig) => FilterConfig;
  createEnvelope: (config: EnvelopeConfig) => EnvelopeConfig;
  createReverb: (config: ReverbConfig) => ReverbConfig;
  createArpeggiator: (config: ArpeggiatorConfig) => ArpeggiatorConfig;
  
  // Event handlers
  handleNoteEvent: (event: NoteEvent) => void;
  handleChordEvent: (event: ChordEvent) => void;
  handleProgressionEvent: (event: ProgressionEvent) => void;
  handleSequencerEvent: (event: SequencerEvent) => void;
} 