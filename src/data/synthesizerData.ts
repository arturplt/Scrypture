import { Note, Chord, ChordProgression, CircleKey, Preset, NumberKeyPattern } from '../types/synthesizer';

export const NOTES: Note[] = [
  { freq: 261.63, key: 'a' },
  { freq: 277.18, key: 'w', black: true },
  { freq: 293.66, key: 's' },
  { freq: 311.13, key: 'e', black: true },
  { freq: 329.63, key: 'd' },
  { freq: 349.23, key: 'f' },
  { freq: 369.99, key: 't', black: true },
  { freq: 392.00, key: 'g' },
  { freq: 415.30, key: 'y', black: true },
  { freq: 440.00, key: 'h' },
  { freq: 466.16, key: 'u', black: true },
  { freq: 493.88, key: 'j' },
  { freq: 523.25, key: 'k' }
];

export const CHORDS: Record<string, Chord> = {
  // C major scale chords
  Cmaj: { name: 'Cmaj', frequencies: [261.63, 329.63, 392.00], type: 'major' },  // C E G
  Dmin: { name: 'Dmin', frequencies: [293.66, 349.23, 440.00], type: 'minor' },  // D F A
  Emin: { name: 'Emin', frequencies: [329.63, 392.00, 493.88], type: 'minor' },  // E G B
  Fmaj: { name: 'Fmaj', frequencies: [349.23, 440.00, 523.25], type: 'major' },  // F A C
  Gmaj: { name: 'Gmaj', frequencies: [392.00, 493.88, 587.33], type: 'major' },  // G B D
  Amin: { name: 'Amin', frequencies: [440.00, 523.25, 659.25], type: 'minor' },  // A C E
  Bdim: { name: 'Bdim', frequencies: [493.88, 587.33, 698.46], type: 'diminished' },  // B D F
  
  // Extended chords
  Cmaj7: { name: 'Cmaj7', frequencies: [261.63, 329.63, 392.00, 493.88], type: 'maj7' },  // C E G B
  Dmin7: { name: 'Dmin7', frequencies: [293.66, 349.23, 440.00, 523.25], type: 'min7' },  // D F A C
  Emin7: { name: 'Emin7', frequencies: [329.63, 392.00, 493.88, 587.33], type: 'min7' },  // E G B D
  Fmaj7: { name: 'Fmaj7', frequencies: [349.23, 440.00, 523.25, 659.25], type: 'maj7' },  // F A C E
  G7: { name: 'G7', frequencies: [392.00, 493.88, 587.33, 698.46], type: '7' },     // G B D F
  Amin7: { name: 'Amin7', frequencies: [440.00, 523.25, 659.25, 783.99], type: 'min7' },  // A C E G
  Bm7b5: { name: 'Bm7b5', frequencies: [493.88, 587.33, 698.46, 783.99], type: 'm7b5' }   // B D F A
};

export const CHORD_PROGRESSIONS: Record<string, ChordProgression> = {
  // Classic Progressions
  'I-IV-V': { name: 'I-IV-V', chords: ['Cmaj', 'Fmaj', 'Gmaj'] },
  'ii-V-I': { name: 'ii-V-I', chords: ['Dmin', 'Gmaj', 'Cmaj'] },
  'I-V-vi-IV': { name: 'I-V-vi-IV', chords: ['Cmaj', 'Gmaj', 'Amin', 'Fmaj'] },
  'vi-IV-I-V': { name: 'vi-IV-I-V', chords: ['Amin', 'Fmaj', 'Cmaj', 'Gmaj'] },
  'I-vi-ii-V': { name: 'I-vi-ii-V', chords: ['Cmaj', 'Amin', 'Dmin', 'Gmaj'] },
  'ii-vi-I-V': { name: 'ii-vi-I-V', chords: ['Dmin', 'Amin', 'Cmaj', 'Gmaj'] },
  
  // Mood-Based Progressions
  'Happy': { name: 'Happy', chords: ['Cmaj', 'Fmaj', 'Gmaj', 'Cmaj'], mood: 'happy' },
  'Sad': { name: 'Sad', chords: ['Amin', 'Dmin', 'Emin', 'Amin'], mood: 'sad' },
  'Tense': { name: 'Tense', chords: ['G7', 'Bdim', 'Dmin7', 'G7'], mood: 'tense' },
  'Dreamy': { name: 'Dreamy', chords: ['Fmaj7', 'Emin7', 'Cmaj7', 'Amin7'], mood: 'dreamy' },
  'Jazz': { name: 'Jazz', chords: ['Dmin7', 'G7', 'Cmaj7', 'Fmaj7'], mood: 'jazz' },
  'Blues': { name: 'Blues', chords: ['Cmaj', 'Fmaj', 'G7', 'Cmaj'], mood: 'blues' }
};

export const CIRCLE_OF_FIFTHS: CircleKey[] = [
  { key: 'C', type: 'major', angle: 0, chordType: 'major' },
  { key: 'G', type: 'dominant', angle: 30, chordType: 'dominant' },
  { key: 'D', type: 'major', angle: 60, chordType: 'major' },
  { key: 'A', type: 'major', angle: 90, chordType: 'major' },
  { key: 'E', type: 'major', angle: 120, chordType: 'major' },
  { key: 'B', type: 'diminished', angle: 150, chordType: 'diminished' },
  { key: 'F#', type: 'major', angle: 180, chordType: 'major' },
  { key: 'C#', type: 'major', angle: 210, chordType: 'major' },
  { key: 'G#', type: 'dominant', angle: 240, chordType: 'dominant' },
  { key: 'D#', type: 'major', angle: 270, chordType: 'major' },
  { key: 'A#', type: 'major', angle: 300, chordType: 'major' },
  { key: 'F', type: 'major', angle: 330, chordType: 'major' }
];

export const NUMBER_KEY_PATTERNS: NumberKeyPattern = {
  0: [], // Empty pattern
  1: [0, 4, 8, 12], // Basic beat
  2: [0, 2, 4, 6, 8, 10, 12, 14], // Double time
  3: [0, 3, 6, 9, 12, 15], // Triplet feel
  4: [0, 4, 8, 12, 1, 5, 9, 13], // Two-track pattern
  5: [0, 2, 4, 6, 8, 10, 12, 14, 1, 3, 5, 7, 9, 11, 13, 15], // Full pattern
  6: [0, 6, 12], // Sparse pattern
  7: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // All steps
  8: [0, 8, 1, 9, 2, 10, 3, 11], // Alternating pattern
  9: [0, 3, 6, 9, 12, 15, 1, 4, 7, 10, 13] // Complex pattern
};

export const PRESETS: Record<string, Preset> = {
  piano: {
    name: 'piano',
    waveform: 'sine',
    volume: 30,
    attack: 5,
    release: 20,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  },
  bass: {
    name: 'bass',
    waveform: 'square',
    volume: 40,
    attack: 1,
    release: 50,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  },
  lead: {
    name: 'lead',
    waveform: 'sawtooth',
    volume: 25,
    attack: 2,
    release: 15,
    detune: 5,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 2,
    lfoDepth: 10,
    lfoTarget: 'pitch'
  },
  pad: {
    name: 'pad',
    waveform: 'sine',
    volume: 20,
    attack: 100,
    release: 100,
    detune: 10,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0.5,
    lfoDepth: 15,
    lfoTarget: 'volume'
  },
  pluck: {
    name: 'pluck',
    waveform: 'square',
    volume: 35,
    attack: 1,
    release: 5,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  },
  bell: {
    name: 'bell',
    waveform: 'triangle',
    volume: 30,
    attack: 1,
    release: 80,
    detune: 0,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  },
  chord: {
    name: 'chord',
    waveform: 'sine',
    volume: 25,
    attack: 10,
    release: 60,
    detune: 5,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  },
  arp: {
    name: 'arp',
    waveform: 'square',
    volume: 30,
    attack: 1,
    release: 10,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'up',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  },
  
  // Scrypture Sound Presets
  'achievement-common': {
    name: 'achievement-common',
    waveform: 'sine',
    volume: 25,
    attack: 1,
    release: 15,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  },
  'achievement-rare': {
    name: 'achievement-rare',
    waveform: 'triangle',
    volume: 30,
    attack: 2,
    release: 25,
    detune: 5,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 1,
    lfoDepth: 8,
    lfoTarget: 'pitch'
  },
  'achievement-legendary': {
    name: 'achievement-legendary',
    waveform: 'sawtooth',
    volume: 35,
    attack: 5,
    release: 40,
    detune: 10,
    reverb: 'on',
    arpeggiator: 'up',
    lfoRate: 2,
    lfoDepth: 15,
    lfoTarget: 'pitch'
  },
  'task-complete': {
    name: 'task-complete',
    waveform: 'sine',
    volume: 20,
    attack: 1,
    release: 8,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  },
  'level-up': {
    name: 'level-up',
    waveform: 'square',
    volume: 30,
    attack: 3,
    release: 20,
    detune: 5,
    reverb: 'on',
    arpeggiator: 'up',
    lfoRate: 1.5,
    lfoDepth: 12,
    lfoTarget: 'pitch'
  },
  'bobr-greeting': {
    name: 'bobr-greeting',
    waveform: 'triangle',
    volume: 25,
    attack: 5,
    release: 30,
    detune: 3,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0.8,
    lfoDepth: 6,
    lfoTarget: 'volume'
  },
  'dam-build': {
    name: 'dam-build',
    waveform: 'square',
    volume: 28,
    attack: 2,
    release: 15,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  },
  'streak-milestone': {
    name: 'streak-milestone',
    waveform: 'sine',
    volume: 30,
    attack: 1,
    release: 12,
    detune: 2,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0.5,
    lfoDepth: 4,
    lfoTarget: 'pitch'
  },
  'ui-click': {
    name: 'ui-click',
    waveform: 'sine',
    volume: 15,
    attack: 1,
    release: 5,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  },
  'form-submit': {
    name: 'form-submit',
    waveform: 'triangle',
    volume: 20,
    attack: 2,
    release: 10,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  },
  'modal-open': {
    name: 'modal-open',
    waveform: 'sine',
    volume: 18,
    attack: 3,
    release: 8,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  },
  'xp-gain': {
    name: 'xp-gain',
    waveform: 'triangle',
    volume: 22,
    attack: 1,
    release: 6,
    detune: 1,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch'
  }
};

export const SEQUENCER_TRACKS = [
  { note: 'C', frequency: 261.63 },
  { note: 'D', frequency: 293.66 },
  { note: 'E', frequency: 329.63 },
  { note: 'F', frequency: 349.23 },
  { note: 'G', frequency: 392.00 },
  { note: 'A', frequency: 440.00 },
  { note: 'B', frequency: 493.88 }
]; 