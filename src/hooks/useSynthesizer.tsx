import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SynthesizerState, 
  SynthesizerContextType, 
  ActiveNote, 
  WaveformType 
} from '../types/synthesizer';
import { CHORDS, CHORD_PROGRESSIONS, PRESETS, NUMBER_KEY_PATTERNS, SEQUENCER_TRACKS, NOTES } from '../data/synthesizerData';

const initialState: SynthesizerState = {
  waveform: 'sine',
  volume: 20,
  attack: 1,
  release: 10,
  detune: 0,
  reverbEnabled: false,
  lfoRate: 0,
  lfoDepth: 5,
  lfoTarget: 'pitch',
  sustainMode: false,
  bpm: 120,
  steps: 8,
  isPlaying: false,
  currentStep: 0,
  drawMode: false,
  isDrawing: false,
  isDraggingCircle: false,
  arpeggiatorMode: 'off',
  arpeggiatorRate: 8
};

export const useSynthesizer = (): SynthesizerContextType => {
  const [state, setState] = useState<SynthesizerState>(initialState);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const limiterRef = useRef<DynamicsCompressorNode | null>(null);
  const activeNotesRef = useRef<Record<string, ActiveNote>>({});
  const sequenceRef = useRef<Record<string, boolean[]>>({});
  const sequenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pressedKeysRef = useRef<Set<number>>(new Set());
  const arpeggiatorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const arpeggiatorNotesRef = useRef<number[]>([]);
  const arpeggiatorIndexRef = useRef<number>(0);
  const arpeggiatorDirectionRef = useRef<number>(1);

  // Initialize audio context and nodes
  useEffect(() => {
    const initAudio = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const masterGain = audioContext.createGain();
        const dryGain = audioContext.createGain();
        const wetGain = audioContext.createGain();
        const convolver = audioContext.createConvolver();
        
        // Create limiter to prevent clipping
        const limiter = audioContext.createDynamicsCompressor();
        limiter.threshold.value = -1; // Start limiting at -1dB
        limiter.knee.value = 0; // Hard knee for sharp limiting
        limiter.ratio.value = 20; // High ratio for hard limiting
        limiter.attack.value = 0.001; // Very fast attack
        limiter.release.value = 0.1; // Fast release

        // Connect audio chain with limiter
        masterGain.connect(limiter);
        limiter.connect(audioContext.destination);
        masterGain.gain.value = state.volume / 100;

        dryGain.connect(masterGain);
        wetGain.connect(masterGain);
        convolver.connect(wetGain);

        // Create reverb impulse response
        const rate = audioContext.sampleRate;
        const length = rate * 2;
        const impulse = audioContext.createBuffer(2, length, rate);
        for (let i = 0; i < 2; i++) {
          const ch = impulse.getChannelData(i);
          for (let j = 0; j < length; j++) {
            ch[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 2);
          }
        }
        convolver.buffer = impulse;

        audioContextRef.current = audioContext;
        masterGainRef.current = masterGain;
        dryGainRef.current = dryGain;
        wetGainRef.current = wetGain;
        convolverRef.current = convolver;
        limiterRef.current = limiter;

        // Initialize sequence
        SEQUENCER_TRACKS.forEach(track => {
          sequenceRef.current[track.note] = new Array(32).fill(false);
        });
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update volume when state changes with anti-clipping protection
  useEffect(() => {
    if (masterGainRef.current) {
      // Apply volume with additional headroom to prevent clipping
      const safeVolume = Math.min(state.volume / 100, 0.8); // Cap at 80% to prevent clipping
      masterGainRef.current.gain.value = safeVolume;
    }
  }, [state.volume]);

  // Update detune for all playing notes when detune changes
  useEffect(() => {
    Object.values(activeNotesRef.current).forEach(({ osc }) => {
      osc.detune.setValueAtTime(state.detune, audioContextRef.current!.currentTime);
    });
  }, [state.detune]);

  // Update waveform for all playing notes when waveform changes
  useEffect(() => {
    Object.values(activeNotesRef.current).forEach(({ osc }) => {
      osc.type = state.waveform;
    });
  }, [state.waveform]);

  // Update LFO for all playing notes when LFO parameters change
  useEffect(() => {
    Object.values(activeNotesRef.current).forEach(({ lfo }) => {
      lfo.frequency.setValueAtTime(state.lfoRate, audioContextRef.current!.currentTime);
    });
  }, [state.lfoRate]);

  // Update reverb routing when reverb is toggled
  useEffect(() => {
    if (dryGainRef.current && wetGainRef.current) {
      if (state.reverbEnabled) {
        dryGainRef.current.gain.value = 0.7;
        wetGainRef.current.gain.value = 0.3;
      } else {
        dryGainRef.current.gain.value = 1.0;
        wetGainRef.current.gain.value = 0.0;
      }
    }
  }, [state.reverbEnabled]);

  // Calculate optimal gain to prevent clipping based on number of notes
  const calculateOptimalGain = useCallback((numNotes: number): number => {
    // Base gain for single notes
    const baseGain = 0.8;
    
    // Reduce gain logarithmically as more notes are added
    // This prevents the sum of multiple sine waves from clipping
    if (numNotes <= 1) return baseGain;
    if (numNotes <= 2) return baseGain * 0.85;
    if (numNotes <= 3) return baseGain * 0.7;
    if (numNotes <= 4) return baseGain * 0.6;
    if (numNotes <= 5) return baseGain * 0.5;
    if (numNotes <= 6) return baseGain * 0.45;
    if (numNotes <= 7) return baseGain * 0.4;
    return baseGain * 0.35; // For 8+ notes
  }, []);

  const updateState = useCallback((updates: Partial<SynthesizerState> | ((prev: SynthesizerState) => Partial<SynthesizerState>)) => {
    setState(prev => {
      const newUpdates = typeof updates === 'function' ? updates(prev) : updates;
      return { ...prev, ...newUpdates };
    });
  }, []);

  const startNote = useCallback((freq: number, element?: HTMLElement | null) => {
    if (!audioContextRef.current || !dryGainRef.current || !wetGainRef.current) return;

    const frequency = parseFloat(freq.toString());
    if (isNaN(frequency) || frequency <= 0) return;

    const noteId = frequency + '_' + Date.now() + '_' + Math.random();
    
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    
    // Create LFO
    const lfo = audioContextRef.current.createOscillator();
    const lfoGain = audioContextRef.current.createGain();
    lfo.frequency.value = state.lfoRate;
    lfoGain.gain.value = state.lfoDepth;
    lfo.connect(lfoGain);
    
    // Calculate optimal gain to prevent clipping
    const optimalGain = calculateOptimalGain(1); // Single note
    gain.gain.value = optimalGain;
    
    osc.type = state.waveform;
    osc.frequency.value = frequency;
    osc.detune.value = state.detune;
    
    // Apply LFO based on target
    if (state.lfoTarget === 'pitch') {
      lfoGain.connect(osc.detune);
    } else if (state.lfoTarget === 'volume') {
      lfoGain.connect(gain.gain);
    } else if (state.lfoTarget === 'filter') {
      const filter = audioContextRef.current.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      filter.Q.value = 1;
      lfoGain.connect(filter.frequency);
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }
    
    if (state.lfoTarget !== 'filter') {
      osc.connect(gain);
    }
    
    gain.connect(dryGainRef.current);
    if (state.reverbEnabled && convolverRef.current) {
      gain.connect(convolverRef.current);
    }
    
    // Apply attack envelope - convert from 0-100 to 0-2 seconds
    const attackTime = (state.attack / 100) * 2; // 0 to 2 seconds
    gain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gain.gain.linearRampToValueAtTime(optimalGain, audioContextRef.current.currentTime + attackTime);
    
    osc.start();
    lfo.start();
    activeNotesRef.current[noteId] = { osc, gain, lfo, freq: frequency };
    
    if (element) {
      element.classList.add('active');
    }
  }, [state.waveform, state.detune, state.lfoRate, state.lfoDepth, state.lfoTarget, state.reverbEnabled, state.attack, calculateOptimalGain]);

  const stopNote = useCallback((freq: number, element?: HTMLElement | null) => {
    const frequency = parseFloat(freq.toString());
    if (isNaN(frequency)) return;
    
    const notesToStop = Object.entries(activeNotesRef.current).filter(
      ([id, note]) => Math.abs(note.freq - frequency) < 0.1
    );
    
    notesToStop.forEach(([noteId, note]) => {
      const { osc, gain, lfo } = note;
      
      const currentGain = gain.gain.value;
      // Apply release envelope - convert from 0-100 to 0.1-3 seconds
      const releaseTime = Math.max(0.1, (state.release / 100) * 3); // 0.1 to 3 seconds
      
      gain.gain.cancelScheduledValues(audioContextRef.current!.currentTime);
      gain.gain.setValueAtTime(currentGain, audioContextRef.current!.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioContextRef.current!.currentTime + releaseTime);
      
      osc.stop(audioContextRef.current!.currentTime + releaseTime);
      lfo.stop(audioContextRef.current!.currentTime + releaseTime);
      
      setTimeout(() => {
        delete activeNotesRef.current[noteId];
      }, releaseTime * 1000);
    });
    
    if (element) {
      element.classList.remove('active');
    }
  }, [state.release]);

  const playChord = useCallback((chordName: string) => {
    const chord = CHORDS[chordName];
    if (!chord || !audioContextRef.current || !masterGainRef.current) return;

    const validFreqs = chord.frequencies.filter(freq => !isNaN(parseFloat(freq.toString())) && parseFloat(freq.toString()) > 0);
    
    // Calculate optimal gain based on number of notes in chord
    const optimalGain = calculateOptimalGain(validFreqs.length);
    
    const chordGain = audioContextRef.current.createGain();
    chordGain.gain.value = optimalGain;
    chordGain.connect(masterGainRef.current);
    
    validFreqs.forEach(freq => {
      const osc = audioContextRef.current!.createOscillator();
      const gain = audioContextRef.current!.createGain();
      
      const lfo = audioContextRef.current!.createOscillator();
      const lfoGain = audioContextRef.current!.createGain();
      lfo.frequency.value = state.lfoRate;
      lfoGain.gain.value = state.lfoDepth;
      lfo.connect(lfoGain);
      
      osc.type = state.waveform;
      osc.frequency.value = freq;
      osc.detune.value = state.detune;
      
      if (state.lfoTarget === 'pitch') {
        lfoGain.connect(osc.detune);
      } else if (state.lfoTarget === 'volume') {
        lfoGain.connect(gain.gain);
      } else if (state.lfoTarget === 'filter') {
        const filter = audioContextRef.current!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;
        lfoGain.connect(filter.frequency);
        osc.connect(filter);
        filter.connect(gain);
      } else {
        osc.connect(gain);
      }
      
      if (state.lfoTarget !== 'filter') {
        osc.connect(gain);
      }
      
      gain.connect(chordGain);
      if (state.reverbEnabled && convolverRef.current) {
        gain.connect(convolverRef.current);
      }
      
      // Apply attack envelope - convert from 0-100 to 0-2 seconds
      const attackTime = (state.attack / 100) * 2; // 0 to 2 seconds
      gain.gain.setValueAtTime(0, audioContextRef.current!.currentTime);
      gain.gain.linearRampToValueAtTime(1, audioContextRef.current!.currentTime + attackTime);
      
      osc.start();
      lfo.start();
      
      setTimeout(() => {
        gain.gain.cancelScheduledValues(audioContextRef.current!.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, audioContextRef.current!.currentTime);
        // Apply release envelope - convert from 0-100 to 0.1-3 seconds
        const releaseTime = Math.max(0.1, (state.release / 100) * 3); // 0.1 to 3 seconds
        gain.gain.linearRampToValueAtTime(0, audioContextRef.current!.currentTime + releaseTime);
        osc.stop(audioContextRef.current!.currentTime + releaseTime);
        lfo.stop(audioContextRef.current!.currentTime + releaseTime);
      }, 1000);
    });
  }, [state.waveform, state.detune, state.lfoRate, state.lfoDepth, state.lfoTarget, state.reverbEnabled, state.attack, state.release, calculateOptimalGain]);

  const playProgression = useCallback((progressionName: string) => {
    const progression = CHORD_PROGRESSIONS[progressionName];
    if (!progression) return;

    let currentChord = 0;
    
    const playNextChord = () => {
      if (currentChord < progression.chords.length) {
        playChord(progression.chords[currentChord]);
        currentChord++;
        setTimeout(playNextChord, 1000);
      }
    };
    
    playNextChord();
  }, [playChord]);

  const loadPreset = useCallback((presetName: string) => {
    const preset = PRESETS[presetName];
    if (!preset) return;

    updateState({
      waveform: preset.waveform,
      attack: preset.attack,
      release: preset.release,
      detune: preset.detune,
      reverbEnabled: preset.reverb === 'on',
      lfoRate: preset.lfoRate,
      lfoDepth: preset.lfoDepth,
      lfoTarget: preset.lfoTarget
    });

    // Update detune for all currently playing notes
    Object.values(activeNotesRef.current).forEach(({ osc }) => {
      osc.detune.setValueAtTime(preset.detune, audioContextRef.current!.currentTime);
    });
  }, [updateState]);

  const playSequence = useCallback(() => {
    if (state.isPlaying) return;
    
    updateState({ isPlaying: true, currentStep: 0 });
    
    const stepTime = (60 / state.bpm) * 4 / state.steps;
    
    sequenceIntervalRef.current = setInterval(() => {
      setState(prev => {
        const newStep = (prev.currentStep + 1) % prev.steps;
        
        // Play notes for current step
        SEQUENCER_TRACKS.forEach(track => {
          if (sequenceRef.current[track.note] && sequenceRef.current[track.note][prev.currentStep]) {
            startNote(track.frequency);
            
            setTimeout(() => {
              stopNote(track.frequency);
            }, stepTime * 1000 * 0.6);
          }
        });
        
        return { ...prev, currentStep: newStep };
      });
    }, stepTime * 1000);
  }, [state.isPlaying, state.bpm, state.steps, startNote, stopNote, updateState]);

  const stopSequence = useCallback(() => {
    if (!state.isPlaying) return;
    
    updateState({ isPlaying: false, currentStep: 0 });
    
    if (sequenceIntervalRef.current) {
      clearInterval(sequenceIntervalRef.current);
      sequenceIntervalRef.current = null;
    }
    
    // Stop all playing notes
    Object.values(activeNotesRef.current).forEach(note => {
      stopNote(note.freq);
    });
  }, [state.isPlaying, stopNote, updateState]);

  const clearSequence = useCallback(() => {
    Object.keys(sequenceRef.current).forEach(note => {
      sequenceRef.current[note].fill(false);
    });
    updateState({ currentStep: 0 });
  }, [updateState]);

  const toggleDrawMode = useCallback(() => {
    updateState(prev => ({ drawMode: !prev.drawMode }));
  }, [updateState]);

  const loadPattern = useCallback((number: number) => {
    const pattern = NUMBER_KEY_PATTERNS[number];
    if (!pattern) return;
    
    clearSequence();
    
    const noteNames = SEQUENCER_TRACKS.map(track => track.note);
    
    pattern.forEach(step => {
      if (step < state.steps) {
        const trackIndex = step % noteNames.length;
        const note = noteNames[trackIndex];
        if (!sequenceRef.current[note]) {
          sequenceRef.current[note] = new Array(32).fill(false);
        }
        sequenceRef.current[note][step] = true;
      }
    });
  }, [state.steps, clearSequence]);

  const resetDetune = useCallback(() => {
    updateState({ detune: 0 });
    
    // Update detune for all currently playing notes
    Object.values(activeNotesRef.current).forEach(({ osc }) => {
      osc.detune.setValueAtTime(0, audioContextRef.current!.currentTime);
    });
  }, [updateState]);

  const toggleSustain = useCallback(() => {
    updateState(prev => ({ sustainMode: !prev.sustainMode }));
  }, [updateState]);

  const startArpeggiator = useCallback((notes: number[]) => {
    if (state.arpeggiatorMode === 'off' || notes.length === 0) return;
    
    // Stop existing arpeggiator
    if (arpeggiatorIntervalRef.current) {
      clearInterval(arpeggiatorIntervalRef.current);
    }
    
    arpeggiatorNotesRef.current = [...notes].sort((a, b) => a - b);
    arpeggiatorIndexRef.current = 0;
    arpeggiatorDirectionRef.current = 1;
    
    const stepTime = (60 / state.bpm) * 4 / state.arpeggiatorRate;
    
    arpeggiatorIntervalRef.current = setInterval(() => {
      if (arpeggiatorNotesRef.current.length === 0) return;
      
      const note = arpeggiatorNotesRef.current[arpeggiatorIndexRef.current];
      startNote(note);
      
      // Stop the note after a short duration
      setTimeout(() => {
        stopNote(note);
      }, stepTime * 1000 * 0.6);
      
      // Update index based on mode
      switch (state.arpeggiatorMode) {
        case 'up':
          arpeggiatorIndexRef.current = (arpeggiatorIndexRef.current + 1) % arpeggiatorNotesRef.current.length;
          break;
        case 'down':
          arpeggiatorIndexRef.current = arpeggiatorIndexRef.current === 0 
            ? arpeggiatorNotesRef.current.length - 1 
            : arpeggiatorIndexRef.current - 1;
          break;
        case 'updown':
          arpeggiatorIndexRef.current += arpeggiatorDirectionRef.current;
          if (arpeggiatorIndexRef.current >= arpeggiatorNotesRef.current.length - 1) {
            arpeggiatorDirectionRef.current = -1;
          } else if (arpeggiatorIndexRef.current <= 0) {
            arpeggiatorDirectionRef.current = 1;
          }
          break;
        case 'random':
          arpeggiatorIndexRef.current = Math.floor(Math.random() * arpeggiatorNotesRef.current.length);
          break;
      }
    }, stepTime * 1000);
  }, [state.arpeggiatorMode, state.bpm, state.arpeggiatorRate, startNote, stopNote]);

  const stopArpeggiator = useCallback(() => {
    if (arpeggiatorIntervalRef.current) {
      clearInterval(arpeggiatorIntervalRef.current);
      arpeggiatorIntervalRef.current = null;
    }
    arpeggiatorNotesRef.current = [];
    arpeggiatorIndexRef.current = 0;
  }, []);

  const setArpeggiatorMode = useCallback((mode: 'off' | 'up' | 'down' | 'updown' | 'random') => {
    updateState({ arpeggiatorMode: mode });
    if (mode === 'off') {
      stopArpeggiator();
    } else if (arpeggiatorNotesRef.current.length > 0) {
      startArpeggiator(arpeggiatorNotesRef.current);
    }
  }, [updateState, stopArpeggiator, startArpeggiator]);

  const setWaveform = useCallback((waveform: WaveformType) => {
    updateState({ waveform });
    
    // Update waveform for all currently playing notes
    Object.values(activeNotesRef.current).forEach(({ osc }) => {
      osc.type = waveform;
    });
  }, [updateState]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    
    // Shift key to enable sustain mode (momentary)
    if (e.key === 'Shift') {
      e.preventDefault();
      updateState({ sustainMode: true });
      return;
    }
    
    // ESC key to stop all sounds
    if (e.key === 'Escape') {
      e.preventDefault();
      // Stop all active notes
      Object.values(activeNotesRef.current).forEach(note => {
        stopNote(note.freq);
      });
      // Stop sequencer if playing
      if (state.isPlaying) {
        stopSequence();
      }
      // Stop arpeggiator if active
      if (state.arpeggiatorMode !== 'off') {
        stopArpeggiator();
      }
      return;
    }
    
    // Spacebar to play/stop sequencer
    if (e.code === 'Space') {
      e.preventDefault();
      if (state.isPlaying) {
        stopSequence();
      } else {
        playSequence();
      }
      return;
    }
    
    // Number keys for patterns (0-9)
    if (e.key >= '0' && e.key <= '9') {
      const number = parseInt(e.key);
      loadPattern(number);
      return;
    }
    
    const key = e.key.toLowerCase();
    const note = NOTES.find(n => n.key === key);
    
    if (note && !pressedKeysRef.current.has(note.freq)) {
      pressedKeysRef.current.add(note.freq);
      
      // If arpeggiator is on and we have multiple notes, start arpeggiator
      if (state.arpeggiatorMode !== 'off' && pressedKeysRef.current.size > 1) {
        stopArpeggiator();
        startArpeggiator(Array.from(pressedKeysRef.current));
      } else if (state.arpeggiatorMode === 'off') {
        startNote(note.freq);
      }
    }
  }, [startNote, state.isPlaying, state.arpeggiatorMode, stopSequence, playSequence, loadPattern, stopArpeggiator, startArpeggiator, updateState, stopNote]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    // Shift key to disable sustain mode (momentary)
    if (e.key === 'Shift') {
      e.preventDefault();
      updateState({ sustainMode: false });
      // Stop all notes when sustain is released
      Object.values(activeNotesRef.current).forEach(note => {
        stopNote(note.freq);
      });
      return;
    }
    
    const key = e.key.toLowerCase();
    const note = NOTES.find(n => n.key === key);
    
    if (note) {
      pressedKeysRef.current.delete(note.freq);
      
      if (state.arpeggiatorMode !== 'off') {
        // Update arpeggiator with remaining notes
        if (pressedKeysRef.current.size > 0) {
          startArpeggiator(Array.from(pressedKeysRef.current));
        } else {
          stopArpeggiator();
        }
      } else if (!state.sustainMode) {
        stopNote(note.freq);
      }
    }
  }, [state.sustainMode, state.arpeggiatorMode, stopNote, startArpeggiator, stopArpeggiator, updateState]);

  const handleMouseDown = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    // Mouse up handling if needed
  }, []);

  // Update sequencer interval when BPM or steps change
  useEffect(() => {
    if (state.isPlaying && sequenceIntervalRef.current) {
      // Clear existing interval
      clearInterval(sequenceIntervalRef.current);
      
      // Create new interval with updated timing
      const stepTime = (60 / state.bpm) * 4 / state.steps;
      
      sequenceIntervalRef.current = setInterval(() => {
        setState(prev => {
          const newStep = (prev.currentStep + 1) % prev.steps;
          
          // Play notes for current step
          SEQUENCER_TRACKS.forEach(track => {
            if (sequenceRef.current[track.note] && sequenceRef.current[track.note][prev.currentStep]) {
              startNote(track.frequency);
              
              setTimeout(() => {
                stopNote(track.frequency);
              }, stepTime * 1000 * 0.6);
            }
          });
          
          return { ...prev, currentStep: newStep };
        });
      }, stepTime * 1000);
    }
  }, [state.bpm, state.steps, state.isPlaying, startNote, stopNote]);

  // Initialize sequence state properly
  useEffect(() => {
    SEQUENCER_TRACKS.forEach(track => {
      if (!sequenceRef.current[track.note]) {
        sequenceRef.current[track.note] = new Array(32).fill(false);
      }
    });
  }, []);

  // Cleanup arpeggiator on unmount
  useEffect(() => {
    return () => {
      if (arpeggiatorIntervalRef.current) {
        clearInterval(arpeggiatorIntervalRef.current);
      }
    };
  }, []);

  // Update arpeggiator when rate changes
  useEffect(() => {
    if (state.arpeggiatorMode !== 'off' && arpeggiatorNotesRef.current.length > 0) {
      startArpeggiator(arpeggiatorNotesRef.current);
    }
  }, [state.arpeggiatorRate, startArpeggiator]);

  return {
    state,
    audioContext: audioContextRef.current,
    masterGain: masterGainRef.current,
    activeNotes: activeNotesRef.current,
    sequence: sequenceRef.current,
    updateState,
    startNote,
    stopNote,
    playChord,
    playProgression,
    loadPreset,
    playSequence,
    stopSequence,
    clearSequence,
    toggleDrawMode,
    loadPattern,
    resetDetune,
    toggleSustain,
    setWaveform,
    setArpeggiatorMode,
    handleKeyDown,
    handleKeyUp,
    handleMouseDown,
    handleMouseUp
  };
}; 