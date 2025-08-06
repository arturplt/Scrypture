// Export all Sanctuary hooks
export { useSanctuaryState, type SanctuaryState, type SanctuaryStateActions } from './useSanctuaryState';
export { useCanvasRendering, type CanvasRenderingState, type CanvasRenderingActions } from './useCanvasRendering';
export { useInputHandling, type InputHandlingState, type InputHandlingActions } from './useInputHandling';
export { usePerformance, type PerformanceState, type PerformanceActions } from './usePerformance';
export { useLevelManagement, type LevelManagementState, type LevelManagementActions } from './useLevelManagement';

// Main hook that combines all functionality
export { useSanctuary } from './useSanctuary'; 