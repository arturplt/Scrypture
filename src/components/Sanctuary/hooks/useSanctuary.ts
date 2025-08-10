import { useMemo, useEffect, useCallback } from 'react';
import { useSanctuaryState, type SanctuaryState, type SanctuaryStateActions } from './useSanctuaryState';
import { useCanvasRendering, type CanvasRenderingState, type CanvasRenderingActions } from './useCanvasRendering';
import { useInputHandling, type InputHandlingState, type InputHandlingActions } from './useInputHandling';
import { usePerformance, type PerformanceState, type PerformanceActions } from './usePerformance';
import { useLevelManagement, type LevelManagementState, type LevelManagementActions } from './useLevelManagement';
import { CullingSystem } from '../systems/CullingSystem';
import { SpatialIndex } from '../systems/SpatialIndexSystem';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

export interface SanctuaryHookState {
  // Core state
  sanctuary: SanctuaryState;
  canvas: CanvasRenderingState;
  input: InputHandlingState;
  performance: PerformanceState;
  levelManagement: LevelManagementState;
  
  // System instances
  cullingSystem: CullingSystem;
  spatialIndex: SpatialIndex;
  performanceMonitor: PerformanceMonitor | null;
}

export interface SanctuaryHookActions {
  // Core actions
  sanctuary: SanctuaryStateActions;
  canvas: CanvasRenderingActions;
  input: InputHandlingActions;
  performance: PerformanceActions;
  levelManagement: LevelManagementActions;
  
  // Convenience methods
  resetSanctuary: () => void;
  exportSanctuaryState: () => string;
  importSanctuaryState: (stateData: string) => boolean;
}

export const useSanctuary = (): [SanctuaryHookState, SanctuaryHookActions] => {
  // Initialize core systems
  const spatialIndex = useMemo(() => new SpatialIndex(), []);
  const cullingSystem = useMemo(() => new CullingSystem(spatialIndex), [spatialIndex]);
  const performanceMonitor = useMemo(() => {
    // Create a temporary canvas to get WebGL context for PerformanceMonitor
    const tempCanvas = document.createElement('canvas');
    // Avoid triggering software WebGL fallback; only use hardware contexts
    const gl =
      (tempCanvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) as WebGL2RenderingContext | null) ||
      (tempCanvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) as WebGLRenderingContext | null);
    return gl ? new PerformanceMonitor(gl) : null;
  }, []);
  
  // Initialize all hooks
  const [sanctuaryState, sanctuaryActions] = useSanctuaryState();
  const [canvasState, canvasActions] = useCanvasRendering(
    sanctuaryState,
    cullingSystem,
    performanceMonitor
  );
  const [inputState, inputActions] = useInputHandling(
    sanctuaryState,
    sanctuaryActions,
    canvasActions
  );
  const [performanceState, performanceActions] = usePerformance();
  const [levelManagementState, levelManagementActions] = useLevelManagement(
    sanctuaryState,
    sanctuaryActions
  );
  
  // Update performance metrics when canvas metrics change
  useEffect(() => {
    if (canvasState.performanceMetrics) {
      performanceActions.updateMetrics(canvasState.performanceMetrics);
    }
  }, [canvasState.performanceMetrics]);
  
  // Sync spatialIndex with blocks
  useEffect(() => {
    // Clear existing blocks
    spatialIndex.clear();
    
    // Add all current blocks
    sanctuaryState.blocks.forEach(block => {
      spatialIndex.addBlock(block);
    });
  }, [sanctuaryState.blocks, spatialIndex]);
  
  // Convenience methods
  const resetSanctuary = useCallback(() => {
    sanctuaryActions.setBlocks([]);
    sanctuaryActions.setCamera({
      position: { x: 0, y: 0, z: 0 },
      zoom: 1,
      rotation: 0
    });
    sanctuaryActions.setSelectedTile(null);
    sanctuaryActions.setSelectedBlock(null);
    sanctuaryActions.setHoverCell(null);
    sanctuaryActions.setCurrentZLevel(0);
    sanctuaryActions.setZLevelFilter([]);
    sanctuaryActions.setFillMode(false);
    sanctuaryActions.setZBuildMode(false);
    if ((sanctuaryActions as any).setDefinedZLevels) {
      (sanctuaryActions as any).setDefinedZLevels([0, 1, 2]);
    }
    
    // Reset UI state
    sanctuaryActions.setInstructionsVisible(false);
    sanctuaryActions.setGridVisible(false);
    sanctuaryActions.setPerformanceVisible(false);
    sanctuaryActions.setPerformanceModalVisible(false);
    sanctuaryActions.setLevelMenuVisible(false);
    sanctuaryActions.setZLevelManagerVisible(false);
    sanctuaryActions.setHeightMapVisible(false);
    sanctuaryActions.setAtlasEditorVisible(false);
    sanctuaryActions.setShowResetConfirmation(false);
    sanctuaryActions.setShowRenameDialog(false);
    
    // Reset performance
    performanceActions.resetMetrics();
    
    // Create new level
    levelManagementActions.createNewLevel();
  }, [sanctuaryActions, performanceActions, levelManagementActions]);
  
  const exportSanctuaryState = useCallback((): string => {
    const exportData = {
      sanctuary: sanctuaryState,
      level: levelManagementState.currentLevelId,
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [sanctuaryState, levelManagementState.currentLevelId]);
  
  const importSanctuaryState = useCallback((stateData: string): boolean => {
    try {
      const importData = JSON.parse(stateData);
      
      if (importData.sanctuary) {
        // Import sanctuary state
        sanctuaryActions.setBlocks(importData.sanctuary.blocks || []);
        sanctuaryActions.setCamera(importData.sanctuary.camera || {
          position: { x: 0, y: 0, z: 0 },
          zoom: 1,
          rotation: 0
        });
        sanctuaryActions.setCurrentZLevel(importData.sanctuary.currentZLevel || 0);
        sanctuaryActions.setZLevelFilter(importData.sanctuary.zLevelFilter || []);
        sanctuaryActions.setFillMode(importData.sanctuary.fillMode || false);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import sanctuary state:', error);
      return false;
    }
  }, [sanctuaryActions]);
  
  // Compose state object
  const state: SanctuaryHookState = {
    sanctuary: sanctuaryState,
    canvas: canvasState,
    input: inputState,
    performance: performanceState,
    levelManagement: levelManagementState,
    cullingSystem,
    spatialIndex,
    performanceMonitor
  };
  
  // Compose actions object
  const actions: SanctuaryHookActions = {
    sanctuary: sanctuaryActions,
    canvas: canvasActions,
    input: inputActions,
    performance: performanceActions,
    levelManagement: levelManagementActions,
    resetSanctuary,
    exportSanctuaryState,
    importSanctuaryState
  };
  
  return [state, actions];
}; 