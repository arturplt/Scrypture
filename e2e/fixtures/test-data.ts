export interface TestTask {
  title: string;
  description?: string;
  category?: string;
  completed?: boolean;
}

export interface TestHabit {
  title: string;
  description?: string;
  category?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak?: number;
}

export interface TestUser {
  name: string;
  level: number;
  experience: number;
  achievements: string[];
}

export const sampleTasks: TestTask[] = [
  {
    title: 'Complete E2E testing setup',
    description: 'Set up Playwright for end-to-end testing',
    category: 'development',
    completed: false,
  },
  {
    title: 'Practice synthesizer',
    description: 'Learn new chord progression',
    category: 'music',
    completed: false,
  },
  {
    title: 'Morning exercise',
    description: '30 minutes of cardio',
    category: 'body',
    completed: true,
  },
];

export const sampleHabits: TestHabit[] = [
  {
    title: 'Daily meditation',
    description: '10 minutes of mindfulness',
    category: 'mind',
    frequency: 'daily',
    streak: 5,
  },
  {
    title: 'Weekly guitar practice',
    description: 'Practice for 1 hour',
    category: 'music',
    frequency: 'weekly',
    streak: 3,
  },
  {
    title: 'Monthly goal review',
    description: 'Review and adjust goals',
    category: 'mind',
    frequency: 'monthly',
    streak: 2,
  },
];

export const sampleUser: TestUser = {
  name: 'Test User',
  level: 3,
  experience: 750,
  achievements: ['First Task', 'Habit Master', 'Synthesizer Explorer'],
};

export const synthesizerTestData = {
  notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
  tracks: [
    { name: 'Melody', instrument: 'piano', notes: ['C4', 'E4', 'G4'] },
    { name: 'Bass', instrument: 'bass', notes: ['C3', 'G3'] },
  ],
}; 