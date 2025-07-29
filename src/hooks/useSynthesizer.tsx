import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SynthesizerState, 
  SynthesizerContextType, 
  ActiveNote, 
  WaveformType 
} from '../types/synthesizer';
import { CHORDS, CHORD_PROGRESSIONS, PRESETS, NUMBER_KEY_PATTERNS, SEQUENCER_TRACKS } from '../data/synthesizerData';

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
  isDraggingCircle: false
};

export const useSynthesizer = (): SynthesizerContextType => {
  const [state, setState] = useState<SynthesizerState>(initialState);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const activeNotesRef = useRef<Record<string, ActiveNote>>({});
  const sequenceRef = useRef<Record<string, boolean[]>>({});
  const sequenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pressedKeysRef = useRef<Set<number>>(new Set());

  // Initialize audio context and nodes
  useEffect(() => {
    const initAudio = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const masterGain = audioContext.createGain();
        const dryGain = audioContext.createGain();
        const wetGain = audioContext.createGain();
        const convolver = audioContext.createConvolver();

        masterGain.connect(audioContext.destination);
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

  // Update volume when state changes
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = state.volume / 100;
    }
  }, [state.volume]);

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
    
    gain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gain.gain.linearRampToValueAtTime(1, audioContextRef.current.currentTime + state.attack / 100);
    
    osc.start();
    lfo.start();
    activeNotesRef.current[noteId] = { osc, gain, lfo, freq: frequency };
    
    if (element) {
      element.classList.add('active');
    }
  }, [state.waveform, state.detune, state.lfoRate, state.lfoDepth, state.lfoTarget, state.reverbEnabled, state.attack]);

  const stopNote = useCallback((freq: number, element?: HTMLElement | null) => {
    const frequency = parseFloat(freq.toString());
    if (isNaN(frequency)) return;
    
    const notesToStop = Object.entries(activeNotesRef.current).filter(
      ([id, note]) => Math.abs(note.freq - frequency) < 0.1
    );
    
    notesToStop.forEach(([noteId, note]) => {
      const { osc, gain, lfo } = note;
      
      const currentGain = gain.gain.value;
      const fadeTime = Math.max(0.1, state.release / 100);
      
      gain.gain.cancelScheduledValues(audioContextRef.current!.currentTime);
      gain.gain.setValueAtTime(currentGain, audioContextRef.current!.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioContextRef.current!.currentTime + fadeTime);
      
      osc.stop(audioContextRef.current!.currentTime + fadeTime);
      lfo.stop(audioContextRef.current!.currentTime + fadeTime);
      
      setTimeout(() => {
        delete activeNotesRef.current[noteId];
      }, fadeTime * 1000);
    });
    
    if (element) {
      element.classList.remove('active');
    }
  }, [state.release]);

  const playChord = useCallback((chordName: string) => {
    const chord = CHORDS[chordName];
    if (!chord || !audioContextRef.current || !masterGainRef.current) return;

    const validFreqs = chord.frequencies.filter(freq => !isNaN(parseFloat(freq.toString())) && parseFloat(freq.toString()) > 0);
    
    const chordGain = audioContextRef.current.createGain();
    chordGain.gain.value = 0.3;
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
      
      gain.gain.setValueAtTime(0, audioContextRef.current!.currentTime);
      gain.gain.linearRampToValueAtTime(1, audioContextRef.current!.currentTime + state.attack / 100);
      
      osc.start();
      lfo.start();
      
      setTimeout(() => {
        gain.gain.cancelScheduledValues(audioContextRef.current!.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, audioContextRef.current!.currentTime);
        const smoothRelease = Math.max(0.5, state.release * 2 / 100);
        gain.gain.linearRampToValueAtTime(0, audioContextRef.current!.currentTime + smoothRelease);
        osc.stop(audioContextRef.current!.currentTime + smoothRelease);
        lfo.stop(audioContextRef.current!.currentTime + smoothRelease);
      }, 1000);
    });
  }, [state.waveform, state.detune, state.lfoRate, state.lfoDepth, state.lfoTarget, state.reverbEnabled, state.attack, state.release]);

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
          if (sequenceRef.current[track.note][prev.currentStep]) {
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
  }, []);

  const toggleDrawMode = useCallback(() => {
    updateState(prev => ({ ...prev, drawMode: !prev.drawMode }));
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
        sequenceRef.current[note][step] = true;
      }
    });
  }, [state.steps, clearSequence]);

  const resetDetune = useCallback(() => {
    updateState({ detune: 0 });
    
    Object.values(activeNotesRef.current).forEach(({ osc }) => {
      osc.detune.setValueAtTime(0, audioContextRef.current!.currentTime);
    });
  }, [updateState]);

  const toggleSustain = useCallback(() => {
    updateState(prev => ({ ...prev, sustainMode: !prev.sustainMode }));
    
    if (!state.sustainMode) {
      Object.values(activeNotesRef.current).forEach(note => {
        stopNote(note.freq);
      });
    }
  }, [state.sustainMode, stopNote, updateState]);

  const setWaveform = useCallback((waveform: WaveformType) => {
    updateState({ waveform });
  }, [updateState]);

  const adjustParameter = useCallback((param: keyof SynthesizerState, delta: number) => {
    updateState(prev => {
      const currentValue = prev[param];
      if (typeof currentValue === 'number') {
        return { ...prev, [param]: Math.max(0, Math.min(100, currentValue + delta)) };
      }
      return {};
    });
  }, [updateState]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Number keys for patterns (0-9)
      if (e.key >= '0' && e.key <= '9') {
        const number = parseInt(e.key);
        loadPattern(number);
      }

      // Spacebar to play/stop sequencer
      if (e.code === 'Space') {
        e.preventDefault();
        if (state.isPlaying) {
          stopSequence();
        } else {
          playSequence();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loadPattern, state.isPlaying, stopSequence, playSequence]);

  // Mouse event handlers for draw mode
  useEffect(() => {
    const handleMouseDown = () => {
      if (state.drawMode) {
        updateState({ isDrawing: true });
      }
    };

    const handleMouseUp = () => {
      if (state.drawMode) {
        updateState({ isDrawing: false });
      }
      updateState({ isDraggingCircle: false });
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [state.drawMode, updateState]);

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
    adjustParameter
  };
}; 