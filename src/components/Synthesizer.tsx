import React, { useState, useRef, useEffect } from 'react';
import { useSynthesizer } from '../hooks/useSynthesizer';
import { NOTES, CHORDS, CHORD_PROGRESSIONS, CIRCLE_OF_FIFTHS, PRESETS, SEQUENCER_TRACKS } from '../data/synthesizerData';
import { WaveformType } from '../types/synthesizer';
import styles from './Synthesizer.module.css';

interface SynthesizerProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  resetFunction?: () => void;
  defaultValue?: number;
  onMouseDown?: () => void;
  onMouseUp?: (value: number) => void;
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
  isLive = false,
  resetFunction,
  defaultValue,
  onMouseDown,
  onMouseUp
}) => {
  return (
    <div className={styles.section}>
      <label>
        {label}
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
          onMouseDown={onMouseDown}
          onMouseUp={() => onMouseUp?.(value)}
          className={isLive ? styles.liveSlider : ''}
        />
        <button onClick={() => onChange(Math.min(max, value + step))}>+</button>
        {showValue && (
          <span className={styles.valueDisplay}>
            {valueDisplay || `${value}${label === 'Volume' ? '%' : ''}`}
          </span>
        )}
        {resetFunction && (
          <button 
            onClick={resetFunction} 
            className={styles.resetBtn}
            title={`Reset ${label} to ${defaultValue || 'default'}`}
          >
            Reset
          </button>
        )}
        {additionalControls}
      </div>
    </div>
  );
};

export const Synthesizer: React.FC<SynthesizerProps> = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>8-BIT SYNTHESIZER</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.content}>
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
              <div className={styles.circleOfFifthsGrid}>
                {CIRCLE_OF_FIFTHS.map((circleKey, index) => {
                  // Manual positioning for 5x5 grid with empty corners
                  let gridX = 0, gridY = 0;
                  
                  // Top row (3 keys) - positions 1,2,3
                  if (index < 3) {
                    gridX = index + 1;
                    gridY = 0;
                  }
                  // Right column (3 keys) - positions 1,2,3
                  else if (index < 6) {
                    gridX = 4;
                    gridY = index - 2;
                  }
                  // Bottom row (3 keys) - positions 1,2,3
                  else if (index < 9) {
                    gridX = 3 - (index - 6);
                    gridY = 4;
                  }
                  // Left column (3 keys) - positions 1,2,3
                  else if (index < 12) {
                    gridX = 0;
                    gridY = 3 - (index - 9);
                  }
                  
                  return (
                    <div
                      key={index}
                      className={`${styles.circleKey} ${styles[circleKey.type]}`}
                      style={{
                        gridColumn: gridX + 1,
                        gridRow: gridY + 1
                      }}
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
                  className={`${styles.key} ${note.black ? styles.black : ''} ${activeKeys.has(note.key) ? styles.active : ''} ${activeKeys.size > 1 && activeKeys.has(note.key) ? styles.chordActive : ''}`}
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

            {/* Add more sections here as needed */}
            
            <SliderControl
              label="Volume"
              value={synth.state.volume}
              min={1}
              max={100}
              onChange={(value) => synth.updateState({ volume: value })}
              showValue
              valueDisplay={`${synth.state.volume}%`}
              isLive={true}
              resetFunction={synth.resetVolume}
              defaultValue={1}
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
              resetFunction={synth.resetAttack}
              defaultValue={1}
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
              resetFunction={synth.resetRelease}
              defaultValue={10}
            />

            <div className={styles.section}>
              <label>Waveform</label>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 