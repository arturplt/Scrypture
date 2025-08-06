import { useState, useCallback } from 'react';
import { Block } from '../types/Block';
import { Camera } from '../types/Camera';
import { Level } from '../types/Level';
import { IsometricTileData } from '../../../data/isometric-tiles';

export interface SanctuaryState {
  // Core data
  blocks: Block[];
  camera: Camera;
  currentLevel: Level;
  
  // Selection state
  selectedTile: IsometricTileData | null;
  selectedBlock: Block | null;
  hoverCell: { x: number; y: number; z: number } | null;
  
  // UI state
  isBlockMenuOpen: boolean;
  showInstructions: boolean;
  showGrid: boolean;
  showPerformance: boolean;
  showLevelMenu: boolean;
  showZLevelManager: boolean;
  showHeightMap: boolean;
  showAtlasEditor: boolean;
  showResetConfirmation: boolean;
  showRenameDialog: boolean;
  
  // Z-level state
  currentZLevel: number;
  zLevelFilter: number[];
  
  // Height map state
  currentHeightMap: any | null; // Will be properly typed later
  heightMapConfig: any; // Will be properly typed later
  
  // Fill mode state
  fillMode: boolean;
  
  // Collapsible groups state
  collapsedGroups: {
    camera: boolean;
    levels: boolean;
    building: boolean;
    tools: boolean;
    heightmap: boolean;
    zlevels: boolean;
  };
  
  // Level management state
  levelNameInput: string;
  expandedCategory: string | null;
}

export interface SanctuaryStateActions {
  // Block management
  setBlocks: (blocks: Block[]) => void;
  addBlock: (block: Block) => void;
  removeBlock: (blockId: string) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  
  // Camera management
  setCamera: (camera: Camera) => void;
  updateCamera: (updates: Partial<Camera>) => void;
  
  // Selection management
  setSelectedTile: (tile: IsometricTileData | null) => void;
  setSelectedBlock: (block: Block | null) => void;
  setHoverCell: (cell: { x: number; y: number; z: number } | null) => void;
  
  // UI state management
  toggleBlockMenu: () => void;
  setBlockMenuOpen: (open: boolean) => void;
  toggleInstructions: () => void;
  setInstructionsVisible: (show: boolean) => void;
  toggleGrid: () => void;
  setGridVisible: (show: boolean) => void;
  togglePerformance: () => void;
  setPerformanceVisible: (show: boolean) => void;
  toggleLevelMenu: () => void;
  setLevelMenuVisible: (show: boolean) => void;
  toggleZLevelManager: () => void;
  setZLevelManagerVisible: (show: boolean) => void;
  toggleHeightMap: () => void;
  setHeightMapVisible: (show: boolean) => void;
  toggleAtlasEditor: () => void;
  setAtlasEditorVisible: (show: boolean) => void;
  setShowResetConfirmation: (show: boolean) => void;
  setShowRenameDialog: (show: boolean) => void;
  
  // Z-level management
  setCurrentZLevel: (level: number) => void;
  setZLevelFilter: (filter: number[]) => void;
  removeZLevelFilter: (level: number) => void;
  
  // Height map management
  setCurrentHeightMap: (heightMap: any | null) => void;
  setHeightMapConfig: (config: any) => void;
  
  // Fill mode management
  setFillMode: (mode: boolean) => void;
  
  // Collapsible groups management
  toggleGroupCollapse: (groupName: keyof SanctuaryState['collapsedGroups']) => void;
  
  // Level management
  setLevelNameInput: (input: string) => void;
  setExpandedCategory: (category: string | null) => void;
  
  // Level operations
  setCurrentLevel: (level: Level) => void;
  updateCurrentLevel: (updates: Partial<Level>) => void;
}

export const useSanctuaryState = (): [SanctuaryState, SanctuaryStateActions] => {
  // Core data state
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [camera, setCamera] = useState<Camera>({
    position: { x: 0, y: 0, z: 0 },
    zoom: 2, // Increased zoom to better show the smaller grid
    rotation: 0
  });
  const [currentLevel, setCurrentLevel] = useState<Level>({
    id: `level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: 'New Level',
    description: 'A new sanctuary level',
    author: 'Player',
    createdAt: new Date(),
    modifiedAt: new Date(),
    blocks: [],
    camera: { position: { x: 0, y: 0, z: 0 }, zoom: 2, rotation: 0 },
    settings: { gravity: true }
  });
  
  // Selection state
  const [selectedTile, setSelectedTile] = useState<IsometricTileData | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number; z: number } | null>(null);
  
  // UI state
  const [isBlockMenuOpen, setIsBlockMenuOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const [showZLevelManager, setShowZLevelManager] = useState(false);
  const [showHeightMap, setShowHeightMap] = useState(false);
  const [showAtlasEditor, setShowAtlasEditor] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  
  // Z-level state
  const [currentZLevel, setCurrentZLevel] = useState(0);
  const [zLevelFilter, setZLevelFilter] = useState<number[]>([]);
  
  // Height map state
  const [currentHeightMap, setCurrentHeightMap] = useState<any | null>(null);
  const [heightMapConfig, setHeightMapConfig] = useState<any>({
    width: 32,
    height: 32,
    octaves: 4,
    frequency: 0.1,
    amplitude: 1.0,
    persistence: 0.5,
    lacunarity: 2.0,
    minHeight: 0,
    maxHeight: 100,
    smoothing: 1.0
  });
  
  // Fill mode state
  const [fillMode, setFillMode] = useState(false);
  
  // Collapsible groups state
  const [collapsedGroups, setCollapsedGroups] = useState<SanctuaryState['collapsedGroups']>({
    camera: false,
    levels: false,
    building: false,
    tools: false,
    heightmap: false,
    zlevels: false
  });
  
  // Level management state
  const [levelNameInput, setLevelNameInput] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Block management actions
  const addBlock = useCallback((block: Block) => {
    setBlocks(prev => [...prev, block]);
  }, []);
  
  const removeBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  }, []);
  
  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  }, []);
  
  // Camera management actions
  const updateCamera = useCallback((updates: Partial<Camera>) => {
    setCamera(prev => ({ ...prev, ...updates }));
  }, []);
  
  // UI state management actions
  const toggleBlockMenu = useCallback(() => {
    setIsBlockMenuOpen(prev => !prev);
  }, []);
  
  const setBlockMenuOpen = useCallback((open: boolean) => {
    setIsBlockMenuOpen(open);
  }, []);
  
  const toggleInstructions = useCallback(() => {
    setShowInstructions(prev => !prev);
  }, []);
  
  const setInstructionsVisible = useCallback((show: boolean) => {
    setShowInstructions(show);
  }, []);
  
  const toggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);
  
  const setGridVisible = useCallback((show: boolean) => {
    setShowGrid(show);
  }, []);
  
  const togglePerformance = useCallback(() => {
    setShowPerformance(prev => !prev);
  }, []);
  
  const setPerformanceVisible = useCallback((show: boolean) => {
    setShowPerformance(show);
  }, []);
  
  const toggleLevelMenu = useCallback(() => {
    setShowLevelMenu(prev => !prev);
  }, []);
  
  const setLevelMenuVisible = useCallback((show: boolean) => {
    setShowLevelMenu(show);
  }, []);
  
  const toggleZLevelManager = useCallback(() => {
    setShowZLevelManager(prev => !prev);
  }, []);
  
  const setZLevelManagerVisible = useCallback((show: boolean) => {
    setShowZLevelManager(show);
  }, []);
  
  const toggleHeightMap = useCallback(() => {
    setShowHeightMap(prev => !prev);
  }, []);
  
  const setHeightMapVisible = useCallback((show: boolean) => {
    setShowHeightMap(show);
  }, []);
  
  const toggleAtlasEditor = useCallback(() => {
    setShowAtlasEditor(prev => !prev);
  }, []);
  
  const setAtlasEditorVisible = useCallback((show: boolean) => {
    setShowAtlasEditor(show);
  }, []);
  
  // Collapsible groups management
  const toggleGroupCollapse = useCallback((groupName: keyof SanctuaryState['collapsedGroups']) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  }, []);
  
  // Z-level management
  const removeZLevelFilter = useCallback((level: number) => {
    setZLevelFilter(prev => prev.filter(l => l !== level));
  }, []);
  
  // Level operations
  const updateCurrentLevel = useCallback((updates: Partial<Level>) => {
    setCurrentLevel(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Compose state object
  const state: SanctuaryState = {
    blocks,
    camera,
    currentLevel,
    selectedTile,
    selectedBlock,
    hoverCell,
    isBlockMenuOpen,
    showInstructions,
    showGrid,
    showPerformance,
    showLevelMenu,
    showZLevelManager,
    showHeightMap,
    showAtlasEditor,
    showResetConfirmation,
    showRenameDialog,
    currentZLevel,
    zLevelFilter,
    currentHeightMap,
    heightMapConfig,
    fillMode,
    collapsedGroups,
    levelNameInput,
    expandedCategory
  };
  
  // Compose actions object
  const actions: SanctuaryStateActions = {
    setBlocks,
    addBlock,
    removeBlock,
    updateBlock,
    setCamera,
    updateCamera,
    setSelectedTile,
    setSelectedBlock,
    setHoverCell,
    toggleBlockMenu,
    setBlockMenuOpen,
    toggleInstructions,
    setInstructionsVisible,
    toggleGrid,
    setGridVisible,
    togglePerformance,
    setPerformanceVisible,
    toggleLevelMenu,
    setLevelMenuVisible,
    toggleZLevelManager,
    setZLevelManagerVisible,
    toggleHeightMap,
    setHeightMapVisible,
    toggleAtlasEditor,
    setAtlasEditorVisible,
    setShowResetConfirmation,
    setShowRenameDialog,
    setCurrentZLevel,
    setZLevelFilter,
    removeZLevelFilter,
    setCurrentHeightMap,
    setHeightMapConfig,
    setFillMode,
    toggleGroupCollapse,
    setLevelNameInput,
    setExpandedCategory,
    setCurrentLevel,
    updateCurrentLevel
  };
  
  return [state, actions];
}; 