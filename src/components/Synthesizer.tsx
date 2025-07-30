import React, { useState, useRef, useEffect } from 'react';
import { useSynthesizer } from '../hooks/useSynthesizer';
import { NOTES, CHORDS, CHORD_PROGRESSIONS, CIRCLE_OF_FIFTHS, PRESETS, SEQUENCER_TRACKS } from '../data/synthesizerData';
import { WaveformType } from '../types/synthesizer';
import styles from './Synthesizer.module.css';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultCollapsed = true 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`${styles.collapsible} ${isCollapsed ? styles.collapsed : ''}`}>
      <div 
        className={styles.sectionHeader} 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <label>{title}</label>
        <span className={styles.collapseIcon}>▼</span>
      </div>
      <div className={styles.sectionContent}>
        {children}
      </div>
    </div>
  );
};

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  valueDisplay?: string;
  additionalControls?: React.ReactNode;
  isLive?: boolean;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  showValue = false,
  valueDisplay,
  additionalControls,
  isLive = false
}) => {
  return (
    <div className={styles.section}>
      <label>
        {label}
        {isLive && <span className={styles.liveIndicator}> 🔴 LIVE</span>}
      </label>
      <div className={styles.sliderGroup}>
        <button onClick={() => onChange(Math.max(min, value - step))}>-</button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={isLive ? styles.liveSlider : ''}
        />
        <button onClick={() => onChange(Math.min(max, value + step))}>+</button>
        {showValue && (
          <span className={styles.valueDisplay}>
            {valueDisplay || `${value}${label === 'Volume' ? '%' : ''}`}
          </span>
        )}
        {additionalControls}
      </div>
    </div>
  );
};

export const Synthesizer: React.FC = () => {
  const synth = useSynthesizer();
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPlayedKey, setLastPlayedKey] = useState<HTMLElement | null>(null);
  const [currentPlayingNote, setCurrentPlayingNote] = useState<{ note: typeof NOTES[0] | null, freq: number }>({ note: null, freq: 0 });
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const keyboardRef = useRef<HTMLDivElement>(null);

  // Add keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      synth.handleKeyDown(e);
      // Track active keys for visual feedback
      const key = e.key.toLowerCase();
      const note = NOTES.find(n => n.key === key);
      if (note) {
        setActiveKeys(prev => new Set(prev).add(note.key));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      synth.handleKeyUp(e);
      // Remove active keys for visual feedback
      const key = e.key.toLowerCase();
      const note = NOTES.find(n => n.key === key);
      if (note && !synth.state.sustainMode) {
        setActiveKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(note.key);
          return newSet;
        });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      synth.handleMouseDown(e);
      if (synth.state.drawMode) {
        setIsDrawing(true);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      synth.handleMouseUp(e);
      if (synth.state.drawMode) {
        setIsDrawing(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [synth]);

  // Clear active keys when sustain mode is turned off
  useEffect(() => {
    if (!synth.state.sustainMode) {
      setActiveKeys(new Set());
    }
  }, [synth.state.sustainMode]);

  const handleKeyMouseDown = (note: typeof NOTES[0], element: HTMLElement) => {
    setIsDragging(true);
    setLastPlayedKey(element);
    setCurrentPlayingNote({ note, freq: note.freq });
    setActiveKeys(prev => new Set(prev).add(note.key));
    synth.startNote(note.freq, element);
  };

  const handleKeyMouseUp = (note: typeof NOTES[0], element: HTMLElement) => {
    if (!synth.state.sustainMode) {
      synth.stopNote(note.freq, element);
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note.key);
        return newSet;
      });
    }
    setIsDragging(false);
    setLastPlayedKey(null);
    setCurrentPlayingNote({ note: null, freq: 0 });
  };

  const handleKeyMouseEnter = (note: typeof NOTES[0], element: HTMLElement) => {
    if (isDragging) {
      setCurrentPlayingNote({ note, freq: note.freq });
      setActiveKeys(prev => new Set(prev).add(note.key));
      synth.startNote(note.freq, element);
    }
  };

  const handleKeyMouseLeave = (note: typeof NOTES[0], element: HTMLElement) => {
    if (isDragging && !synth.state.sustainMode) {
      synth.stopNote(note.freq, element);
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note.key);
        return newSet;
      });
    }
  };

  const handleKeyboardMouseLeave = () => {
    setIsDragging(false);
    setLastPlayedKey(null);
  };

  const handleStepClick = (note: string, stepIndex: number) => {
    if (!synth.sequence[note]) {
      synth.sequence[note] = new Array(32).fill(false);
    }
    synth.sequence[note][stepIndex] = !synth.sequence[note][stepIndex];
    // Force re-render
    setCurrentPlayingNote(prev => ({ ...prev }));
  };

  const handleStepMouseEnter = (note: string, stepIndex: number) => {
    if (synth.state.drawMode && isDrawing) {
      if (!synth.sequence[note]) {
        synth.sequence[note] = new Array(32).fill(false);
      }
      synth.sequence[note][stepIndex] = true;
      // Force re-render
      setCurrentPlayingNote(prev => ({ ...prev }));
    }
  };

  const playCircleKey = (circleKey: typeof CIRCLE_OF_FIFTHS[0]) => {
    let chordName: string;
    if (circleKey.chordType === 'dominant') {
      chordName = circleKey.key + '7';
    } else if (circleKey.chordType === 'diminished') {
      chordName = circleKey.key + 'dim';
    } else {
      chordName = circleKey.key + 'maj';
    }
    
    if (CHORDS[chordName]) {
      synth.playChord(chordName);
    } else {
      // Fallback to C major
      synth.playChord('Cmaj');
    }
  };

  // Use currentPlayingNote state for immediate feedback
  const { note, freq } = currentPlayingNote;

  // Clear current playing note when no active notes
  useEffect(() => {
    if (Object.keys(synth.activeNotes).length === 0 && currentPlayingNote.note) {
      setCurrentPlayingNote({ note: null, freq: 0 });
    }
  }, [synth.activeNotes, currentPlayingNote.note]);

  return (
    <div className={styles.container}>
      {/* Currently Playing Notes Display */}
      {Object.keys(synth.activeNotes).length > 0 && (
        <div className={styles.fixedPlayingNotesBar}>
          <div className={styles.playingNotesContent}>
            <div className={styles.playingNotesLabel}>🎵 Playing:</div>
            <div className={styles.playingNotesList}>
              {Object.values(synth.activeNotes).map((activeNote, index) => {
                const note = NOTES.find(n => Math.abs(n.freq - activeNote.freq) < 0.1);
                return (
                  <span key={index} className={styles.playingNote}>
                    {note?.note || activeNote.freq.toFixed(0)}Hz
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Status Display */}
      {currentPlayingNote.note && (
        <div className={styles.fixedStatusBar}>
          <div className={styles.statusBarContent}>
            <div className={styles.statusSection}>
              <span className={styles.statusLabel}>Note:</span>
              <span className={styles.statusValue}>{currentPlayingNote.note.note || currentPlayingNote.note.key.toUpperCase()}</span>
            </div>
            <div className={styles.statusSection}>
              <span className={styles.statusLabel}>Freq:</span>
              <span className={styles.statusValue} id="frequencyValue">{currentPlayingNote.freq.toFixed(1)} Hz</span>
            </div>
            {activeKeys.size > 0 && (
              <div className={styles.statusSection}>
                <span className={styles.statusLabel}>Active:</span>
                <span className={styles.statusValue}>
                  {Array.from(activeKeys).map(key => {
                    const note = NOTES.find(n => n.key === key);
                    return note?.note || key.toUpperCase();
                  }).join(' ')}
                </span>
              </div>
            )}
            {synth.state.sustainMode && (
              <div className={styles.statusSection}>
                <span className={styles.statusLabel}>Sustain:</span>
                <span className={styles.statusValue}>ON</span>
              </div>
            )}
          </div>
        </div>
      )}

      <h1>8-BIT SYNTHESIZER</h1>

      <CollapsibleSection title="🎯 Circle of Fifths">
        <div className={styles.circleOfFifths}>
          {CIRCLE_OF_FIFTHS.map((circleKey, index) => {
            const angle = (circleKey.angle * Math.PI) / 180;
            const radius = 130;
            const x = Math.cos(angle) * radius + 150;
            const y = Math.sin(angle) * radius + 150;

            return (
              <div
                key={index}
                className={`${styles.circleKey} ${styles[circleKey.type]}`}
                style={{ left: `${x}px`, top: `${y}px` }}
                onMouseDown={() => {
                  synth.updateState({ isDraggingCircle: true });
                  playCircleKey(circleKey);
                }}
                onMouseEnter={() => {
                  if (synth.state.isDraggingCircle) {
                    playCircleKey(circleKey);
                  }
                }}
              >
                {circleKey.key}
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="😊 Mood Chords">
        <div className={styles.moodChords}>
          <div className={styles.moodGroup}>
            <div className={styles.moodLabel}>😊 Happy</div>
            <div className={styles.moodButtons}>
              <button onClick={() => synth.playChord('Cmaj')} className={`${styles.moodBtn} ${styles.happy}`}>C</button>
              <button onClick={() => synth.playChord('Fmaj')} className={`${styles.moodBtn} ${styles.happy}`}>F</button>
              <button onClick={() => synth.playChord('Gmaj')} className={`${styles.moodBtn} ${styles.happy}`}>G</button>
              <button onClick={() => synth.playChord('Cmaj7')} className={`${styles.moodBtn} ${styles.happy}`}>Cmaj7</button>
            </div>
          </div>
          <div className={styles.moodGroup}>
            <div className={styles.moodLabel}>😢 Sad</div>
            <div className={styles.moodButtons}>
              <button onClick={() => synth.playChord('Amin')} className={`${styles.moodBtn} ${styles.sad}`}>Am</button>
              <button onClick={() => synth.playChord('Dmin')} className={`${styles.moodBtn} ${styles.sad}`}>Dm</button>
              <button onClick={() => synth.playChord('Emin')} className={`${styles.moodBtn} ${styles.sad}`}>Em</button>
              <button onClick={() => synth.playChord('Amin7')} className={`${styles.moodBtn} ${styles.sad}`}>Am7</button>
            </div>
          </div>
          <div className={styles.moodGroup}>
            <div className={styles.moodLabel}>😤 Tense</div>
            <div className={styles.moodButtons}>
              <button onClick={() => synth.playChord('G7')} className={`${styles.moodBtn} ${styles.tense}`}>G7</button>
              <button onClick={() => synth.playChord('Bdim')} className={`${styles.moodBtn} ${styles.tense}`}>B°</button>
              <button onClick={() => synth.playChord('Dmin7')} className={`${styles.moodBtn} ${styles.tense}`}>Dm7</button>
              <button onClick={() => synth.playChord('Bm7b5')} className={`${styles.moodBtn} ${styles.tense}`}>Bm7b5</button>
            </div>
          </div>
          <div className={styles.moodGroup}>
            <div className={styles.moodLabel}>😌 Dreamy</div>
            <div className={styles.moodButtons}>
              <button onClick={() => synth.playChord('Fmaj7')} className={`${styles.moodBtn} ${styles.dreamy}`}>Fmaj7</button>
              <button onClick={() => synth.playChord('Emin7')} className={`${styles.moodBtn} ${styles.dreamy}`}>Em7</button>
              <button onClick={() => synth.playChord('Cmaj7')} className={`${styles.moodBtn} ${styles.dreamy}`}>Cmaj7</button>
              <button onClick={() => synth.playChord('Amin7')} className={`${styles.moodBtn} ${styles.dreamy}`}>Am7</button>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="🎼 Plain Chords">
        <div className={styles.chordButtons}>
          <button onClick={() => synth.playChord('Cmaj')} className={`${styles.chordBtn} ${styles.major}`}>C</button>
          <button onClick={() => synth.playChord('Dmin')} className={`${styles.chordBtn} ${styles.minor}`}>Dm</button>
          <button onClick={() => synth.playChord('Emin')} className={`${styles.chordBtn} ${styles.minor}`}>Em</button>
          <button onClick={() => synth.playChord('Fmaj')} className={`${styles.chordBtn} ${styles.major}`}>F</button>
          <button onClick={() => synth.playChord('Gmaj')} className={`${styles.chordBtn} ${styles.major}`}>G</button>
          <button onClick={() => synth.playChord('Amin')} className={`${styles.chordBtn} ${styles.minor}`}>Am</button>
          <button onClick={() => synth.playChord('Bdim')} className={`${styles.chordBtn} ${styles.diminished}`}>B°</button>
        </div>
      </CollapsibleSection>

      <div className={styles.keyboard} ref={keyboardRef} onMouseLeave={handleKeyboardMouseLeave}>
        {NOTES.map((note, index) => (
          <div
            key={index}
            className={`${styles.key} ${note.black ? styles.black : ''} ${activeKeys.has(note.key) ? styles.active : ''}`}
            data-freq={note.freq}
            data-key={note.key}
            onMouseDown={(e) => handleKeyMouseDown(note, e.currentTarget)}
            onMouseUp={(e) => handleKeyMouseUp(note, e.currentTarget)}
            onMouseEnter={(e) => handleKeyMouseEnter(note, e.currentTarget)}
            onMouseLeave={(e) => handleKeyMouseLeave(note, e.currentTarget)}
            onTouchStart={(e) => {
              e.preventDefault();
              handleKeyMouseDown(note, e.currentTarget);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleKeyMouseUp(note, e.currentTarget);
            }}
          >
            {note.note || note.key.toUpperCase()}
          </div>
        ))}
      </div>

      <CollapsibleSection title="🎼 Chord Progressions">
        <div className={styles.chordControls}>
          <div className={styles.chordPresets}>
            <button onClick={() => synth.playProgression('I-IV-V')} className={styles.presetBtn}>I-IV-V</button>
            <button onClick={() => synth.playProgression('ii-V-I')} className={styles.presetBtn}>ii-V-I</button>
            <button onClick={() => synth.playProgression('I-V-vi-IV')} className={styles.presetBtn}>Pop</button>
            <button onClick={() => synth.playProgression('vi-IV-I-V')} className={styles.presetBtn}>Sad</button>
            <button onClick={() => synth.playProgression('Happy')} className={styles.presetBtn}>😊 Happy</button>
            <button onClick={() => synth.playProgression('Tense')} className={styles.presetBtn}>😤 Tense</button>
            <button onClick={() => synth.playProgression('Dreamy')} className={styles.presetBtn}>😌 Dreamy</button>
            <button onClick={() => synth.playProgression('Jazz')} className={styles.presetBtn}>🎷 Jazz</button>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="🎛️ Presets">
        <div className={styles.presetButtons}>
          <button onClick={() => synth.loadPreset('piano')} className={styles.presetBtn}>Piano</button>
          <button onClick={() => synth.loadPreset('bass')} className={styles.presetBtn}>Bass</button>
          <button onClick={() => synth.loadPreset('lead')} className={styles.presetBtn}>Lead</button>
          <button onClick={() => synth.loadPreset('pad')} className={styles.presetBtn}>Pad</button>
          <button onClick={() => synth.loadPreset('pluck')} className={styles.presetBtn}>Pluck</button>
          <button onClick={() => synth.loadPreset('bell')} className={styles.presetBtn}>Bell</button>
          <button onClick={() => synth.loadPreset('chord')} className={styles.presetBtn}>Chord</button>
          <button onClick={() => synth.loadPreset('arp')} className={styles.presetBtn}>Arp</button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="🦫 Scrypture Sounds">
        <div className={styles.presetButtons}>
          <button onClick={() => synth.loadPreset('achievement-common')} className={styles.presetBtn}>🏆 Common</button>
          <button onClick={() => synth.loadPreset('achievement-rare')} className={styles.presetBtn}>💎 Rare</button>
          <button onClick={() => synth.loadPreset('achievement-legendary')} className={styles.presetBtn}>👑 Legendary</button>
          <button onClick={() => synth.loadPreset('task-complete')} className={styles.presetBtn}>✅ Complete</button>
          <button onClick={() => synth.loadPreset('level-up')} className={styles.presetBtn}>�� Level Up</button>
          <button onClick={() => synth.loadPreset('bobr-greeting')} className={styles.presetBtn}>🦫 Bóbr</button>
          <button onClick={() => synth.loadPreset('dam-build')} className={styles.presetBtn}>🏗️ Dam Build</button>
          <button onClick={() => synth.loadPreset('streak-milestone')} className={styles.presetBtn}>🔥 Streak</button>
          <button onClick={() => synth.loadPreset('ui-click')} className={styles.presetBtn}>🖱️ UI Click</button>
          <button onClick={() => synth.loadPreset('form-submit')} className={styles.presetBtn}>📝 Submit</button>
          <button onClick={() => synth.loadPreset('modal-open')} className={styles.presetBtn}>📋 Modal</button>
          <button onClick={() => synth.loadPreset('xp-gain')} className={styles.presetBtn}>⭐ XP Gain</button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="🎵 Waveform">
        <div className={styles.waveformButtons}>
          {(['sine', 'square', 'triangle', 'sawtooth'] as WaveformType[]).map(waveform => (
            <button
              key={waveform}
              onClick={() => synth.setWaveform(waveform)}
              className={`${styles.waveformBtn} ${synth.state.waveform === waveform ? styles.active : ''}`}
            >
              {waveform.charAt(0).toUpperCase() + waveform.slice(1)}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <SliderControl
        label="Volume"
        value={synth.state.volume}
        min={0}
        max={100}
        onChange={(value) => synth.updateState({ volume: value })}
        showValue
        valueDisplay={`${synth.state.volume}%`}
        isLive={true}
      />

      <SliderControl
        label="Attack"
        value={synth.state.attack}
        min={0}
        max={100}
        onChange={(value) => synth.updateState({ attack: value })}
        showValue
        valueDisplay={`${((synth.state.attack / 100) * 2).toFixed(2)}s`}
        isLive={true}
      />

      <SliderControl
        label="Release"
        value={synth.state.release}
        min={0}
        max={100}
        onChange={(value) => synth.updateState({ release: value })}
        showValue
        valueDisplay={`${Math.max(0.1, (synth.state.release / 100) * 3).toFixed(2)}s`}
        additionalControls={
          <>
            <button
              onClick={synth.toggleSustain}
              className={`${styles.sustainBtn} ${synth.state.sustainMode ? styles.active : ''}`}
            >
              Sustain
            </button>
            <button
              onClick={() => synth.startNote(440)} // A4 note
              className={styles.testBtn}
            >
              Test A4
            </button>
          </>
        }
        isLive={true}
      />

      <SliderControl
        label="Detune"
        value={synth.state.detune}
        min={-100}
        max={100}
        onChange={(value) => synth.updateState({ detune: value })}
        additionalControls={
          <button onClick={synth.resetDetune} className={styles.resetBtn}>
            Reset
          </button>
        }
        isLive={true}
      />

      <div className={styles.section}>
        <label>Reverb</label>
        <select
          value={synth.state.reverbEnabled ? 'on' : 'off'}
          onChange={(e) => synth.updateState({ reverbEnabled: e.target.value === 'on' })}
        >
          <option value="off">Off</option>
          <option value="on">On</option>
        </select>
      </div>

      <div className={styles.section}>
        <label>Arpeggiator</label>
        <select
          value={synth.state.arpeggiatorMode}
          onChange={(e) => synth.setArpeggiatorMode(e.target.value as any)}
        >
          <option value="off">Off</option>
          <option value="up">Up</option>
          <option value="down">Down</option>
          <option value="updown">Up/Down</option>
          <option value="random">Random</option>
        </select>
      </div>

      {synth.state.arpeggiatorMode !== 'off' && (
        <SliderControl
          label="Arpeggiator Rate"
          value={synth.state.arpeggiatorRate}
          min={1}
          max={16}
          onChange={(value) => synth.updateState({ arpeggiatorRate: value })}
          showValue
          valueDisplay={`${synth.state.arpeggiatorRate}/16`}
          isLive={true}
        />
      )}

      <SliderControl
        label="LFO Rate"
        value={synth.state.lfoRate}
        min={0}
        max={10}
        step={0.1}
        onChange={(value) => synth.updateState({ lfoRate: value })}
        showValue
        valueDisplay={`${synth.state.lfoRate} Hz`}
        isLive={true}
      />

      <SliderControl
        label="LFO Depth"
        value={synth.state.lfoDepth}
        min={0}
        max={50}
        onChange={(value) => synth.updateState({ lfoDepth: value })}
        isLive={true}
      />

      <div className={styles.section}>
        <label>LFO Target</label>
        <select
          value={synth.state.lfoTarget}
          onChange={(e) => synth.updateState({ lfoTarget: e.target.value as any })}
        >
          <option value="pitch">Pitch</option>
          <option value="volume">Volume</option>
          <option value="filter">Filter</option>
        </select>
      </div>

      {/* Sequencer Section */}
      <div className={styles.container} style={{ marginTop: '20px' }}>
        <h1>SEQUENCER</h1>

        <SliderControl
          label="BPM"
          value={synth.state.bpm}
          min={60}
          max={200}
          onChange={(value) => synth.updateState({ bpm: value })}
          isLive={true}
        />

        <SliderControl
          label="Steps"
          value={synth.state.steps}
          min={4}
          max={16}
          onChange={(value) => synth.updateState({ steps: value })}
          isLive={true}
        />

        <div className={styles.section}>
          <div className={styles.sliderGroup}>
            <button onClick={synth.playSequence}>
              {synth.state.isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={synth.stopSequence}>Stop</button>
            <button onClick={synth.clearSequence}>Clear</button>
            <button 
              onClick={synth.toggleDrawMode}
              style={{ backgroundColor: synth.state.drawMode ? '#4a4a4a' : '#2d2d2d' }}
            >
              {synth.state.drawMode ? 'Click' : 'Draw'}
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.timelineContainer}>
            <div className={styles.timelineHeader}>
              <div className={styles.stepIndicators}>
                {Array.from({ length: synth.state.steps }, (_, i) => (
                  <div
                    key={i}
                    className={`${styles.stepIndicator} ${synth.state.currentStep === i ? styles.active : ''}`}
                  >
                    {(i + 1) % 10}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.timelineTracks}>
              {SEQUENCER_TRACKS.map((track, trackIndex) => (
                <div key={trackIndex} className={styles.track}>
                  <div className={styles.trackLabel}>{track.note}</div>
                  <div className={styles.trackSteps}>
                    {Array.from({ length: synth.state.steps }, (_, stepIndex) => (
                      <div
                        key={stepIndex}
                        className={`${styles.step} ${synth.sequence[track.note]?.[stepIndex] ? styles.active : ''}`}
                        onClick={() => handleStepClick(track.note, stepIndex)}
                        onMouseEnter={() => handleStepMouseEnter(track.note, stepIndex)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 