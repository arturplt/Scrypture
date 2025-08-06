import { useState, useCallback, useEffect } from 'react';
import { SanctuaryState, SanctuaryStateActions } from './useSanctuaryState';
import { Level } from '../types/Level';
import { LevelManager } from '../utils/LevelManager';

export interface LevelManagementState {
  savedLevels: Level[];
  currentLevelId: string | null;
  isSaving: boolean;
  isLoading: boolean;
  saveError: string | null;
  loadError: string | null;
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  lastAutoSave: Date | null;
}

export interface LevelManagementActions {
  // Level operations
  saveLevel: (level?: Level) => Promise<boolean>;
  loadLevel: (levelId: string) => Promise<boolean>;
  createNewLevel: (name?: string, description?: string) => Promise<boolean>;
  deleteLevel: (levelId: string) => Promise<boolean>;
  duplicateLevel: (levelId: string, newName?: string) => Promise<boolean>;
  renameLevel: (levelId: string, newName: string) => Promise<boolean>;
  
  // Level management
  refreshLevelList: () => Promise<void>;
  exportLevel: (levelId: string) => Promise<string>;
  importLevel: (levelData: string) => Promise<boolean>;
  
  // Auto-save management
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  triggerAutoSave: () => Promise<void>;
  
  // Error handling
  clearSaveError: () => void;
  clearLoadError: () => void;
  
  // Utility functions
  getLevelById: (levelId: string) => Level | undefined;
  getLevelByName: (name: string) => Level | undefined;
  isLevelModified: (levelId: string) => boolean;
  renameCurrentLevel: (newName: string) => Promise<boolean>;
}

export const useLevelManagement = (
  state: SanctuaryState,
  stateActions: SanctuaryStateActions
): [LevelManagementState, LevelManagementActions] => {
  // Level management state
  const [savedLevels, setSavedLevels] = useState<Level[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30000); // 30 seconds
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  
  // Level manager (static class, no instantiation needed)
  
  // Save level
  const saveLevel = useCallback(async (level?: Level): Promise<boolean> => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const levelToSave = level || {
        ...state.currentLevel,
        blocks: state.blocks,
        camera: state.camera,
        modifiedAt: new Date()
      };
      
      LevelManager.saveLevel(levelToSave);
      
      setCurrentLevelId(levelToSave.id);
      
      // Refresh the level list directly
      try {
        const levels = LevelManager.getAllLevels();
        setSavedLevels(levels);
      } catch (error) {
        console.error('Failed to refresh level list:', error);
      }
      
      setLastAutoSave(new Date());
      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unknown error occurred');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [state.currentLevel, state.blocks, state.camera]);
  
  // Load level
  const loadLevel = useCallback(async (levelId: string): Promise<boolean> => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const level = LevelManager.loadLevel(levelId);
      
      if (level) {
        stateActions.setCurrentLevel(level);
        stateActions.setBlocks(level.blocks || []);
        stateActions.setCamera(level.camera || { position: { x: 0, y: 0, z: 0 }, zoom: 2, rotation: 0 });
        setCurrentLevelId(levelId);
        return true;
      } else {
        setLoadError('Failed to load level');
        return false;
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unknown error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [stateActions]);
  
  // Create new level
  const createNewLevel = useCallback(async (name?: string, description?: string): Promise<boolean> => {
    const newLevel: Level = {
      id: `level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name || 'New Level',
      description: description || 'A new sanctuary level',
      author: 'Player',
      createdAt: new Date(),
      modifiedAt: new Date(),
      blocks: [],
      camera: { position: { x: 0, y: 0, z: 0 }, zoom: 2, rotation: 0 },
      settings: { gravity: true }
    };
    
    stateActions.setCurrentLevel(newLevel);
    stateActions.setBlocks([]);
    stateActions.setCamera(newLevel.camera);
    setCurrentLevelId(newLevel.id);
    
    // Save the level directly without calling saveLevel to avoid circular dependency
    try {
      LevelManager.saveLevel(newLevel);
      
      // Refresh the level list directly
      try {
        const levels = LevelManager.getAllLevels();
        setSavedLevels(levels);
      } catch (error) {
        console.error('Failed to refresh level list:', error);
      }
      
      setLastAutoSave(new Date());
      return true;
    } catch (error) {
      return false;
    }
  }, [stateActions]);
  
  // Delete level
  const deleteLevel = useCallback(async (levelId: string): Promise<boolean> => {
    try {
      const success = LevelManager.deleteLevel(levelId);
      
      if (success) {
        if (currentLevelId === levelId) {
          // If we deleted the current level, create a new one
          await createNewLevel();
        } else {
          // Refresh the level list directly
          try {
            const levels = LevelManager.getAllLevels();
            setSavedLevels(levels);
          } catch (error) {
            console.error('Failed to refresh level list:', error);
          }
        }
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }, [currentLevelId, createNewLevel]);
  
  // Duplicate level
  const duplicateLevel = useCallback(async (levelId: string, newName?: string): Promise<boolean> => {
    try {
      const originalLevel = LevelManager.loadLevel(levelId);
      
      if (originalLevel) {
        const duplicatedLevel: Level = {
          ...originalLevel,
          id: `level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: newName || `${originalLevel.name} (Copy)`,
          createdAt: new Date(),
          modifiedAt: new Date()
        };
        
        LevelManager.saveLevel(duplicatedLevel);
        
        // Refresh the level list directly
        try {
          const levels = LevelManager.getAllLevels();
          setSavedLevels(levels);
        } catch (error) {
          console.error('Failed to refresh level list:', error);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }, []);
  
  // Rename level
  const renameLevel = useCallback(async (levelId: string, newName: string): Promise<boolean> => {
    try {
      const level = LevelManager.loadLevel(levelId);
      
      if (level) {
        const renamedLevel: Level = {
          ...level,
          name: newName,
          modifiedAt: new Date()
        };
        
        LevelManager.saveLevel(renamedLevel);
        
        if (currentLevelId === levelId) {
          stateActions.updateCurrentLevel({ name: newName });
        }
        
        // Refresh the level list directly
        try {
          const levels = LevelManager.getAllLevels();
          setSavedLevels(levels);
        } catch (error) {
          console.error('Failed to refresh level list:', error);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }, [currentLevelId, stateActions]);
  
  // Refresh level list
  const refreshLevelList = useCallback(async (): Promise<void> => {
    try {
      const levels = LevelManager.getAllLevels();
      setSavedLevels(levels);
    } catch (error) {
      console.error('Failed to refresh level list:', error);
    }
  }, []);
  
  // Export level
  const exportLevel = useCallback(async (levelId: string): Promise<string> => {
    try {
      const level = LevelManager.loadLevel(levelId);
      if (level) {
        return JSON.stringify(level, null, 2);
      }
      throw new Error('Level not found');
    } catch (error) {
      throw new Error('Failed to export level');
    }
  }, []);
  
  // Import level
  const importLevel = useCallback(async (levelData: string): Promise<boolean> => {
    try {
      const level: Level = JSON.parse(levelData);
      
      // Validate level structure
      if (!level.id || !level.name) {
        throw new Error('Invalid level data');
      }
      
      // Generate new ID to avoid conflicts
      level.id = `level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      level.createdAt = new Date();
      level.modifiedAt = new Date();
      
      LevelManager.saveLevel(level);
      
      // Refresh the level list directly
      try {
        const levels = LevelManager.getAllLevels();
        setSavedLevels(levels);
      } catch (error) {
        console.error('Failed to refresh level list:', error);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }, []);
  
  // Auto-save management
  const triggerAutoSave = useCallback(async (): Promise<void> => {
    if (autoSaveEnabled && currentLevelId) {
      await saveLevel();
    }
  }, [autoSaveEnabled, currentLevelId, saveLevel]);
  
  // Error handling
  const clearSaveError = useCallback(() => {
    setSaveError(null);
  }, []);
  
  const clearLoadError = useCallback(() => {
    setLoadError(null);
  }, []);
  
  // Utility functions
  const getLevelById = useCallback((levelId: string): Level | undefined => {
    return savedLevels.find(level => level.id === levelId);
  }, [savedLevels]);
  
  const getLevelByName = useCallback((name: string): Level | undefined => {
    return savedLevels.find(level => level.name === name);
  }, [savedLevels]);
  
  const isLevelModified = useCallback((levelId: string): boolean => {
    const savedLevel = getLevelById(levelId);
    if (!savedLevel) return false;
    
    // Compare with current state
    return (
      JSON.stringify(savedLevel.blocks) !== JSON.stringify(state.blocks) ||
      JSON.stringify(savedLevel.camera) !== JSON.stringify(state.camera)
    );
  }, [getLevelById, state.blocks, state.camera]);
  
  // Rename current level
  const renameCurrentLevel = useCallback(async (newName: string): Promise<boolean> => {
    if (!currentLevelId) return false;
    
    try {
      const level = LevelManager.loadLevel(currentLevelId);
      
      if (level) {
        const renamedLevel: Level = {
          ...level,
          name: newName,
          modifiedAt: new Date()
        };
        
        LevelManager.saveLevel(renamedLevel);
        
        // Refresh the level list directly
        try {
          const levels = LevelManager.getAllLevels();
          setSavedLevels(levels);
        } catch (error) {
          console.error('Failed to refresh level list:', error);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }, [currentLevelId]);
  
  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const timeSinceLastSave = lastAutoSave ? now.getTime() - lastAutoSave.getTime() : autoSaveInterval;
      
      if (timeSinceLastSave >= autoSaveInterval) {
        triggerAutoSave();
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [autoSaveEnabled, autoSaveInterval, lastAutoSave, triggerAutoSave]);
  
  // Load saved levels on mount
  useEffect(() => {
    // Load saved levels directly without calling refreshLevelList to avoid circular dependency
    try {
      const levels = LevelManager.getAllLevels();
      setSavedLevels(levels);
    } catch (error) {
      console.error('Failed to load saved levels:', error);
    }
  }, []);
  
  // Compose state object
  const levelManagementState: LevelManagementState = {
    savedLevels,
    currentLevelId,
    isSaving,
    isLoading,
    saveError,
    loadError,
    autoSaveEnabled,
    autoSaveInterval,
    lastAutoSave
  };
  
  // Compose actions object
  const levelManagementActions: LevelManagementActions = {
    saveLevel,
    loadLevel,
    createNewLevel,
    deleteLevel,
    duplicateLevel,
    renameLevel,
    refreshLevelList,
    exportLevel,
    importLevel,
    setAutoSaveEnabled,
    setAutoSaveInterval,
    triggerAutoSave,
    clearSaveError,
    clearLoadError,
    getLevelById,
    getLevelByName,
    isLevelModified,
    renameCurrentLevel
  };
  
  return [levelManagementState, levelManagementActions];
}; 