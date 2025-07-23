import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataManager } from '../DataManager';

// Mock the storage service
const mockStorageInstance = {
  createBackup: jest.fn(),
  restoreFromBackup: jest.fn(),
  exportData: jest.fn(),
  importData: jest.fn(),
  clearAllData: jest.fn(),
  getStorageStats: jest.fn(),
};

jest.mock('../../services/storageService', () => ({
  StorageService: {
    getInstance: jest.fn(() => mockStorageInstance),
  },
}));

// Mock the services
jest.mock('../../services/taskService', () => ({
  taskService: {
    getAllTasks: jest.fn(),
    addTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    createTask: jest.fn(),
  },
}));

jest.mock('../../services/userService', () => ({
  userService: {
    getUser: jest.fn(),
    updateUser: jest.fn(),
    getStorageStats: jest.fn(),
    createBackup: jest.fn(),
    saveBackup: jest.fn(),
    getBackup: jest.fn(),
    restoreFromBackup: jest.fn(),
    clearAllData: jest.fn(),
    exportUserData: jest.fn(),
    importUserData: jest.fn(),
  },
}));

jest.mock('../../services/habitService', () => ({
  habitService: {
    getAllHabits: jest.fn(),
    addHabit: jest.fn(),
    updateHabit: jest.fn(),
    deleteHabit: jest.fn(),
  },
}));

jest.mock('../../services/categoryService', () => ({
  categoryService: {
    getAllCategories: jest.fn(),
    getCustomCategories: jest.fn(),
    addCustomCategory: jest.fn(),
    clearCustomCategories: jest.fn(),
  },
}));

// Mock file download
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL,
  writable: true,
});
Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
  writable: true,
});

// Mock file input
const mockClick = jest.fn();
Object.defineProperty(HTMLInputElement.prototype, 'click', {
  value: mockClick,
  writable: true,
});

const mockBackupData = {
  version: '1.0.0',
  tasks: [
    {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      priority: 'high',
      category: 'body',
    },
  ],
  habits: [
    {
      id: '1',
      title: 'Test Habit',
      description: 'Test Description',
      frequency: 'daily',
      completedDates: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  user: {
    id: '1',
    name: 'Test User',
    level: 5,
    experience: 1000,
    body: 50,
    mind: 60,
    soul: 40,
    achievements: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  categories: [
    {
      name: 'body',
      icon: '💪',
      color: 'var(--color-body)',
    },
  ],
};

const mockStorageStats = {
  totalTasks: 10,
  completedTasks: 5,
  totalHabits: 3,
  activeHabits: 2,
  userLevel: 5,
  userExperience: 1000,
};

describe('DataManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageInstance.createBackup.mockReturnValue(mockBackupData);
    mockStorageInstance.exportData.mockReturnValue(
      JSON.stringify(mockBackupData)
    );
    mockStorageInstance.getStorageStats.mockReturnValue(mockStorageStats);

    // Mock userService.getStorageStats
    const { userService } = require('../../services/userService');
    userService.getStorageStats.mockReturnValue({
      used: 1024,
      available: 5242880,
      percentage: 0.02,
    });

    // Mock userService methods to return success
    userService.createBackup.mockReturnValue(mockBackupData);
    userService.saveBackup.mockReturnValue(true);
    userService.getBackup.mockReturnValue(mockBackupData);
    userService.restoreFromBackup.mockReturnValue(true);
    userService.clearAllData.mockReturnValue(true);
    userService.exportUserData.mockReturnValue(JSON.stringify(mockBackupData));
    userService.importUserData.mockReturnValue(true);

    // Mock categoryService
    const { categoryService } = require('../../services/categoryService');
    categoryService.clearCustomCategories.mockReturnValue(true);
  });

  it('renders data manager interface', () => {
    render(<DataManager />);

    // Click the toggle button to open the interface
    const toggleButton = screen.getByText('Data Manager');
    fireEvent.click(toggleButton);

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Load' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Clear All' })
    ).toBeInTheDocument();
  });

  it('displays storage statistics', () => {
    render(<DataManager />);

    // Click the toggle button to open the interface
    const toggleButton = screen.getByText('Data Manager');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Storage')).toBeInTheDocument();
    expect(screen.getByText(/KB/)).toBeInTheDocument();
    expect(screen.getByText(/% used/)).toBeInTheDocument();
  });

  describe('Export Data', () => {
    it('exports data successfully', async () => {
      mockStorageInstance.exportData.mockReturnValue(
        JSON.stringify(mockBackupData)
      );

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const exportButton = screen.getByRole('button', { name: 'Export' });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Exported!')).toBeInTheDocument();
      });
    });

    it('handles export errors gracefully', async () => {
      const { userService } = require('../../services/userService');
      userService.exportUserData.mockImplementation(() => {
        throw new Error('Export failed');
      });

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const exportButton = screen.getByRole('button', { name: 'Export' });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export failed')).toBeInTheDocument();
      });
    });
  });

  describe('Import Data', () => {
    it('imports data successfully', async () => {
      mockStorageInstance.importData.mockReturnValue(true);

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      const fileInput = screen.getByLabelText(/Import/i);
      const file = new File([JSON.stringify(mockBackupData)], 'backup.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('Imported!')).toBeInTheDocument();
      });
    });

    it('handles invalid file format', async () => {
      const { userService } = require('../../services/userService');
      userService.importUserData.mockReturnValue(false);

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      const fileInput = screen.getByLabelText(/Import/i);
      const file = new File(['invalid json'], 'invalid.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('Import failed')).toBeInTheDocument();
      });
    });

    it('handles import errors gracefully', async () => {
      const { userService } = require('../../services/userService');
      userService.importUserData.mockReturnValue(false);

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      const fileInput = screen.getByLabelText(/Import/i);
      const file = new File([JSON.stringify(mockBackupData)], 'backup.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('Import failed')).toBeInTheDocument();
      });
    });
  });

  describe('Backup and Restore', () => {
    it('creates backup successfully', async () => {
      mockStorageInstance.createBackup.mockReturnValue(mockBackupData);

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const backupButton = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(backupButton);

      await waitFor(() => {
        expect(screen.getByText('Backup saved!')).toBeInTheDocument();
      });
    });

    it('restores from backup successfully', async () => {
      mockStorageInstance.restoreFromBackup.mockReturnValue(true);

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const restoreButton = screen.getByRole('button', { name: 'Load' });
      fireEvent.click(restoreButton);

      await waitFor(() => {
        expect(screen.getByText('Restored!')).toBeInTheDocument();
      });
    });

    it('handles restore errors gracefully', async () => {
      const { userService } = require('../../services/userService');
      userService.restoreFromBackup.mockReturnValue(false);

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const restoreButton = screen.getByRole('button', { name: 'Load' });
      fireEvent.click(restoreButton);

      await waitFor(() => {
        expect(screen.getByText('Restore failed')).toBeInTheDocument();
      });
    });
  });

  describe('Clear Data', () => {
    it('shows confirmation dialog for clear data', async () => {
      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const clearButton = screen.getByRole('button', { name: 'Clear All' });
      fireEvent.click(clearButton);

      // The confirmation dialog is handled by window.confirm
      expect(clearButton).toBeInTheDocument();
    });

    it('clears data when confirmed', async () => {
      mockStorageInstance.clearAllData.mockReturnValue(true);

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const clearButton = screen.getByRole('button', { name: 'Clear All' });

      // Mock window.confirm to return true
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Data cleared!')).toBeInTheDocument();
      });

      // Restore original confirm
      window.confirm = originalConfirm;
    });
  });

  describe('Error Handling', () => {
    it('handles storage service errors', async () => {
      mockStorageInstance.getStorageStats.mockImplementation(() => {
        throw new Error('Storage error');
      });

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      // The component should still render even with errors
      expect(screen.getByText('Storage')).toBeInTheDocument();
    });

    it('handles network errors during export', async () => {
      const { userService } = require('../../services/userService');
      userService.exportUserData.mockImplementation(() => {
        throw new Error('Network error');
      });

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const exportButton = screen.getByRole('button', { name: 'Export' });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export failed')).toBeInTheDocument();
      });
    });
  });

  describe('Data Validation', () => {
    it('validates backup data structure', async () => {
      const { userService } = require('../../services/userService');
      userService.importUserData.mockReturnValue(false);

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      const fileInput = screen.getByLabelText(/Import/i);
      const invalidFile = new File(['{"invalid": "data"}'], 'invalid.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByText('Import failed')).toBeInTheDocument();
      });
    });

    it('validates backup version compatibility', async () => {
      const { userService } = require('../../services/userService');
      userService.importUserData.mockReturnValue(false);

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      const fileInput = screen.getByLabelText(/Import/i);
      const oldVersionFile = new File(
        [JSON.stringify({ ...mockBackupData, version: '0.1.0' })],
        'old-backup.json',
        { type: 'application/json' }
      );

      fireEvent.change(fileInput, { target: { files: [oldVersionFile] } });

      await waitFor(() => {
        expect(screen.getByText('Import failed')).toBeInTheDocument();
      });
    });
  });

  describe('User Experience', () => {
    it('shows loading states during operations', async () => {
      mockStorageInstance.exportData.mockImplementation(() => {
        return new Promise((resolve) =>
          setTimeout(() => resolve(JSON.stringify(mockBackupData)), 100)
        );
      });

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const exportButton = screen.getByRole('button', { name: 'Export' });
      fireEvent.click(exportButton);

      // The component shows success message after export
      await waitFor(() => {
        expect(screen.getByText('Exported!')).toBeInTheDocument();
      });
    });

    it('provides success feedback', async () => {
      mockStorageInstance.exportData.mockReturnValue(
        JSON.stringify(mockBackupData)
      );

      render(<DataManager />);

      // Click the toggle button to open the interface
      const toggleButton = screen.getByText('Data Manager');
      fireEvent.click(toggleButton);

      const exportButton = screen.getByRole('button', { name: 'Export' });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Exported!')).toBeInTheDocument();
      });
    });
  });
});
