import { useCallback, useEffect, useRef } from 'react';
import { SanctuaryState, SanctuaryStateActions } from './useSanctuaryState';
import { CanvasRenderingActions } from './useCanvasRendering';
import { screenToCanvas, isWithinCanvas, debugCoordinateConversion } from '../utils/CoordinateUtils';

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
  handleMouseClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
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
      // Pass raw screen coordinates to screenToGrid
      const gridPos = canvasActions.screenToGrid(event.clientX, event.clientY);
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
    
    // Update hover cell - pass raw screen coordinates to screenToGrid
    const gridPos = canvasActions.screenToGrid(event.clientX, event.clientY);
    stateActions.setHoverCell(gridPos);
    
    // Debug coordinate conversion on mouse move (only when debug is enabled)
    if (state.showPerformance) {
      const canvas = event.currentTarget;
      debugCoordinateConversion(
        event.clientX, 
        event.clientY, 
        canvas, 
        state.camera, 
        state.currentZLevel
      );
    }
    
    lastMousePosition.current = mousePos;
  }, [state.camera, state.showPerformance, state.currentZLevel, stateActions, canvasActions]);

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

  const handleMouseClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePosition(event);
    // Pass raw screen coordinates to screenToGrid
    const gridPos = canvasActions.screenToGrid(event.clientX, event.clientY);
    
    // Debug: Log click position and resulting grid coordinates
    console.log('Mouse Click Debug:', {
      mouse: mousePos,
      grid: gridPos,
      camera: state.camera,
      canvas: event.currentTarget.getBoundingClientRect()
    });
    
    // Handle block placement (if implemented)
    if (state.selectedBlock && !isPanning.current) {
      console.log('Would place block at:', gridPos, 'with block:', state.selectedBlock);
    }
  }, [state.selectedBlock, state.camera, stateActions, canvasActions]);

  const handleWheel = useCallback((_event: React.WheelEvent<HTMLCanvasElement>) => {
    // Wheel handling can be implemented here if needed
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    // Prevent default context menu
    event.preventDefault();
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const touchPos = getTouchPosition(event);
      touchStartPosition.current = touchPos;
      lastMousePosition.current = touchPos;
      
      // Convert touch to grid coordinates for potential block placement
      const gridPos = canvasActions.screenToGrid(touch.clientX, touch.clientY);
      stateActions.setHoverCell(gridPos);
    }
  }, [canvasActions, stateActions]);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    if (event.touches.length === 1 && touchStartPosition.current) {
      const touch = event.touches[0];
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
      
      // Update hover cell for touch
      const gridPos = canvasActions.screenToGrid(touch.clientX, touch.clientY);
      stateActions.setHoverCell(gridPos);
      
      lastMousePosition.current = touchPos;
    }
  }, [state.camera, stateActions, canvasActions]);

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
      case 'd':
        if (event.ctrlKey || event.metaKey) {
          // Toggle debug mode - this will show coordinate conversion info
          stateActions.togglePerformance(); // Reuse performance toggle for debug info
        }
        break;
      case 'f':
        stateActions.setFillMode(!state.fillMode);
        break;
      case 't':
        if (event.ctrlKey || event.metaKey) {
          // Test coordinate conversion
          console.log('Testing coordinate conversion...');
          // This will be handled by the main component
        }
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
    const canvas = event.currentTarget;
    return screenToCanvas(event.clientX, event.clientY, canvas);
  }, []);

  const getTouchPosition = useCallback((event: React.TouchEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = event.currentTarget;
    const touch = event.touches[0];
    return screenToCanvas(touch.clientX, touch.clientY, canvas);
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
    handleMouseClick,
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