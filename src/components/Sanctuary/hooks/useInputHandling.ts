import { useCallback, useEffect, useRef } from 'react';
import { SanctuaryState, SanctuaryStateActions } from './useSanctuaryState';
import { CanvasRenderingActions } from './useCanvasRendering';

export interface InputHandlingState {
  isDragging: boolean;
  isPanning: boolean;
  lastMousePosition: { x: number; y: number } | null;
  keyStates: { [key: string]: boolean };
  touchStartPosition: { x: number; y: number } | null;
}

export interface InputHandlingActions {
  // Mouse event handlers
  handleMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseLeave: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleWheel: (event: React.WheelEvent<HTMLCanvasElement>) => void;
  handleContextMenu: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  
  // Touch event handlers
  handleTouchStart: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  handleTouchMove: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  handleTouchEnd: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  
  // Keyboard event handlers
  handleKeyDown: (event: KeyboardEvent) => void;
  handleKeyUp: (event: KeyboardEvent) => void;
  
  // Utility functions
  isKeyPressed: (key: string) => boolean;
  getMousePosition: (event: React.MouseEvent<HTMLCanvasElement>) => { x: number; y: number };
  getTouchPosition: (event: React.TouchEvent<HTMLCanvasElement>) => { x: number; y: number };
}

export const useInputHandling = (
  state: SanctuaryState,
  stateActions: SanctuaryStateActions,
  canvasActions: CanvasRenderingActions
): [InputHandlingState, InputHandlingActions] => {
  // Input state
  const isDragging = useRef(false);
  const isPanning = useRef(false);
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);
  const keyStates = useRef<{ [key: string]: boolean }>({});
  const touchStartPosition = useRef<{ x: number; y: number } | null>(null);

  // Mouse event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePosition(event);
    lastMousePosition.current = mousePos;
    
    // Right click for panning
    if (event.button === 2) {
      isPanning.current = true;
      event.preventDefault();
      return;
    }
    
    // Left click for building/selection
    if (event.button === 0) {
      const gridPos = canvasActions.screenToGrid(mousePos.x, mousePos.y);
      stateActions.setHoverCell(gridPos);
      
      // Place block if tile is selected
      if (state.selectedTile) {
        const newBlock = {
          id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: state.selectedTile.type,
          position: { x: gridPos.x, y: gridPos.y, z: gridPos.z },
          sprite: {
            sourceX: state.selectedTile.sourceX,
            sourceY: state.selectedTile.sourceY,
            width: state.selectedTile.width,
            height: state.selectedTile.height,
            sheetPath: '/assets/Tilemaps/isometric-sandbox-sheet.png'
          },
          rotation: 0 as 0,
          palette: state.selectedTile.palette || 'green',
          properties: {
            walkable: true,
            climbable: false,
            interactable: false,
            destructible: true
          }
        };
        stateActions.addBlock(newBlock);
      }
      
      // Select block if no tile is selected
      else {
        const blockAtPosition = state.blocks.find(block => 
          block.position.x === gridPos.x && 
          block.position.y === gridPos.y && 
          block.position.z === gridPos.z
        );
        stateActions.setSelectedBlock(blockAtPosition || null);
      }
    }
  }, [state.selectedTile, state.blocks, stateActions, canvasActions]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePosition(event);
    
    // Handle panning
    if (isPanning.current && lastMousePosition.current) {
      const deltaX = mousePos.x - lastMousePosition.current.x;
      const deltaY = mousePos.y - lastMousePosition.current.y;
      
      stateActions.updateCamera({
        position: {
          x: state.camera.position.x + deltaX,
          y: state.camera.position.y + deltaY,
          z: state.camera.position.z
        }
      });
    }
    
    // Update hover cell
    const gridPos = canvasActions.screenToGrid(mousePos.x, mousePos.y);
    stateActions.setHoverCell(gridPos);
    
    lastMousePosition.current = mousePos;
  }, [state.camera, stateActions, canvasActions]);

  const handleMouseUp = useCallback((_event: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = false;
    isPanning.current = false;
    lastMousePosition.current = null;
  }, []);

  const handleMouseLeave = useCallback((_event: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = false;
    isPanning.current = false;
    lastMousePosition.current = null;
    stateActions.setHoverCell(null);
  }, [stateActions]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    // Disabled scroll zoom - only use zoom buttons (1x, 2x, 4x)
    // Note: preventDefault() removed due to passive event listener restrictions
    // Wheel zoom is disabled in favor of zoom buttons (1x, 2x, 4x)
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    // Prevent default context menu
    event.preventDefault();
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    if (event.touches.length === 1) {
      const touchPos = getTouchPosition(event);
      touchStartPosition.current = touchPos;
      lastMousePosition.current = touchPos;
    }
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    if (event.touches.length === 1 && touchStartPosition.current) {
      const touchPos = getTouchPosition(event);
      
      // Pan with single touch
      if (lastMousePosition.current) {
        const deltaX = touchPos.x - lastMousePosition.current.x;
        const deltaY = touchPos.y - lastMousePosition.current.y;
        
        stateActions.updateCamera({
          position: {
            x: state.camera.position.x + deltaX,
            y: state.camera.position.y + deltaY,
            z: state.camera.position.z
          }
        });
      }
      
      lastMousePosition.current = touchPos;
    }
  }, [state.camera, stateActions]);

  const handleTouchEnd = useCallback((_event: React.TouchEvent<HTMLCanvasElement>) => {
    isDragging.current = false;
    isPanning.current = false;
    lastMousePosition.current = null;
    touchStartPosition.current = null;
  }, []);

  // Keyboard event handlers
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keyStates.current[event.key.toLowerCase()] = true;
    
    // Handle specific key actions
    switch (event.key.toLowerCase()) {
      case 'escape':
        stateActions.setSelectedTile(null);
        stateActions.setSelectedBlock(null);
        break;
      case 'delete':
      case 'backspace':
        if (state.selectedBlock) {
          stateActions.removeBlock(state.selectedBlock.id);
          stateActions.setSelectedBlock(null);
        }
        break;
      case 'g':
        if (event.ctrlKey || event.metaKey) {
          stateActions.toggleGrid();
        }
        break;
      case 'p':
        if (event.ctrlKey || event.metaKey) {
          stateActions.togglePerformance();
        }
        break;
      case 'f':
        stateActions.setFillMode(!state.fillMode);
        break;
    }
  }, [state.selectedBlock, state.fillMode, stateActions]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keyStates.current[event.key.toLowerCase()] = false;
  }, []);

  // Utility functions
  const isKeyPressed = useCallback((key: string): boolean => {
    return keyStates.current[key.toLowerCase()] || false;
  }, []);

  const getMousePosition = useCallback((event: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }, []);

  const getTouchPosition = useCallback((event: React.TouchEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const rect = event.currentTarget.getBoundingClientRect();
    const touch = event.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }, []);

  // Set up global keyboard listeners
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => handleKeyDown(event);
    const handleGlobalKeyUp = (event: KeyboardEvent) => handleKeyUp(event);
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Prevent context menu on right click
  useEffect(() => {
    const handleContextMenu = (event: Event) => {
      event.preventDefault();
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Compose state object
  const inputState: InputHandlingState = {
    isDragging: isDragging.current,
    isPanning: isPanning.current,
    lastMousePosition: lastMousePosition.current,
    keyStates: keyStates.current,
    touchStartPosition: touchStartPosition.current
  };

  // Compose actions object
  const inputActions: InputHandlingActions = {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    handleContextMenu,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown,
    handleKeyUp,
    isKeyPressed,
    getMousePosition,
    getTouchPosition
  };

  return [inputState, inputActions];
}; 