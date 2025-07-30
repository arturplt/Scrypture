// Debug script to test XP functionality
console.log('🔍 Debugging XP functionality...');

// Test user creation
const testUserCreation = () => {
  console.log('1. Testing user creation...');
  
  // Clear any existing user data
  localStorage.removeItem('user');
  
  // Create a test user
  const testUser = {
    id: 'test-user-1',
    name: 'TestUser',
    level: 1,
    experience: 0,
    body: 0,
    mind: 0,
    soul: 0,
    achievements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    bobrStage: 'hatchling',
    damProgress: 0,
  };
  
  localStorage.setItem('user', JSON.stringify(testUser));
  console.log('✅ Test user created:', testUser);
  return testUser;
};

// Test task creation
const testTaskCreation = () => {
  console.log('2. Testing task creation...');
  
  const testTask = {
    id: 'test-task-1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    priority: 'medium',
    categories: ['personal'],
    statRewards: {
      xp: 15,
      body: 2,
      mind: 1,
      soul: 0,
    },
    difficulty: 3,
  };
  
  // Get existing tasks or create empty array
  const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const updatedTasks = [...existingTasks, testTask];
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  
  console.log('✅ Test task created:', testTask);
  return testTask;
};

// Test XP addition
const testXPAddition = () => {
  console.log('3. Testing XP addition...');
  
  // Get current user
  const userData = localStorage.getItem('user');
  if (!userData) {
    console.error('❌ No user found');
    return;
  }
  
  const user = JSON.parse(userData);
  console.log('👤 Current user before XP:', user);
  
  // Add XP
  const xpToAdd = 15;
  const newExperience = user.experience + xpToAdd;
  const newLevel = Math.floor(newExperience / 100) + 1;
  
  const updatedUser = {
    ...user,
    experience: newExperience,
    level: newLevel,
    updatedAt: new Date(),
  };
  
  localStorage.setItem('user', JSON.stringify(updatedUser));
  console.log('✅ XP added successfully:', {
    oldXP: user.experience,
    newXP: updatedUser.experience,
    oldLevel: user.level,
    newLevel: updatedUser.level,
    xpAdded: xpToAdd
  });
  
  return updatedUser;
};

// Test task completion
const testTaskCompletion = () => {
  console.log('4. Testing task completion...');
  
  // Get tasks
  const tasksData = localStorage.getItem('tasks');
  if (!tasksData) {
    console.error('❌ No tasks found');
    return;
  }
  
  const tasks = JSON.parse(tasksData);
  const testTask = tasks.find(t => t.id === 'test-task-1');
  
  if (!testTask) {
    console.error('❌ Test task not found');
    return;
  }
  
  console.log('📋 Test task before completion:', testTask);
  
  // Mark task as completed
  const updatedTask = {
    ...testTask,
    completed: true,
    updatedAt: new Date(),
    completedAt: new Date(),
  };
  
  const updatedTasks = tasks.map(t => t.id === 'test-task-1' ? updatedTask : t);
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  
  console.log('✅ Task marked as completed:', updatedTask);
  
  // Now add XP for completion
  if (updatedTask.statRewards && updatedTask.statRewards.xp) {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const xpToAdd = updatedTask.statRewards.xp;
      const newExperience = user.experience + xpToAdd;
      const newLevel = Math.floor(newExperience / 100) + 1;
      
      const updatedUser = {
        ...user,
        experience: newExperience,
        level: newLevel,
        updatedAt: new Date(),
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ XP added for task completion:', {
        taskTitle: updatedTask.title,
        xpReward: xpToAdd,
        oldXP: user.experience,
        newXP: updatedUser.experience,
        oldLevel: user.level,
        newLevel: updatedUser.level
      });
    }
  }
};

// Run all tests
console.log('🚀 Starting XP functionality tests...\n');

const user = testUserCreation();
const task = testTaskCreation();
const userAfterXP = testXPAddition();
testTaskCompletion();

console.log('\n📊 Final Results:');
console.log('User:', JSON.parse(localStorage.getItem('user')));
console.log('Tasks:', JSON.parse(localStorage.getItem('tasks')));

console.log('\n✅ XP functionality test completed!'); 