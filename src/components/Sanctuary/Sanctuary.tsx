import React, { useEffect, useRef, useState } from 'react';
import { useSanctuary } from './hooks/useSanctuary';
import {
  SanctuaryTopBar,
  SanctuaryBottomBar,
  BlockSelector,
  PerformanceDisplay,
  PerformanceModal,
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
 * 
 * New layout: Top and bottom bars with canvas in between
 */
const Sanctuary: React.FC<SanctuaryProps> = ({ className, onExit }) => {
  const [state, actions] = useSanctuary();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Handle exit
  const handleExit = () => {
    // Exit fullscreen if active
    if (isFullscreen) {
      exitFullscreen();
    }
    // Stop game loop and cleanup
    actions.canvas.stopGameLoop();
    onExit?.();
  };

  // Fullscreen functionality
  const enterFullscreen = async () => {
    try {
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const newFullscreenState = !!document.fullscreenElement;
      setIsFullscreen(newFullscreenState);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Show welcome message when component mounts (always full screen now)
  useEffect(() => {
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 3000);
  }, []);

  // Auto-enter fullscreen when component mounts
  useEffect(() => {
    // No longer auto-entering fullscreen since modal is always full screen
    // The modal itself provides the full screen experience
  }, []);

  // Keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F11 to toggle browser fullscreen (optional enhancement)
      if (event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
      }
      // Ctrl+P to open performance modal
      if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        actions.sanctuary.setPerformanceModalVisible(true);
      }
      // Escape handled by modal component
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, actions.sanctuary]);

  // Handle canvas resize and center camera
  useEffect(() => {
    const handleResize = () => {
      if (state.canvas.canvasRef.current) {
        const canvas = state.canvas.canvasRef.current;
        const container = containerRef.current;
        if (container) {
          // Use fullscreen dimensions when in fullscreen mode
          const width = isFullscreen ? window.innerWidth : container.clientWidth;
          const height = isFullscreen ? window.innerHeight : container.clientHeight;
          
          canvas.width = width;
          canvas.height = height;
          
          // Center camera on canvas
          const centerX = width / 2;
          const centerY = height / 2;
          actions.sanctuary.setCamera({
            position: { x: centerX, y: centerY, z: 0 },
            zoom: 1,
            rotation: 0
          });
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.canvas.canvasRef, actions.sanctuary, isFullscreen]);

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

      {/* Top Bar - Essential Controls */}
      <SanctuaryTopBar
        currentLevelName={state.levelManagement.currentLevelId || 'New Level'}
        selectedTile={state.sanctuary.selectedTile}
        camera={state.sanctuary.camera}
        currentZLevel={state.sanctuary.currentZLevel}
        onExit={handleExit}
        onZoomClick={(zoom: number) => actions.sanctuary.setCamera({ ...state.sanctuary.camera, zoom })}
        onResetCamera={() => {
          const canvasElement = state.canvas.canvasRef.current;
          if (canvasElement) {
            const container = canvasElement.parentElement;
            if (container) {
              const containerRect = container.getBoundingClientRect();
              const centerX = containerRect.width / 2;
              const centerY = containerRect.height / 2;
              actions.sanctuary.setCamera({
                position: { x: centerX, y: centerY, z: 0 },
                zoom: 1,
                rotation: 0
              });
            }
          }
        }}
        onToggleBlockMenu={() => actions.sanctuary.setBlockMenuOpen(!state.sanctuary.isBlockMenuOpen)}
        onToggleInstructions={() => actions.sanctuary.setInstructionsVisible(!state.sanctuary.showInstructions)}
        onToggleGrid={() => actions.sanctuary.setGridVisible(!state.sanctuary.showGrid)}
        onTogglePerformance={() => actions.sanctuary.setPerformanceModalVisible(true)}
        onSwitchToZLevel={(level: number) => actions.sanctuary.setCurrentZLevel(level)}
        isBlockMenuOpen={state.sanctuary.isBlockMenuOpen}
      />

      {/* Bottom Bar - Building and Advanced Tools */}
      <SanctuaryBottomBar
        onToggleLevelMenu={() => actions.sanctuary.setLevelMenuVisible(!state.sanctuary.showLevelMenu)}
        onResetTerrain={() => actions.sanctuary.setBlocks([])}
        onFillVisibleArea={() => {}}
        onGenerateWithAllBlocks={() => {}}
        onGenerateProceduralMap={(_size: string) => {}}
        onToggleHeightMap={() => actions.sanctuary.setHeightMapVisible(!state.sanctuary.showHeightMap)}
        onExportHeightMap={() => {}}
        onToggleZLevelManager={() => actions.sanctuary.setZLevelManagerVisible(!state.sanctuary.showZLevelManager)}
        onToggleAtlasEditor={() => actions.sanctuary.setAtlasEditorVisible(!state.sanctuary.showAtlasEditor)}
        showHeightMap={state.sanctuary.showHeightMap}
      />

      {/* Fullscreen Toggle Button */}
      <button
        className={styles.fullscreenToggle}
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit Browser Fullscreen (F11)" : "Enter Browser Fullscreen (F11)"}
      >
        {isFullscreen ? "⛶" : "⛶"}
      </button>

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

        {/* Fullscreen Instructions */}
        {isFullscreen && (
          <div className={styles.fullscreenInstructions}>
            <div>Press <kbd>F11</kbd> to exit browser fullscreen</div>
            <div>Press <kbd>ESC</kbd> to close Sanctuary</div>
            <div>Use mouse to navigate, scroll to zoom</div>
          </div>
        )}

        {/* Welcome Message */}
        {showWelcome && (
          <div className={styles.welcomeMessage}>
            <div>Welcome to Sanctuary!</div>
            <div>You're now in full screen mode</div>
          </div>
        )}
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

      {/* Performance Modal */}
      <PerformanceModal
        isOpen={state.sanctuary.showPerformanceModal}
        onClose={() => actions.sanctuary.setPerformanceModalVisible(false)}
        performanceReport={actions.performance.getPerformanceReport()}
        fps={state.performance.fps}
        frameTime={state.performance.frameTime}
        renderTime={state.performance.renderTime}
        blockCount={state.performance.blockCount}
        visibleBlocks={state.performance.visibleBlocks}
        drawCalls={state.performance.drawCalls}
        memoryUsage={state.performance.memoryUsage}
        isOptimized={state.performance.isOptimized}
        targetFPS={state.performance.targetFPS}
        enableVSync={state.performance.enableVSync}
        enableCulling={state.performance.enableCulling}
        enableBatching={state.performance.enableBatching}
        enableLOD={state.performance.enableLOD}
        onOptimizeForPerformance={actions.performance.optimizeForPerformance}
        onOptimizeForQuality={actions.performance.optimizeForQuality}
        onAutoOptimize={actions.performance.autoOptimize}
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