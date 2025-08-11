import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SynthesizerState, 
  SynthesizerContextType, 
  ActiveNote, 
  WaveformType,
  Track,
  TrackState,
  TrackEffects,
  TrackEnvelope,
  TrackLFO
} from '../types/synthesizer';
import { CHORDS, CHORD_PROGRESSIONS, PRESETS, NUMBER_KEY_PATTERNS, RHYTHM_PATTERNS, SCRYPTURE_RHYTHM_PATTERNS, NOTES, TRACK_PRESETS } from '../data/synthesizerData';

// Default track effects
const defaultTrackEffects: TrackEffects = {
  delay: {
    enabled: false,
    time: 0.3,
    feedback: 0.3,
    mix: 0.5
  },
  chorus: {
    enabled: false,
    rate: 1.5,
    depth: 0.002,
    mix: 0.5
  },
  distortion: {
    enabled: false,
    amount: 0.3,
    type: 'soft'
  },
  filter: {
    enabled: false,
    type: 'lowpass',
    frequency: 2000,
    resonance: 1
  },
  compression: {
    enabled: false,
    threshold: -24,
    ratio: 4,
    attack: 0.003,
    release: 0.25
  }
};

// Default track envelope
const defaultTrackEnvelope: TrackEnvelope = {
  attack: 0.1,
  decay: 0.3,
  sustain: 0.5,
  release: 0.5
};

// Default track LFO
const defaultTrackLFO: TrackLFO = {
  enabled: false,
  rate: 0,
  depth: 5,
  target: 'pitch',
  waveform: 'sine'
};

// Create initial tracks - start with empty array for user-created tracks
const createInitialTracks = (): Track[] => {
  return [];
};

const initialState: SynthesizerState = {
  waveform: 'sine',
  volume: 80, // Increased default volume for better initial loudness
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
  
  // Track Management
  trackState: {
    tracks: createInitialTracks(),
    selectedTrackId: null,
    masterVolume: 100,
    masterPan: 0,
    trackOrder: [],
    showTrackEditor: false
  }
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
  
  // Track-specific audio nodes
  const trackNodesRef = useRef<Map<string, {
    gain: GainNode;
    pan: StereoPannerNode;
    filter: BiquadFilterNode;
    delay: DelayNode;
    delayGain: GainNode;
    delayFeedback: GainNode;
    chorus: GainNode;
    distortion: WaveShaperNode;
    compressor: DynamicsCompressorNode;
  }>>(new Map());
  
  const activeNotesRef = useRef<Record<string, ActiveNote>>({});
  const sequenceRef = useRef<Record<string, boolean[]>>({});
  const sequenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pressedKeysRef = useRef<Set<number>>(new Set());
  const arpeggiatorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const arpeggiatorNotesRef = useRef<number[]>([]);
  const arpeggiatorIndexRef = useRef<number>(0);
  const arpeggiatorDirectionRef = useRef<number>(1);

  // Create track-specific audio nodes
  const createTrackNodes = useCallback((trackId: string) => {
    if (!audioContextRef.current) {
      console.warn(`Cannot create track nodes for ${trackId}: Audio context not available`);
      return;
    }

    const context = audioContextRef.current;
    
    // Check if track nodes already exist and are from the same context
    const existingNodes = trackNodesRef.current.get(trackId);
    if (existingNodes && existingNodes.gain.context === context) {
      console.log(`Track nodes for ${trackId} already exist and are valid`);
      return;
    }
    
    // Remove existing nodes if they exist but are from a different context
    if (existingNodes) {
      console.log(`Removing existing track nodes for ${trackId} from different context`);
      removeTrackNodes(trackId);
    }
    
    console.log(`Creating track nodes for ${trackId}`);
    
    const trackNodes = {
      gain: context.createGain(),
      pan: context.createStereoPanner(),
      filter: context.createBiquadFilter(),
      delay: context.createDelay(2.0),
      delayGain: context.createGain(),
      delayFeedback: context.createGain(),
      chorus: context.createGain(),
      distortion: context.createWaveShaper(),
      compressor: context.createDynamicsCompressor()
    };

    // Configure default values
    trackNodes.gain.gain.value = 1.0;
    trackNodes.pan.pan.value = 0;
    trackNodes.filter.type = 'lowpass';
    trackNodes.filter.frequency.value = 20000;
    trackNodes.filter.Q.value = 1;
    trackNodes.delay.delayTime.value = 0.3;
    trackNodes.delayGain.gain.value = 1.0; // Changed from 0 to 1.0 - delay output should pass through when disabled
    trackNodes.delayFeedback.gain.value = 0;
    trackNodes.chorus.gain.value = 1.0; // Changed from 0 to 1.0 - chorus output should pass through when disabled
    trackNodes.distortion.curve = new Float32Array(44100);
    trackNodes.compressor.threshold.value = -100;
    trackNodes.compressor.ratio.value = 1;

    // Connect track audio chain
    trackNodes.gain.connect(trackNodes.pan);
    trackNodes.pan.connect(trackNodes.filter);
    trackNodes.filter.connect(trackNodes.distortion);
    trackNodes.distortion.connect(trackNodes.compressor);
    trackNodes.compressor.connect(trackNodes.delay);
    trackNodes.delay.connect(trackNodes.delayGain);
    trackNodes.delayGain.connect(trackNodes.delayFeedback);
    trackNodes.delayFeedback.connect(trackNodes.delay);
    trackNodes.delayGain.connect(trackNodes.chorus);
    
    // Connect to master gain
    if (masterGainRef.current) {
      trackNodes.chorus.connect(masterGainRef.current);
      console.log(`Track ${trackId} connected to master gain successfully`);
    } else {
      console.error(`Master gain not available for track ${trackId} - this will prevent audio output`);
      // Try to connect directly to destination as fallback
      trackNodes.chorus.connect(context.destination);
      console.log(`Track ${trackId} connected directly to destination as fallback`);
    }

    trackNodesRef.current.set(trackId, trackNodes);
    console.log(`Track nodes for ${trackId} created and stored`);
  }, []);

  // Remove track-specific audio nodes
  const removeTrackNodes = useCallback((trackId: string) => {
    const trackNodes = trackNodesRef.current.get(trackId);
    if (trackNodes) {
      // Disconnect all nodes
      trackNodes.gain.disconnect();
      trackNodes.pan.disconnect();
      trackNodes.filter.disconnect();
      trackNodes.delay.disconnect();
      trackNodes.delayGain.disconnect();
      trackNodes.delayFeedback.disconnect();
      trackNodes.chorus.disconnect();
      trackNodes.distortion.disconnect();
      trackNodes.compressor.disconnect();
      
      trackNodesRef.current.delete(trackId);
    }
  }, []);



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

  // Update track audio parameters
  const updateTrackAudio = useCallback((trackId: string, track: Track) => {
    const trackNodes = trackNodesRef.current.get(trackId);
    if (!trackNodes || !audioContextRef.current) return;

    const context = audioContextRef.current;
    const currentTime = context.currentTime;

    // Update volume
    trackNodes.gain.gain.setValueAtTime(track.volume / 100, currentTime);
    
    // Update pan
    trackNodes.pan.pan.setValueAtTime(track.pan / 100, currentTime);
    
    // Update filter
    if (track.effects.filter.enabled) {
      trackNodes.filter.type = track.effects.filter.type;
      trackNodes.filter.frequency.setValueAtTime(track.effects.filter.frequency, currentTime);
      trackNodes.filter.Q.setValueAtTime(track.effects.filter.resonance, currentTime);
    } else {
      trackNodes.filter.frequency.setValueAtTime(20000, currentTime);
      trackNodes.filter.Q.setValueAtTime(0, currentTime);
    }
    
    // Update delay
    if (track.effects.delay.enabled) {
      trackNodes.delay.delayTime.setValueAtTime(track.effects.delay.time, currentTime);
      trackNodes.delayGain.gain.setValueAtTime(track.effects.delay.mix, currentTime);
      trackNodes.delayFeedback.gain.setValueAtTime(track.effects.delay.feedback, currentTime);
    } else {
      trackNodes.delayGain.gain.setValueAtTime(1.0, currentTime); // Changed from 0 to 1.0 - pass through when disabled
      trackNodes.delayFeedback.gain.setValueAtTime(0, currentTime);
    }
    
    // Update chorus
    if (track.effects.chorus.enabled) {
      trackNodes.chorus.gain.setValueAtTime(track.effects.chorus.mix, currentTime);
    } else {
      trackNodes.chorus.gain.setValueAtTime(1.0, currentTime); // Changed from 0 to 1.0 - pass through when disabled
    }
    
    // Update distortion
    if (track.effects.distortion.enabled) {
      trackNodes.distortion.curve = createDistortionCurve(track.effects.distortion.amount, track.effects.distortion.type);
    } else {
      const linearCurve = new Float32Array(44100);
      for (let i = 0; i < 44100; i++) {
        const x = (i * 2) / 44100 - 1;
        linearCurve[i] = x;
      }
      trackNodes.distortion.curve = linearCurve as any;
    }
    
    // Update compression
    if (track.effects.compression.enabled) {
      trackNodes.compressor.threshold.setValueAtTime(track.effects.compression.threshold, currentTime);
      trackNodes.compressor.ratio.setValueAtTime(track.effects.compression.ratio, currentTime);
      trackNodes.compressor.attack.setValueAtTime(track.effects.compression.attack, currentTime);
      trackNodes.compressor.release.setValueAtTime(track.effects.compression.release, currentTime);
    } else {
      trackNodes.compressor.threshold.setValueAtTime(-100, currentTime);
      trackNodes.compressor.ratio.setValueAtTime(1, currentTime);
      trackNodes.compressor.attack.setValueAtTime(0.001, currentTime);
      trackNodes.compressor.release.setValueAtTime(0.001, currentTime);
    }
  }, [createDistortionCurve]);

  // Recreate all track nodes (useful when audio context changes)
  const recreateAllTrackNodes = useCallback(() => {
    if (!audioContextRef.current) return;
    
    // Get all track IDs before clearing
    const trackIds = Array.from(trackNodesRef.current.keys());
    
    // Clear all existing track nodes
    trackIds.forEach(trackId => {
      removeTrackNodes(trackId);
    });
    
    // Recreate track nodes for all tracks
    state.trackState.tracks.forEach(track => {
      createTrackNodes(track.id);
      updateTrackAudio(track.id, track);
    });
  }, [state.trackState.tracks, createTrackNodes, updateTrackAudio, removeTrackNodes]);

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
        
        console.log('Audio chain connected: masterGain -> limiter -> destination');
        console.log('Master gain value:', masterGain.gain.value);

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
        
        // Clear any existing track nodes since they're from the old context
        trackNodesRef.current.clear();
        stereoWidthRef.current = stereoWidth;
        panningRef.current = panning;



        // Initialize sequence - now handled by track management system
        // Each track has its own sequence property
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
      // Apply volume with proper scaling - much louder now
      // 1% = 0.01, 50% = 0.5, 100% = 1.0 (max)
      const safeVolume = Math.min(state.volume / 100, 1.0); // Proper scaling for full volume range
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
      if (state.delayEnabled) {
        delayGainRef.current.gain.setValueAtTime(state.delayMix, audioContextRef.current!.currentTime);
      } else {
        delayGainRef.current.gain.setValueAtTime(0, audioContextRef.current!.currentTime);
      }
    }
    if (delayFeedbackRef.current) {
      if (state.delayEnabled) {
        delayFeedbackRef.current.gain.setValueAtTime(state.delayFeedback, audioContextRef.current!.currentTime);
      } else {
        delayFeedbackRef.current.gain.setValueAtTime(0, audioContextRef.current!.currentTime);
      }
    }
  }, [state.delayTime, state.delayMix, state.delayFeedback, state.delayEnabled]);

  // Update chorus parameters
  useEffect(() => {
    if (chorusRef.current) {
      if (state.chorusEnabled) {
        chorusRef.current.gain.setValueAtTime(state.chorusMix, audioContextRef.current!.currentTime);
      } else {
        chorusRef.current.gain.setValueAtTime(0, audioContextRef.current!.currentTime);
      }
    }
  }, [state.chorusEnabled, state.chorusMix]);

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
        distortionRef.current.curve = linearCurve as any;
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
    // Base gain for single notes - increased for better volume
    const baseGain = 0.6; // Increased from 0.3 to 0.6 for louder output
    
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

  const startNote = useCallback((freq: number, element?: HTMLElement | null, trackId?: string) => {
    console.log('startNote called with:', { freq, trackId });
    
    if (!audioContextRef.current) {
      console.warn('Audio context not available');
      return;
    }

    // Ensure audio context is running
    if (audioContextRef.current.state === 'suspended') {
      console.log('Resuming suspended audio context');
      audioContextRef.current.resume();
      
      // Recreate all track nodes after resuming to ensure they're from the same context
      setTimeout(() => {
        const trackIds = Array.from(trackNodesRef.current.keys());
        trackIds.forEach(trackId => {
          removeTrackNodes(trackId);
          createTrackNodes(trackId);
        });
      }, 100);
    }

    const frequency = parseFloat(freq.toString());
    if (isNaN(frequency) || frequency <= 0) {
      console.warn('Invalid frequency:', freq);
      return;
    }

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
    
    // Route through track-specific audio chain if trackId is provided
    if (trackId) {
      console.log(`Attempting to route note through track ${trackId}`);
      
      // Ensure track nodes exist
      if (!trackNodesRef.current.has(trackId)) {
        console.log(`Creating track nodes for ${trackId}`);
        createTrackNodes(trackId);
      }
      
      let trackNodes = trackNodesRef.current.get(trackId);
      const track = state.trackState.tracks.find(t => t.id === trackId);
      
      if (!trackNodes) {
        console.error(`Failed to get track nodes for ${trackId}`);
        return;
      }
      
      // Check if track nodes are from the same audio context
      if (trackNodes.gain.context !== audioContextRef.current) {
        console.warn('Track nodes from different audio context, recreating...');
        removeTrackNodes(trackId);
        createTrackNodes(trackId);
        const newTrackNodes = trackNodesRef.current.get(trackId);
        if (!newTrackNodes) {
          console.error('Failed to recreate track nodes');
          return;
        }
        trackNodes = newTrackNodes;
      }
      
      if (track && !track.muted && trackNodes && trackNodes.gain) {
        console.log(`Routing note through track ${trackId} (${track.name})`);
        
        // Connect to track-specific audio chain
        gain.connect(trackNodes.gain);
        
        // Apply track-specific envelope
        const attackTime = track.envelope.attack;
        const releaseTime = track.envelope.release;
        
        gain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        gain.gain.linearRampToValueAtTime(optimalGain, audioContextRef.current.currentTime + attackTime);
        
        osc.start();
        lfo.start();
        activeNotesRef.current[noteId] = { osc, gain, lfo, freq: frequency };
        
        if (element) {
          element.classList.add('active');
        }
        console.log(`Note started successfully through track ${trackId}`);
        return;
      } else {
        console.warn(`Track ${trackId} is muted or invalid, falling back to global chain`);
      }
    }
    
    // Fallback to global effects chain
    console.log('Using global effects chain');
    
    if (state.delayEnabled && delayRef.current) {
      gain.connect(delayRef.current);
    }
    
    if (state.chorusEnabled && chorusRef.current) {
      gain.connect(chorusRef.current);
    }
    
    // Main audio path through effects
    if (dryGainRef.current) {
      gain.connect(dryGainRef.current);
    } else {
      // Fallback: connect directly to master gain or destination
      if (masterGainRef.current) {
        gain.connect(masterGainRef.current);
      } else {
        gain.connect(audioContextRef.current.destination);
      }
    }
    
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
    
    console.log(`Note started successfully through global chain`);
  }, [state.waveform, state.detune, state.lfoRate, state.lfoDepth, state.lfoTarget, state.reverbEnabled, state.attack, calculateOptimalGain, state.trackState.tracks, createTrackNodes, removeTrackNodes]);

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
        
        // Play notes for current step using track management system
        const tracks = prev.trackState.tracks;
        const soloTracks = tracks.filter(track => track.solo);
        const activeTracks = tracks.filter(track => !track.muted);
        const tracksToPlay = soloTracks.length > 0 ? soloTracks : activeTracks;
        
        tracksToPlay.forEach(track => {
          if (track.sequence && track.sequence[prev.currentStep]) {
            // Use track's frequency and properties
            const frequency = track.frequency;
            
            // Start note with track ID for proper routing
            startNote(frequency, null, track.id);
            
            // Calculate note duration based on track envelope
            const noteDuration = (track.envelope.attack + track.envelope.decay + track.envelope.release) * 1000;
            const stepDuration = stepTime * 1000;
            const actualDuration = Math.min(noteDuration, stepDuration * 0.8);
            
            setTimeout(() => {
              stopNote(frequency, null);
            }, actualDuration);
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
    // Clear all track sequences
    updateState(prev => ({
      currentStep: 0,
      trackState: {
        ...prev.trackState,
        tracks: prev.trackState.tracks.map(track => ({
          ...track,
          sequence: new Array(32).fill(false)
        }))
      }
    }));
  }, [updateState]);

  const toggleDrawMode = useCallback(() => {
    updateState(prev => ({ drawMode: !prev.drawMode }));
  }, [updateState]);

  const loadPattern = useCallback((number: number) => {
    const pattern = NUMBER_KEY_PATTERNS[number];
    if (!pattern) return;
    
    // Clear all track sequences and load pattern
    updateState(prev => {
      const tracks = prev.trackState.tracks;
      const updatedTracks = tracks.map(track => ({
        ...track,
        sequence: new Array(32).fill(false)
      }));
      
      // Apply pattern to tracks
      pattern.forEach(step => {
        if (step < prev.steps) {
          const trackIndex = step % tracks.length;
          if (trackIndex < tracks.length) {
            updatedTracks[trackIndex].sequence[step] = true;
          }
        }
      });
      
      return {
        trackState: {
          ...prev.trackState,
          tracks: updatedTracks
        }
      };
    });
  }, [state.steps, updateState]);

  const loadRhythmPattern = useCallback((patternName: string) => {
    const pattern = RHYTHM_PATTERNS[patternName];
    if (!pattern) return;
    
    // Clear all track sequences and load rhythm pattern
    updateState(prev => {
      const tracks = prev.trackState.tracks;
      const updatedTracks = tracks.map(track => ({
        ...track,
        sequence: new Array(32).fill(false)
      }));
      
      // Apply rhythm pattern to tracks
      Object.entries(pattern).forEach(([trackIndexStr, steps]) => {
        const trackIndex = parseInt(trackIndexStr);
        if (trackIndex < tracks.length) {
          steps.forEach(step => {
            if (step < prev.steps) {
              updatedTracks[trackIndex].sequence[step] = true;
            }
          });
        }
      });
      
      return {
        trackState: {
          ...prev.trackState,
          tracks: updatedTracks
        }
      };
    });
  }, [state.steps, updateState]);

  const loadScryptureRhythmPattern = useCallback((patternName: string) => {
    const pattern = SCRYPTURE_RHYTHM_PATTERNS[patternName];
    if (!pattern) return;
    
    // Clear all track sequences and load Scrypture rhythm pattern
    updateState(prev => {
      const tracks = prev.trackState.tracks;
      const updatedTracks = tracks.map(track => ({
        ...track,
        sequence: new Array(32).fill(false)
      }));
      
      // Apply Scrypture rhythm pattern to tracks
      Object.entries(pattern).forEach(([trackIndexStr, steps]) => {
        const trackIndex = parseInt(trackIndexStr);
        if (trackIndex < tracks.length) {
          steps.forEach(step => {
            if (step < prev.steps) {
              updatedTracks[trackIndex].sequence[step] = true;
            }
          });
        }
      });
      
      return {
        trackState: {
          ...prev.trackState,
          tracks: updatedTracks
        }
      };
    });
  }, [state.steps, updateState]);

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
      
      // Recreate all track nodes after resuming to ensure they're from the same context
      setTimeout(() => {
        const trackIds = Array.from(trackNodesRef.current.keys());
        trackIds.forEach(trackId => {
          removeTrackNodes(trackId);
          createTrackNodes(trackId);
        });
      }, 100);
    }
  }, [removeTrackNodes, createTrackNodes]);

  const handleMouseUp = useCallback(() => {
    // Mouse up handling if needed
  }, []);

  // Simple test function to verify basic audio is working


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
          
                  // Play notes for current step using track management system
        const tracks = prev.trackState.tracks;
        const soloTracks = tracks.filter(track => track.solo);
        const activeTracks = tracks.filter(track => !track.muted);
        const tracksToPlay = soloTracks.length > 0 ? soloTracks : activeTracks;
        
        tracksToPlay.forEach(track => {
          if (track.sequence && track.sequence[prev.currentStep]) {
            // Use track's frequency and properties
            const frequency = track.frequency;
            
            // Start note with track ID for proper routing
            startNote(frequency, null, track.id);
            
            // Calculate note duration based on track envelope
            const noteDuration = (track.envelope.attack + track.envelope.decay + track.envelope.release) * 1000;
            const stepDuration = stepTime * 1000;
            const actualDuration = Math.min(noteDuration, stepDuration * 0.8);
            
            setTimeout(() => {
              stopNote(frequency, null);
            }, actualDuration);
          }
        });
          
          return { ...prev, currentStep: newStep, bpm: newBpm };
        });
      }, stepTime * 1000);
    }
  }, [state.bpm, state.steps, state.isPlaying, startNote, stopNote, updateState]);

  // Initialize sequence state properly - now handled by track management system
  // Each track has its own sequence property in the track state

  // Initialize track nodes for existing tracks
  useEffect(() => {
    if (audioContextRef.current && state.trackState.tracks.length > 0) {
      console.log('Initializing track nodes for', state.trackState.tracks.length, 'tracks');
      state.trackState.tracks.forEach(track => {
        if (!trackNodesRef.current.has(track.id)) {
          console.log(`Creating initial track nodes for ${track.id} (${track.name})`);
          createTrackNodes(track.id);
          updateTrackAudio(track.id, track);
        } else {
          console.log(`Track nodes already exist for ${track.id}`);
        }
      });
    }
  }, [audioContextRef.current, state.trackState.tracks, createTrackNodes, updateTrackAudio]);

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

  // Track Management Functions
  const createTrack = useCallback((trackData: Partial<Track>): Track => {
    const newTrack: Track = {
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: trackData.name || 'New Track',
      frequency: trackData.frequency || 440,
      note: trackData.note || 'A',
      category: trackData.category || 'melody',
      instrument: trackData.instrument || 'sine',
      volume: trackData.volume ?? 100,
      pan: trackData.pan ?? 0,
      muted: trackData.muted ?? false,
      solo: trackData.solo ?? false,
      effects: { ...defaultTrackEffects, ...trackData.effects },
      envelope: { ...defaultTrackEnvelope, ...trackData.envelope },
      lfo: { ...defaultTrackLFO, ...trackData.lfo },
      sequence: trackData.sequence || new Array(32).fill(false),
      color: trackData.color || `hsl(${Math.random() * 360}, 70%, 60%)`,
      order: trackData.order ?? state.trackState.tracks.length
    };

    updateState(prev => ({
      trackState: {
        ...prev.trackState,
        tracks: [...prev.trackState.tracks, newTrack],
        trackOrder: [...prev.trackState.trackOrder, newTrack.id],
        selectedTrackId: newTrack.id // Auto-select the new track
      }
    }));

    // Create audio nodes for the new track
    createTrackNodes(newTrack.id);
    updateTrackAudio(newTrack.id, newTrack);

    return newTrack;
  }, [updateState, createTrackNodes, updateTrackAudio, state.trackState.tracks.length]);

  const updateTrack = useCallback((trackId: string, updates: Partial<Track>) => {
    updateState(prev => {
      const updatedTracks = prev.trackState.tracks.map(track =>
        track.id === trackId ? { ...track, ...updates } : track
      );
      
      return {
        trackState: {
          ...prev.trackState,
          tracks: updatedTracks
        }
      };
    });

    // Update audio parameters for the track
    const updatedTrack = state.trackState.tracks.find(track => track.id === trackId);
    if (updatedTrack) {
      const newTrack = { ...updatedTrack, ...updates };
      updateTrackAudio(trackId, newTrack);
    }
  }, [updateState, updateTrackAudio, state.trackState.tracks]);

  const deleteTrack = useCallback((trackId: string) => {
    // Remove audio nodes for the track
    removeTrackNodes(trackId);
    
    updateState(prev => {
      const remainingTracks = prev.trackState.tracks.filter(track => track.id !== trackId);
      const remainingOrder = prev.trackState.trackOrder.filter(id => id !== trackId);
      
      // If we're deleting the selected track, select the first remaining track or null
      let newSelectedTrackId = prev.trackState.selectedTrackId;
      if (prev.trackState.selectedTrackId === trackId) {
        newSelectedTrackId = remainingTracks.length > 0 ? remainingTracks[0].id : null;
      }
      
      return {
        trackState: {
          ...prev.trackState,
          tracks: remainingTracks,
          trackOrder: remainingOrder,
          selectedTrackId: newSelectedTrackId
        }
      };
    });
  }, [updateState, removeTrackNodes]);

  const selectTrack = useCallback((trackId: string | null) => {
    updateState(prev => ({
      trackState: {
        ...prev.trackState,
        selectedTrackId: trackId
      }
    }));
  }, [updateState]);

  const toggleTrackMute = useCallback((trackId: string) => {
    updateState(prev => {
      const updatedTracks = prev.trackState.tracks.map(track =>
        track.id === trackId ? { ...track, muted: !track.muted } : track
      );
      
      return {
        trackState: {
          ...prev.trackState,
          tracks: updatedTracks
        }
      };
    });

    // Update audio parameters for the track
    const updatedTrack = state.trackState.tracks.find(track => track.id === trackId);
    if (updatedTrack) {
      const newTrack = { ...updatedTrack, muted: !updatedTrack.muted };
      updateTrackAudio(trackId, newTrack);
    }
  }, [updateState, updateTrackAudio, state.trackState.tracks]);

  const toggleTrackSolo = useCallback((trackId: string) => {
    updateState(prev => {
      const updatedTracks = prev.trackState.tracks.map(track =>
        track.id === trackId ? { ...track, solo: !track.solo } : track
      );
      
      return {
        trackState: {
          ...prev.trackState,
          tracks: updatedTracks
        }
      };
    });

    // Update audio parameters for the track
    const updatedTrack = state.trackState.tracks.find(track => track.id === trackId);
    if (updatedTrack) {
      const newTrack = { ...updatedTrack, solo: !updatedTrack.solo };
      updateTrackAudio(trackId, newTrack);
    }
  }, [updateState, updateTrackAudio, state.trackState.tracks]);

  const reorderTracks = useCallback((trackIds: string[]) => {
    updateState(prev => ({
      trackState: {
        ...prev.trackState,
        trackOrder: trackIds,
        tracks: prev.trackState.tracks.map((track) => ({
          ...track,
          order: trackIds.indexOf(track.id)
        })).sort((a, b) => a.order - b.order)
      }
    }));
  }, [updateState]);

  const updateTrackSequence = useCallback((trackId: string, stepIndex: number, active: boolean) => {
    updateState(prev => ({
      trackState: {
        ...prev.trackState,
        tracks: prev.trackState.tracks.map(track =>
          track.id === trackId
            ? {
                ...track,
                sequence: track.sequence.map((step, index) =>
                  index === stepIndex ? active : step
                )
              }
            : track
        )
      }
    }));
  }, [updateState]);

  const clearTrackSequence = useCallback((trackId: string) => {
    updateState(prev => ({
      trackState: {
        ...prev.trackState,
        tracks: prev.trackState.tracks.map(track =>
          track.id === trackId
            ? { ...track, sequence: new Array(32).fill(false) }
            : track
        )
      }
    }));
  }, [updateState]);

  const clearAllTracks = useCallback(() => {
    updateState(prev => ({
      trackState: {
        ...prev.trackState,
        tracks: [],
        trackOrder: [],
        selectedTrackId: null
      }
    }));
    
    // Clear all track nodes
    trackNodesRef.current.forEach((_, trackId) => {
      removeTrackNodes(trackId);
    });
    trackNodesRef.current.clear();
  }, [updateState, removeTrackNodes]);

  const loadTrackPreset = useCallback((presetName: string) => {
    const preset = TRACK_PRESETS[presetName];
    if (!preset) {
      console.warn(`Track preset "${presetName}" not found`);
      return;
    }

    console.log(`Loading track preset: ${preset.name}`);

    // Clear existing tracks
    clearAllTracks();

    // Set BPM
    updateState({ bpm: preset.bpm });

    // Create tracks from preset
    preset.tracks.forEach((trackData, index) => {
      const newTrack: Track = {
        id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: trackData.name,
        frequency: trackData.frequency,
        note: trackData.note,
        category: trackData.category,
        instrument: trackData.instrument,
        volume: trackData.volume,
        pan: trackData.pan,
        muted: trackData.muted,
        solo: trackData.solo,
        effects: trackData.effects,
        envelope: trackData.envelope,
        lfo: trackData.lfo,
        sequence: trackData.sequence,
        color: trackData.color,
        order: index
      };

      // Add track to state
      updateState(prev => ({
        trackState: {
          ...prev.trackState,
          tracks: [...prev.trackState.tracks, newTrack],
          trackOrder: [...prev.trackState.trackOrder, newTrack.id],
          selectedTrackId: newTrack.id // Select the last created track
        }
      }));

      // Create audio nodes for the track
      createTrackNodes(newTrack.id);
      updateTrackAudio(newTrack.id, newTrack);
    });

    console.log(`Loaded ${preset.tracks.length} tracks from preset "${preset.name}"`);
  }, [clearAllTracks, updateState, createTrackNodes, updateTrackAudio]);

  const duplicateTrack = useCallback((trackId: string) => {
    const originalTrack = state.trackState.tracks.find(track => track.id === trackId);
    if (!originalTrack) return;

    const duplicatedTrack: Track = {
      ...originalTrack,
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${originalTrack.name} (Copy)`,
      order: state.trackState.tracks.length
    };

    updateState(prev => ({
      trackState: {
        ...prev.trackState,
        tracks: [...prev.trackState.tracks, duplicatedTrack],
        trackOrder: [...prev.trackState.trackOrder, duplicatedTrack.id],
        selectedTrackId: duplicatedTrack.id // Auto-select the duplicated track
      }
    }));

    // Create audio nodes for the duplicated track
    createTrackNodes(duplicatedTrack.id);
    updateTrackAudio(duplicatedTrack.id, duplicatedTrack);
  }, [state.trackState.tracks, updateState, createTrackNodes, updateTrackAudio]);



  const toggleTrackEditor = useCallback(() => {
    updateState(prev => ({
      trackState: {
        ...prev.trackState,
        showTrackEditor: !prev.trackState.showTrackEditor
      }
    }));
  }, [updateState]);

  const updateMasterVolume = useCallback((volume: number) => {
    updateState(prev => ({
      trackState: {
        ...prev.trackState,
        masterVolume: volume
      }
    }));
  }, [updateState]);

  const updateMasterPan = useCallback((pan: number) => {
    updateState(prev => ({
      trackState: {
        ...prev.trackState,
        masterPan: pan
      }
    }));
  }, [updateState]);

  const getSelectedTrack = useCallback(() => {
    return state.trackState.tracks.find(track => track.id === state.trackState.selectedTrackId) || null;
  }, [state.trackState.tracks, state.trackState.selectedTrackId]);

  const getActiveTracks = useCallback(() => {
    return state.trackState.tracks.filter(track => !track.muted);
  }, [state.trackState.tracks]);

  const getSoloTracks = useCallback(() => {
    return state.trackState.tracks.filter(track => track.solo);
  }, [state.trackState.tracks]);



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
    handleMouseUp,
    // Track Management Functions
    createTrack,
    updateTrack,
    deleteTrack,
    selectTrack,
    toggleTrackMute,
    toggleTrackSolo,
    reorderTracks,
    updateTrackSequence,
    clearTrackSequence,
    clearAllTracks,
    duplicateTrack,
    toggleTrackEditor,
    updateMasterVolume,
    updateMasterPan,
    getSelectedTrack,
    getActiveTracks,
    getSoloTracks,
    loadTrackPreset
  };
}; 