// Synthesizer Module - Connected to TypeScript logic

// Synthesizer state
let synthesizerState = {
    waveform: 'sine',
    volume: 50,
    attack: 10,
    release: 20,
    detune: 0,
    reverbEnabled: false,
    lfoRate: 1,
    lfoDepth: 10,
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

// Audio context and nodes
let audioContext = null;
let masterGain = null;
let dryGain = null;
let wetGain = null;
let convolver = null;
let activeNotes = {};
let sequence = {};

// Keyboard interaction state
let isDragging = false;
let lastPlayedKey = null;
let pressed = new Set();
let activeNotesSet = new Set();

// Initialize audio context
function initializeAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
        masterGain.gain.value = (synthesizerState.volume / 100) * 0.5; // Reduce overall volume to 50%
        
        // Create reverb nodes
        dryGain = audioContext.createGain();
        wetGain = audioContext.createGain();
        convolver = audioContext.createConvolver();
        
        dryGain.connect(masterGain);
        wetGain.connect(masterGain);
        convolver.connect(wetGain);
        
        // Create impulse response for reverb
        convolver.buffer = (() => {
            const rate = audioContext.sampleRate;
            const length = rate * 2;
            const impulse = audioContext.createBuffer(2, length, rate);
            for (let i = 0; i < 2; i++) {
                const ch = impulse.getChannelData(i);
                for (let j = 0; j < length; j++) {
                    ch[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 2);
                }
            }
            return impulse;
        })();
        
        console.log('Audio context initialized successfully');
        updateStatus('Audio initialized');
    } catch (error) {
        console.error('Failed to initialize audio context:', error);
        updateStatus('Audio failed to initialize');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing synthesizer...');
    
    // Initialize test sound button
    initializeTestSound();
    
    // Update initial status
    updateStatus('Synthesizer ready - click "Test Sound" to enable audio');
    
    // Wait for data to be loaded before initializing components
    const checkDataAndInitialize = () => {
        if (window.SynthesizerData && window.SynthesizerData.NOTES) {
            console.log('SynthesizerData loaded successfully:', Object.keys(window.SynthesizerData));
            
            // Initialize UI components
            initializeCollapsibleSections();
            initializeSliderControls();
            initializeKeyboard();
            initializeSequencer();
            initializeCircleOfFifths();
            initializeChordButtons();
            initializePresetButtons();
            initializeWaveformButtons();
            initializeFooterControls();
            initializeStatusUpdates();
            
            // Add keyboard event listeners
            addKeyboardEventListeners();
            
            updateStatus('Synthesizer fully initialized');
        } else {
            console.log('Waiting for SynthesizerData to load...');
            setTimeout(checkDataAndInitialize, 50);
        }
    };
    
    // Start checking for data
    checkDataAndInitialize();
});

// Initialize test sound button
function initializeTestSound() {
    const testBtn = document.getElementById('testSoundBtn');
    if (testBtn) {
        testBtn.addEventListener('click', function() {
            console.log('Test sound button clicked');
            // Initialize audio context on first user interaction
            if (!audioContext) {
                initializeAudioContext();
            }
            
            // Play a test note
            startNote(440); // A4
            
            // Stop after 1 second
            setTimeout(() => {
                stopNote(440);
            }, 1000);
            
            updateStatus('Test sound played');
        });
    }
}

// Add keyboard event listeners
function addKeyboardEventListeners() {
    // Keyboard event listeners
    document.addEventListener('keydown', e => {
        // Prevent default behavior for music keys
        const musicKeys = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k'];
        if (musicKeys.includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
        
        const notes = window.SynthesizerData?.NOTES || [];
        const note = notes.find(n => n.key === e.key.toLowerCase());
        if (note && !pressed.has(note.freq)) {
            const el = document.querySelector(`.key[data-key="${note.key}"]`);
            startNote(note.freq, el);
            pressed.add(note.freq);
            console.log('Key pressed:', e.key, 'frequency:', note.freq);
        }
    });

    document.addEventListener('keyup', e => {
        const notes = window.SynthesizerData?.NOTES || [];
        const note = notes.find(n => n.key === e.key.toLowerCase());
        if (note && !synthesizerState.sustainMode) {
            const el = document.querySelector(`.key[data-key="${note.key}"]`);
            stopNote(note.freq, el);
            pressed.delete(note.freq);
            console.log('Key released:', e.key, 'frequency:', note.freq);
        }
    });

    // Mouse event listeners for keyboard dragging
    document.querySelectorAll('.key').forEach(el => {
        const freq = parseFloat(el.dataset.freq);
        
        el.addEventListener('mousedown', () => {
            isDragging = true;
            lastPlayedKey = el;
            startNote(freq, el);
        });
        
        el.addEventListener('mouseup', () => {
            if (!synthesizerState.sustainMode) stopNote(freq, el);
            isDragging = false;
            lastPlayedKey = null;
        });
        
        el.addEventListener('mouseenter', () => {
            if (isDragging && el !== lastPlayedKey) {
                lastPlayedKey = el;
                startNote(freq, el);
            }
        });
        
        el.addEventListener('mouseleave', () => {
            if (!synthesizerState.sustainMode) stopNote(freq, el);
        });
        
        el.addEventListener('touchstart', e => {
            e.preventDefault();
            isDragging = true;
            lastPlayedKey = el;
            startNote(freq, el);
        }, { passive: false });
        
        el.addEventListener('touchend', () => {
            if (!synthesizerState.sustainMode) stopNote(freq, el);
            isDragging = false;
            lastPlayedKey = null;
        });
        
        el.addEventListener('touchmove', e => {
            e.preventDefault();
            if (isDragging) {
                const touch = e.touches[0];
                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                if (elementBelow && elementBelow.classList.contains('key') && elementBelow !== lastPlayedKey) {
                    lastPlayedKey = elementBelow;
                    const touchFreq = parseFloat(elementBelow.dataset.freq);
                    startNote(touchFreq, elementBelow);
                }
            }
        }, { passive: false });
    });

    // Stop dragging when mouse leaves the keyboard area
    const keyboard = document.getElementById('keyboard');
    if (keyboard) {
        keyboard.addEventListener('mouseleave', () => {
            isDragging = false;
            lastPlayedKey = null;
        });
    }

    // Resume audio context on first click
    document.addEventListener('click', () => {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }, { once: true });
}

// Collapsible Sections
function initializeCollapsibleSections() {
    const sectionHeaders = document.querySelectorAll('.sectionHeader');
    
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const collapsible = this.closest('.collapsible');
            const isCollapsed = collapsible.classList.contains('collapsed');
            
            if (isCollapsed) {
                collapsible.classList.remove('collapsed');
            } else {
                collapsible.classList.add('collapsed');
            }
        });
    });
}

// Slider Controls
function initializeSliderControls() {
    const sliders = document.querySelectorAll('input[type="range"]');
    
    sliders.forEach(slider => {
        const valueDisplay = slider.parentElement.querySelector('.valueDisplay');
        const minusBtn = slider.parentElement.querySelector('button:first-child');
        const plusBtn = slider.parentElement.querySelector('button:nth-child(3)');
        
        // Update value display
        function updateValueDisplay() {
            if (valueDisplay) {
                const value = slider.value;
                const label = slider.closest('.section').querySelector('label').textContent;
                
                if (label === 'Volume') {
                    valueDisplay.textContent = `${value}%`;
                } else if (label === 'Detune') {
                    valueDisplay.textContent = `${value}¢`;
                } else if (label === 'LFO Rate') {
                    valueDisplay.textContent = `${value} Hz`;
                } else {
                    valueDisplay.textContent = value;
                }
            }
        }
        
        // Minus button
        if (minusBtn) {
            minusBtn.addEventListener('click', function() {
                const step = parseFloat(slider.step) || 1;
                const newValue = Math.max(parseFloat(slider.min), parseFloat(slider.value) - step);
                slider.value = newValue;
                updateValueDisplay();
                slider.dispatchEvent(new Event('input'));
            });
        }
        
        // Plus button
        if (plusBtn) {
            plusBtn.addEventListener('click', function() {
                const step = parseFloat(slider.step) || 1;
                const newValue = Math.min(parseFloat(slider.max), parseFloat(slider.value) + step);
                slider.value = newValue;
                updateValueDisplay();
                slider.dispatchEvent(new Event('input'));
            });
        }
        
        // Slider change
        slider.addEventListener('input', function() {
            updateValueDisplay();
            
            // Update synthesizer state based on slider ID
            const sliderId = slider.id;
            const value = parseFloat(slider.value);
            
            switch(sliderId) {
                case 'volume':
                    synthesizerState.volume = value;
                    if (masterGain) {
                        masterGain.gain.value = value / 100;
                    }
                    break;
                case 'attack':
                    synthesizerState.attack = value;
                    break;
                case 'release':
                    synthesizerState.release = value;
                    break;
                case 'detune':
                    synthesizerState.detune = value;
                    // Update detune for all currently playing notes
                    Object.values(activeNotes).forEach(({ osc }) => {
                        if (osc && osc.detune) {
                            osc.detune.setValueAtTime(value, audioContext.currentTime);
                        }
                    });
                    break;
                case 'lfoRate':
                    synthesizerState.lfoRate = value;
                    break;
                case 'lfoDepth':
                    synthesizerState.lfoDepth = value;
                    break;
                case 'bpm':
                    synthesizerState.bpm = value;
                    break;
                case 'steps':
                    synthesizerState.steps = value;
                    break;
            }
            
            updateStatus(`${sliderId}: ${value}`);
        });
        
        // Initialize display
        updateValueDisplay();
    });
    
    // Initialize select elements
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            const selectId = this.id;
            const value = this.value;
            
            switch(selectId) {
                case 'reverb':
                    synthesizerState.reverbEnabled = value === 'on';
                    updateStatus(`Reverb: ${value}`);
                    break;
                case 'arpeggiator':
                    synthesizerState.arpeggiator = value;
                    updateStatus(`Arpeggiator: ${value}`);
                    break;
                case 'lfoTarget':
                    synthesizerState.lfoTarget = value;
                    updateStatus(`LFO Target: ${value}`);
                    break;
            }
        });
    });
    
    // Initialize sustain button
    const sustainBtn = document.getElementById('sustainBtn');
    if (sustainBtn) {
        sustainBtn.addEventListener('click', function() {
            toggleSustain();
        });
    }
    
    // Initialize reset detune button
    const resetDetuneBtn = document.querySelector('.resetBtn');
    if (resetDetuneBtn) {
        resetDetuneBtn.addEventListener('click', function() {
            resetDetune();
        });
    }
    
    // Initialize sequencer buttons
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const clearBtn = document.getElementById('clearBtn');
    const drawBtn = document.getElementById('drawBtn');
    
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            playSequence();
        });
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            stopSequence();
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            clearSequence();
        });
    }
    
    if (drawBtn) {
        drawBtn.addEventListener('click', function() {
            toggleDrawMode();
        });
    }
}

// Keyboard with real data
function initializeKeyboard() {
    const keyboard = document.querySelector('.keyboard');
    if (!keyboard) {
        console.error('Keyboard element not found');
        return;
    }
    
    console.log('Initializing keyboard...');
    console.log('SynthesizerData available:', !!window.SynthesizerData);
    console.log('SynthesizerData content:', window.SynthesizerData);
    
    // Use fallback notes if SynthesizerData is not available
    const notes = (window.SynthesizerData && window.SynthesizerData.NOTES) || [
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
    
    console.log('Creating keyboard with', notes.length, 'notes');
    console.log('Notes data:', notes);
    
    // Clear existing keys
    keyboard.innerHTML = '';
    
    // Create keyboard keys
    notes.forEach((note, index) => {
        const key = document.createElement('div');
        key.className = `key ${note.black ? 'black' : ''}`;
        key.textContent = note.key.toUpperCase();
        key.dataset.freq = note.freq;
        key.dataset.key = note.key;
        
        // Event listeners are added globally in addKeyboardEventListeners()
        
        keyboard.appendChild(key);
    });
    
    console.log('Keyboard initialized with', keyboard.children.length, 'keys');
}

// Sequencer with real data
function initializeSequencer() {
    const stepIndicators = document.querySelector('.stepIndicators');
    const timelineTracks = document.querySelector('.timelineTracks');
    
    if (!stepIndicators || !timelineTracks) return;
    
    const tracks = window.SynthesizerData?.SEQUENCER_TRACKS || [
        { note: 'C', freq: 261.63 },
        { note: 'D', freq: 293.66 },
        { note: 'E', freq: 329.63 },
        { note: 'F', freq: 349.23 },
        { note: 'G', freq: 392.00 },
        { note: 'A', freq: 440.00 },
        { note: 'B', freq: 493.88 }
    ];
    
    // Initialize sequence data
    tracks.forEach(track => {
        sequence[track.note] = new Array(synthesizerState.steps).fill(false);
    });
    
    // Create step indicators
    for (let i = 0; i < synthesizerState.steps; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'stepIndicator';
        indicator.textContent = (i + 1) % 10;
        stepIndicators.appendChild(indicator);
    }
    
    // Create tracks
    tracks.forEach(track => {
        const trackElement = document.createElement('div');
        trackElement.className = 'track';
        
        const trackLabel = document.createElement('div');
        trackLabel.className = 'trackLabel';
        trackLabel.textContent = track.note;
        
        const trackSteps = document.createElement('div');
        trackSteps.className = 'trackSteps';
        
        // Create steps for this track
        for (let i = 0; i < synthesizerState.steps; i++) {
            const step = document.createElement('div');
            step.className = 'step';
            step.dataset.track = track.note;
            step.dataset.step = i;
            step.dataset.freq = track.freq;
            
            step.addEventListener('click', function() {
                const trackName = this.dataset.track;
                const stepIndex = parseInt(this.dataset.step);
                sequence[trackName][stepIndex] = !sequence[trackName][stepIndex];
                this.classList.toggle('active');
            });
            
            trackSteps.appendChild(step);
        }
        
        trackElement.appendChild(trackLabel);
        trackElement.appendChild(trackSteps);
        timelineTracks.appendChild(trackElement);
    });
}

// Initialize circle of fifths
function initializeCircleOfFifths() {
    const circleContainer = document.querySelector('.circleOfFifths');
    if (!circleContainer) return;
    
    const circleKeys = window.SynthesizerData?.CIRCLE_OF_FIFTHS || [];
    
    circleKeys.forEach(circleKey => {
        const angle = (circleKey.angle * Math.PI) / 180;
        const radius = 130;
        const x = Math.cos(angle) * radius + 150;
        const y = Math.sin(angle) * radius + 150;
        
        const keyElement = document.createElement('div');
        keyElement.className = `circleKey ${circleKey.type}`;
        keyElement.style.left = `${x}px`;
        keyElement.style.top = `${y}px`;
        keyElement.textContent = circleKey.key;
        
        keyElement.addEventListener('mousedown', function() {
            synthesizerState.isDraggingCircle = true;
            playCircleKey(circleKey);
        });
        
        keyElement.addEventListener('mouseenter', function() {
            if (synthesizerState.isDraggingCircle) {
                playCircleKey(circleKey);
            }
        });
        
        circleContainer.appendChild(keyElement);
    });
}

// Initialize chord buttons
function initializeChordButtons() {
    console.log('Initializing chord buttons...');
    const chordButtons = document.querySelectorAll('.chordBtn');
    console.log('Found chord buttons:', chordButtons.length);
    chordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const chordName = this.textContent;
            console.log('Chord button clicked:', chordName);
            playChord(chordName);
        });
    });
    
    const moodButtons = document.querySelectorAll('.moodBtn');
    console.log('Found mood buttons:', moodButtons.length);
    moodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const chordName = this.textContent;
            console.log('Mood button clicked:', chordName);
            playChord(chordName);
        });
    });
}

// Initialize preset buttons
function initializePresetButtons() {
    console.log('Initializing preset buttons...');
    const presetButtons = document.querySelectorAll('.presetBtn');
    console.log('Found preset buttons:', presetButtons.length);
    
    // Mapping for Scrypture Sound presets
    const scrypturePresetMap = {
        '🏆 Common': 'achievement-common',
        '💎 Rare': 'achievement-rare',
        '👑 Legendary': 'achievement-legendary',
        '✅ Complete': 'task-complete',
        '🎉 Level Up': 'level-up',
        '🦫 Bóbr': 'bobr-greeting',
        '🏗️ Dam Build': 'dam-build',
        '🔥 Streak': 'streak-milestone',
        '🖱️ UI Click': 'ui-click',
        '📝 Submit': 'form-submit',
        '📋 Modal': 'modal-open',
        '⭐ XP Gain': 'xp-gain'
    };
    
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent;
            console.log('Preset button clicked:', buttonText);
            
            // Check if it's a Scrypture Sound preset
            if (scrypturePresetMap[buttonText]) {
                const presetName = scrypturePresetMap[buttonText];
                console.log('Loading Scrypture preset:', presetName);
                if (window.SynthesizerData && window.SynthesizerData.PRESETS && window.SynthesizerData.PRESETS[presetName]) {
                    loadPreset(presetName);
                } else {
                    console.log('Scrypture preset not found:', presetName);
                    updateStatus('Preset not found: ' + buttonText);
                }
                return;
            }
            
            // Try regular preset mapping
            const presetName = buttonText.toLowerCase().replace(/\s+/g, '-');
            console.log('Trying regular preset:', presetName);
            if (window.SynthesizerData && window.SynthesizerData.PRESETS && window.SynthesizerData.PRESETS[presetName]) {
                loadPreset(presetName);
            } else {
                // Try chord progression
                if (window.SynthesizerData && window.SynthesizerData.CHORD_PROGRESSIONS && window.SynthesizerData.CHORD_PROGRESSIONS[buttonText]) {
                    playProgression(buttonText);
                } else {
                    console.log('Preset/progression not found:', presetName, 'or', buttonText);
                    updateStatus('Preset not found: ' + buttonText);
                }
            }
        });
    });
}

// Initialize waveform buttons
function initializeWaveformButtons() {
    const waveformButtons = document.querySelectorAll('.waveformBtn');
    waveformButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            waveformButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const waveform = this.textContent.toLowerCase();
            setWaveform(waveform);
        });
    });
}

// Helper function for circle of fifths
function playCircleKey(circleKey) {
    let chordName;
    if (circleKey.chordType === 'dominant') {
        chordName = circleKey.key + '7';
    } else if (circleKey.chordType === 'diminished') {
        chordName = circleKey.key + 'dim';
    } else {
        chordName = circleKey.key + 'maj';
    }
    
    if (window.SynthesizerData?.CHORDS[chordName]) {
        playChord(chordName);
    } else {
        // Fallback to C major
        playChord('Cmaj');
    }
}

// Update UI controls based on state
function updateUIControls() {
    // Update sliders
    const volumeSlider = document.querySelector('input[type="range"][min="0"][max="100"][value="50"]');
    if (volumeSlider) {
        volumeSlider.value = synthesizerState.volume;
        const valueDisplay = volumeSlider.parentElement.querySelector('.valueDisplay');
        if (valueDisplay) {
            valueDisplay.textContent = `${synthesizerState.volume}%`;
        }
    }
    
    const attackSlider = document.querySelector('input[type="range"][min="0"][max="100"][value="10"]');
    if (attackSlider) {
        attackSlider.value = synthesizerState.attack;
    }
    
    const releaseSlider = document.querySelector('input[type="range"][min="0"][max="100"][value="20"]');
    if (releaseSlider) {
        releaseSlider.value = synthesizerState.release;
    }
    
    const detuneSlider = document.querySelector('input[type="range"][min="-100"][max="100"][value="0"]');
    if (detuneSlider) {
        detuneSlider.value = synthesizerState.detune;
        const valueDisplay = detuneSlider.parentElement.querySelector('.valueDisplay');
        if (valueDisplay) {
            valueDisplay.textContent = `${synthesizerState.detune}¢`;
        }
    }
    
    const lfoRateSlider = document.querySelector('input[type="range"][min="0"][max="10"][value="1"][step="0.1"]');
    if (lfoRateSlider) {
        lfoRateSlider.value = synthesizerState.lfoRate;
        const valueDisplay = lfoRateSlider.parentElement.querySelector('.valueDisplay');
        if (valueDisplay) {
            valueDisplay.textContent = `${synthesizerState.lfoRate} Hz`;
        }
    }
    
    const lfoDepthSlider = document.querySelector('input[type="range"][min="0"][max="50"][value="10"]');
    if (lfoDepthSlider) {
        lfoDepthSlider.value = synthesizerState.lfoDepth;
    }
    
    // Update waveform buttons
    const waveformButtons = document.querySelectorAll('.waveformBtn');
    waveformButtons.forEach(button => {
        button.classList.remove('active');
        if (button.textContent.toLowerCase() === synthesizerState.waveform) {
            button.classList.add('active');
        }
    });
    
    // Update sustain button
    const sustainBtn = document.querySelector('.sustainBtn');
    if (sustainBtn) {
        if (synthesizerState.sustainMode) {
            sustainBtn.classList.add('active');
        } else {
            sustainBtn.classList.remove('active');
        }
    }
    
    // Update reverb select
    const reverbSelect = document.querySelector('select option[value="off"]').parentElement;
    if (reverbSelect) {
        reverbSelect.value = synthesizerState.reverbEnabled ? 'on' : 'off';
    }
    
    // Update LFO target select
    const lfoTargetSelect = document.querySelector('select option[value="pitch"]').parentElement;
    if (lfoTargetSelect) {
        lfoTargetSelect.value = synthesizerState.lfoTarget;
    }
}

// Audio functions with Web Audio API implementation
function startNote(freq, el = null) {
    // Ensure frequency is a number
    const frequency = parseFloat(freq);
    if (isNaN(frequency) || frequency <= 0) return;
    
    // Initialize audio context if not already done
    if (!audioContext) {
        console.log('Initializing audio context on first note...');
        initializeAudioContext();
    }
    
    if (!audioContext || !masterGain) {
        console.error('Audio context not available');
        return;
    }
    
    // Allow multiple notes of the same frequency (polyphony)
    const noteId = frequency + '_' + Date.now() + '_' + Math.random();
    
    try {
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
            console.log('Resuming suspended audio context...');
            audioContext.resume();
        }
        
        console.log('Creating oscillator for frequency:', frequency);
        
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        // Create LFO
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        lfo.frequency.value = synthesizerState.lfoRate;
        lfoGain.gain.value = synthesizerState.lfoDepth;
        lfo.connect(lfoGain);
        
        osc.type = synthesizerState.waveform;
        osc.frequency.value = frequency;
        osc.detune.value = synthesizerState.detune;
        
        // Apply LFO based on target
        if (synthesizerState.lfoTarget === 'pitch') {
            lfoGain.connect(osc.detune);
        } else if (synthesizerState.lfoTarget === 'volume') {
            lfoGain.connect(gain.gain);
        } else if (synthesizerState.lfoTarget === 'filter') {
            const filter = audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 2000;
            filter.Q.value = 1;
            lfoGain.connect(filter.frequency);
            osc.connect(filter);
            filter.connect(gain);
        } else {
            osc.connect(gain);
        }
        
        if (synthesizerState.lfoTarget !== 'filter') {
            osc.connect(gain);
        }
        
        gain.connect(dryGain);
        if (synthesizerState.reverbEnabled) gain.connect(convolver);
        
        // Reduce volume to prevent clipping
        const maxGain = 0.3; // 30% max volume
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(maxGain, audioContext.currentTime + synthesizerState.attack / 1000);
        
        osc.start();
        lfo.start();
        activeNotes[noteId] = { osc, gain, lfo, freq: frequency };
        activeNotesSet.add(noteId);
        if (el) el.classList.add('active');
        
        console.log('Oscillator started for frequency:', frequency);
        updateStatus(`Playing ${frequency.toFixed(1)} Hz`);
        updateStatusInfo(); // Update fixed status bar
        
    } catch (error) {
        console.error('Error playing note:', error);
        updateStatus('Error playing note');
    }
}

function stopNote(freq, el = null) {
    // Ensure frequency is a number
    const frequency = parseFloat(freq);
    if (isNaN(frequency)) return;
    
    console.log('Stopping note with frequency:', frequency);
    
    // Find all notes with this frequency
    const notesToStop = Object.entries(activeNotes).filter(([id, note]) => Math.abs(note.freq - frequency) < 0.1);
    
    notesToStop.forEach(([noteId, note]) => {
        const { osc, gain, lfo } = note;
        
        // Smooth fade out with longer release time for better sound
        const currentGain = gain.gain.value;
        const fadeTime = Math.max(0.3, synthesizerState.release / 1000); // Minimum 0.3s fade for smoother sound
        
        console.log('Fading out note with fade time:', fadeTime);
        
        gain.gain.cancelScheduledValues(audioContext.currentTime);
        gain.gain.setValueAtTime(currentGain, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeTime);
        
        // Stop oscillator and LFO after fade
        osc.stop(audioContext.currentTime + fadeTime);
        lfo.stop(audioContext.currentTime + fadeTime);
        
        // Clean up after fade completes
        setTimeout(() => {
            delete activeNotes[noteId];
            activeNotesSet.delete(noteId);
            console.log('Note cleanup completed for frequency:', frequency);
            updateStatusInfo(); // Update fixed status bar after cleanup
        }, fadeTime * 1000);
    });
    
    if (el) el.classList.remove('active');
    updateStatus(`Stopped ${frequency.toFixed(1)} Hz`);
    updateStatusInfo(); // Update fixed status bar immediately
}

function stopAllNotes() {
    console.log('Stopping all notes...');
    const noteIds = Object.keys(activeNotes);
    noteIds.forEach(noteId => {
        const note = activeNotes[noteId];
        if (note) {
            const { osc, gain, lfo } = note;
            
            // Quick fade out for all notes
            const fadeTime = 0.2; // Quick fade for stop all
            gain.gain.cancelScheduledValues(audioContext.currentTime);
            gain.gain.setValueAtTime(gain.gain.value, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeTime);
            
            osc.stop(audioContext.currentTime + fadeTime);
            lfo.stop(audioContext.currentTime + fadeTime);
        }
    });
    
    // Clear after fade
    setTimeout(() => {
        activeNotes = {};
        activeNotesSet.clear();
        console.log('All notes stopped and cleaned up');
        updateStatusInfo(); // Update fixed status bar after cleanup
    }, 200);
    
    updateStatus('All notes stopped');
    updateStatusInfo(); // Update fixed status bar immediately
}

function playChord(chordName) {
    console.log('playChord called with:', chordName);
    console.log('SynthesizerData available:', !!window.SynthesizerData);
    console.log('SynthesizerData.CHORDS available:', !!window.SynthesizerData?.CHORDS);
    
    // Map common chord names to data structure
    const chordMap = {
        'C': 'Cmaj',
        'Dm': 'Dmin', 
        'Em': 'Emin',
        'F': 'Fmaj',
        'G': 'Gmaj',
        'Am': 'Amin',
        'B°': 'Bdim',
        'Bdim': 'Bdim',
        'Cmaj7': 'Cmaj7',
        'Dm7': 'Dmin7',
        'Em7': 'Emin7',
        'Fmaj7': 'Fmaj7',
        'G7': 'G7',
        'Am7': 'Amin7',
        'Bm7b5': 'Bm7b5'
    };
    
    const mappedChordName = chordMap[chordName] || chordName;
    console.log('Mapped chord name:', mappedChordName);
    
    const chord = window.SynthesizerData?.CHORDS[mappedChordName];
    console.log('Found chord:', chord);
    
    if (!chord) {
        console.warn('Chord not found:', chordName, 'mapped to:', mappedChordName);
        console.log('Available chords:', Object.keys(window.SynthesizerData?.CHORDS || {}));
        return;
    }
    
    console.log('Playing chord:', chordName, '->', mappedChordName, 'frequencies:', chord);
    
    // Stop any currently playing notes
    stopAllNotes();
    
    // Play all frequencies in the chord (chord is now a simple array)
    chord.forEach(freq => {
        startNote(freq);
    });
    
    // Auto-stop chord after 2 seconds for better user experience
    setTimeout(() => {
        chord.forEach(freq => {
            stopNote(freq);
        });
    }, 2000);
    
    updateStatus(`Playing ${chordName}`);
}

function playProgression(progressionName) {
    const progression = window.SynthesizerData && window.SynthesizerData.CHORD_PROGRESSIONS && window.SynthesizerData.CHORD_PROGRESSIONS[progressionName];
    if (!progression) {
        console.warn('Progression not found:', progressionName);
        updateStatus('Progression not found: ' + progressionName);
        return;
    }
    
    // Stop current notes
    stopAllNotes();
    
    // Play progression with timing (progression is now a simple array)
    progression.forEach((chordName, index) => {
        setTimeout(() => {
            playChord(chordName);
        }, index * 1000); // 1 second per chord
    });
    
    updateStatus(`Playing ${progressionName}`);
}

function loadPreset(presetName) {
    console.log('Loading preset:', presetName);
    console.log('Available presets:', Object.keys(window.SynthesizerData?.PRESETS || {}));
    
    const preset = window.SynthesizerData && window.SynthesizerData.PRESETS && window.SynthesizerData.PRESETS[presetName];
    if (!preset) {
        console.warn('Preset not found:', presetName);
        updateStatus('Preset not found: ' + presetName);
        return;
    }
    
    console.log('Preset found:', preset);
    
    // Update synthesizer state
    synthesizerState.waveform = preset.waveform;
    synthesizerState.volume = preset.volume;
    synthesizerState.attack = preset.attack;
    synthesizerState.release = preset.release;
    synthesizerState.detune = preset.detune;
    synthesizerState.reverbEnabled = preset.reverb === 'on';
    synthesizerState.lfoRate = preset.lfoRate;
    synthesizerState.lfoDepth = preset.lfoDepth;
    synthesizerState.lfoTarget = preset.lfoTarget;
    
    // Update UI controls
    updateUIControls();
    
    updateStatus(`Loaded preset: ${presetName}`);
}

function setWaveform(waveform) {
    synthesizerState.waveform = waveform;
    updateStatus(`Waveform: ${waveform}`);
}

function toggleSustain() {
    synthesizerState.sustainMode = !synthesizerState.sustainMode;
    updateStatus(`Sustain: ${synthesizerState.sustainMode ? 'ON' : 'OFF'}`);
}

function resetDetune() {
    synthesizerState.detune = 0;
    updateUIControls();
    updateStatus('Detune reset');
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Footer Controls
function initializeFooterControls() {
    const panicBtn = document.getElementById('panicBtn');
    const resetBtn = document.getElementById('resetBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const midiBtn = document.getElementById('midiBtn');
    const recordBtn = document.getElementById('recordBtn');
    const exportBtn = document.getElementById('exportBtn');
    const helpBtn = document.getElementById('helpBtn');
    
    if (panicBtn) {
        panicBtn.addEventListener('click', function() {
            // Stop all notes
            stopAllNotes();
            updateStatus('Panic - All notes stopped');
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            // Reset all controls to default
            resetAllControls();
            updateStatus('Reset to defaults');
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            // Save current settings
            saveSettings();
            updateStatus('Settings saved');
        });
    }
    
    if (loadBtn) {
        loadBtn.addEventListener('click', function() {
            // Load saved settings
            loadSettings();
            updateStatus('Settings loaded');
        });
    }
    
    if (midiBtn) {
        midiBtn.addEventListener('click', function() {
            // Toggle MIDI input
            toggleMidi();
            updateStatus('MIDI toggled');
        });
    }
    
    if (recordBtn) {
        recordBtn.addEventListener('click', function() {
            // Toggle recording
            toggleRecording();
            updateStatus('Recording toggled');
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            // Export current sequence
            exportSequence();
            updateStatus('Sequence exported');
        });
    }
    
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
            // Show help modal
            showHelp();
            updateStatus('Help opened');
        });
    }
}

// Status Updates
function initializeStatusUpdates() {
    // Update status periodically
    setInterval(updateStatusInfo, 1000);
}

function updateStatus(message) {
    const statusElement = document.getElementById('synthStatus');
    const statusValueElement = document.getElementById('statusValue');
    
    if (statusElement) {
        statusElement.textContent = message;
        // Clear status after 3 seconds
        setTimeout(() => {
            statusElement.textContent = 'Ready';
        }, 3000);
    }
    
    if (statusValueElement) {
        statusValueElement.textContent = message;
    }
    
    console.log('Status:', message);
}

function updateStatusInfo() {
    // Update fixed status bar
    const frequencyValueElement = document.getElementById('frequencyValue');
    const notesDisplayElement = document.getElementById('notesDisplay');
    
    if (frequencyValueElement && notesDisplayElement) {
        if (activeNotesSet.size === 0) {
            frequencyValueElement.textContent = '- Hz';
            notesDisplayElement.textContent = 'None';
        } else {
            // Get all unique frequencies from active notes
            const frequencies = new Set();
            Object.values(activeNotes).forEach(note => {
                frequencies.add(note.freq);
            });
            
            // Convert frequencies to note names
            const notes = window.SynthesizerData?.NOTES || [];
            const noteNames = [];
            const freqList = [];
            
            frequencies.forEach(freq => {
                const note = notes.find(n => Math.abs(n.freq - freq) < 0.1);
                if (note) {
                    noteNames.push(note.key.toUpperCase());
                }
                freqList.push(freq.toFixed(1));
            });
            
            // Show all frequencies joined
            frequencyValueElement.textContent = freqList.join(', ') + ' Hz';
            
            // Show note names in big font
            notesDisplayElement.textContent = noteNames.join(', ') || 'Unknown';
        }
    }
}

// Utility functions for footer controls
function stopAllNotes() {
    console.log('Stopping all notes');
    // TODO: Implement stop all notes
}

function resetAllControls() {
    console.log('Resetting all controls');
    // TODO: Implement reset controls
}

function saveSettings() {
    console.log('Saving settings');
    // TODO: Implement save settings
}

function loadSettings() {
    console.log('Loading settings');
    // TODO: Implement load settings
}

function toggleMidi() {
    console.log('Toggling MIDI');
    // TODO: Implement MIDI toggle
}

function toggleRecording() {
    console.log('Toggling recording');
    // TODO: Implement recording toggle
}

function exportSequence() {
    console.log('Exporting sequence');
    // TODO: Implement sequence export
}

function showHelp() {
    console.log('Showing help');
    // TODO: Implement help modal
}

// Sequencer functions
let sequenceInterval = null;
let currentStep = 0;
let drawMode = false;
let isDrawing = false;

function playSequence() {
    if (synthesizerState.isPlaying) return;
    
    synthesizerState.isPlaying = true;
    currentStep = 0;
    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.textContent = 'Pause';
    
    const stepTime = (60 / synthesizerState.bpm) * 4 / synthesizerState.steps; // 16th note timing
    
    sequenceInterval = setInterval(() => {
        // Clear previous step indicator
        const indicators = document.querySelectorAll('.stepIndicator');
        indicators.forEach(ind => ind.classList.remove('active'));
        
        // Highlight current step
        if (indicators[currentStep]) {
            indicators[currentStep].classList.add('active');
        }
        
        // Play notes for current step
        const tracks = window.SynthesizerData?.SEQUENCER_TRACKS || [];
        tracks.forEach(track => {
            if (sequence[track.note] && sequence[track.note][currentStep]) {
                startNote(track.freq);
                
                // Stop note after a short duration
                setTimeout(() => {
                    stopNote(track.freq);
                }, stepTime * 1000 * 0.6);
            }
        });
        
        currentStep = (currentStep + 1) % synthesizerState.steps;
    }, stepTime * 1000);
    
    updateStatus('Sequencer playing');
}

function stopSequence() {
    if (!synthesizerState.isPlaying) return;
    
    synthesizerState.isPlaying = false;
    currentStep = 0;
    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.textContent = 'Play';
    
    if (sequenceInterval) {
        clearInterval(sequenceInterval);
        sequenceInterval = null;
    }
    
    // Clear step indicators
    document.querySelectorAll('.stepIndicator').forEach(ind => {
        ind.classList.remove('active');
    });
    
    // Stop all playing notes
    Object.values(activeNotes).forEach(note => {
        stopNote(note.freq);
    });
    
    updateStatus('Sequencer stopped');
}

function clearSequence() {
    // Clear sequence data
    Object.keys(sequence).forEach(note => {
        sequence[note].fill(false);
    });
    
    // Clear visual indicators
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    updateStatus('Sequence cleared');
}

function toggleDrawMode() {
    drawMode = !drawMode;
    const drawBtn = document.getElementById('drawBtn');
    if (drawBtn) {
        drawBtn.textContent = drawMode ? 'Click' : 'Draw';
        drawBtn.style.backgroundColor = drawMode ? '#4a4a4a' : '#2d2d2d';
    }
    
    updateStatus(`Draw mode: ${drawMode ? 'ON' : 'OFF'}`);
}

// Add mouse event handlers for draw mode
document.addEventListener('mousedown', () => {
    if (drawMode) {
        isDrawing = true;
    }
});

document.addEventListener('mouseup', () => {
    if (drawMode) {
        isDrawing = false;
    }
    synthesizerState.isDraggingCircle = false;
});

// Track active notes (using Set for counting)
    // activeNotesSet is already declared globally

// Export for potential use in other modules
window.SynthesizerModule = {
    // Core audio functions
    startNote,
    stopNote,
    stopAllNotes,
    playChord,
    playProgression,
    loadPreset,
    setWaveform,
    toggleSustain,
    resetDetune,
    
    // Initialization functions
    initializeCollapsibleSections,
    initializeSliderControls,
    initializeKeyboard,
    initializeSequencer,
    initializeFooterControls,
    initializeStatusUpdates,
    initializeCircleOfFifths,
    initializeChordButtons,
    initializePresetButtons,
    initializeWaveformButtons,
    
    // Utility functions
    updateStatus,
    updateUIControls,
    resetAllControls,
    saveSettings,
    loadSettings,
    toggleMidi,
    toggleRecording,
    exportSequence,
    showHelp,
    
    // State access
    getState: () => synthesizerState,
    getAudioContext: () => audioContext
}; 