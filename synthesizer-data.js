// Synthesizer Data - JavaScript version of the TypeScript data

// Make data globally available
window.SynthesizerData = {};

// Notes data
window.SynthesizerData.NOTES = [
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

// Chords data - Simple frequency arrays like in working Synth.html
window.SynthesizerData.CHORDS = {
  // C major scale chords
  Cmaj: [261.63, 329.63, 392.00],  // C E G
  Dmin: [293.66, 349.23, 440.00],  // D F A
  Emin: [329.63, 392.00, 493.88],  // E G B
  Fmaj: [349.23, 440.00, 523.25],  // F A C
  Gmaj: [392.00, 493.88, 587.33],  // G B D
  Amin: [440.00, 523.25, 659.25],  // A C E
  Bdim: [493.88, 587.33, 698.46],  // B D F
  
  // Extended chords
  Cmaj7: [261.63, 329.63, 392.00, 493.88],  // C E G B
  Dmin7: [293.66, 349.23, 440.00, 523.25],  // D F A C
  Emin7: [329.63, 392.00, 493.88, 587.33],  // E G B D
  Fmaj7: [349.23, 440.00, 523.25, 659.25],  // F A C E
  G7: [392.00, 493.88, 587.33, 698.46],     // G B D F
  Amin7: [440.00, 523.25, 659.25, 783.99],  // A C E G
  Bm7b5: [493.88, 587.33, 698.46, 783.99]   // B D F A
};

// Chord progressions - Simple arrays like in working Synth.html
window.SynthesizerData.CHORD_PROGRESSIONS = {
  // Classic Progressions
  'I-IV-V': ['Cmaj', 'Fmaj', 'Gmaj'],
  'ii-V-I': ['Dmin', 'Gmaj', 'Cmaj'],
  'I-V-vi-IV': ['Cmaj', 'Gmaj', 'Amin', 'Fmaj'],
  'vi-IV-I-V': ['Amin', 'Fmaj', 'Cmaj', 'Gmaj'],
  'I-vi-ii-V': ['Cmaj', 'Amin', 'Dmin', 'Gmaj'],
  'ii-vi-I-V': ['Dmin', 'Amin', 'Cmaj', 'Gmaj'],
  
  // Mood-Based Progressions
  'Happy': ['Cmaj', 'Fmaj', 'Gmaj', 'Cmaj'],
  'Sad': ['Amin', 'Dmin', 'Emin', 'Amin'],
  'Tense': ['G7', 'Bdim', 'Dmin7', 'G7'],
  'Dreamy': ['Fmaj7', 'Emin7', 'Cmaj7', 'Amin7'],
  'Jazz': ['Dmin7', 'G7', 'Cmaj7', 'Fmaj7'],
  'Blues': ['Cmaj', 'Fmaj', 'G7', 'Cmaj']
};

// Circle of fifths
window.SynthesizerData.CIRCLE_OF_FIFTHS = [
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

// Number key patterns
window.SynthesizerData.NUMBER_KEY_PATTERNS = {
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

// Sequencer tracks
window.SynthesizerData.SEQUENCER_TRACKS = [
  { note: 'C', freq: 261.63 },
  { note: 'D', freq: 293.66 },
  { note: 'E', freq: 329.63 },
  { note: 'F', freq: 349.23 },
  { note: 'G', freq: 392.00 },
  { note: 'A', freq: 440.00 },
  { note: 'B', freq: 493.88 }
];

// Presets
window.SynthesizerData.PRESETS = {
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

// Data initialization complete
console.log('SynthesizerData loaded successfully'); 