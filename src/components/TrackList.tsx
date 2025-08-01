import React from 'react';
import { Track } from '../types/synthesizer';
import styles from './TrackList.module.css';

interface TrackListProps {
  tracks: Track[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string) => void;
  onToggleMute: (trackId: string) => void;
  onToggleSolo: (trackId: string) => void;
  onUpdateTrackVolume: (trackId: string, volume: number) => void;
  onUpdateTrackPan: (trackId: string, pan: number) => void;
  onUpdateTrackInstrument: (trackId: string, instrument: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onDuplicateTrack: (trackId: string) => void;
  onReorderTracks: (trackIds: string[]) => void;
}

interface TrackItemProps {
  track: Track;
  isSelected: boolean;
  onSelect: () => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onVolumeChange: (volume: number) => void;
  onPanChange: (pan: number) => void;
  onInstrumentChange: (instrument: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const TrackItem: React.FC<TrackItemProps> = ({
  track,
  isSelected,
  onSelect,
  onToggleMute,
  onToggleSolo,
  onVolumeChange,
  onPanChange,
  onInstrumentChange,
  onDelete,
  onDuplicate
}) => {
  return (
    <div 
      className={`${styles.trackItem} ${isSelected ? styles.selected : ''} ${track.muted ? styles.muted : ''}`}
      style={{ borderLeftColor: track.color }}
      onClick={onSelect}
    >
      <div className={styles.trackHeader}>
        <div className={styles.trackInfo}>
          <span className={styles.trackName}>{track.name}</span>
          <span className={styles.trackNote}>{track.note}</span>
          <span className={styles.trackCategory}>{track.category}</span>
        </div>
        
        <div className={styles.trackControls}>
          <div className={styles.volumeControl}>
            <label>V</label>
            <input
              type="range"
              min="0"
              max="100"
              value={track.volume}
              onChange={(e) => onVolumeChange(parseInt(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className={styles.volumeSlider}
            />
            <span className={styles.valueDisplay}>{track.volume}</span>
          </div>
          
          <div className={styles.panControl}>
            <label>P</label>
            <input
              type="range"
              min="-100"
              max="100"
              value={track.pan}
              onChange={(e) => onPanChange(parseInt(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className={styles.panSlider}
            />
            <span className={styles.valueDisplay}>
              {track.pan === 0 ? 'C' : track.pan > 0 ? `R${track.pan}` : `L${Math.abs(track.pan)}`}
            </span>
          </div>
          
          <div className={styles.instrumentDisplay}>
            <select
              value={track.instrument}
              onChange={(e) => {
                e.stopPropagation();
                onInstrumentChange(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className={styles.instrumentSelect}
              title="Change Instrument"
            >
              <option value="sine">🌊 Sine</option>
              <option value="square">⬜ Square</option>
              <option value="triangle">🔺 Triangle</option>
              <option value="sawtooth">🔺 Sawtooth</option>
              <option value="noise">📻 Noise</option>
              <option value="custom">🎛️ Custom</option>
            </select>
          </div>
          
          <button
            className={`${styles.controlBtn} ${styles.muteBtn} ${track.muted ? styles.active : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            title={track.muted ? 'Unmute' : 'Mute'}
          >
            🔇
          </button>
          
          <button
            className={`${styles.controlBtn} ${styles.soloBtn} ${track.solo ? styles.active : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSolo();
            }}
            title={track.solo ? 'Unsolo' : 'Solo'}
          >
            🎧
          </button>
          
          <button
            className={styles.controlBtn}
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicate Track"
          >
            📋
          </button>
          
          <button
            className={`${styles.controlBtn} ${styles.deleteBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete Track"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {track.solo && <div className={styles.soloIndicator}>SOLO</div>}
    </div>
  );
};

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  selectedTrackId,
  onSelectTrack,
  onToggleMute,
  onToggleSolo,
  onUpdateTrackVolume,
  onUpdateTrackPan,
  onUpdateTrackInstrument,
  onDeleteTrack,
  onDuplicateTrack,
  onReorderTracks
}) => {
  const handleDragStart = (e: React.DragEvent, trackId: string) => {
    e.dataTransfer.setData('text/plain', trackId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTrackId: string) => {
    e.preventDefault();
    const draggedTrackId = e.dataTransfer.getData('text/plain');
    
    if (draggedTrackId === targetTrackId) return;
    
    const currentOrder = tracks.map(t => t.id);
    const draggedIndex = currentOrder.indexOf(draggedTrackId);
    const targetIndex = currentOrder.indexOf(targetTrackId);
    
    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedTrackId);
    
    onReorderTracks(newOrder);
  };

  return (
    <div className={styles.trackList}>
      <div className={styles.trackListHeader}>
        <h3>🎛️ Your Tracks</h3>
        <div className={styles.trackStats}>
          <span>Total: {tracks.length}</span>
          <span>Active: {tracks.filter(t => !t.muted).length}</span>
          <span>Solo: {tracks.filter(t => t.solo).length}</span>
        </div>
      </div>
      
      <div className={styles.tracksContainer}>
        {tracks.map((track) => (
          <div
            key={track.id}
            draggable
            onDragStart={(e) => handleDragStart(e, track.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, track.id)}
            className={styles.trackWrapper}
          >
            <TrackItem
              track={track}
              isSelected={selectedTrackId === track.id}
              onSelect={() => onSelectTrack(track.id)}
              onToggleMute={() => onToggleMute(track.id)}
              onToggleSolo={() => onToggleSolo(track.id)}
              onVolumeChange={(volume) => onUpdateTrackVolume(track.id, volume)}
              onPanChange={(pan) => onUpdateTrackPan(track.id, pan)}
              onInstrumentChange={(instrument) => onUpdateTrackInstrument(track.id, instrument)}
              onDelete={() => onDeleteTrack(track.id)}
              onDuplicate={() => onDuplicateTrack(track.id)}
            />
          </div>
        ))}
      </div>
      
      {tracks.length === 0 && (
        <div className={styles.emptyState}>
          <p>🎵 No tracks created yet</p>
          <p>Click "Add Track" to create your first track</p>
          <p>Each track can have its own instrument, effects, and sequence</p>
        </div>
      )}
    </div>
  );
}; 