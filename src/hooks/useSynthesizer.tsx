import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SynthesizerState, 
  SynthesizerContextType, 
  ActiveNote, 
  WaveformType 
} from '../types/synthesizer';
import { CHORDS, CHORD_PROGRESSIONS, PRESETS, NUMBER_KEY_PATTERNS, RHYTHM_PATTERNS, SCRYPTURE_RHYTHM_PATTERNS, SEQUENCER_TRACKS, NOTES } from '../data/synthesizerData';



const initialState: SynthesizerState = {
  waveform: 'sine',
  volume: 1,
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
  isPlaying: false,
  currentStep: 0,
  drawMode: false,
  isDrawing: false,
  isDraggingCircle: false,
  arpeggiatorMode: 'off',
  arpeggiatorRate: 8,
  
  // New Effects - Default Values
  delayEnabled: false,
  delayTime: 0.3,
  delayFeedback: 0.3,
  delayMix: 0.5,
  
  chorusEnabled: false,
  chorusRate: 1.5,
  chorusDepth: 0.002,
  chorusMix: 0.5,
  
  distortionEnabled: false,
  distortionAmount: 0.3,
  distortionType: 'soft',
  
  filterEnabled: false,
  filterType: 'lowpass',
  filterFrequency: 2000,
  filterResonance: 1,
  filterEnvelopeEnabled: false,
  filterAttack: 0.1,
  filterDecay: 0.3,
  filterSustain: 0.5,
  filterRelease: 0.5,
  
  compressionEnabled: false,
  compressionThreshold: -24,
  compressionRatio: 4,
  compressionAttack: 0.003,
  compressionRelease: 0.25,
  
  stereoWidth: 1,
  panningEnabled: false,
  panningAmount: 0,
  
  // Sequencer improvements
  isBpmSliding: false,
  pendingBpmChange: null,
  gridAlignment: 'quantize',
};

export const useSynthesizer = (): SynthesizerContextType => {
  const [state, setState] = useState<SynthesizerState>(initialState);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const limiterRef = useRef<DynamicsCompressorNode | null>(null);
  
  // New effect nodes
  const delayRef = useRef<DelayNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);
  const delayFeedbackRef = useRef<GainNode | null>(null);
  const chorusRef = useRef<GainNode | null>(null);
  const distortionRef = useRef<WaveShaperNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const stereoWidthRef = useRef<GainNode | null>(null);
  const panningRef = useRef<StereoPannerNode | null>(null);
  
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
        
        // Create new effect nodes
        const delay = audioContext.createDelay(2.0); // Max 2 second delay
        const delayGain = audioContext.createGain();
        const delayFeedback = audioContext.createGain();
        const chorus = audioContext.createGain();
        const distortion = audioContext.createWaveShaper();
        const filter = audioContext.createBiquadFilter();
        const compressor = audioContext.createDynamicsCompressor();
        const stereoWidth = audioContext.createGain();
        const panning = audioContext.createStereoPanner();
        
        // Create limiter to prevent clipping
        const limiter = audioContext.createDynamicsCompressor();
        limiter.threshold.value = -1; // Start limiting at -1dB
        limiter.knee.value = 0; // Hard knee for sharp limiting
        limiter.ratio.value = 20; // High ratio for hard limiting
        limiter.attack.value = 0.001; // Very fast attack
        limiter.release.value = 0.1; // Fast release

        // Configure effect nodes
        delay.delayTime.value = state.delayTime;
        delayGain.gain.value = state.delayMix;
        delayFeedback.gain.value = state.delayFeedback;
        
        filter.type = state.filterType;
        filter.frequency.value = state.filterFrequency;
        filter.Q.value = state.filterResonance;
        
        compressor.threshold.value = state.compressionThreshold;
        compressor.ratio.value = state.compressionRatio;
        compressor.attack.value = state.compressionAttack;
        compressor.release.value = state.compressionRelease;
        
        stereoWidth.gain.value = state.stereoWidth;
        panning.pan.value = state.panningAmount;

        // Connect audio chain with effects
        masterGain.connect(limiter);
        limiter.connect(audioContext.destination);
        masterGain.gain.value = state.volume / 100;

        // Main audio path with effects (effects will be bypassed when disabled)
        dryGain.connect(filter);
        filter.connect(distortion);
        distortion.connect(compressor);
        compressor.connect(stereoWidth);
        stereoWidth.connect(panning);
        panning.connect(masterGain);
        
        // Reverb path: wetGain → convolver → masterGain
        wetGain.connect(masterGain);
        convolver.connect(wetGain);
        
        // Delay path: delay → delayGain → delayFeedback → delay (feedback loop)
        delay.connect(delayGain);
        delayGain.connect(delayFeedback);
        delayFeedback.connect(delay);
        delayGain.connect(masterGain);
        
        // Chorus path: chorus → masterGain
        chorus.connect(masterGain);

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
        
        // Store new effect nodes
        delayRef.current = delay;
        delayGainRef.current = delayGain;
        delayFeedbackRef.current = delayFeedback;
        chorusRef.current = chorus;
        distortionRef.current = distortion;
        filterRef.current = filter;
        compressorRef.current = compressor;
        stereoWidthRef.current = stereoWidth;
        panningRef.current = panning;

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
      // Apply volume with much more conservative scaling
      // 1% = 0.01, 50% = 0.25, 100% = 0.5 (max)
      const safeVolume = Math.min(state.volume / 200, 0.5); // Much more conservative scaling
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

  // Update delay parameters
  useEffect(() => {
    if (delayRef.current) {
      delayRef.current.delayTime.setValueAtTime(state.delayTime, audioContextRef.current!.currentTime);
    }
    if (delayGainRef.current) {
      delayGainRef.current.gain.setValueAtTime(state.delayMix, audioContextRef.current!.currentTime);
    }
    if (delayFeedbackRef.current) {
      delayFeedbackRef.current.gain.setValueAtTime(state.delayFeedback, audioContextRef.current!.currentTime);
    }
  }, [state.delayTime, state.delayMix, state.delayFeedback]);

  // Update filter parameters
  useEffect(() => {
    if (filterRef.current) {
      filterRef.current.type = state.filterType;
      filterRef.current.frequency.setValueAtTime(state.filterFrequency, audioContextRef.current!.currentTime);
      filterRef.current.Q.setValueAtTime(state.filterResonance, audioContextRef.current!.currentTime);
    }
  }, [state.filterType, state.filterFrequency, state.filterResonance]);

  // Update compression parameters
  useEffect(() => {
    if (compressorRef.current) {
      compressorRef.current.threshold.setValueAtTime(state.compressionThreshold, audioContextRef.current!.currentTime);
      compressorRef.current.ratio.setValueAtTime(state.compressionRatio, audioContextRef.current!.currentTime);
      compressorRef.current.attack.setValueAtTime(state.compressionAttack, audioContextRef.current!.currentTime);
      compressorRef.current.release.setValueAtTime(state.compressionRelease, audioContextRef.current!.currentTime);
    }
  }, [state.compressionThreshold, state.compressionRatio, state.compressionAttack, state.compressionRelease]);

  // Update stereo width and panning
  useEffect(() => {
    if (stereoWidthRef.current) {
      stereoWidthRef.current.gain.setValueAtTime(state.stereoWidth, audioContextRef.current!.currentTime);
    }
    if (panningRef.current) {
      panningRef.current.pan.setValueAtTime(state.panningAmount, audioContextRef.current!.currentTime);
    }
  }, [state.stereoWidth, state.panningAmount]);

  // Create distortion curve based on type and amount
  const createDistortionCurve = useCallback((amount: number, type: 'soft' | 'hard' | 'bitcrusher'): Float32Array => {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      
      switch (type) {
        case 'soft':
          curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
          break;
        case 'hard':
          curve[i] = Math.sign(x) * (1 - Math.exp(-Math.abs(x) * amount));
          break;
        case 'bitcrusher':
          const bits = Math.max(1, Math.floor(16 * (1 - amount)));
          const levels = Math.pow(2, bits);
          curve[i] = Math.round(x * levels) / levels;
          break;
      }
    }
    return curve;
  }, []);



  // Update effect bypass states by adjusting effect parameters
  useEffect(() => {
    if (filterRef.current) {
      if (state.filterEnabled) {
        // Enable filter by setting normal parameters
        filterRef.current.frequency.value = state.filterFrequency;
        filterRef.current.Q.value = state.filterResonance;
      } else {
        // Disable filter by setting it to pass-through
        filterRef.current.frequency.value = 20000; // Very high frequency = pass-through
        filterRef.current.Q.value = 0; // No resonance
      }
    }
  }, [state.filterEnabled, state.filterFrequency, state.filterResonance]);

  useEffect(() => {
    if (distortionRef.current) {
      if (state.distortionEnabled) {
        // Enable distortion by setting the curve
        distortionRef.current.curve = createDistortionCurve(state.distortionAmount, state.distortionType);
      } else {
        // Disable distortion by setting a linear curve (no distortion)
        const linearCurve = new Float32Array(44100);
        for (let i = 0; i < 44100; i++) {
          const x = (i * 2) / 44100 - 1;
          linearCurve[i] = x; // Linear response = no distortion
        }
        distortionRef.current.curve = linearCurve;
      }
    }
  }, [state.distortionEnabled, state.distortionAmount, state.distortionType, createDistortionCurve]);

  useEffect(() => {
    if (compressorRef.current) {
      if (state.compressionEnabled) {
        // Enable compression by setting normal parameters
        compressorRef.current.threshold.value = state.compressionThreshold;
        compressorRef.current.ratio.value = state.compressionRatio;
        compressorRef.current.attack.value = state.compressionAttack;
        compressorRef.current.release.value = state.compressionRelease;
      } else {
        // Disable compression by setting it to pass-through
        compressorRef.current.threshold.value = -100; // Very low threshold = no compression
        compressorRef.current.ratio.value = 1; // 1:1 ratio = no compression
        compressorRef.current.attack.value = 0.001; // Very fast attack
        compressorRef.current.release.value = 0.001; // Very fast release
      }
    }
  }, [state.compressionEnabled, state.compressionThreshold, state.compressionRatio, state.compressionAttack, state.compressionRelease]);

  // Calculate optimal gain to prevent clipping based on number of notes
  const calculateOptimalGain = useCallback((numNotes: number): number => {
    // Base gain for single notes - much more conservative to prevent clipping
    const baseGain = 0.3;
    
    // Reduce gain logarithmically as more notes are added
    // This prevents the sum of multiple sine waves from clipping
    if (numNotes <= 1) return baseGain;
    if (numNotes <= 2) return baseGain * 0.7;
    if (numNotes <= 3) return baseGain * 0.55;
    if (numNotes <= 4) return baseGain * 0.45;
    if (numNotes <= 5) return baseGain * 0.35;
    if (numNotes <= 6) return baseGain * 0.3;
    if (numNotes <= 7) return baseGain * 0.25;
    return baseGain * 0.2; // For 8+ notes
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
    
    // Calculate optimal gain to prevent clipping based on current active notes
    const currentActiveNotes = Object.keys(activeNotesRef.current).length + 1; // +1 for this new note
    const optimalGain = calculateOptimalGain(currentActiveNotes);
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
    
    // Route through effects based on state
    if (state.delayEnabled && delayRef.current) {
      gain.connect(delayRef.current);
    }
    
    if (state.chorusEnabled && chorusRef.current) {
      gain.connect(chorusRef.current);
    }
    
    // Main audio path through effects
    gain.connect(dryGainRef.current);
    
    // Reverb path
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
      ([, note]) => Math.abs(note.freq - frequency) < 0.1
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
    
    // Highlight chord keys visually
    const chordKeys: HTMLElement[] = [];
    validFreqs.forEach(freq => {
      const note = NOTES.find(n => Math.abs(n.freq - freq) < 0.1);
      if (note) {
        const keyElement = document.querySelector(`[data-freq="${note.freq}"]`) as HTMLElement;
        if (keyElement) {
          keyElement.classList.add('chord-active');
          chordKeys.push(keyElement);
        }
      }
    });
    
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
      gain.gain.linearRampToValueAtTime(optimalGain, audioContextRef.current!.currentTime + attackTime);
      
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
    
    // Remove chord key highlighting after chord duration
    setTimeout(() => {
      chordKeys.forEach(keyElement => {
        keyElement.classList.remove('chord-active');
      });
    }, 1000);
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
      lfoTarget: preset.lfoTarget,
      
      // New Effects
      delayEnabled: preset.delayEnabled ?? false,
      delayTime: preset.delayTime ?? 0.3,
      delayFeedback: preset.delayFeedback ?? 0.3,
      delayMix: preset.delayMix ?? 0.5,
      
      chorusEnabled: preset.chorusEnabled ?? false,
      chorusRate: preset.chorusRate ?? 1.5,
      chorusDepth: preset.chorusDepth ?? 0.002,
      chorusMix: preset.chorusMix ?? 0.5,
      
      distortionEnabled: preset.distortionEnabled ?? false,
      distortionAmount: preset.distortionAmount ?? 0.3,
      distortionType: preset.distortionType ?? 'soft',
      
      filterEnabled: preset.filterEnabled ?? false,
      filterType: preset.filterType ?? 'lowpass',
      filterFrequency: preset.filterFrequency ?? 2000,
      filterResonance: preset.filterResonance ?? 1,
      
      compressionEnabled: preset.compressionEnabled ?? false,
      compressionThreshold: preset.compressionThreshold ?? -24,
      compressionRatio: preset.compressionRatio ?? 4,
      compressionAttack: preset.compressionAttack ?? 0.003,
      compressionRelease: preset.compressionRelease ?? 0.25,
      
      stereoWidth: preset.stereoWidth ?? 1,
      panningEnabled: preset.panningEnabled ?? false,
      panningAmount: preset.panningAmount ?? 0
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

  const loadRhythmPattern = useCallback((patternName: string) => {
    const pattern = RHYTHM_PATTERNS[patternName];
    if (!pattern) return;
    
    clearSequence();
    
    const noteNames = SEQUENCER_TRACKS.map(track => track.note);
    
    Object.entries(pattern).forEach(([trackIndexStr, steps]) => {
      const trackIndex = parseInt(trackIndexStr);
      if (trackIndex < noteNames.length) {
        const note = noteNames[trackIndex];
        if (!sequenceRef.current[note]) {
          sequenceRef.current[note] = new Array(32).fill(false);
        }
        
        steps.forEach(step => {
          if (step < state.steps) {
            sequenceRef.current[note][step] = true;
          }
        });
      }
    });
  }, [state.steps, clearSequence]);

  const loadScryptureRhythmPattern = useCallback((patternName: string) => {
    const pattern = SCRYPTURE_RHYTHM_PATTERNS[patternName];
    if (!pattern) return;
    
    clearSequence();
    
    const noteNames = SEQUENCER_TRACKS.map(track => track.note);
    
    Object.entries(pattern).forEach(([trackIndexStr, steps]) => {
      const trackIndex = parseInt(trackIndexStr);
      if (trackIndex < noteNames.length) {
        const note = noteNames[trackIndex];
        if (!sequenceRef.current[note]) {
          sequenceRef.current[note] = new Array(32).fill(false);
        }
        
        steps.forEach(step => {
          if (step < state.steps) {
            sequenceRef.current[note][step] = true;
          }
        });
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

  const resetVolume = useCallback(() => {
    updateState({ volume: 1 });
  }, [updateState]);

  const resetAttack = useCallback(() => {
    updateState({ attack: 1 });
  }, [updateState]);

  const resetRelease = useCallback(() => {
    updateState({ release: 10 });
  }, [updateState]);

  const resetLfoRate = useCallback(() => {
    updateState({ lfoRate: 0 });
  }, [updateState]);

  const resetLfoDepth = useCallback(() => {
    updateState({ lfoDepth: 5 });
  }, [updateState]);

  const resetArpeggiatorRate = useCallback(() => {
    updateState({ arpeggiatorRate: 8 });
  }, [updateState]);

  const resetDelayTime = useCallback(() => {
    updateState({ delayTime: 0.3 });
  }, [updateState]);

  const resetDelayFeedback = useCallback(() => {
    updateState({ delayFeedback: 0.3 });
  }, [updateState]);

  const resetDelayMix = useCallback(() => {
    updateState({ delayMix: 0.5 });
  }, [updateState]);

  const resetChorusRate = useCallback(() => {
    updateState({ chorusRate: 1.5 });
  }, [updateState]);

  const resetChorusDepth = useCallback(() => {
    updateState({ chorusDepth: 0.002 });
  }, [updateState]);

  const resetChorusMix = useCallback(() => {
    updateState({ chorusMix: 0.5 });
  }, [updateState]);

  const resetDistortionAmount = useCallback(() => {
    updateState({ distortionAmount: 0.3 });
  }, [updateState]);

  const resetFilterFrequency = useCallback(() => {
    updateState({ filterFrequency: 2000 });
  }, [updateState]);

  const resetFilterResonance = useCallback(() => {
    updateState({ filterResonance: 1 });
  }, [updateState]);

  const resetCompressionThreshold = useCallback(() => {
    updateState({ compressionThreshold: -24 });
  }, [updateState]);

  const resetCompressionRatio = useCallback(() => {
    updateState({ compressionRatio: 4 });
  }, [updateState]);

  const resetCompressionAttack = useCallback(() => {
    updateState({ compressionAttack: 0.003 });
  }, [updateState]);

  const resetCompressionRelease = useCallback(() => {
    updateState({ compressionRelease: 0.25 });
  }, [updateState]);

  const resetStereoWidth = useCallback(() => {
    updateState({ stereoWidth: 1 });
  }, [updateState]);

  const resetPanningAmount = useCallback(() => {
    updateState({ panningAmount: 0 });
  }, [updateState]);

  const resetBpm = useCallback(() => {
    updateState({ bpm: 120 });
  }, [updateState]);

  const resetSteps = useCallback(() => {
    updateState({ steps: 16 });
  }, [updateState]);

  // Sequencer improvement functions
  const startBpmSlide = useCallback(() => {
    updateState({ isBpmSliding: true });
    // Allow BPM changes without stopping the sequencer
  }, [updateState]);

  const endBpmSlide = useCallback((newBpm: number) => {
    updateState({ 
      isBpmSliding: false, 
      pendingBpmChange: newBpm,
      bpm: newBpm 
    });
  }, [updateState]);

  const setGridAlignment = useCallback((alignment: 'quantize' | 'free') => {
    updateState({ gridAlignment: alignment });
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
          
          // Apply pending BPM change on the next step
          let newBpm = prev.bpm;
          if (prev.pendingBpmChange !== null) {
            newBpm = prev.pendingBpmChange;
            // Clear the pending change after applying it
            setTimeout(() => {
              updateState({ pendingBpmChange: null });
            }, 0);
          }
          
          // Play notes for current step
          SEQUENCER_TRACKS.forEach(track => {
            if (sequenceRef.current[track.note] && sequenceRef.current[track.note][prev.currentStep]) {
              startNote(track.frequency);
              
              setTimeout(() => {
                stopNote(track.frequency);
              }, stepTime * 1000 * 0.6);
            }
          });
          
          return { ...prev, currentStep: newStep, bpm: newBpm };
        });
      }, stepTime * 1000);
    }
  }, [state.bpm, state.steps, state.isPlaying, startNote, stopNote, updateState]);

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
    loadRhythmPattern,
    loadScryptureRhythmPattern,
    resetDetune,
    resetVolume,
    resetAttack,
    resetRelease,
    resetLfoRate,
    resetLfoDepth,
    resetArpeggiatorRate,
    resetDelayTime,
    resetDelayFeedback,
    resetDelayMix,
    resetChorusRate,
    resetChorusDepth,
    resetChorusMix,
    resetDistortionAmount,
    resetFilterFrequency,
    resetFilterResonance,
    resetCompressionThreshold,
    resetCompressionRatio,
    resetCompressionAttack,
    resetCompressionRelease,
    resetStereoWidth,
    resetPanningAmount,
    resetBpm,
    resetSteps,
    startBpmSlide,
    endBpmSlide,
    setGridAlignment,
    toggleSustain,
    setWaveform,
    setArpeggiatorMode,
    handleKeyDown,
    handleKeyUp,
    handleMouseDown,
    handleMouseUp
  };
}; 