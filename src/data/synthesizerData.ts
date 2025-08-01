import { Note, Chord, ChordProgression, CircleKey, Preset, NumberKeyPattern } from '../types/synthesizer';

export const NOTES: Note[] = [
  { freq: 261.63, key: 'a', note: 'C' }, // C4
  { freq: 277.18, key: 'w', black: true, note: 'C#' }, // C#4
  { freq: 293.66, key: 's', note: 'D' }, // D4
  { freq: 311.13, key: 'e', black: true, note: 'D#' }, // D#4
  { freq: 329.63, key: 'd', note: 'E' }, // E4
  { freq: 349.23, key: 'f', note: 'F' }, // F4
  { freq: 369.99, key: 't', black: true, note: 'F#' }, // F#4
  { freq: 392.00, key: 'g', note: 'G' }, // G4
  { freq: 415.30, key: 'y', black: true, note: 'G#' }, // G#4
  { freq: 440.00, key: 'h', note: 'A' }, // A4
  { freq: 466.16, key: 'u', black: true, note: 'A#' }, // A#4
  { freq: 493.88, key: 'j', note: 'B' }, // B4
  { freq: 523.25, key: 'k', note: 'C' } // C5
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
  
  // Extended Classic Progressions
  'I-IV-V-IV': { name: 'I-IV-V-IV', chords: ['Cmaj', 'Fmaj', 'Gmaj', 'Fmaj'] },
  'I-V-vi-iii': { name: 'I-V-vi-iii', chords: ['Cmaj', 'Gmaj', 'Amin', 'Emin'] },
  'I-vi-IV-V': { name: 'I-vi-IV-V', chords: ['Cmaj', 'Amin', 'Fmaj', 'Gmaj'] },
  'vi-V-IV-III': { name: 'vi-V-IV-III', chords: ['Amin', 'Gmaj', 'Fmaj', 'Emin'] },
  
  // Jazz Progressions
  'Jazz': { name: 'Jazz', chords: ['Dmin7', 'G7', 'Cmaj7', 'Fmaj7'], mood: 'jazz' },
  'Jazz II-V-I': { name: 'Jazz II-V-I', chords: ['Dmin7', 'G7', 'Cmaj7'], mood: 'jazz' },
  'Jazz Turnaround': { name: 'Jazz Turnaround', chords: ['Cmaj7', 'Amin7', 'Dmin7', 'G7'], mood: 'jazz' },
  'Jazz Minor': { name: 'Jazz Minor', chords: ['Amin7', 'Dmin7', 'G7', 'Cmaj7'], mood: 'jazz' },
  'Jazz Blues': { name: 'Jazz Blues', chords: ['Cmaj7', 'Fmaj7', 'G7', 'Cmaj7'], mood: 'jazz' },
  
  // Blues Progressions
  'Blues': { name: 'Blues', chords: ['Cmaj', 'Fmaj', 'G7', 'Cmaj'], mood: 'blues' },
  'Blues 12-Bar': { name: 'Blues 12-Bar', chords: ['Cmaj', 'Fmaj', 'Cmaj', 'G7', 'Fmaj', 'Cmaj'], mood: 'blues' },
  'Blues Minor': { name: 'Blues Minor', chords: ['Amin', 'Dmin', 'Amin', 'E7', 'Dmin', 'Amin'], mood: 'blues' },
  
  // Pop Progressions
  'Pop': { name: 'Pop', chords: ['Cmaj', 'Gmaj', 'Amin', 'Fmaj'], mood: 'happy' },
  'Pop Rock': { name: 'Pop Rock', chords: ['Cmaj', 'Fmaj', 'Gmaj', 'Amin'], mood: 'happy' },
  'Pop Ballad': { name: 'Pop Ballad', chords: ['Cmaj', 'Amin', 'Fmaj', 'Gmaj'], mood: 'sad' },
  'Pop Upbeat': { name: 'Pop Upbeat', chords: ['Cmaj', 'Fmaj', 'Gmaj', 'Cmaj'], mood: 'happy' },
  
  // Rock Progressions
  'Rock': { name: 'Rock', chords: ['Cmaj', 'Fmaj', 'Gmaj', 'Cmaj'], mood: 'tense' },
  'Rock Minor': { name: 'Rock Minor', chords: ['Amin', 'Dmin', 'Emin', 'Amin'], mood: 'tense' },
  'Rock Power': { name: 'Rock Power', chords: ['Cmaj', 'Fmaj', 'Gmaj', 'Amin'], mood: 'tense' },
  
  // Folk Progressions
  'Folk': { name: 'Folk', chords: ['Cmaj', 'Fmaj', 'Gmaj', 'Amin'], mood: 'happy' },
  'Folk Minor': { name: 'Folk Minor', chords: ['Amin', 'Dmin', 'Gmaj', 'Amin'], mood: 'sad' },
  'Folk Ballad': { name: 'Folk Ballad', chords: ['Cmaj', 'Amin', 'Fmaj', 'Gmaj'], mood: 'sad' },
  
  // Country Progressions
  'Country': { name: 'Country', chords: ['Cmaj', 'Fmaj', 'Gmaj', 'Cmaj'], mood: 'happy' },
  'Country Ballad': { name: 'Country Ballad', chords: ['Cmaj', 'Amin', 'Fmaj', 'Gmaj'], mood: 'sad' },
  'Country Rock': { name: 'Country Rock', chords: ['Cmaj', 'Fmaj', 'Gmaj', 'Amin'], mood: 'happy' },
  
  // Electronic Progressions
  'Electronic': { name: 'Electronic', chords: ['Cmaj', 'Amin', 'Fmaj', 'Gmaj'], mood: 'dreamy' },
  'House': { name: 'House', chords: ['Cmaj', 'Fmaj', 'Gmaj', 'Amin'], mood: 'happy' },
  'Ambient': { name: 'Ambient', chords: ['Cmaj7', 'Fmaj7', 'Amin7', 'Gmaj7'], mood: 'dreamy' },
  
  // Mood-Based Progressions
  'Happy': { name: 'Happy', chords: ['Cmaj', 'Fmaj', 'Gmaj', 'Cmaj'], mood: 'happy' },
  'Sad': { name: 'Sad', chords: ['Amin', 'Dmin', 'Emin', 'Amin'], mood: 'sad' },
  'Tense': { name: 'Tense', chords: ['G7', 'Bdim', 'Dmin7', 'G7'], mood: 'tense' },
  'Dreamy': { name: 'Dreamy', chords: ['Fmaj7', 'Emin7', 'Cmaj7', 'Amin7'], mood: 'dreamy' },
  'Mysterious': { name: 'Mysterious', chords: ['Amin', 'Emin', 'Dmin', 'Amin'], mood: 'tense' },
  'Peaceful': { name: 'Peaceful', chords: ['Cmaj7', 'Fmaj7', 'Gmaj7', 'Cmaj7'], mood: 'dreamy' },
  'Energetic': { name: 'Energetic', chords: ['Cmaj', 'Gmaj', 'Fmaj', 'Gmaj'], mood: 'happy' },
  'Melancholic': { name: 'Melancholic', chords: ['Amin', 'Fmaj', 'Cmaj', 'Gmaj'], mood: 'sad' },
  
  // Advanced Progressions
  'Advanced Jazz': { name: 'Advanced Jazz', chords: ['Dmin7', 'G7', 'Cmaj7', 'Amin7', 'Dmin7', 'G7'], mood: 'jazz' },
  'Advanced Pop': { name: 'Advanced Pop', chords: ['Cmaj', 'Amin', 'Fmaj', 'Gmaj', 'Cmaj', 'Fmaj', 'Gmaj', 'Cmaj'], mood: 'happy' },
  'Advanced Blues': { name: 'Advanced Blues', chords: ['Cmaj', 'Fmaj', 'Cmaj', 'G7', 'Fmaj', 'Cmaj', 'G7', 'Cmaj'], mood: 'blues' },
  
  // Modal Progressions
  'Dorian': { name: 'Dorian', chords: ['Dmin', 'Gmaj', 'Cmaj', 'Dmin'], mood: 'dreamy' },
  'Mixolydian': { name: 'Mixolydian', chords: ['Gmaj', 'Fmaj', 'Cmaj', 'Gmaj'], mood: 'happy' },
  'Lydian': { name: 'Lydian', chords: ['Fmaj', 'Gmaj', 'Cmaj', 'Fmaj'], mood: 'dreamy' },
  
  // Extended Harmony Progressions
  'Extended Harmony': { name: 'Extended Harmony', chords: ['Cmaj7', 'Dmin7', 'Emin7', 'Fmaj7'], mood: 'jazz' },
  'Rich Harmony': { name: 'Rich Harmony', chords: ['Cmaj7', 'Amin7', 'Fmaj7', 'G7'], mood: 'jazz' },
  'Complex Jazz': { name: 'Complex Jazz', chords: ['Dmin7', 'G7', 'Cmaj7', 'Fmaj7', 'Bmin7', 'E7'], mood: 'jazz' }
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
  1: [0, 4, 8, 12], // Basic 4/4 beat
  2: [0, 2, 4, 6, 8, 10, 12, 14], // Double time
  3: [0, 3, 6, 9, 12, 15], // Triplet feel
  4: [0, 4, 8, 12, 1, 5, 9, 13], // Two-track pattern
  5: [0, 2, 4, 6, 8, 10, 12, 14, 1, 3, 5, 7, 9, 11, 13, 15], // Full pattern
  6: [0, 6, 12], // Sparse pattern
  7: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // All steps
  8: [0, 8, 1, 9, 2, 10, 3, 11], // Alternating pattern
  9: [0, 3, 6, 9, 12, 15, 1, 4, 7, 10, 13], // Complex pattern
  // New advanced patterns
  10: [0, 4, 7, 11, 14], // Jazz swing
  11: [0, 2, 5, 7, 10, 12, 15], // Latin rhythm
  12: [0, 3, 6, 9, 12, 15, 2, 5, 8, 11, 14], // Polyrhythm
  13: [0, 1, 4, 5, 8, 9, 12, 13], // Stutter
  14: [0, 6, 12, 2, 8, 14, 4, 10], // Cross rhythm
  15: [0, 2, 4, 6, 8, 10, 12, 14, 1, 3, 5, 7, 9, 11, 13, 15], // Dense syncopation
  16: [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15], // Layered pattern
  17: [0, 3, 7, 10, 14, 1, 4, 8, 11, 15, 2, 5, 9, 12], // Melodic sequence
  18: [0, 2, 4, 6, 8, 10, 12, 14, 1, 3, 5, 7, 9, 11, 13, 15], // Binary pattern
  19: [0, 1, 2, 3, 12, 13, 14, 15, 4, 5, 6, 7, 8, 9, 10, 11] // Bookend pattern
};

// Basic rhythm patterns for drum sequencing
export const RHYTHM_PATTERNS: { [key: string]: { [trackIndex: number]: number[] } } = {
  'basic-beat': {
    0: [0, 4, 8, 12], // Kick on beats 1, 2, 3, 4
    2: [2, 6, 10, 14], // Snare on beats 2 and 4
    4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] // Hi-hat on every step
  },
  'rock-beat': {
    0: [0, 6, 12], // Kick on beats 1, 2.5, 4
    2: [4, 12], // Snare on beats 2 and 4
    4: [0, 2, 4, 6, 8, 10, 12, 14], // Hi-hat on off-beats
    6: [0, 8] // Crash on beats 1 and 3
  },
  'funk-beat': {
    0: [0, 4, 7, 11, 14], // Kick with syncopation
    2: [4, 12], // Snare on beats 2 and 4
    4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // Hi-hat on every step
    8: [0, 8] // Clap on beats 1 and 3
  },
  'latin-beat': {
    0: [0, 6, 12], // Kick on beats 1, 2.5, 4
    2: [4, 12], // Snare on beats 2 and 4
    4: [0, 2, 4, 6, 8, 10, 12, 14], // Hi-hat on off-beats
    10: [0, 4, 8, 12], // Tom on beats 1, 2, 3, 4
    12: [0, 8] // Ride on beats 1 and 3
  },
  'techno-beat': {
    0: [0, 4, 8, 12], // Kick on every beat
    2: [4, 12], // Snare on beats 2 and 4
    4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // Hi-hat on every step
    6: [0, 8], // Crash on beats 1 and 3
    14: [0, 4, 8, 12] // Bass on every beat
  },
  'jazz-beat': {
    0: [0, 7, 14], // Kick with swing
    2: [4, 12], // Snare on beats 2 and 4
    4: [0, 2, 4, 6, 8, 10, 12, 14], // Hi-hat on off-beats
    12: [0, 4, 8, 12], // Ride on every beat
    16: [0, 8] // Bass on beats 1 and 3
  },
  'hip-hop-beat': {
    0: [0, 6, 12], // Kick with syncopation
    2: [4, 12], // Snare on beats 2 and 4
    4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // Hi-hat on every step
    8: [0, 8], // Clap on beats 1 and 3
    18: [0, 4, 8, 12] // Bass on every beat
  },
  'ambient-beat': {
    0: [0, 8], // Kick on beats 1 and 3
    2: [4, 12], // Snare on beats 2 and 4
    4: [0, 4, 8, 12], // Hi-hat on every beat
    12: [0, 8], // Ride on beats 1 and 3
    20: [0, 8] // Bass on beats 1 and 3
  }
};

// Scrypture-specific rhythm patterns for gamified productivity
export const SCRYPTURE_RHYTHM_PATTERNS: { [key: string]: { [trackIndex: number]: number[] } } = {
  'achievement-unlock': {
    0: [0, 8], // Kick on beats 1 and 3 (achievement impact)
    2: [4, 12], // Snare on beats 2 and 4 (celebration)
    4: [0, 2, 4, 6, 8, 10, 12, 14], // Hi-hat (excitement)
    6: [0, 8], // Crash (achievement sound)
    8: [1, 5, 9, 13] // Bass (power)
  },
  'task-complete': {
    0: [0, 4, 8, 12], // Kick (completion rhythm)
    2: [4, 12], // Snare (satisfaction)
    4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // Hi-hat (progress)
    6: [2, 6, 10, 14], // Clap (success)
    8: [0, 8] // Crash (completion)
  },
  'level-up': {
    0: [0, 6, 12], // Kick (level progression)
    2: [4, 12], // Snare (achievement)
    4: [0, 2, 4, 6, 8, 10, 12, 14], // Hi-hat (excitement)
    6: [0, 8], // Crash (level up sound)
    8: [1, 5, 9, 13], // Bass (power)
    10: [2, 6, 10, 14] // Tom (celebration)
  },
  'streak-milestone': {
    0: [0, 4, 8, 12], // Kick (consistency)
    2: [4, 12], // Snare (milestone)
    4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // Hi-hat (momentum)
    6: [0, 8], // Crash (achievement)
    8: [2, 6, 10, 14], // Clap (success)
    10: [1, 5, 9, 13] // Bass (power)
  },
  'bobr-greeting': {
    0: [0, 8], // Kick (friendly greeting)
    2: [4, 12], // Snare (welcome)
    4: [0, 2, 4, 6, 8, 10, 12, 14], // Hi-hat (cheerful)
    6: [0, 8], // Crash (hello)
    8: [1, 5, 9, 13] // Bass (warmth)
  },
  'dam-build': {
    0: [0, 4, 8, 12], // Kick (construction)
    2: [4, 12], // Snare (building)
    4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // Hi-hat (work)
    6: [2, 6, 10, 14], // Clap (progress)
    8: [0, 8], // Crash (completion)
    10: [1, 5, 9, 13] // Bass (strength)
  },
  'xp-gain': {
    0: [0, 6, 12], // Kick (experience gain)
    2: [4, 12], // Snare (reward)
    4: [0, 2, 4, 6, 8, 10, 12, 14], // Hi-hat (progress)
    6: [0, 8], // Crash (achievement)
    8: [1, 5, 9, 13], // Bass (growth)
    10: [2, 6, 10, 14] // Tom (celebration)
  },
  'productivity-flow': {
    0: [0, 4, 8, 12], // Kick (focus)
    2: [4, 12], // Snare (breakthrough)
    4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // Hi-hat (flow)
    6: [0, 8], // Crash (inspiration)
    8: [2, 6, 10, 14], // Clap (success)
    10: [1, 5, 9, 13] // Bass (momentum)
  }
};

export const PRESETS: Record<string, Preset> = {
  piano: {
    name: 'piano',
    waveform: 'sine',
    volume: 60, // Updated for new volume scale
    attack: 5,
    release: 20,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    compressionEnabled: true,
    compressionThreshold: -20,
    compressionRatio: 3,
    compressionAttack: 0.01,
    compressionRelease: 0.1,
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 8000,
    filterResonance: 0.5
  },
  bass: {
    name: 'bass',
    waveform: 'square',
    volume: 70, // Updated for new volume scale
    attack: 1,
    release: 50,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 400,
    filterResonance: 2,
    compressionEnabled: true,
    compressionThreshold: -15,
    compressionRatio: 4,
    compressionAttack: 0.005,
    compressionRelease: 0.2,
    distortionEnabled: true,
    distortionAmount: 0.2,
    distortionType: 'soft'
  },
  lead: {
    name: 'lead',
    waveform: 'sawtooth',
    volume: 65, // Updated for new volume scale
    attack: 2,
    release: 15,
    detune: 5,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 2,
    lfoDepth: 10,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 3000,
    filterResonance: 1.5,
    delayEnabled: true,
    delayTime: 0.3,
    delayFeedback: 0.2,
    delayMix: 0.3,
    distortionEnabled: true,
    distortionAmount: 0.3,
    distortionType: 'hard'
  },
  pad: {
    name: 'pad',
    waveform: 'sine',
    volume: 40, // Updated for new volume scale
    attack: 100,
    release: 100,
    detune: 10,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0.5,
    lfoDepth: 15,
    lfoTarget: 'volume',
    chorusEnabled: true,
    chorusRate: 1.2,
    chorusDepth: 0.003,
    chorusMix: 0.6,
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 2000,
    filterResonance: 0.8,
    stereoWidth: 1.5
  },
  pluck: {
    name: 'pluck',
    waveform: 'square',
    volume: 75, // Updated for new volume scale
    attack: 1,
    release: 5,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 1500,
    filterResonance: 3,
    delayEnabled: true,
    delayTime: 0.1,
    delayFeedback: 0.1,
    delayMix: 0.2
  },
  bell: {
    name: 'bell',
    waveform: 'triangle',
    volume: 80, // Updated for new volume scale
    attack: 1,
    release: 80,
    detune: 0,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 800,
    filterResonance: 1.2,
    delayEnabled: true,
    delayTime: 0.5,
    delayFeedback: 0.4,
    delayMix: 0.4,
    stereoWidth: 1.3
  },
  chord: {
    name: 'chord',
    waveform: 'sine',
    volume: 55, // Updated for new volume scale
    attack: 10,
    release: 60,
    detune: 5,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    chorusEnabled: true,
    chorusRate: 0.8,
    chorusDepth: 0.002,
    chorusMix: 0.4,
    compressionEnabled: true,
    compressionThreshold: -18,
    compressionRatio: 2.5,
    compressionAttack: 0.02,
    compressionRelease: 0.15
  },
  arp: {
    name: 'arp',
    waveform: 'square',
    volume: 70, // Updated for new volume scale
    attack: 1,
    release: 10,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'up',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 2500,
    filterResonance: 1,
    delayEnabled: true,
    delayTime: 0.2,
    delayFeedback: 0.3,
    delayMix: 0.3
  },
  
  // Scrypture Sound Presets
  'achievement-common': {
    name: 'achievement-common',
    waveform: 'sine',
    volume: 60, // Updated for new volume scale
    attack: 1,
    release: 15,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 800,
    filterResonance: 0.5,
    compressionEnabled: true,
    compressionThreshold: -20,
    compressionRatio: 2.0,
    compressionAttack: 0.01,
    compressionRelease: 0.1,
    delayEnabled: true,
    delayTime: 0.1,
    delayFeedback: 0.2,
    delayMix: 0.15
  },
  'achievement-rare': {
    name: 'achievement-rare',
    waveform: 'triangle',
    volume: 70, // Updated for new volume scale
    attack: 2,
    release: 25,
    detune: 5,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 1,
    lfoDepth: 8,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 3000,
    filterResonance: 1.2,
    chorusEnabled: true,
    chorusRate: 1.2,
    chorusDepth: 0.004,
    chorusMix: 0.4,
    delayEnabled: true,
    delayTime: 0.2,
    delayFeedback: 0.3,
    delayMix: 0.25,
    stereoWidth: 1.3
  },
  'achievement-legendary': {
    name: 'achievement-legendary',
    waveform: 'sawtooth',
    volume: 80, // Updated for new volume scale
    attack: 5,
    release: 40,
    detune: 10,
    reverb: 'on',
    arpeggiator: 'up',
    lfoRate: 2,
    lfoDepth: 15,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'bandpass',
    filterFrequency: 2000,
    filterResonance: 2.0,
    chorusEnabled: true,
    chorusRate: 0.8,
    chorusDepth: 0.006,
    chorusMix: 0.5,
    delayEnabled: true,
    delayTime: 0.3,
    delayFeedback: 0.4,
    delayMix: 0.3,
    distortionEnabled: true,
    distortionAmount: 0.3,
    stereoWidth: 1.5
  },
  'task-complete': {
    name: 'task-complete',
    waveform: 'sine',
    volume: 4,
    attack: 1,
    release: 8,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 1200,
    filterResonance: 0.8,
    compressionEnabled: true,
    compressionThreshold: -15,
    compressionRatio: 1.5,
    compressionAttack: 0.005,
    compressionRelease: 0.05
  },
  'level-up': {
    name: 'level-up',
    waveform: 'square',
    volume: 6,
    attack: 3,
    release: 20,
    detune: 5,
    reverb: 'on',
    arpeggiator: 'up',
    lfoRate: 1.5,
    lfoDepth: 12,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 4000,
    filterResonance: 1.5,
    chorusEnabled: true,
    chorusRate: 1.0,
    chorusDepth: 0.003,
    chorusMix: 0.35,
    delayEnabled: true,
    delayTime: 0.15,
    delayFeedback: 0.25,
    delayMix: 0.2,
    stereoWidth: 1.2
  },
  'bobr-greeting': {
    name: 'bobr-greeting',
    waveform: 'triangle',
    volume: 5,
    attack: 5,
    release: 30,
    detune: 3,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0.8,
    lfoDepth: 6,
    lfoTarget: 'volume',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 2500,
    filterResonance: 1.0,
    chorusEnabled: true,
    chorusRate: 0.6,
    chorusDepth: 0.002,
    chorusMix: 0.3,
    delayEnabled: true,
    delayTime: 0.25,
    delayFeedback: 0.2,
    delayMix: 0.2,
    stereoWidth: 1.1
  },
  'dam-build': {
    name: 'dam-build',
    waveform: 'square',
    volume: 6,
    attack: 2,
    release: 15,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 600,
    filterResonance: 1.5,
    distortionEnabled: true,
    distortionAmount: 0.2,
    compressionEnabled: true,
    compressionThreshold: -18,
    compressionRatio: 2.0,
    compressionAttack: 0.02,
    compressionRelease: 0.1,
    delayEnabled: true,
    delayTime: 0.1,
    delayFeedback: 0.1,
    delayMix: 0.1
  },
  'streak-milestone': {
    name: 'streak-milestone',
    waveform: 'sine',
    volume: 6,
    attack: 1,
    release: 12,
    detune: 2,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0.5,
    lfoDepth: 4,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'bandpass',
    filterFrequency: 1500,
    filterResonance: 1.8,
    chorusEnabled: true,
    chorusRate: 1.1,
    chorusDepth: 0.003,
    chorusMix: 0.4,
    delayEnabled: true,
    delayTime: 0.2,
    delayFeedback: 0.3,
    delayMix: 0.25,
    stereoWidth: 1.25
  },
  'ui-click': {
    name: 'ui-click',
    waveform: 'sine',
    volume: 3,
    attack: 1,
    release: 5,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 2000,
    filterResonance: 0.5,
    compressionEnabled: true,
    compressionThreshold: -10,
    compressionRatio: 1.2,
    compressionAttack: 0.001,
    compressionRelease: 0.02
  },
  'form-submit': {
    name: 'form-submit',
    waveform: 'triangle',
    volume: 4,
    attack: 2,
    release: 10,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 3500,
    filterResonance: 0.8,
    chorusEnabled: true,
    chorusRate: 0.9,
    chorusDepth: 0.002,
    chorusMix: 0.25,
    compressionEnabled: true,
    compressionThreshold: -12,
    compressionRatio: 1.5,
    compressionAttack: 0.01,
    compressionRelease: 0.05
  },
  'modal-open': {
    name: 'modal-open',
    waveform: 'sine',
    volume: 4,
    attack: 3,
    release: 8,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 1000,
    filterResonance: 1.0,
    delayEnabled: true,
    delayTime: 0.05,
    delayFeedback: 0.1,
    delayMix: 0.1,
    compressionEnabled: true,
    compressionThreshold: -8,
    compressionRatio: 1.1,
    compressionAttack: 0.005,
    compressionRelease: 0.03
  },
  'xp-gain': {
    name: 'xp-gain',
    waveform: 'triangle',
    volume: 4,
    attack: 1,
    release: 6,
    detune: 1,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 2800,
    filterResonance: 0.6,
    chorusEnabled: true,
    chorusRate: 1.0,
    chorusDepth: 0.002,
    chorusMix: 0.2,
    compressionEnabled: true,
    compressionThreshold: -14,
    compressionRatio: 1.3,
    compressionAttack: 0.008,
    compressionRelease: 0.04
  },

  // 🎛️ Modern Effect Presets
  'atmospheric-pad': {
    name: 'atmospheric-pad',
    waveform: 'sine',
    volume: 4,
    attack: 150,
    release: 120,
    detune: 15,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0.3,
    lfoDepth: 20,
    lfoTarget: 'volume',
    chorusEnabled: true,
    chorusRate: 0.8,
    chorusDepth: 0.004,
    chorusMix: 0.7,
    delayEnabled: true,
    delayTime: 0.8,
    delayFeedback: 0.6,
    delayMix: 0.5,
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 1500,
    filterResonance: 0.5,
    stereoWidth: 1.8
  },

  'aggressive-lead': {
    name: 'aggressive-lead',
    waveform: 'sawtooth',
    volume: 6,
    attack: 1,
    release: 20,
    detune: 8,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 3,
    lfoDepth: 15,
    lfoTarget: 'pitch',
    distortionEnabled: true,
    distortionAmount: 0.6,
    distortionType: 'hard',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 2500,
    filterResonance: 2,
    delayEnabled: true,
    delayTime: 0.2,
    delayFeedback: 0.4,
    delayMix: 0.4,
    compressionEnabled: true,
    compressionThreshold: -12,
    compressionRatio: 6,
    compressionAttack: 0.005,
    compressionRelease: 0.1
  },

  'retro-bitcrusher': {
    name: 'retro-bitcrusher',
    waveform: 'square',
    volume: 6,
    attack: 1,
    release: 8,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    distortionEnabled: true,
    distortionAmount: 0.8,
    distortionType: 'bitcrusher',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 3000,
    filterResonance: 1,
    delayEnabled: true,
    delayTime: 0.15,
    delayFeedback: 0.2,
    delayMix: 0.3
  },

  'warm-bass': {
    name: 'warm-bass',
    waveform: 'triangle',
    volume: 9,
    attack: 2,
    release: 60,
    detune: 3,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 300,
    filterResonance: 3,
    distortionEnabled: true,
    distortionAmount: 0.3,
    distortionType: 'soft',
    compressionEnabled: true,
    compressionThreshold: -10,
    compressionRatio: 5,
    compressionAttack: 0.01,
    compressionRelease: 0.3,
    stereoWidth: 0.8
  },

  'ethereal-bell': {
    name: 'ethereal-bell',
    waveform: 'triangle',
    volume: 5,
    attack: 1,
    release: 100,
    detune: 5,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0.5,
    lfoDepth: 8,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 1000,
    filterResonance: 1.5,
    delayEnabled: true,
    delayTime: 0.6,
    delayFeedback: 0.5,
    delayMix: 0.6,
    chorusEnabled: true,
    chorusRate: 1.0,
    chorusDepth: 0.003,
    chorusMix: 0.5,
    stereoWidth: 1.6
  },

  'rhythmic-pluck': {
    name: 'rhythmic-pluck',
    waveform: 'square',
    volume: 8,
    attack: 1,
    release: 3,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 1200,
    filterResonance: 4,
    delayEnabled: true,
    delayTime: 0.1,
    delayFeedback: 0.3,
    delayMix: 0.4,
    compressionEnabled: true,
    compressionThreshold: -15,
    compressionRatio: 3,
    compressionAttack: 0.005,
    compressionRelease: 0.05
  },

  'space-pad': {
    name: 'space-pad',
    waveform: 'sine',
    volume: 1,
    attack: 200,
    release: 150,
    detune: 20,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0.2,
    lfoDepth: 25,
    lfoTarget: 'volume',
    chorusEnabled: true,
    chorusRate: 0.6,
    chorusDepth: 0.005,
    chorusMix: 0.8,
    filterEnabled: true,
    filterType: 'bandpass',
    filterFrequency: 800,
    filterResonance: 2,
    delayEnabled: true,
    delayTime: 1.2,
    delayFeedback: 0.7,
    delayMix: 0.6,
    stereoWidth: 2.0,
    panningEnabled: true,
    panningAmount: 0.3
  },

  'industrial-noise': {
    name: 'industrial-noise',
    waveform: 'sawtooth',
    volume: 6,
    attack: 5,
    release: 25,
    detune: 12,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 4,
    lfoDepth: 20,
    lfoTarget: 'filter',
    distortionEnabled: true,
    distortionAmount: 0.9,
    distortionType: 'hard',
    filterEnabled: true,
    filterType: 'notch',
    filterFrequency: 1500,
    filterResonance: 3,
    delayEnabled: true,
    delayTime: 0.3,
    delayFeedback: 0.8,
    delayMix: 0.5,
    compressionEnabled: true,
    compressionThreshold: -8,
    compressionRatio: 8,
    compressionAttack: 0.001,
    compressionRelease: 0.2
  },

  'liquid-chord': {
    name: 'liquid-chord',
    waveform: 'sine',
    volume: 4,
    attack: 20,
    release: 80,
    detune: 8,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0.4,
    lfoDepth: 12,
    lfoTarget: 'volume',
    chorusEnabled: true,
    chorusRate: 1.2,
    chorusDepth: 0.004,
    chorusMix: 0.7,
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 1800,
    filterResonance: 1,
    delayEnabled: true,
    delayTime: 0.4,
    delayFeedback: 0.4,
    delayMix: 0.4,
    compressionEnabled: true,
    compressionThreshold: -16,
    compressionRatio: 2,
    compressionAttack: 0.03,
    compressionRelease: 0.2,
    stereoWidth: 1.4
  },

  'crystal-arp': {
    name: 'crystal-arp',
    waveform: 'triangle',
    volume: 6,
    attack: 1,
    release: 12,
    detune: 3,
    reverb: 'on',
    arpeggiator: 'up',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 600,
    filterResonance: 2,
    delayEnabled: true,
    delayTime: 0.25,
    delayFeedback: 0.5,
    delayMix: 0.5,
    chorusEnabled: true,
    chorusRate: 0.9,
    chorusDepth: 0.002,
    chorusMix: 0.4,
    stereoWidth: 1.5
  },

  // 🎛️ Sequencer-Specific Presets
  'sequencer-bass': {
    name: 'sequencer-bass',
    waveform: 'square',
    volume: 7,
    attack: 1,
    release: 30,
    detune: 2,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0.5,
    lfoDepth: 8,
    lfoTarget: 'filter',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 300,
    filterResonance: 3,
    compressionEnabled: true,
    compressionThreshold: -12,
    compressionRatio: 6,
    compressionAttack: 0.001,
    compressionRelease: 0.15,
    distortionEnabled: true,
    distortionAmount: 0.3,
    distortionType: 'soft',
    stereoWidth: 1.1
  },

  'sequencer-lead': {
    name: 'sequencer-lead',
    waveform: 'sawtooth',
    volume: 6,
    attack: 2,
    release: 20,
    detune: 5,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 2.5,
    lfoDepth: 12,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 2500,
    filterResonance: 2,
    delayEnabled: true,
    delayTime: 0.2,
    delayFeedback: 0.3,
    delayMix: 0.3,
    chorusEnabled: true,
    chorusRate: 1.1,
    chorusDepth: 0.003,
    chorusMix: 0.4,
    compressionEnabled: true,
    compressionThreshold: -10,
    compressionRatio: 4,
    compressionAttack: 0.005,
    compressionRelease: 0.1,
    stereoWidth: 1.3
  },

  'sequencer-pad': {
    name: 'sequencer-pad',
    waveform: 'sine',
    volume: 4,
    attack: 50,
    release: 80,
    detune: 8,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0.4,
    lfoDepth: 15,
    lfoTarget: 'volume',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 1200,
    filterResonance: 1,
    delayEnabled: true,
    delayTime: 0.6,
    delayFeedback: 0.4,
    delayMix: 0.4,
    chorusEnabled: true,
    chorusRate: 0.7,
    chorusDepth: 0.004,
    chorusMix: 0.6,
    compressionEnabled: true,
    compressionThreshold: -18,
    compressionRatio: 2,
    compressionAttack: 0.02,
    compressionRelease: 0.3,
    stereoWidth: 1.6
  },

  'sequencer-percussion': {
    name: 'sequencer-percussion',
    waveform: 'square',
    volume: 8,
    attack: 1,
    release: 5,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 800,
    filterResonance: 4,
    compressionEnabled: true,
    compressionThreshold: -6,
    compressionRatio: 8,
    compressionAttack: 0.001,
    compressionRelease: 0.05,
    distortionEnabled: true,
    distortionAmount: 0.4,
    distortionType: 'hard',
    stereoWidth: 1.0
  },

  'sequencer-arpeggio': {
    name: 'sequencer-arpeggio',
    waveform: 'triangle',
    volume: 5,
    attack: 1,
    release: 15,
    detune: 3,
    reverb: 'on',
    arpeggiator: 'up',
    lfoRate: 1.5,
    lfoDepth: 10,
    lfoTarget: 'filter',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 2000,
    filterResonance: 1.5,
    delayEnabled: true,
    delayTime: 0.3,
    delayFeedback: 0.5,
    delayMix: 0.4,
    chorusEnabled: true,
    chorusRate: 1.0,
    chorusDepth: 0.002,
    chorusMix: 0.3,
    compressionEnabled: true,
    compressionThreshold: -14,
    compressionRatio: 3,
    compressionAttack: 0.01,
    compressionRelease: 0.2,
    stereoWidth: 1.4
  },

  'sequencer-acid': {
    name: 'sequencer-acid',
    waveform: 'sawtooth',
    volume: 7,
    attack: 1,
    release: 25,
    detune: 6,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 3,
    lfoDepth: 20,
    lfoTarget: 'filter',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 800,
    filterResonance: 4,
    delayEnabled: true,
    delayTime: 0.4,
    delayFeedback: 0.6,
    delayMix: 0.5,
    distortionEnabled: true,
    distortionAmount: 0.5,
    distortionType: 'hard',
    compressionEnabled: true,
    compressionThreshold: -8,
    compressionRatio: 5,
    compressionAttack: 0.005,
    compressionRelease: 0.15,
    stereoWidth: 1.2
  },

  'sequencer-ambient': {
    name: 'sequencer-ambient',
    waveform: 'sine',
    volume: 3,
    attack: 100,
    release: 150,
    detune: 12,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0.2,
    lfoDepth: 25,
    lfoTarget: 'volume',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 800,
    filterResonance: 0.5,
    delayEnabled: true,
    delayTime: 1.2,
    delayFeedback: 0.7,
    delayMix: 0.6,
    chorusEnabled: true,
    chorusRate: 0.5,
    chorusDepth: 0.006,
    chorusMix: 0.8,
    compressionEnabled: true,
    compressionThreshold: -20,
    compressionRatio: 1.5,
    compressionAttack: 0.05,
    compressionRelease: 0.5,
    stereoWidth: 1.8
  },

  'sequencer-techno': {
    name: 'sequencer-techno',
    waveform: 'square',
    volume: 8,
    attack: 1,
    release: 10,
    detune: 2,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 4,
    lfoDepth: 15,
    lfoTarget: 'filter',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 1500,
    filterResonance: 3,
    delayEnabled: true,
    delayTime: 0.25,
    delayFeedback: 0.4,
    delayMix: 0.3,
    compressionEnabled: true,
    compressionThreshold: -6,
    compressionRatio: 10,
    compressionAttack: 0.001,
    compressionRelease: 0.1,
    distortionEnabled: true,
    distortionAmount: 0.3,
    distortionType: 'soft',
    stereoWidth: 1.1
  },

  // 🥁 Basic Rhythm Presets
  'rhythm-kick': {
    name: 'rhythm-kick',
    waveform: 'sine',
    volume: 9,
    attack: 1,
    release: 20,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 200,
    filterResonance: 2,
    compressionEnabled: true,
    compressionThreshold: -4,
    compressionRatio: 8,
    compressionAttack: 0.001,
    compressionRelease: 0.05,
    stereoWidth: 1.0
  },

  'rhythm-snare': {
    name: 'rhythm-snare',
    waveform: 'square',
    volume: 7,
    attack: 1,
    release: 8,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 1000,
    filterResonance: 4,
    compressionEnabled: true,
    compressionThreshold: -6,
    compressionRatio: 6,
    compressionAttack: 0.001,
    compressionRelease: 0.03,
    distortionEnabled: true,
    distortionAmount: 0.2,
    distortionType: 'soft',
    stereoWidth: 1.0
  },

  'rhythm-hihat': {
    name: 'rhythm-hihat',
    waveform: 'square',
    volume: 6,
    attack: 1,
    release: 3,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 2000,
    filterResonance: 3,
    compressionEnabled: true,
    compressionThreshold: -8,
    compressionRatio: 10,
    compressionAttack: 0.001,
    compressionRelease: 0.02,
    stereoWidth: 1.0
  },

  'rhythm-clap': {
    name: 'rhythm-clap',
    waveform: 'square',
    volume: 7,
    attack: 1,
    release: 6,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 800,
    filterResonance: 2,
    compressionEnabled: true,
    compressionThreshold: -5,
    compressionRatio: 7,
    compressionAttack: 0.001,
    compressionRelease: 0.04,
    stereoWidth: 1.0
  },

  'rhythm-tom': {
    name: 'rhythm-tom',
    waveform: 'sine',
    volume: 8,
    attack: 1,
    release: 15,
    detune: 0,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 400,
    filterResonance: 3,
    compressionEnabled: true,
    compressionThreshold: -6,
    compressionRatio: 6,
    compressionAttack: 0.001,
    compressionRelease: 0.08,
    stereoWidth: 1.0
  },

  'rhythm-crash': {
    name: 'rhythm-crash',
    waveform: 'sawtooth',
    volume: 8,
    attack: 1,
    release: 25,
    detune: 5,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 1500,
    filterResonance: 2,
    delayEnabled: true,
    delayTime: 0.1,
    delayFeedback: 0.3,
    delayMix: 0.2,
    compressionEnabled: true,
    compressionThreshold: -4,
    compressionRatio: 8,
    compressionAttack: 0.001,
    compressionRelease: 0.1,
    stereoWidth: 1.2
  },

  'rhythm-ride': {
    name: 'rhythm-ride',
    waveform: 'triangle',
    volume: 6,
    attack: 1,
    release: 12,
    detune: 2,
    reverb: 'on',
    arpeggiator: 'off',
    lfoRate: 0,
    lfoDepth: 0,
    lfoTarget: 'pitch',
    filterEnabled: true,
    filterType: 'highpass',
    filterFrequency: 1200,
    filterResonance: 2,
    delayEnabled: true,
    delayTime: 0.2,
    delayFeedback: 0.2,
    delayMix: 0.15,
    compressionEnabled: true,
    compressionThreshold: -7,
    compressionRatio: 5,
    compressionAttack: 0.001,
    compressionRelease: 0.06,
    stereoWidth: 1.1
  },

  'rhythm-bass': {
    name: 'rhythm-bass',
    waveform: 'square',
    volume: 8,
    attack: 1,
    release: 30,
    detune: 1,
    reverb: 'off',
    arpeggiator: 'off',
    lfoRate: 0.5,
    lfoDepth: 5,
    lfoTarget: 'filter',
    filterEnabled: true,
    filterType: 'lowpass',
    filterFrequency: 300,
    filterResonance: 2,
    compressionEnabled: true,
    compressionThreshold: -8,
    compressionRatio: 4,
    compressionAttack: 0.001,
    compressionRelease: 0.15,
    distortionEnabled: true,
    distortionAmount: 0.2,
    distortionType: 'soft',
    stereoWidth: 1.0
  }
};

export const SEQUENCER_TRACKS = [
  { note: 'C', frequency: 261.63 },
  { note: 'C#', frequency: 277.18 },
  { note: 'D', frequency: 293.66 },
  { note: 'D#', frequency: 311.13 },
  { note: 'E', frequency: 329.63 },
  { note: 'F', frequency: 349.23 },
  { note: 'F#', frequency: 369.99 },
  { note: 'G', frequency: 392.00 },
  { note: 'G#', frequency: 415.30 },
  { note: 'A', frequency: 440.00 },
  { note: 'A#', frequency: 466.16 },
  { note: 'B', frequency: 493.88 },
  { note: 'C2', frequency: 523.25 },
  { note: 'C#2', frequency: 554.37 },
  { note: 'D2', frequency: 587.33 },
  { note: 'D#2', frequency: 622.25 },
  { note: 'E2', frequency: 659.25 },
  { note: 'F2', frequency: 698.46 },
  { note: 'F#2', frequency: 739.99 },
  { note: 'G2', frequency: 783.99 },
  { note: 'G#2', frequency: 830.61 },
  { note: 'A2', frequency: 880.00 },
  { note: 'A#2', frequency: 932.33 },
  { note: 'B2', frequency: 987.77 }
]; 