import '@testing-library/jest-dom';

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Create a proper localStorage mock that actually stores data
const createLocalStorageMock = () => {
  let store: { [key: string]: string } = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(),
  };
};

const localStorageMock = createLocalStorageMock();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock StorageService with proper singleton pattern - MUST BE FIRST
const mockStorageService: any = {
  getTasks: jest.fn(() => [
    {
      id: '1',
      title: 'Workout',
      description: 'Daily exercise routine',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      priority: 'high' as const,
      categories: ['body'],
      statRewards: { body: 1, xp: 10 },
      difficulty: 3
    },
    {
      id: '2',
      title: 'Study Programming',
      description: 'Learn React development',
      completed: false,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      priority: 'medium' as const,
      categories: ['mind'],
      statRewards: { mind: 1, xp: 10 },
      difficulty: 2
    },
    {
      id: '3',
      title: 'Read Book',
      description: 'Read 30 minutes',
      completed: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      priority: 'low' as const,
      categories: ['soul'],
      statRewards: { soul: 1, xp: 5 },
      difficulty: 1
    }
  ]),
  saveTasks: jest.fn(() => true),
  getHabits: jest.fn(() => []),
  saveHabits: jest.fn(() => true),
  getUser: jest.fn(() => ({
    id: 'user_1',
    name: 'Test User',
    level: 1,
    experience: 0,
    body: 0,
    mind: 0,
    soul: 0,
    achievements: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  })),
  saveUser: jest.fn(() => true),
  getSettings: jest.fn(() => ({})),
  saveSettings: jest.fn(() => true),
  getGenericItem: jest.fn(() => null),
  setGenericItem: jest.fn(() => true),
  removeGenericItem: jest.fn(() => true),
  createBackup: jest.fn(() => ({ tasks: [], habits: [], user: null, settings: {} })),
  saveBackup: jest.fn(() => true),
  getBackup: jest.fn(() => null),
  restoreFromBackup: jest.fn(() => true),
  exportData: jest.fn(() => '{}'),
  importData: jest.fn(() => true),
  clearAllData: jest.fn(() => true),
  getStorageStats: jest.fn(() => ({
    used: 1024,
    available: 5 * 1024 * 1024,
    percentage: 0.02,
  })),
};

// Mock StorageService class and singleton
jest.mock('./services/storageService', () => ({
  StorageService: {
    getInstance: jest.fn(() => mockStorageService),
  },
  storageService: mockStorageService,
  STORAGE_KEYS: {
    TASKS: 'scrypture_tasks',
    HABITS: 'scrypture_habits',
    USER: 'scrypture_user',
    ACHIEVEMENTS: 'scrypture_achievements',
    SETTINGS: 'scrypture_settings',
    BACKUP: 'scrypture_backup',
  },
}));

// Mock services that depend on StorageService
jest.mock('./services/taskService', () => ({
  taskService: {
    getTasks: jest.fn(() => [
      {
        id: '1',
        title: 'Workout',
        description: 'Daily exercise routine',
        completed: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        priority: 'high' as const,
        categories: ['body'],
        statRewards: { body: 1, xp: 10 },
        difficulty: 3
      },
      {
        id: '2',
        title: 'Study Programming',
        description: 'Learn React development',
        completed: false,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        priority: 'medium' as const,
        categories: ['mind'],
        statRewards: { mind: 1, xp: 10 },
        difficulty: 2
      },
      {
        id: '3',
        title: 'Read Book',
        description: 'Read 30 minutes',
        completed: false,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        priority: 'low' as const,
        categories: ['soul'],
        statRewards: { soul: 1, xp: 5 },
        difficulty: 1
      }
    ]),
    saveTasks: jest.fn(() => true),
    clearTasks: jest.fn(() => true),
    createTask: jest.fn((taskData) => ({
      id: `task_${Date.now()}`,
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    addTask: jest.fn(() => true),
    updateTask: jest.fn(() => true),
    toggleTask: jest.fn(() => true),
  },
}));

jest.mock('./services/userService', () => ({
  userService: {
    getUser: jest.fn(() => ({
      id: 'user_1',
      name: 'Test User',
      level: 1,
      experience: 0,
      body: 0,
      mind: 0,
      soul: 0,
      achievements: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    })),
    saveUser: jest.fn(() => true),
    createUser: jest.fn(() => ({
      id: 'user_1',
      name: 'Test User',
      level: 1,
      experience: 0,
      body: 0,
      mind: 0,
      soul: 0,
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    addExperience: jest.fn(() => true),
    addStatRewards: jest.fn(() => true),
    removeStatRewards: jest.fn(() => true),
    unlockAchievement: jest.fn(() => true),
    getStorageStats: jest.fn(() => ({ used: 1024, available: 5 * 1024 * 1024, percentage: 0.02 })),
  },
}));

jest.mock('./services/categoryService', () => ({
  categoryService: {
    getCustomCategories: jest.fn(() => []),
    addCustomCategory: jest.fn(() => true),
    getAllCategories: jest.fn(() => [
      { name: 'body', icon: '💪', color: 'var(--color-body)' },
      { name: 'mind', icon: '🧠', color: 'var(--color-mind)' },
      { name: 'soul', icon: '✨', color: 'var(--color-soul)' },
      { name: 'home', icon: '🏠', color: 'var(--color-home)' },
      { name: 'work', icon: '💼', color: 'var(--color-work)' },
    ]),
  },
}));

jest.mock('./services/habitService', () => ({
  habitService: {
    getHabits: jest.fn(() => []),
    saveHabits: jest.fn(() => true),
    addHabit: jest.fn((habitData) => ({
      id: `habit_${Date.now()}`,
      ...habitData,
      streak: 0,
      lastCompleted: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    completeHabit: jest.fn(() => true),
  },
}));
