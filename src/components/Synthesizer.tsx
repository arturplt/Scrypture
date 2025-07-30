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
  resetFunction?: () => void;
  defaultValue?: number;
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
  defaultValue
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

      <CollapsibleSection title="🎛️ Classic Presets">
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

      <CollapsibleSection title="🚀 Modern Effect Presets">
        <div className={styles.presetButtons}>
          <button onClick={() => synth.loadPreset('atmospheric-pad')} className={styles.presetBtn}>🌫️ Atmospheric</button>
          <button onClick={() => synth.loadPreset('aggressive-lead')} className={styles.presetBtn}>🔥 Aggressive</button>
          <button onClick={() => synth.loadPreset('retro-bitcrusher')} className={styles.presetBtn}>🎮 Retro</button>
          <button onClick={() => synth.loadPreset('warm-bass')} className={styles.presetBtn}>🔥 Warm Bass</button>
          <button onClick={() => synth.loadPreset('ethereal-bell')} className={styles.presetBtn}>✨ Ethereal</button>
          <button onClick={() => synth.loadPreset('rhythmic-pluck')} className={styles.presetBtn}>🥁 Rhythmic</button>
          <button onClick={() => synth.loadPreset('space-pad')} className={styles.presetBtn}>🚀 Space</button>
          <button onClick={() => synth.loadPreset('industrial-noise')} className={styles.presetBtn}>🏭 Industrial</button>
          <button onClick={() => synth.loadPreset('liquid-chord')} className={styles.presetBtn}>💧 Liquid</button>
          <button onClick={() => synth.loadPreset('crystal-arp')} className={styles.presetBtn}>💎 Crystal</button>
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
        resetFunction={synth.resetVolume}
        defaultValue={20}
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

      <SliderControl
        label="Detune"
        value={synth.state.detune}
        min={-100}
        max={100}
        onChange={(value) => synth.updateState({ detune: value })}
        isLive={true}
        resetFunction={synth.resetDetune}
        defaultValue={0}
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
          resetFunction={synth.resetArpeggiatorRate}
          defaultValue={8}
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
        resetFunction={synth.resetLfoRate}
        defaultValue={0}
      />

      <SliderControl
        label="LFO Depth"
        value={synth.state.lfoDepth}
        min={0}
        max={50}
        onChange={(value) => synth.updateState({ lfoDepth: value })}
        isLive={true}
        resetFunction={synth.resetLfoDepth}
        defaultValue={5}
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

      {/* New Effects Sections */}
      <CollapsibleSection title="🎚️ Delay Effect">
        <div className={styles.section}>
          <label>
            <input
              type="checkbox"
              checked={synth.state.delayEnabled}
              onChange={(e) => synth.updateState({ delayEnabled: e.target.checked })}
            />
            Enable Delay
          </label>
        </div>
        {synth.state.delayEnabled && (
          <>
            <SliderControl
              label="Delay Time"
              value={synth.state.delayTime}
              min={0.1}
              max={2.0}
              step={0.1}
              onChange={(value) => synth.updateState({ delayTime: value })}
              showValue
              valueDisplay={`${synth.state.delayTime.toFixed(1)}s`}
              isLive={true}
              resetFunction={synth.resetDelayTime}
              defaultValue={0.3}
            />
            <SliderControl
              label="Feedback"
              value={synth.state.delayFeedback}
              min={0}
              max={0.9}
              step={0.1}
              onChange={(value) => synth.updateState({ delayFeedback: value })}
              showValue
              valueDisplay={`${(synth.state.delayFeedback * 100).toFixed(0)}%`}
              isLive={true}
              resetFunction={synth.resetDelayFeedback}
              defaultValue={0.3}
            />
            <SliderControl
              label="Mix"
              value={synth.state.delayMix}
              min={0}
              max={1}
              step={0.1}
              onChange={(value) => synth.updateState({ delayMix: value })}
              showValue
              valueDisplay={`${(synth.state.delayMix * 100).toFixed(0)}%`}
              isLive={true}
              resetFunction={synth.resetDelayMix}
              defaultValue={0.5}
            />
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="🎵 Chorus Effect">
        <div className={styles.section}>
          <label>
            <input
              type="checkbox"
              checked={synth.state.chorusEnabled}
              onChange={(e) => synth.updateState({ chorusEnabled: e.target.checked })}
            />
            Enable Chorus
          </label>
        </div>
        {synth.state.chorusEnabled && (
          <>
            <SliderControl
              label="Rate"
              value={synth.state.chorusRate}
              min={0.1}
              max={10}
              step={0.1}
              onChange={(value) => synth.updateState({ chorusRate: value })}
              showValue
              valueDisplay={`${synth.state.chorusRate.toFixed(1)} Hz`}
              isLive={true}
              resetFunction={synth.resetChorusRate}
              defaultValue={1.5}
            />
            <SliderControl
              label="Depth"
              value={synth.state.chorusDepth}
              min={0}
              max={0.01}
              step={0.001}
              onChange={(value) => synth.updateState({ chorusDepth: value })}
              showValue
              valueDisplay={`${(synth.state.chorusDepth * 1000).toFixed(1)} ms`}
              isLive={true}
              resetFunction={synth.resetChorusDepth}
              defaultValue={0.002}
            />
            <SliderControl
              label="Mix"
              value={synth.state.chorusMix}
              min={0}
              max={1}
              step={0.1}
              onChange={(value) => synth.updateState({ chorusMix: value })}
              showValue
              valueDisplay={`${(synth.state.chorusMix * 100).toFixed(0)}%`}
              isLive={true}
              resetFunction={synth.resetChorusMix}
              defaultValue={0.5}
            />
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="🎸 Distortion">
        <div className={styles.section}>
          <label>
            <input
              type="checkbox"
              checked={synth.state.distortionEnabled}
              onChange={(e) => synth.updateState({ distortionEnabled: e.target.checked })}
            />
            Enable Distortion
          </label>
        </div>
        {synth.state.distortionEnabled && (
          <>
            <div className={styles.section}>
              <label>Type</label>
              <select
                value={synth.state.distortionType}
                onChange={(e) => synth.updateState({ distortionType: e.target.value as any })}
              >
                <option value="soft">Soft Clipping</option>
                <option value="hard">Hard Clipping</option>
                <option value="bitcrusher">Bit Crusher</option>
              </select>
            </div>
            <SliderControl
              label="Amount"
              value={synth.state.distortionAmount}
              min={0}
              max={1}
              step={0.1}
              onChange={(value) => synth.updateState({ distortionAmount: value })}
              showValue
              valueDisplay={`${(synth.state.distortionAmount * 100).toFixed(0)}%`}
              isLive={true}
              resetFunction={synth.resetDistortionAmount}
              defaultValue={0.3}
            />
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="🔊 Filter">
        <div className={styles.section}>
          <label>
            <input
              type="checkbox"
              checked={synth.state.filterEnabled}
              onChange={(e) => synth.updateState({ filterEnabled: e.target.checked })}
            />
            Enable Filter
          </label>
        </div>
        {synth.state.filterEnabled && (
          <>
            <div className={styles.section}>
              <label>Type</label>
              <select
                value={synth.state.filterType}
                onChange={(e) => synth.updateState({ filterType: e.target.value as any })}
              >
                <option value="lowpass">Low Pass</option>
                <option value="highpass">High Pass</option>
                <option value="bandpass">Band Pass</option>
                <option value="notch">Notch</option>
              </select>
            </div>
            <SliderControl
              label="Frequency"
              value={synth.state.filterFrequency}
              min={20}
              max={20000}
              step={10}
              onChange={(value) => synth.updateState({ filterFrequency: value })}
              showValue
              valueDisplay={`${synth.state.filterFrequency.toFixed(0)} Hz`}
              isLive={true}
              resetFunction={synth.resetFilterFrequency}
              defaultValue={2000}
            />
            <SliderControl
              label="Resonance"
              value={synth.state.filterResonance}
              min={0}
              max={20}
              step={0.1}
              onChange={(value) => synth.updateState({ filterResonance: value })}
              showValue
              valueDisplay={`${synth.state.filterResonance.toFixed(1)}`}
              isLive={true}
              resetFunction={synth.resetFilterResonance}
              defaultValue={1}
            />
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="🎛️ Compression">
        <div className={styles.section}>
          <label>
            <input
              type="checkbox"
              checked={synth.state.compressionEnabled}
              onChange={(e) => synth.updateState({ compressionEnabled: e.target.checked })}
            />
            Enable Compression
          </label>
        </div>
        {synth.state.compressionEnabled && (
          <>
            <SliderControl
              label="Threshold"
              value={synth.state.compressionThreshold}
              min={-60}
              max={0}
              step={1}
              onChange={(value) => synth.updateState({ compressionThreshold: value })}
              showValue
              valueDisplay={`${synth.state.compressionThreshold} dB`}
              isLive={true}
              resetFunction={synth.resetCompressionThreshold}
              defaultValue={-24}
            />
            <SliderControl
              label="Ratio"
              value={synth.state.compressionRatio}
              min={1}
              max={20}
              step={0.1}
              onChange={(value) => synth.updateState({ compressionRatio: value })}
              showValue
              valueDisplay={`${synth.state.compressionRatio}:1`}
              isLive={true}
              resetFunction={synth.resetCompressionRatio}
              defaultValue={4}
            />
            <SliderControl
              label="Attack"
              value={synth.state.compressionAttack}
              min={0.001}
              max={1}
              step={0.001}
              onChange={(value) => synth.updateState({ compressionAttack: value })}
              showValue
              valueDisplay={`${(synth.state.compressionAttack * 1000).toFixed(1)} ms`}
              isLive={true}
              resetFunction={synth.resetCompressionAttack}
              defaultValue={0.003}
            />
            <SliderControl
              label="Release"
              value={synth.state.compressionRelease}
              min={0.001}
              max={1}
              step={0.001}
              onChange={(value) => synth.updateState({ compressionRelease: value })}
              showValue
              valueDisplay={`${(synth.state.compressionRelease * 1000).toFixed(1)} ms`}
              isLive={true}
              resetFunction={synth.resetCompressionRelease}
              defaultValue={0.25}
            />
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="🎧 Stereo & Panning">
        <SliderControl
          label="Stereo Width"
          value={synth.state.stereoWidth}
          min={0}
          max={2}
          step={0.1}
          onChange={(value) => synth.updateState({ stereoWidth: value })}
          showValue
          valueDisplay={`${synth.state.stereoWidth.toFixed(1)}x`}
          isLive={true}
          resetFunction={synth.resetStereoWidth}
          defaultValue={1}
        />
        <div className={styles.section}>
          <label>
            <input
              type="checkbox"
              checked={synth.state.panningEnabled}
              onChange={(e) => synth.updateState({ panningEnabled: e.target.checked })}
            />
            Enable Panning
          </label>
        </div>
        {synth.state.panningEnabled && (
          <SliderControl
            label="Pan Position"
            value={synth.state.panningAmount}
            min={-1}
            max={1}
            step={0.1}
            onChange={(value) => synth.updateState({ panningAmount: value })}
            showValue
            valueDisplay={synth.state.panningAmount === 0 ? 'Center' : 
              synth.state.panningAmount > 0 ? `Right ${(synth.state.panningAmount * 100).toFixed(0)}%` :
              `Left ${(Math.abs(synth.state.panningAmount) * 100).toFixed(0)}%`}
            isLive={true}
            resetFunction={synth.resetPanningAmount}
            defaultValue={0}
          />
        )}
      </CollapsibleSection>

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
          resetFunction={synth.resetBpm}
          defaultValue={120}
        />

        <SliderControl
          label="Steps"
          value={synth.state.steps}
          min={4}
          max={16}
          onChange={(value) => synth.updateState({ steps: value })}
          isLive={true}
          resetFunction={synth.resetSteps}
          defaultValue={8}
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