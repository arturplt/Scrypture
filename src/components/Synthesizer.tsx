import React, { useState, useRef, useEffect } from 'react';
import { useSynthesizer } from '../hooks/useSynthesizer';
import { NOTES, CHORDS, CHORD_PROGRESSIONS, CIRCLE_OF_FIFTHS, PRESETS, SEQUENCER_TRACKS, INSTRUMENT_CATEGORIES, InstrumentPreset } from '../data/synthesizerData';
import { WaveformType } from '../types/synthesizer';
import { TrackList } from './TrackList';
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

interface InstrumentSelectorProps {
  selectedInstrument: string;
  onSelectInstrument: (instrument: InstrumentPreset) => void;
}

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({ 
  selectedInstrument, 
  onSelectInstrument 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('electronic');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredInstruments = INSTRUMENT_CATEGORIES
    .find(cat => cat.id === selectedCategory)
    ?.instruments.filter(instrument => 
      instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instrument.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

  return (
    <div className={styles.instrumentSelector}>
      <div className={styles.instrumentSearch}>
        <input
          type="text"
          placeholder="Search instruments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.instrumentSearchInput}
        />
      </div>
      
      <div className={styles.categoryTabs}>
        {INSTRUMENT_CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`${styles.categoryTab} ${selectedCategory === category.id ? styles.active : ''}`}
          >
            <span className={styles.categoryIcon}>{category.icon}</span>
            <span className={styles.categoryName}>{category.name}</span>
          </button>
        ))}
      </div>
      
      <div className={styles.instrumentsGrid}>
        {filteredInstruments.map(instrument => (
          <div
            key={instrument.id}
            onClick={() => onSelectInstrument(instrument)}
            className={`${styles.instrumentCard} ${selectedInstrument === instrument.id ? styles.selected : ''}`}
          >
            <div className={styles.instrumentCardHeader}>
              <h4>{instrument.name}</h4>
              <span className={styles.instrumentWaveform}>{instrument.waveform}</span>
            </div>
            <p className={styles.instrumentDescription}>{instrument.description}</p>
            <div className={styles.instrumentTags}>
              {instrument.tags.map(tag => (
                <span key={tag} className={styles.instrumentTag}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface EffectsRoutingProps {
  tracks: any[];
  onUpdateTrackEffects: (trackId: string, effects: any) => void;
}

const EffectsRouting: React.FC<EffectsRoutingProps> = ({ tracks, onUpdateTrackEffects }) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showEffectsChain, setShowEffectsChain] = useState<boolean>(false);

  const selectedTrack = tracks.find(track => track.id === selectedTrackId);

  const effectTypes = [
    { id: 'delay', name: 'Delay', icon: '⏱️', color: 'var(--color-accent-gold)' },
    { id: 'chorus', name: 'Chorus', icon: '🌊', color: 'var(--color-accent-beaver)' },
    { id: 'distortion', name: 'Distortion', icon: '⚡', color: 'var(--color-urgent)' },
    { id: 'filter', name: 'Filter', icon: '🔧', color: 'var(--color-easy)' },
    { id: 'compression', name: 'Compression', icon: '📊', color: 'var(--color-focus)' }
  ];

  return (
    <div className={styles.effectsRouting}>
      <div className={styles.effectsRoutingHeader}>
        <h4>Effects Routing</h4>
        <button
          onClick={() => setShowEffectsChain(!showEffectsChain)}
          className={styles.effectsChainToggle}
        >
          {showEffectsChain ? 'Hide Chain' : 'Show Chain'}
        </button>
      </div>

      <div className={styles.tracksEffectsGrid}>
        {tracks.map(track => (
          <div
            key={track.id}
            className={`${styles.trackEffectsCard} ${selectedTrackId === track.id ? styles.selected : ''}`}
            onClick={() => setSelectedTrackId(track.id)}
          >
            <div className={styles.trackEffectsHeader}>
              <h5>{track.name}</h5>
              <div 
                className={styles.trackColorIndicator}
                style={{ backgroundColor: track.color }}
              />
            </div>
            
            <div className={styles.effectsStatus}>
              {effectTypes.map(effect => (
                <div
                  key={effect.id}
                  className={`${styles.effectStatus} ${track.effects[effect.id]?.enabled ? styles.enabled : styles.disabled}`}
                  style={{ borderColor: effect.color }}
                >
                  <span className={styles.effectIcon}>{effect.icon}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTrack && (
        <div className={styles.effectsChainEditor}>
          <h5>Effects Chain: {selectedTrack.name}</h5>
          
          <div className={styles.effectsChain}>
            <div className={styles.chainInput}>
              <span>Input</span>
            </div>
            
            {effectTypes.map((effect, index) => (
              <div key={effect.id} className={styles.chainEffect}>
                <div
                  className={`${styles.effectNode} ${selectedTrack.effects[effect.id]?.enabled ? styles.enabled : styles.disabled}`}
                  style={{ borderColor: effect.color }}
                >
                  <span className={styles.effectIcon}>{effect.icon}</span>
                  <span className={styles.effectName}>{effect.name}</span>
                  <button
                    onClick={() => {
                      const newEffects = {
                        ...selectedTrack.effects,
                        [effect.id]: {
                          ...selectedTrack.effects[effect.id],
                          enabled: !selectedTrack.effects[effect.id]?.enabled
                        }
                      };
                      onUpdateTrackEffects(selectedTrack.id, newEffects);
                    }}
                    className={styles.effectToggle}
                  >
                    {selectedTrack.effects[effect.id]?.enabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                {index < effectTypes.length - 1 && (
                  <div className={styles.chainConnection} />
                )}
              </div>
            ))}
            
            <div className={styles.chainOutput}>
              <span>Output</span>
            </div>
          </div>
        </div>
      )}

      {showEffectsChain && (
        <div className={styles.globalEffectsChain}>
          <h5>Global Effects Chain</h5>
          <div className={styles.globalChainVisualization}>
            {tracks.map((track) => (
              <div key={track.id} className={styles.trackChain}>
                <div className={styles.trackChainLabel}>
                  <div 
                    className={styles.trackColorIndicator}
                    style={{ backgroundColor: track.color }}
                  />
                  <span>{track.name}</span>
                </div>
                <div className={styles.trackChainEffects}>
                  {effectTypes.map(effect => (
                    <div
                      key={effect.id}
                      className={`${styles.globalEffectNode} ${track.effects[effect.id]?.enabled ? styles.enabled : styles.disabled}`}
                      style={{ borderColor: effect.color }}
                    >
                      {effect.icon}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface MultiTrackSequencerProps {
  tracks: any[];
  currentStep: number;
  steps: number;
  onStepClick: (trackId: string, stepIndex: number) => void;
  onStepMouseEnter: (trackId: string, stepIndex: number) => void;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  onTrackVolumeChange: (trackId: string, volume: number) => void;
}

const MultiTrackSequencer: React.FC<MultiTrackSequencerProps> = ({
  tracks,
  currentStep,
  steps,
  onStepClick,
  onStepMouseEnter,
  onTrackMute,
  onTrackSolo,
  onTrackVolumeChange
}) => {
  const [drawMode, setDrawMode] = useState(false);

  const handleStepClick = (trackId: string, stepIndex: number) => {
    onStepClick(trackId, stepIndex);
  };

  const handleStepMouseEnter = (trackId: string, stepIndex: number) => {
    if (drawMode) {
      onStepClick(trackId, stepIndex);
    }
    onStepMouseEnter(trackId, stepIndex);
  };

  return (
    <div className={styles.multiTrackSequencer}>
      <div className={styles.sequencerControls}>
        <button 
          className={`${styles.sequencerBtn} ${drawMode ? styles.active : ''}`}
          onClick={() => setDrawMode(!drawMode)}
          title="Toggle draw mode"
        >
          ✏️ Draw Mode
        </button>
      </div>
      
      <div className={styles.sequencerGrid}>
        {/* Step numbers header */}
        <div className={styles.stepNumbers}>
          <div className={styles.trackHeader}></div>
          {Array.from({ length: steps }, (_, i) => (
            <div key={i} className={`${styles.stepNumber} ${currentStep === i ? styles.currentStep : ''}`}>
              {i + 1}
            </div>
          ))}
        </div>
        
        {/* Tracks */}
        {tracks.map((track) => (
          <div key={track.id} className={styles.sequencerTrack}>
            {/* Track controls */}
            <div className={styles.trackControls}>
              <div className={styles.trackInfo}>
                <span 
                  className={styles.trackColor} 
                  style={{ backgroundColor: track.color }}
                ></span>
                <span className={styles.trackName}>{track.name}</span>
              </div>
              <div className={styles.trackActions}>
                <button
                  className={`${styles.muteBtn} ${track.muted ? styles.active : ''}`}
                  onClick={() => onTrackMute(track.id)}
                  title="Mute track"
                >
                  🔇
                </button>
                <button
                  className={`${styles.soloBtn} ${track.solo ? styles.active : ''}`}
                  onClick={() => onTrackSolo(track.id)}
                  title="Solo track"
                >
                  🎧
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={track.volume}
                  onChange={(e) => onTrackVolumeChange(track.id, parseInt(e.target.value))}
                  className={styles.volumeSlider}
                  title={`Volume: ${track.volume}%`}
                />
              </div>
            </div>
            
            {/* Track steps */}
            <div className={styles.trackSteps}>
              {Array.from({ length: steps }, (_, stepIndex) => (
                <div
                  key={stepIndex}
                  className={`${styles.step} ${
                    track.sequence[stepIndex] ? styles.active : ''
                  } ${currentStep === stepIndex ? styles.currentStep : ''} ${
                    track.muted ? styles.muted : ''
                  }`}
                  onClick={() => handleStepClick(track.id, stepIndex)}
                  onMouseEnter={() => handleStepMouseEnter(track.id, stepIndex)}
                  style={{
                    backgroundColor: track.sequence[stepIndex] ? track.color : 'transparent',
                    borderColor: currentStep === stepIndex ? 'var(--color-accent-gold)' : 'var(--color-border-secondary)'
                  }}
                ></div>
              ))}
            </div>
          </div>
        ))}
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

  // Multi-Track Sequencer handlers
  const handleMultiTrackStepClick = (trackId: string, stepIndex: number) => {
    synth.updateTrackSequence(trackId, stepIndex, !synth.state.trackState.tracks.find(t => t.id === trackId)?.sequence[stepIndex]);
  };

  const handleMultiTrackStepMouseEnter = (trackId: string, stepIndex: number) => {
    if (synth.state.drawMode && isDrawing) {
      synth.updateTrackSequence(trackId, stepIndex, true);
    }
  };

  const handleTrackMute = (trackId: string) => {
    synth.toggleTrackMute(trackId);
  };

  const handleTrackSolo = (trackId: string) => {
    synth.toggleTrackSolo(trackId);
  };

  const handleTrackVolumeChange = (trackId: string, volume: number) => {
    synth.updateTrack(trackId, { volume });
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

            {/* 🎛️ MULTI-TRACK SEQUENCER SECTION */}
            <CollapsibleSection title="🎛️ Multi-Track Sequencer" defaultCollapsed={false}>
              <div className={styles.sequencerSection}>
                {/* Track Management Controls */}
                <div className={styles.trackManagementControls}>
                  <button
                    onClick={synth.testAudio}
                    className={styles.trackControlBtn}
                    style={{ backgroundColor: '#ff6b6b', color: 'white' }}
                  >
                    🔊 Test Audio
                  </button>
                  <button
                    onClick={synth.debugTrackNodes}
                    className={styles.trackControlBtn}
                    style={{ backgroundColor: '#4ecdc4', color: 'white' }}
                  >
                    🐛 Debug Tracks
                  </button>
                  <button
                    onClick={synth.clearAllTracks}
                    className={styles.trackControlBtn}
                    style={{ backgroundColor: '#ff4757', color: 'white' }}
                  >
                    🗑️ Clear All Tracks
                  </button>
                  <button
                    onClick={synth.toggleTrackList}
                    className={`${styles.trackControlBtn} ${synth.state.trackState.showTrackList ? styles.active : ''}`}
                  >
                    {synth.state.trackState.showTrackList ? '📋 Hide Tracks' : '📋 Show Tracks'}
                  </button>
                  
                  <button
                    onClick={() => synth.createTrack({
                      name: 'New Track',
                      frequency: 440,
                      note: 'A',
                      category: 'melody',
                      instrument: 'sine'
                    })}
                    className={styles.trackControlBtn}
                  >
                    ➕ Add Track
                  </button>
                  
                  <button
                    onClick={synth.toggleTrackEditor}
                    className={`${styles.trackControlBtn} ${synth.state.trackState.showTrackEditor ? styles.active : ''}`}
                  >
                    {synth.state.trackState.showTrackEditor ? '⚙️ Hide Editor' : '⚙️ Show Editor'}
                  </button>

                  {/* Track Presets */}
                  <div className={styles.trackPresetButtons}>
                    <button
                      onClick={() => synth.loadTrackPreset('electronic-beat')}
                      className={styles.trackControlBtn}
                      title="Load Electronic Beat preset (4 tracks)"
                    >
                      🎵 Electronic Beat
                    </button>
                    <button
                      onClick={() => synth.loadTrackPreset('ambient-pad')}
                      className={styles.trackControlBtn}
                      title="Load Ambient Pad preset (4 tracks)"
                    >
                      🌊 Ambient Pad
                    </button>
                    <button
                      onClick={() => synth.loadTrackPreset('jazz-quartet')}
                      className={styles.trackControlBtn}
                      title="Load Jazz Quartet preset (4 tracks)"
                    >
                      🎷 Jazz Quartet
                    </button>
                  </div>
                </div>

                {/* Track List */}
                {synth.state.trackState.showTrackList && (
                  <TrackList
                    tracks={synth.state.trackState.tracks}
                    selectedTrackId={synth.state.trackState.selectedTrackId}
                    onSelectTrack={synth.selectTrack}
                    onToggleMute={synth.toggleTrackMute}
                    onToggleSolo={synth.toggleTrackSolo}
                    onUpdateTrackVolume={(trackId, volume) => synth.updateTrack(trackId, { volume })}
                    onUpdateTrackPan={(trackId, pan) => synth.updateTrack(trackId, { pan })}
                    onUpdateTrackInstrument={(trackId, instrument) => synth.updateTrack(trackId, { instrument: instrument as 'sine' | 'square' | 'triangle' | 'sawtooth' | 'noise' | 'custom' })}
                    onDeleteTrack={synth.deleteTrack}
                    onDuplicateTrack={synth.duplicateTrack}
                    onReorderTracks={synth.reorderTracks}
                  />
                )}

                {/* Track Editor */}
                {synth.state.trackState.showTrackEditor && synth.getSelectedTrack() && (
                  <div className={styles.trackEditor}>
                    <div className={styles.trackEditorHeader}>
                      <h4>Track Editor: {synth.getSelectedTrack()?.name}</h4>
                      <button 
                        onClick={() => synth.toggleTrackEditor()}
                        className={styles.closeButton}
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className={styles.trackEditorContent}>
                      {/* Track Basic Settings */}
                      <CollapsibleSection title="Basic Settings" defaultCollapsed={false}>
                        <div className={styles.trackBasicSettings}>
                          <div className={styles.trackNameSection}>
                            <label>Track Name:</label>
                            <input
                              type="text"
                              value={synth.getSelectedTrack()?.name || ''}
                              onChange={(e) => synth.updateTrack(synth.getSelectedTrack()!.id, { name: e.target.value })}
                              className={styles.trackNameInput}
                            />
                          </div>
                          
                          <div className={styles.trackControls}>
                            <SliderControl
                              label="Volume"
                              value={synth.getSelectedTrack()?.volume || 100}
                              min={0}
                              max={100}
                              onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { volume: value })}
                              showValue={true}
                              valueDisplay={`${synth.getSelectedTrack()?.volume || 100}%`}
                            />
                            
                            <SliderControl
                              label="Pan"
                              value={synth.getSelectedTrack()?.pan || 0}
                              min={-100}
                              max={100}
                              onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { pan: value })}
                              showValue={true}
                              valueDisplay={`${synth.getSelectedTrack()?.pan || 0}%`}
                            />
                          </div>
                          
                          <div className={styles.trackActions}>
                            <button
                              onClick={() => synth.toggleTrackMute(synth.getSelectedTrack()!.id)}
                              className={`${styles.trackActionBtn} ${synth.getSelectedTrack()?.muted ? styles.active : ''}`}
                            >
                              {synth.getSelectedTrack()?.muted ? '🔇 Unmute' : '🔊 Mute'}
                            </button>
                            <button
                              onClick={() => synth.toggleTrackSolo(synth.getSelectedTrack()!.id)}
                              className={`${styles.trackActionBtn} ${synth.getSelectedTrack()?.solo ? styles.active : ''}`}
                            >
                              {synth.getSelectedTrack()?.solo ? '🎧 Unsolo' : '🎧 Solo'}
                            </button>
                            <button
                              onClick={() => synth.duplicateTrack(synth.getSelectedTrack()!.id)}
                              className={styles.trackActionBtn}
                            >
                              📋 Duplicate
                            </button>
                            <button
                              onClick={() => synth.deleteTrack(synth.getSelectedTrack()!.id)}
                              className={`${styles.trackActionBtn} ${styles.danger}`}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </CollapsibleSection>

                      {/* Instrument Settings */}
                      <CollapsibleSection title="Instrument" defaultCollapsed={false}>
                        <div className={styles.instrumentSettings}>
                          <div className={styles.instrumentType}>
                            <label>Instrument Type:</label>
                            <select
                              value={synth.getSelectedTrack()?.instrument || 'sine'}
                              onChange={(e) => synth.updateTrack(synth.getSelectedTrack()!.id, { instrument: e.target.value as any })}
                              className={styles.instrumentSelect}
                            >
                              <option value="sine">Sine Wave</option>
                              <option value="square">Square Wave</option>
                              <option value="triangle">Triangle Wave</option>
                              <option value="sawtooth">Sawtooth Wave</option>
                              <option value="noise">Noise</option>
                            </select>
                          </div>
                          
                          <div className={styles.trackCategory}>
                            <label>Category:</label>
                            <select
                              value={synth.getSelectedTrack()?.category || 'melody'}
                              onChange={(e) => synth.updateTrack(synth.getSelectedTrack()!.id, { category: e.target.value as any })}
                              className={styles.instrumentSelect}
                            >
                              <option value="melody">Melody</option>
                              <option value="bass">Bass</option>
                              <option value="rhythm">Rhythm</option>
                              <option value="ambient">Ambient</option>
                              <option value="fx">Effects</option>
                            </select>
                          </div>
                        </div>
                      </CollapsibleSection>

                      {/* Envelope Settings */}
                      <CollapsibleSection title="Envelope" defaultCollapsed={true}>
                        <div className={styles.envelopeSettings}>
                          <SliderControl
                            label="Attack"
                            value={synth.getSelectedTrack()?.envelope.attack || 0.1}
                            min={0}
                            max={2}
                            step={0.01}
                            onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                              envelope: { ...synth.getSelectedTrack()!.envelope, attack: value }
                            })}
                            showValue={true}
                            valueDisplay={`${(synth.getSelectedTrack()?.envelope.attack || 0.1).toFixed(2)}s`}
                          />
                          
                          <SliderControl
                            label="Decay"
                            value={synth.getSelectedTrack()?.envelope.decay || 0.3}
                            min={0}
                            max={2}
                            step={0.01}
                            onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                              envelope: { ...synth.getSelectedTrack()!.envelope, decay: value }
                            })}
                            showValue={true}
                            valueDisplay={`${(synth.getSelectedTrack()?.envelope.decay || 0.3).toFixed(2)}s`}
                          />
                          
                          <SliderControl
                            label="Sustain"
                            value={synth.getSelectedTrack()?.envelope.sustain || 0.5}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                              envelope: { ...synth.getSelectedTrack()!.envelope, sustain: value }
                            })}
                            showValue={true}
                            valueDisplay={`${(synth.getSelectedTrack()?.envelope.sustain || 0.5).toFixed(2)}`}
                          />
                          
                          <SliderControl
                            label="Release"
                            value={synth.getSelectedTrack()?.envelope.release || 0.5}
                            min={0}
                            max={2}
                            step={0.01}
                            onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                              envelope: { ...synth.getSelectedTrack()!.envelope, release: value }
                            })}
                            showValue={true}
                            valueDisplay={`${(synth.getSelectedTrack()?.envelope.release || 0.5).toFixed(2)}s`}
                          />
                        </div>
                      </CollapsibleSection>

                      {/* LFO Settings */}
                      <CollapsibleSection title="LFO" defaultCollapsed={true}>
                        <div className={styles.lfoSettings}>
                          <div className={styles.lfoEnable}>
                            <label>
                              <input
                                type="checkbox"
                                checked={synth.getSelectedTrack()?.lfo.enabled || false}
                                onChange={(e) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                  lfo: { ...synth.getSelectedTrack()!.lfo, enabled: e.target.checked }
                                })}
                              />
                              Enable LFO
                            </label>
                          </div>
                          
                          {synth.getSelectedTrack()?.lfo.enabled && (
                            <div className={styles.lfoControls}>
                              <SliderControl
                                label="LFO Rate"
                                value={synth.getSelectedTrack()?.lfo.rate || 1}
                                min={0.1}
                                max={10}
                                step={0.1}
                                onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                  lfo: { ...synth.getSelectedTrack()!.lfo, rate: value }
                                })}
                                showValue={true}
                                valueDisplay={`${(synth.getSelectedTrack()?.lfo.rate || 1).toFixed(1)}Hz`}
                              />
                              
                              <SliderControl
                                label="LFO Depth"
                                value={synth.getSelectedTrack()?.lfo.depth || 0.1}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                  lfo: { ...synth.getSelectedTrack()!.lfo, depth: value }
                                })}
                                showValue={true}
                                valueDisplay={`${(synth.getSelectedTrack()?.lfo.depth || 0.1).toFixed(2)}`}
                              />
                              
                                                             <div className={styles.lfoWaveform}>
                                 <label>LFO Waveform:</label>
                                 <select
                                   value={synth.getSelectedTrack()?.lfo.waveform || 'sine'}
                                   onChange={(e) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                     lfo: { ...synth.getSelectedTrack()!.lfo, waveform: e.target.value as any }
                                   })}
                                   className={styles.instrumentSelect}
                                 >
                                   <option value="sine">Sine</option>
                                   <option value="square">Square</option>
                                   <option value="triangle">Triangle</option>
                                   <option value="sawtooth">Sawtooth</option>
                                 </select>
                               </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleSection>

                      {/* Effects Settings */}
                      <CollapsibleSection title="Effects" defaultCollapsed={true}>
                        <div className={styles.effectsSettings}>
                          {/* Delay Effect */}
                          <div className={styles.effectGroup}>
                            <div className={styles.effectHeader}>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={synth.getSelectedTrack()?.effects.delay.enabled || false}
                                  onChange={(e) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                    effects: { 
                                      ...synth.getSelectedTrack()!.effects, 
                                      delay: { ...synth.getSelectedTrack()!.effects.delay, enabled: e.target.checked }
                                    }
                                  })}
                                />
                                Delay
                              </label>
                            </div>
                            
                            {synth.getSelectedTrack()?.effects.delay.enabled && (
                              <div className={styles.effectControls}>
                                <SliderControl
                                  label="Delay Time"
                                  value={synth.getSelectedTrack()?.effects.delay.time || 0.3}
                                  min={0.1}
                                  max={2}
                                  step={0.1}
                                  onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                    effects: { 
                                      ...synth.getSelectedTrack()!.effects, 
                                      delay: { ...synth.getSelectedTrack()!.effects.delay, time: value }
                                    }
                                  })}
                                  showValue={true}
                                  valueDisplay={`${(synth.getSelectedTrack()?.effects.delay.time || 0.3).toFixed(1)}s`}
                                />
                                
                                <SliderControl
                                  label="Delay Feedback"
                                  value={synth.getSelectedTrack()?.effects.delay.feedback || 0.3}
                                  min={0}
                                  max={0.9}
                                  step={0.1}
                                  onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                    effects: { 
                                      ...synth.getSelectedTrack()!.effects, 
                                      delay: { ...synth.getSelectedTrack()!.effects.delay, feedback: value }
                                    }
                                  })}
                                  showValue={true}
                                  valueDisplay={`${(synth.getSelectedTrack()?.effects.delay.feedback || 0.3).toFixed(1)}`}
                                />
                                
                                <SliderControl
                                  label="Delay Mix"
                                  value={synth.getSelectedTrack()?.effects.delay.mix || 0.5}
                                  min={0}
                                  max={1}
                                  step={0.1}
                                  onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                    effects: { 
                                      ...synth.getSelectedTrack()!.effects, 
                                      delay: { ...synth.getSelectedTrack()!.effects.delay, mix: value }
                                    }
                                  })}
                                  showValue={true}
                                  valueDisplay={`${(synth.getSelectedTrack()?.effects.delay.mix || 0.5).toFixed(1)}`}
                                />
                              </div>
                            )}
                          </div>

                          {/* Chorus Effect */}
                          <div className={styles.effectGroup}>
                            <div className={styles.effectHeader}>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={synth.getSelectedTrack()?.effects.chorus.enabled || false}
                                  onChange={(e) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                    effects: { 
                                      ...synth.getSelectedTrack()!.effects, 
                                      chorus: { ...synth.getSelectedTrack()!.effects.chorus, enabled: e.target.checked }
                                    }
                                  })}
                                />
                                Chorus
                              </label>
                            </div>
                            
                            {synth.getSelectedTrack()?.effects.chorus.enabled && (
                              <div className={styles.effectControls}>
                                <SliderControl
                                  label="Chorus Rate"
                                  value={synth.getSelectedTrack()?.effects.chorus.rate || 1.5}
                                  min={0.1}
                                  max={10}
                                  step={0.1}
                                  onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                    effects: { 
                                      ...synth.getSelectedTrack()!.effects, 
                                      chorus: { ...synth.getSelectedTrack()!.effects.chorus, rate: value }
                                    }
                                  })}
                                  showValue={true}
                                  valueDisplay={`${(synth.getSelectedTrack()?.effects.chorus.rate || 1.5).toFixed(1)}Hz`}
                                />
                                
                                <SliderControl
                                  label="Chorus Depth"
                                  value={synth.getSelectedTrack()?.effects.chorus.depth || 0.002}
                                  min={0.001}
                                  max={0.01}
                                  step={0.001}
                                  onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                    effects: { 
                                      ...synth.getSelectedTrack()!.effects, 
                                      chorus: { ...synth.getSelectedTrack()!.effects.chorus, depth: value }
                                    }
                                  })}
                                  showValue={true}
                                  valueDisplay={`${(synth.getSelectedTrack()?.effects.chorus.depth || 0.002).toFixed(3)}`}
                                />
                                
                                <SliderControl
                                  label="Chorus Mix"
                                  value={synth.getSelectedTrack()?.effects.chorus.mix || 0.5}
                                  min={0}
                                  max={1}
                                  step={0.1}
                                  onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                    effects: { 
                                      ...synth.getSelectedTrack()!.effects, 
                                      chorus: { ...synth.getSelectedTrack()!.effects.chorus, mix: value }
                                    }
                                  })}
                                  showValue={true}
                                  valueDisplay={`${(synth.getSelectedTrack()?.effects.chorus.mix || 0.5).toFixed(1)}`}
                                />
                              </div>
                            )}
                          </div>

                          {/* Distortion Effect */}
                          <div className={styles.effectGroup}>
                            <div className={styles.effectHeader}>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={synth.getSelectedTrack()?.effects.distortion.enabled || false}
                                  onChange={(e) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                    effects: { 
                                      ...synth.getSelectedTrack()!.effects, 
                                      distortion: { ...synth.getSelectedTrack()!.effects.distortion, enabled: e.target.checked }
                                    }
                                  })}
                                />
                                Distortion
                              </label>
                            </div>
                            
                            {synth.getSelectedTrack()?.effects.distortion.enabled && (
                              <div className={styles.effectControls}>
                                <SliderControl
                                  label="Distortion Amount"
                                  value={synth.getSelectedTrack()?.effects.distortion.amount || 0.3}
                                  min={0}
                                  max={1}
                                  step={0.1}
                                  onChange={(value) => synth.updateTrack(synth.getSelectedTrack()!.id, { 
                                    effects: { 
                                      ...synth.getSelectedTrack()!.effects, 
                                      distortion: { ...synth.getSelectedTrack()!.effects.distortion, amount: value }
                                    }
                                  })}
                                  showValue={true}
                                  valueDisplay={`${Math.round((synth.getSelectedTrack()?.effects.distortion.amount || 0.3) * 100)}%`}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </CollapsibleSection>
                    </div>
                  </div>
                )}

                {/* Sequencer Controls */}
                <div className={styles.sequencerControls}>
                  <div className={styles.sequencerControlGroup}>
                    <label>BPM: {synth.state.bpm}</label>
                    <input
                      type="range"
                      min="60"
                      max="200"
                      value={synth.state.bpm}
                      onChange={(e) => synth.updateState({ bpm: parseInt(e.target.value) })}
                      className={styles.bpmSlider}
                    />
                  </div>
                  
                  <div className={styles.sequencerControlGroup}>
                    <label>Steps: {synth.state.steps}</label>
                    <select
                      value={synth.state.steps}
                      onChange={(e) => synth.updateState({ steps: parseInt(e.target.value) })}
                      className={styles.stepsSelect}
                    >
                      <option value={8}>8</option>
                      <option value={16}>16</option>
                      <option value={32}>32</option>
                    </select>
                  </div>
                  
                  <div className={styles.sequencerButtons}>
                    <button
                      onClick={synth.state.isPlaying ? synth.stopSequence : synth.playSequence}
                      className={`${styles.sequencerBtn} ${synth.state.isPlaying ? styles.playing : ''}`}
                    >
                      {synth.state.isPlaying ? '⏹️ Stop' : '▶️ Play'}
                    </button>
                    <button onClick={synth.clearSequence} className={styles.sequencerBtn}>
                      🗑️ Clear
                    </button>
                    <button
                      onClick={synth.toggleDrawMode}
                      className={`${styles.sequencerBtn} ${synth.state.drawMode ? styles.active : ''}`}
                    >
                      ✏️ Draw Mode
                    </button>
                  </div>
                </div>

                {/* Pattern Loading */}
                <div className={styles.patternSection}>
                  <h4>Quick Patterns (Press 0-9):</h4>
                  <div className={styles.patternButtons}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <button
                        key={num}
                        onClick={() => synth.loadPattern(num)}
                        className={styles.patternBtn}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multi-Track Sequencer Component */}
                <MultiTrackSequencer
                  tracks={synth.state.trackState.tracks}
                  currentStep={synth.state.currentStep}
                  steps={synth.state.steps}
                  onStepClick={handleMultiTrackStepClick}
                  onStepMouseEnter={handleMultiTrackStepMouseEnter}
                  onTrackMute={handleTrackMute}
                  onTrackSolo={handleTrackSolo}
                  onTrackVolumeChange={handleTrackVolumeChange}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="🎼 CHORD PROGRESSIONS SECTION">
              <div className={styles.progressionsSection}>
                {/* Classic Progressions */}
                <div className={styles.progressionGroup}>
                  <h4>🎵 Classic Progressions</h4>
                  <div className={styles.progressionButtons}>
                    {Object.entries(CHORD_PROGRESSIONS)
                      .filter(([key]) => ['I-IV-V', 'ii-V-I', 'I-V-vi-IV', 'vi-IV-I-V', 'I-vi-ii-V', 'ii-vi-I-V'].includes(key))
                      .map(([key, progression]) => (
                        <button
                          key={key}
                          onClick={() => synth.playProgression(key)}
                          className={styles.progressionBtn}
                        >
                          {progression.name}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Jazz Progressions */}
                <div className={styles.progressionGroup}>
                  <h4>🎷 Jazz Progressions</h4>
                  <div className={styles.progressionButtons}>
                    {Object.entries(CHORD_PROGRESSIONS)
                      .filter(([key]) => key.includes('Jazz'))
                      .map(([key, progression]) => (
                        <button
                          key={key}
                          onClick={() => synth.playProgression(key)}
                          className={styles.progressionBtn}
                        >
                          {progression.name}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Pop Progressions */}
                <div className={styles.progressionGroup}>
                  <h4>🎵 Pop Progressions</h4>
                  <div className={styles.progressionButtons}>
                    {Object.entries(CHORD_PROGRESSIONS)
                      .filter(([key]) => key.includes('Pop'))
                      .map(([key, progression]) => (
                        <button
                          key={key}
                          onClick={() => synth.playProgression(key)}
                          className={styles.progressionBtn}
                        >
                          {progression.name}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Mood-Based Progressions */}
                <div className={styles.progressionGroup}>
                  <h4>😊 Mood-Based Progressions</h4>
                  <div className={styles.progressionButtons}>
                    {Object.entries(CHORD_PROGRESSIONS)
                      .filter(([key]) => ['Happy', 'Sad', 'Tense', 'Dreamy', 'Mysterious', 'Peaceful', 'Energetic', 'Melancholic'].includes(key))
                      .map(([key, progression]) => (
                        <button
                          key={key}
                          onClick={() => synth.playProgression(key)}
                          className={styles.progressionBtn}
                        >
                          {progression.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

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

            {/* 🎛️ INSTRUMENT SELECTOR SECTION */}
            <CollapsibleSection title="🎛️ Instrument Selector" defaultCollapsed={true}>
              <InstrumentSelector
                selectedInstrument={synth.getSelectedTrack()?.instrument || 'sine'}
                onSelectInstrument={(instrument) => {
                  synth.updateTrack(synth.getSelectedTrack()!.id, {
                    instrument: instrument.waveform,
                    envelope: instrument.envelope,
                    lfo: instrument.lfo,
                    effects: instrument.effects
                  });
                }}
              />
            </CollapsibleSection>

            {/* 🎛️ EFFECTS ROUTING SECTION */}
            <CollapsibleSection title="🎛️ Effects Routing" defaultCollapsed={true}>
              <EffectsRouting
                tracks={synth.state.trackState.tracks}
                onUpdateTrackEffects={(trackId, effects) => {
                  synth.updateTrack(trackId, { effects });
                }}
              />
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

            {/* 🎛️ ADVANCED CONTROLS SECTION */}
            <CollapsibleSection title="🎛️ Advanced Controls">
              <div className={styles.advancedControls}>
                {/* LFO Controls */}
                <div className={styles.controlGroup}>
                  <h4>LFO (Low-Frequency Oscillator)</h4>
                  <SliderControl
                    label="LFO Rate"
                    value={synth.state.lfoRate}
                    min={0}
                    max={10}
                    step={0.1}
                    onChange={(value) => synth.updateState({ lfoRate: value })}
                    showValue
                    valueDisplay={`${synth.state.lfoRate.toFixed(1)}Hz`}
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
                    showValue
                    isLive={true}
                    resetFunction={synth.resetLfoDepth}
                    defaultValue={5}
                  />
                  <div className={styles.section}>
                    <label>LFO Target</label>
                    <div className={styles.lfoTargetButtons}>
                      {(['pitch', 'volume', 'filter'] as const).map(target => (
                        <button
                          key={target}
                          onClick={() => synth.updateState({ lfoTarget: target })}
                          className={`${styles.lfoTargetBtn} ${synth.state.lfoTarget === target ? styles.active : ''}`}
                        >
                          {target.charAt(0).toUpperCase() + target.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Arpeggiator Controls */}
                <div className={styles.controlGroup}>
                  <h4>Arpeggiator</h4>
                  <div className={styles.section}>
                    <label>Mode</label>
                    <div className={styles.arpeggiatorButtons}>
                      {(['off', 'up', 'down', 'updown', 'random'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => synth.setArpeggiatorMode(mode)}
                          className={`${styles.arpeggiatorBtn} ${synth.state.arpeggiatorMode === mode ? styles.active : ''}`}
                        >
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <SliderControl
                    label="Arpeggiator Rate"
                    value={synth.state.arpeggiatorRate}
                    min={1}
                    max={16}
                    onChange={(value) => synth.updateState({ arpeggiatorRate: value })}
                    showValue
                    isLive={true}
                    resetFunction={synth.resetArpeggiatorRate}
                    defaultValue={8}
                  />
                </div>

                {/* Preset Loading */}
                <div className={styles.controlGroup}>
                  <h4>Presets</h4>
                  <div className={styles.presetButtons}>
                    {Object.keys(PRESETS).slice(0, 12).map(presetName => (
                      <button
                        key={presetName}
                        onClick={() => synth.loadPreset(presetName)}
                        className={styles.presetBtn}
                      >
                        {presetName.charAt(0).toUpperCase() + presetName.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* 🎛️ EFFECTS SECTION */}
            <CollapsibleSection title="🎛️ Effects" defaultCollapsed={false}>
              <div className={styles.effectsControls}>
                
                {/* Delay Effect */}
                <CollapsibleSection title="⏱️ Delay" defaultCollapsed={true}>
                  <div className={styles.controlGroup}>
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
                      resetFunction={() => synth.updateState({ delayTime: 0.5 })}
                      defaultValue={0.5}
                    />
                    <SliderControl
                      label="Delay Feedback"
                      value={synth.state.delayFeedback}
                      min={0}
                      max={0.9}
                      step={0.1}
                      onChange={(value) => synth.updateState({ delayFeedback: value })}
                      showValue
                      valueDisplay={`${(synth.state.delayFeedback * 100).toFixed(0)}%`}
                      isLive={true}
                      resetFunction={() => synth.updateState({ delayFeedback: 0.3 })}
                      defaultValue={0.3}
                    />
                    <SliderControl
                      label="Delay Mix"
                      value={synth.state.delayMix}
                      min={0}
                      max={1}
                      step={0.1}
                      onChange={(value) => synth.updateState({ delayMix: value })}
                      showValue
                      valueDisplay={`${(synth.state.delayMix * 100).toFixed(0)}%`}
                      isLive={true}
                      resetFunction={() => synth.updateState({ delayMix: 0.5 })}
                      defaultValue={0.5}
                    />
                  </div>
                </CollapsibleSection>

                {/* Chorus Effect */}
                <CollapsibleSection title="🎵 Chorus" defaultCollapsed={true}>
                  <div className={styles.controlGroup}>
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
                    <SliderControl
                      label="Chorus Rate"
                      value={synth.state.chorusRate}
                      min={0.1}
                      max={10}
                      step={0.1}
                      onChange={(value) => synth.updateState({ chorusRate: value })}
                      showValue
                      valueDisplay={`${synth.state.chorusRate.toFixed(1)}Hz`}
                      isLive={true}
                      resetFunction={() => synth.updateState({ chorusRate: 1.5 })}
                      defaultValue={1.5}
                    />
                    <SliderControl
                      label="Chorus Depth"
                      value={synth.state.chorusDepth}
                      min={0}
                      max={1}
                      step={0.1}
                      onChange={(value) => synth.updateState({ chorusDepth: value })}
                      showValue
                      valueDisplay={`${(synth.state.chorusDepth * 100).toFixed(0)}%`}
                      isLive={true}
                      resetFunction={() => synth.updateState({ chorusDepth: 0.3 })}
                      defaultValue={0.3}
                    />
                    <SliderControl
                      label="Chorus Mix"
                      value={synth.state.chorusMix}
                      min={0}
                      max={1}
                      step={0.1}
                      onChange={(value) => synth.updateState({ chorusMix: value })}
                      showValue
                      valueDisplay={`${(synth.state.chorusMix * 100).toFixed(0)}%`}
                      isLive={true}
                      resetFunction={() => synth.updateState({ chorusMix: 0.5 })}
                      defaultValue={0.5}
                    />
                  </div>
                </CollapsibleSection>

                {/* Distortion Effect */}
                <CollapsibleSection title="🔥 Distortion" defaultCollapsed={true}>
                  <div className={styles.controlGroup}>
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
                    <div className={styles.section}>
                      <label>Distortion Type</label>
                      <div className={styles.distortionTypeButtons}>
                        {(['soft', 'hard', 'bitcrusher'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => synth.updateState({ distortionType: type })}
                            className={`${styles.distortionTypeBtn} ${synth.state.distortionType === type ? styles.active : ''}`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <SliderControl
                      label="Distortion Amount"
                      value={synth.state.distortionAmount}
                      min={0}
                      max={1}
                      step={0.1}
                      onChange={(value) => synth.updateState({ distortionAmount: value })}
                      showValue
                      valueDisplay={`${(synth.state.distortionAmount * 100).toFixed(0)}%`}
                      isLive={true}
                      resetFunction={() => synth.updateState({ distortionAmount: 0.5 })}
                      defaultValue={0.5}
                    />
                  </div>
                </CollapsibleSection>

                {/* Filter Effect */}
                <CollapsibleSection title="🎚️ Filter" defaultCollapsed={true}>
                  <div className={styles.controlGroup}>
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
                    <div className={styles.section}>
                      <label>Filter Type</label>
                      <div className={styles.filterTypeButtons}>
                        {(['lowpass', 'highpass', 'bandpass', 'notch'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => synth.updateState({ filterType: type })}
                            className={`${styles.filterTypeBtn} ${synth.state.filterType === type ? styles.active : ''}`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <SliderControl
                      label="Filter Frequency"
                      value={synth.state.filterFrequency}
                      min={20}
                      max={20000}
                      step={1}
                      onChange={(value) => synth.updateState({ filterFrequency: value })}
                      showValue
                      valueDisplay={`${synth.state.filterFrequency.toFixed(0)}Hz`}
                      isLive={true}
                      resetFunction={() => synth.updateState({ filterFrequency: 1000 })}
                      defaultValue={1000}
                    />
                    <SliderControl
                      label="Filter Resonance"
                      value={synth.state.filterResonance}
                      min={0}
                      max={20}
                      step={0.1}
                      onChange={(value) => synth.updateState({ filterResonance: value })}
                      showValue
                      valueDisplay={`${synth.state.filterResonance.toFixed(1)}`}
                      isLive={true}
                      resetFunction={() => synth.updateState({ filterResonance: 1 })}
                      defaultValue={1}
                    />
                  </div>
                </CollapsibleSection>

                {/* Compression Effect */}
                <CollapsibleSection title="📊 Compression" defaultCollapsed={true}>
                  <div className={styles.controlGroup}>
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
                    <SliderControl
                      label="Compression Threshold"
                      value={synth.state.compressionThreshold}
                      min={-60}
                      max={0}
                      step={1}
                      onChange={(value) => synth.updateState({ compressionThreshold: value })}
                      showValue
                      valueDisplay={`${synth.state.compressionThreshold}dB`}
                      isLive={true}
                      resetFunction={() => synth.updateState({ compressionThreshold: -20 })}
                      defaultValue={-20}
                    />
                    <SliderControl
                      label="Compression Ratio"
                      value={synth.state.compressionRatio}
                      min={1}
                      max={20}
                      step={0.1}
                      onChange={(value) => synth.updateState({ compressionRatio: value })}
                      showValue
                      valueDisplay={`${synth.state.compressionRatio.toFixed(1)}:1`}
                      isLive={true}
                      resetFunction={() => synth.updateState({ compressionRatio: 4 })}
                      defaultValue={4}
                    />
                    <SliderControl
                      label="Compression Attack"
                      value={synth.state.compressionAttack}
                      min={0.001}
                      max={1}
                      step={0.001}
                      onChange={(value) => synth.updateState({ compressionAttack: value })}
                      showValue
                      valueDisplay={`${(synth.state.compressionAttack * 1000).toFixed(1)}ms`}
                      isLive={true}
                      resetFunction={() => synth.updateState({ compressionAttack: 0.003 })}
                      defaultValue={0.003}
                    />
                    <SliderControl
                      label="Compression Release"
                      value={synth.state.compressionRelease}
                      min={0.001}
                      max={1}
                      step={0.001}
                      onChange={(value) => synth.updateState({ compressionRelease: value })}
                      showValue
                      valueDisplay={`${(synth.state.compressionRelease * 1000).toFixed(1)}ms`}
                      isLive={true}
                      resetFunction={() => synth.updateState({ compressionRelease: 0.25 })}
                      defaultValue={0.25}
                    />
                  </div>
                </CollapsibleSection>

                {/* Stereo Effects */}
                <CollapsibleSection title="🎧 Stereo Effects" defaultCollapsed={true}>
                  <div className={styles.controlGroup}>
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
                      resetFunction={() => synth.updateState({ stereoWidth: 1 })}
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
                    <SliderControl
                      label="Panning Amount"
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
                      resetFunction={() => synth.updateState({ panningAmount: 0 })}
                      defaultValue={0}
                    />
                  </div>
                </CollapsibleSection>
              </div>
            </CollapsibleSection>
            
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