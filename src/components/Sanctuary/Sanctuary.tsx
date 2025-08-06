import React, { useEffect, useRef } from 'react';
import { useSanctuary } from './hooks/useSanctuary';
import {
  SanctuaryHeader,
  BlockSelector,
  PerformanceDisplay,
  Instructions,
  LoadingOverlay
} from './ui';
import styles from '../Sanctuary.module.css';

interface SanctuaryProps {
  className?: string;
  onExit?: () => void;
}

/**
 * Sanctuary Component - Isometric Sandbox Editor
 * 
 * Refactored to use modular hooks and extracted UI components for better
 * maintainability, testability, and performance.
 */
const Sanctuary: React.FC<SanctuaryProps> = ({ className, onExit }) => {
  const [state, actions] = useSanctuary();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle exit
  const handleExit = () => {
    // Stop game loop and cleanup
    actions.canvas.stopGameLoop();
    onExit?.();
  };

  // Handle canvas resize and center camera
  useEffect(() => {
    const handleResize = () => {
      if (state.canvas.canvasRef.current) {
        const canvas = state.canvas.canvasRef.current;
        const container = containerRef.current;
        if (container) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
          
          // Center camera on canvas
          const centerX = container.clientWidth / 2;
          const centerY = container.clientHeight / 2;
          actions.sanctuary.updateCamera({
            position: { x: centerX, y: centerY, z: 0 }
          });
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.canvas.canvasRef, actions.sanctuary]);

  // Start game loop when component mounts
  useEffect(() => {
    if (state.canvas.tileSheetLoaded) {
      actions.canvas.startGameLoop();
    }
    return () => {
      actions.canvas.stopGameLoop();
    };
  }, [state.canvas.tileSheetLoaded, actions.canvas]);

  return (
    <div className={`${styles.sanctuary} ${className || ''}`} ref={containerRef}>
      {/* Loading Overlay */}
      <LoadingOverlay 
        isLoaded={state.canvas.isLoaded}
        tileSheetLoaded={state.canvas.tileSheetLoaded}
      />

      {/* Main Header */}
      <SanctuaryHeader
        currentLevelName={state.levelManagement.currentLevelId || 'New Level'}
        selectedTile={state.sanctuary.selectedTile}
        camera={state.sanctuary.camera}
        currentZLevel={state.sanctuary.currentZLevel}
        showGrid={state.sanctuary.showGrid}
        showPerformance={state.sanctuary.showPerformance}
        showInstructions={state.sanctuary.showInstructions}
        showLevelMenu={state.sanctuary.showLevelMenu}
        showZLevelManager={state.sanctuary.showZLevelManager}
        showHeightMap={state.sanctuary.showHeightMap}
        showAtlasEditor={state.sanctuary.showAtlasEditor}
        showResetConfirmation={state.sanctuary.showResetConfirmation}
        showRenameDialog={state.sanctuary.showRenameDialog}
        onExit={handleExit}
        onToggleGrid={() => actions.sanctuary.setGridVisible(!state.sanctuary.showGrid)}
        onTogglePerformance={() => actions.sanctuary.setPerformanceVisible(!state.sanctuary.showPerformance)}
        onToggleInstructions={() => actions.sanctuary.setInstructionsVisible(!state.sanctuary.showInstructions)}
        onToggleLevelMenu={() => actions.sanctuary.setLevelMenuVisible(!state.sanctuary.showLevelMenu)}
        onToggleZLevelManager={() => actions.sanctuary.setZLevelManagerVisible(!state.sanctuary.showZLevelManager)}
        onToggleHeightMap={() => actions.sanctuary.setHeightMapVisible(!state.sanctuary.showHeightMap)}
        onToggleAtlasEditor={() => actions.sanctuary.setAtlasEditorVisible(!state.sanctuary.showAtlasEditor)}
        onReset={() => actions.sanctuary.setShowResetConfirmation(true)}
        onRename={() => actions.sanctuary.setShowRenameDialog(true)}
        onSaveLevel={() => actions.levelManagement.saveLevel()}
        onLoadLevel={(levelId) => actions.levelManagement.loadLevel(levelId)}
        onNewLevel={() => actions.levelManagement.createNewLevel()}
        onSetZLevel={(level) => actions.sanctuary.setCurrentZLevel(level)}
        onSetZoom={(zoom) => actions.sanctuary.setCamera({ ...state.sanctuary.camera, zoom })}
      />

      {/* Main Canvas */}
      <div className={styles.canvasContainer}>
        <canvas
          ref={state.canvas.canvasRef}
          className={styles.mainCanvas}
          onMouseDown={actions.input.handleMouseDown}
          onMouseMove={actions.input.handleMouseMove}
          onMouseUp={actions.input.handleMouseUp}
          onMouseLeave={actions.input.handleMouseLeave}
          onWheel={actions.input.handleWheel}
          onContextMenu={actions.input.handleContextMenu}
          onTouchStart={actions.input.handleTouchStart}
          onTouchMove={actions.input.handleTouchMove}
          onTouchEnd={actions.input.handleTouchEnd}
        />
        
        {/* Hover Canvas */}
        <canvas
          ref={state.canvas.hoverCanvasRef}
          className={styles.hoverCanvas}
        />
      </div>

      {/* Block Selector */}
      <BlockSelector
        isOpen={state.sanctuary.isBlockMenuOpen}
        selectedTile={state.sanctuary.selectedTile}
        expandedCategory={state.sanctuary.expandedCategory}
        onClose={() => actions.sanctuary.setBlockMenuOpen(false)}
        onSelectTile={actions.sanctuary.setSelectedTile}
        onToggleCategory={actions.sanctuary.setExpandedCategory}
      />

      {/* Performance Display */}
      <PerformanceDisplay
        isVisible={state.sanctuary.showPerformance}
        fps={state.performance.fps}
        renderTime={state.performance.renderTime}
        blockCount={state.performance.blockCount}
        visibleBlocks={state.performance.visibleBlocks}
        drawCalls={state.performance.drawCalls}
        isOptimized={state.performance.isOptimized}
      />

      {/* Instructions */}
      <Instructions isVisible={state.sanctuary.showInstructions} />

      {/* Additional UI Components */}
      {state.sanctuary.showLevelMenu && (
        <div className={styles.levelMenu}>
          <h3>Level Management</h3>
          <div className={styles.levelList}>
            {state.levelManagement.savedLevels.map(level => (
              <div key={level.id} className={styles.levelItem}>
                <span>{level.name}</span>
                <button onClick={() => actions.levelManagement.loadLevel(level.id)}>
                  Load
                </button>
                <button onClick={() => actions.levelManagement.deleteLevel(level.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.sanctuary.showZLevelManager && (
        <div className={styles.zLevelManager}>
          <h3>Z-Level Manager</h3>
          <div className={styles.zLevelList}>
            {state.sanctuary.zLevelFilter.map((level, index) => (
              <div key={index} className={styles.zLevelItem}>
                <span>Level {level}</span>
                <button onClick={() => actions.sanctuary.removeZLevelFilter(level)}>
                  Hide
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.sanctuary.showHeightMap && (
        <div className={styles.heightMap}>
          <h3>Height Map</h3>
          <p>Height map visualization will be implemented here.</p>
        </div>
      )}

      {state.sanctuary.showAtlasEditor && (
        <div className={styles.atlasEditor}>
          <h3>Atlas Editor</h3>
          <p>Atlas editor will be implemented here.</p>
        </div>
      )}

      {/* Confirmation Dialogs */}
      {state.sanctuary.showResetConfirmation && (
        <div className={styles.confirmationDialog}>
          <h3>Reset Sanctuary</h3>
          <p>Are you sure you want to reset all blocks and start over?</p>
          <div className={styles.dialogButtons}>
            <button onClick={() => {
              actions.resetSanctuary();
              actions.sanctuary.setShowResetConfirmation(false);
            }}>
              Reset
            </button>
            <button onClick={() => actions.sanctuary.setShowResetConfirmation(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {state.sanctuary.showRenameDialog && (
        <div className={styles.renameDialog}>
          <h3>Rename Level</h3>
          <input
            type="text"
            value={state.sanctuary.levelNameInput}
            onChange={(e) => actions.sanctuary.setLevelNameInput(e.target.value)}
            placeholder="Enter level name"
          />
          <div className={styles.dialogButtons}>
            <button onClick={() => {
              actions.levelManagement.renameCurrentLevel(state.sanctuary.levelNameInput);
              actions.sanctuary.setShowRenameDialog(false);
            }}>
              Rename
            </button>
            <button onClick={() => actions.sanctuary.setShowRenameDialog(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sanctuary; 