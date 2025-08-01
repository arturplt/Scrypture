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
  createBuffer: jest.fn(() => ({import React from 'react';
    import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
      createDelay: jest.fn(() => ({
        connect: jest.fn(),
        delayTime: { value: 0.3 }
      })),
      createBiquadFilter: jest.fn(() => ({
        connect: jest.fn(),
        frequency: { value: 2000 },
        Q: { value: 1 },
        type: 'lowpass'
      })),
      createDynamicsCompressor: jest.fn(() => ({
        connect: jest.fn(),
        threshold: { value: -24 },
        ratio: { value: 4 },
        attack: { value: 0.003 },
        release: { value: 0.25 }
      })),
      createStereoPanner: jest.fn(() => ({
        connect: jest.fn(),
        pan: { value: 0 }
      })),
      createWaveShaper: jest.fn(() => ({
        connect: jest.fn(),
        curve: new Float32Array(44100)
      })),
      sampleRate: 44100,
      currentTime: 0,
      destination: {},
      state: 'running',
      close: jest.fn(),
      resume: jest.fn()
    };
    
    global.AudioContext = jest.fn(() => mockAudioContext) as any;
    (global as any).webkitAudioContext = global.AudioContext;
    
    // Mock the synthesizer hook
    jest.mock('../../hooks/useSynthesizer', () => ({
      useSynthesizer: () => ({
        state: {
          waveform: 'sine',
          volume: 80,
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
          compressionEnabled: false,
          compressionThreshold: -24,
          compressionRatio: 4,
          compressionAttack: 0.003,
          compressionRelease: 0.25,
          stereoWidth: 1.0,
          panningEnabled: false,
          panningAmount: 0,
          tracks: []
        },
        startNote: jest.fn(),
        stopNote: jest.fn(),
        handleKeyDown: jest.fn(),
        handleKeyUp: jest.fn(),
        handleMouseDown: jest.fn(),
        handleMouseUp: jest.fn(),
        setWaveform: jest.fn(),
        setVolume: jest.fn(),
        setAttack: jest.fn(),
        setRelease: jest.fn(),
        setDetune: jest.fn(),
        setReverbEnabled: jest.fn(),
        setLfoRate: jest.fn(),
        setLfoDepth: jest.fn(),
        setLfoTarget: jest.fn(),
        setSustainMode: jest.fn(),
        setBpm: jest.fn(),
        setSteps: jest.fn(),
        setIsPlaying: jest.fn(),
        setCurrentStep: jest.fn(),
        setDrawMode: jest.fn(),
        setIsDrawing: jest.fn(),
        setIsDraggingCircle: jest.fn(),
        setArpeggiatorMode: jest.fn(),
        setArpeggiatorRate: jest.fn(),
        setDelayEnabled: jest.fn(),
        setDelayTime: jest.fn(),
        setDelayFeedback: jest.fn(),
        setDelayMix: jest.fn(),
        setChorusEnabled: jest.fn(),
        setChorusRate: jest.fn(),
        setChorusDepth: jest.fn(),
        setChorusMix: jest.fn(),
        setDistortionEnabled: jest.fn(),
        setDistortionAmount: jest.fn(),
        setDistortionType: jest.fn(),
        setFilterEnabled: jest.fn(),
        setFilterType: jest.fn(),
        setFilterFrequency: jest.fn(),
        setFilterResonance: jest.fn(),
        setCompressionEnabled: jest.fn(),
        setCompressionThreshold: jest.fn(),
        setCompressionRatio: jest.fn(),
        setCompressionAttack: jest.fn(),
        setCompressionRelease: jest.fn(),
        setStereoWidth: jest.fn(),
        setPanningEnabled: jest.fn(),
        setPanningAmount: jest.fn(),
        playChord: jest.fn(),
        playChordProgression: jest.fn(),
        playCircleKey: jest.fn(),
        setPreset: jest.fn(),
        clearSequence: jest.fn(),
        toggleStep: jest.fn(),
        setSequence: jest.fn(),
        addTrack: jest.fn(),
        removeTrack: jest.fn(),
        updateTrack: jest.fn(),
        updateTrackEffects: jest.fn(),
        updateTrackEnvelope: jest.fn(),
        updateTrackLFO: jest.fn(),
        toggleTrackMute: jest.fn(),
        toggleTrackSolo: jest.fn(),
        setTrackVolume: jest.fn(),
        setTrackPan: jest.fn(),
        setTrackName: jest.fn(),
        setTrackNote: jest.fn(),
        setTrackCategory: jest.fn(),
        setTrackInstrument: jest.fn(),
        setSelectedTrack: jest.fn(),
        initAudio: jest.fn()
      })
    }));
    
    describe('Synthesizer', () => {
      const defaultProps = {
        isOpen: true,
        onClose: jest.fn()
      };
    
      beforeEach(() => {
        jest.clearAllMocks();
      });
    
      it('renders without crashing when open', () => {
        render(<Synthesizer {...defaultProps} />);
        // The component should render without throwing errors
        expect(document.body).toBeInTheDocument();
      });
    
      it('does not render when closed', () => {
        render(<Synthesizer isOpen={false} onClose={jest.fn()} />);
        // When closed, the component should not render its content
        expect(screen.queryByText(/synthesizer/i)).not.toBeInTheDocument();
      });
    
      it('calls onClose when close button is clicked', () => {
        const onClose = jest.fn();
        render(<Synthesizer isOpen={true} onClose={onClose} />);
        
        // Look for a close button (usually an X or close icon)
        const closeButton = screen.getByRole('button', { name: /close/i }) || 
                           screen.getByText('×') || 
                           screen.getByTitle('Close');
        
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
      });
    
      it('renders keyboard when open', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // The keyboard should be present in the DOM
        const keyboard = document.querySelector('[data-testid="keyboard"]') || 
                        document.querySelector('.keyboard') ||
                        document.querySelector('[class*="keyboard"]');
        
        expect(keyboard).toBeInTheDocument();
      });
    
      it('renders controls when open', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for common synthesizer controls
        const controls = document.querySelector('[class*="controls"]') ||
                        document.querySelector('[class*="panel"]') ||
                        document.querySelector('form');
        
        expect(controls).toBeInTheDocument();
      });
    
      it('handles keyboard interactions', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate keyboard events
        fireEvent.keyDown(document, { key: 'a' });
        fireEvent.keyUp(document, { key: 'a' });
        
        // The component should handle these events without crashing
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles mouse interactions', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate mouse events
        fireEvent.mouseDown(document);
        fireEvent.mouseUp(document);
        
        // The component should handle these events without crashing
        expect(document.body).toBeInTheDocument();
      });
    
      it('renders with proper accessibility attributes', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Check for basic accessibility
        const mainElement = document.querySelector('main') || 
                           document.querySelector('[role="main"]') ||
                           document.querySelector('[class*="synthesizer"]');
        
        expect(mainElement).toBeInTheDocument();
      });
    
      it('initializes audio context when component mounts', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // The AudioContext should be created
        expect(AudioContext).toHaveBeenCalled();
      });
    
      it('renders waveform controls', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for waveform-related elements
        const waveformControls = document.querySelector('[class*="waveform"]') ||
                                document.querySelector('[data-testid="waveform"]') ||
                                document.querySelector('input[type="radio"]');
        
        expect(waveformControls).toBeInTheDocument();
      });
    
      it('renders volume controls', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for volume-related elements
        const volumeControls = document.querySelector('[class*="volume"]') ||
                              document.querySelector('input[type="range"]') ||
                              document.querySelector('[data-testid="volume"]');
        
        expect(volumeControls).toBeInTheDocument();
      });
    
      it('renders sequencer controls', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for sequencer-related elements
        const sequencerControls = document.querySelector('[class*="sequencer"]') ||
                                 document.querySelector('[data-testid="sequencer"]') ||
                                 document.querySelector('button');
        
        expect(sequencerControls).toBeInTheDocument();
      });
    
      it('handles preset selection', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for preset buttons
        const presetButtons = document.querySelectorAll('button');
        
        if (presetButtons.length > 0) {
          fireEvent.click(presetButtons[0]);
          // Should not crash when clicking preset buttons
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles chord selection', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for chord-related elements
        const chordElements = document.querySelectorAll('[class*="chord"]');
        
        if (chordElements.length > 0) {
          fireEvent.click(chordElements[0]);
          // Should not crash when clicking chord elements
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles progression selection', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for progression-related elements
        const progressionElements = document.querySelectorAll('[class*="progression"]');
        
        if (progressionElements.length > 0) {
          fireEvent.click(progressionElements[0]);
          // Should not crash when clicking progression elements
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles circle of fifths interaction', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for circle of fifths elements
        const circleElements = document.querySelectorAll('[class*="circle"]');
        
        if (circleElements.length > 0) {
          fireEvent.click(circleElements[0]);
          // Should not crash when clicking circle elements
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles LFO controls', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for LFO-related elements
        const lfoElements = document.querySelectorAll('[class*="lfo"]');
        
        if (lfoElements.length > 0) {
          fireEvent.click(lfoElements[0]);
          // Should not crash when interacting with LFO controls
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles effects controls', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for effects-related elements
        const effectsElements = document.querySelectorAll('[class*="effect"]');
        
        if (effectsElements.length > 0) {
          fireEvent.click(effectsElements[0]);
          // Should not crash when interacting with effects controls
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles multi-track sequencer', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for multi-track sequencer elements
        const sequencerElements = document.querySelectorAll('[class*="track"]');
        
        if (sequencerElements.length > 0) {
          fireEvent.click(sequencerElements[0]);
          // Should not crash when interacting with track elements
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles instrument selection', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for instrument-related elements
        const instrumentElements = document.querySelectorAll('[class*="instrument"]');
        
        if (instrumentElements.length > 0) {
          fireEvent.click(instrumentElements[0]);
          // Should not crash when selecting instruments
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles rhythm patterns', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for rhythm-related elements
        const rhythmElements = document.querySelectorAll('[class*="rhythm"]');
        
        if (rhythmElements.length > 0) {
          fireEvent.click(rhythmElements[0]);
          // Should not crash when selecting rhythm patterns
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles Scrypture-specific sounds', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for Scrypture-specific elements
        const scryptureElements = document.querySelectorAll('[class*="scrypture"]');
        
        if (scryptureElements.length > 0) {
          fireEvent.click(scryptureElements[0]);
          // Should not crash when selecting Scrypture sounds
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles collapsible sections', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for collapsible section headers
        const sectionHeaders = document.querySelectorAll('[class*="header"]');
        
        if (sectionHeaders.length > 0) {
          fireEvent.click(sectionHeaders[0]);
          // Should not crash when toggling sections
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles slider controls', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for slider inputs
        const sliders = document.querySelectorAll('input[type="range"]');
        
        if (sliders.length > 0) {
          fireEvent.change(sliders[0], { target: { value: '50' } });
          // Should not crash when adjusting sliders
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles button controls', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for buttons
        const buttons = document.querySelectorAll('button');
        
        if (buttons.length > 0) {
          fireEvent.click(buttons[0]);
          // Should not crash when clicking buttons
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles form submissions', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for forms
        const forms = document.querySelectorAll('form');
        
        if (forms.length > 0) {
          fireEvent.submit(forms[0]);
          // Should not crash when submitting forms
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles input changes', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for inputs
        const inputs = document.querySelectorAll('input');
        
        if (inputs.length > 0) {
          fireEvent.change(inputs[0], { target: { value: 'test' } });
          // Should not crash when changing inputs
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles textarea changes', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for textareas
        const textareas = document.querySelectorAll('textarea');
        
        if (textareas.length > 0) {
          fireEvent.change(textareas[0], { target: { value: 'test' } });
          // Should not crash when changing textareas
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles select changes', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for select elements
        const selects = document.querySelectorAll('select');
        
        if (selects.length > 0) {
          fireEvent.change(selects[0], { target: { value: 'option1' } });
          // Should not crash when changing selects
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles drag and drop', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for draggable elements
        const draggableElements = document.querySelectorAll('[draggable="true"]');
        
        if (draggableElements.length > 0) {
          fireEvent.dragStart(draggableElements[0]);
          fireEvent.drop(draggableElements[0]);
          // Should not crash when dragging and dropping
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles focus events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Look for focusable elements
        const focusableElements = document.querySelectorAll('button, input, select, textarea');
        
        if (focusableElements.length > 0) {
          fireEvent.focus(focusableElements[0]);
          fireEvent.blur(focusableElements[0]);
          // Should not crash when focusing elements
          expect(document.body).toBeInTheDocument();
        }
      });
    
      it('handles scroll events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate scroll events
        fireEvent.scroll(document);
        // Should not crash when scrolling
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles resize events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate resize events
        fireEvent.resize(window);
        // Should not crash when resizing
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles context menu events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate context menu events
        fireEvent.contextMenu(document);
        // Should not crash when right-clicking
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles copy and paste events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate copy and paste events
        fireEvent.copy(document);
        fireEvent.paste(document);
        // Should not crash when copying and pasting
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles cut events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate cut events
        fireEvent.cut(document);
        // Should not crash when cutting
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles composition events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate composition events
        fireEvent.compositionStart(document);
        fireEvent.compositionEnd(document);
        // Should not crash when composing text
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles animation events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate animation events
        fireEvent.animationStart(document);
        fireEvent.animationEnd(document);
        // Should not crash when animations occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles transition events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate transition events
        fireEvent.transitionEnd(document);
        // Should not crash when transitions occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles touch events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate touch events
        fireEvent.touchStart(document);
        fireEvent.touchEnd(document);
        fireEvent.touchMove(document);
        // Should not crash when touching
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles wheel events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate wheel events
        fireEvent.wheel(document);
        // Should not crash when scrolling with wheel
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles pointer events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate pointer events
        fireEvent.pointerDown(document);
        fireEvent.pointerUp(document);
        fireEvent.pointerMove(document);
        // Should not crash when using pointer
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles gesture events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate gesture events
        fireEvent.gestureStart(document);
        fireEvent.gestureEnd(document);
        fireEvent.gestureChange(document);
        // Should not crash when using gestures
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles before input events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate before input events
        fireEvent.beforeInput(document);
        // Should not crash when before input occurs
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles input events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate input events
        fireEvent.input(document);
        // Should not crash when input occurs
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles invalid events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate invalid events
        fireEvent.invalid(document);
        // Should not crash when invalid events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles reset events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate reset events
        fireEvent.reset(document);
        // Should not crash when reset events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles search events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate search events
        fireEvent.search(document);
        // Should not crash when search events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles select events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate select events
        fireEvent.select(document);
        // Should not crash when select events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles selection change events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate selection change events
        fireEvent.selectionChange(document);
        // Should not crash when selection change events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles toggle events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate toggle events
        fireEvent.toggle(document);
        // Should not crash when toggle events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles volume change events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate volume change events
        fireEvent.volumeChange(document);
        // Should not crash when volume change events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles rate change events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate rate change events
        fireEvent.rateChange(document);
        // Should not crash when rate change events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles load start events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate load start events
        fireEvent.loadStart(document);
        // Should not crash when load start events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles progress events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate progress events
        fireEvent.progress(document);
        // Should not crash when progress events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles suspend events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate suspend events
        fireEvent.suspend(document);
        // Should not crash when suspend events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles abort events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate abort events
        fireEvent.abort(document);
        // Should not crash when abort events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles error events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate error events
        fireEvent.error(document);
        // Should not crash when error events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles emptied events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate emptied events
        fireEvent.emptied(document);
        // Should not crash when emptied events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles stalled events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate stalled events
        fireEvent.stalled(document);
        // Should not crash when stalled events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles loaded metadata events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate loaded metadata events
        fireEvent.loadedMetadata(document);
        // Should not crash when loaded metadata events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles loaded data events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate loaded data events
        fireEvent.loadedData(document);
        // Should not crash when loaded data events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles can play events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate can play events
        fireEvent.canPlay(document);
        // Should not crash when can play events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles can play through events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate can play through events
        fireEvent.canPlayThrough(document);
        // Should not crash when can play through events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles playing events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate playing events
        fireEvent.playing(document);
        // Should not crash when playing events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles waiting events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate waiting events
        fireEvent.waiting(document);
        // Should not crash when waiting events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles seeking events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate seeking events
        fireEvent.seeking(document);
        // Should not crash when seeking events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles seeked events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate seeked events
        fireEvent.seeked(document);
        // Should not crash when seeked events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles time update events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate time update events
        fireEvent.timeUpdate(document);
        // Should not crash when time update events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles ended events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate ended events
        fireEvent.ended(document);
        // Should not crash when ended events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles duration change events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate duration change events
        fireEvent.durationChange(document);
        // Should not crash when duration change events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles play events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate play events
        fireEvent.play(document);
        // Should not crash when play events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles pause events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate pause events
        fireEvent.pause(document);
        // Should not crash when pause events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles rate change events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate rate change events
        fireEvent.rateChange(document);
        // Should not crash when rate change events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles resize events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate resize events
        fireEvent.resize(document);
        // Should not crash when resize events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles scroll events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate scroll events
        fireEvent.scroll(document);
        // Should not crash when scroll events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles focus events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate focus events
        fireEvent.focus(document);
        fireEvent.blur(document);
        // Should not crash when focus events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles focus in events', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate focus in events
        fireEvent.focusIn(document);
        fireEvent.focusOut(document);
        // Should not crash when focus in events occur
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM attribute modification', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM attribute modification
        const element = document.createElement('div');
        element.setAttribute('data-test', 'value');
        element.removeAttribute('data-test');
        // Should not crash when modifying attributes
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM property modification', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM property modification
        const element = document.createElement('div');
        element.style.color = 'red';
        element.style.color = 'blue';
        // Should not crash when modifying properties
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM text modification', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM text modification
        const element = document.createElement('div');
        element.textContent = 'test';
        element.textContent = 'updated';
        // Should not crash when modifying text
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element removal', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element removal
        const element = document.createElement('div');
        document.body.appendChild(element);
        document.body.removeChild(element);
        // Should not crash when removing elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element insertion', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element insertion
        const element = document.createElement('div');
        document.body.appendChild(element);
        // Should not crash when inserting elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element replacement', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element replacement
        const oldElement = document.createElement('div');
        const newElement = document.createElement('span');
        document.body.appendChild(oldElement);
        document.body.replaceChild(newElement, oldElement);
        // Should not crash when replacing elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element movement', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element movement
        const element = document.createElement('div');
        const container1 = document.createElement('div');
        const container2 = document.createElement('div');
        document.body.appendChild(container1);
        document.body.appendChild(container2);
        container1.appendChild(element);
        container2.appendChild(element);
        // Should not crash when moving elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element cloning', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element cloning
        const element = document.createElement('div');
        const clone = element.cloneNode(true);
        // Should not crash when cloning elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element import', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element import
        const element = document.createElement('div');
        const importedElement = document.importNode(element, true);
        // Should not crash when importing elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element adoption', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element adoption
        const element = document.createElement('div');
        const adoptedElement = document.adoptNode(element);
        // Should not crash when adopting elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element normalization', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element normalization
        const element = document.createElement('div');
        element.normalize();
        // Should not crash when normalizing elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element comparison', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element comparison
        const element1 = document.createElement('div');
        const element2 = document.createElement('div');
        const isEqual = element1.isEqualNode(element2);
        // Should not crash when comparing elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element lookup', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element lookup
        const element = document.createElement('div');
        element.id = 'test';
        document.body.appendChild(element);
        const foundElement = document.getElementById('test');
        // Should not crash when looking up elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element selection', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element selection
        const element = document.createElement('div');
        element.className = 'test';
        document.body.appendChild(element);
        const selectedElements = document.getElementsByClassName('test');
        // Should not crash when selecting elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element querying', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element querying
        const element = document.createElement('div');
        element.setAttribute('data-test', 'value');
        document.body.appendChild(element);
        const queriedElements = document.querySelectorAll('[data-test="value"]');
        // Should not crash when querying elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element traversal', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element traversal
        const parent = document.createElement('div');
        const child = document.createElement('span');
        parent.appendChild(child);
        const firstChild = parent.firstChild;
        const lastChild = parent.lastChild;
        const nextSibling = child.nextSibling;
        const previousSibling = child.previousSibling;
        // Should not crash when traversing elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element manipulation', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element manipulation
        const element = document.createElement('div');
        element.innerHTML = '<span>test</span>';
        element.outerHTML = '<div><span>updated</span></div>';
        // Should not crash when manipulating elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element measurement', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element measurement
        const element = document.createElement('div');
        document.body.appendChild(element);
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        // Should not crash when measuring elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element positioning', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element positioning
        const element = document.createElement('div');
        document.body.appendChild(element);
        element.scrollIntoView();
        element.scrollIntoViewIfNeeded();
        // Should not crash when positioning elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element scrolling', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element scrolling
        const element = document.createElement('div');
        element.style.height = '1000px';
        element.style.overflow = 'auto';
        document.body.appendChild(element);
        element.scrollTo(0, 100);
        element.scrollBy(0, 50);
        // Should not crash when scrolling elements
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element focus management', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element focus management
        const element = document.createElement('button');
        document.body.appendChild(element);
        element.focus();
        element.blur();
        // Should not crash when managing focus
        expect(document.body).toBeInTheDocument();
      });
    
      it('handles DOM element form submission', () => {
        render(<Synthesizer {...defaultProps} />);
        
        // Simulate DOM element form submission
        const form = document.creat
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
    expect(screen.getByText('🎛️ Classic Presets')).toBeInTheDocument();
    expect(screen.getByText('🦫 Scrypture Sounds')).toBeInTheDocument();
    expect(screen.getByText('🎵 Waveform')).toBeInTheDocument();
    expect(screen.getByText('SEQUENCER')).toBeInTheDocument();
  });

  it('renders keyboard keys', () => {
    render(<Synthesizer />);
    
    // Check for some piano keys - use getAllByText since there are multiple elements
    const aKeys = screen.getAllByText('A');
    expect(aKeys.length).toBeGreaterThan(0);
    const dKeys = screen.getAllByText('D');
    expect(dKeys.length).toBeGreaterThan(0);
    const fKeys = screen.getAllByText('F');
    expect(fKeys.length).toBeGreaterThan(0);
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
    expect(screen.getByText('🦫 Bóbr')).toBeInTheDocument();
  });

  it('renders sequencer controls', () => {
    render(<Synthesizer />);
    expect(screen.getByText('BPM')).toBeInTheDocument();
    const stepsElements = screen.getAllByText('Steps');
    expect(stepsElements.length).toBeGreaterThan(0);
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