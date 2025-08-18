# Quick Start Guide

**Version:** 1.0.0  
**Last Updated:** July 27, 2025  
**Status:** Active Development  

---

## 🚀 **Get Started in 5 Minutes**

Welcome to Scrypture! This guide will help you get up and running quickly, whether you're a new user exploring the app or a developer setting up the project.

---

## 👤 **For New Users**

### **1. First Launch**
1. **Open the app** at [scrypture.app](https://scrypture.app)
2. **Create your character** by entering your name
3. **Begin your journey** - complete the tutorial to understand the basics
4. **Create your first task** using the "Create Task" button

### **2. Core Features to Try**
- **Create a habit**: Toggle "Make it a Habit" when creating a task
- **Complete tasks**: Click the ✓ button to mark tasks complete
- **View achievements**: Click the 🏆 button to see unlockable achievements
- **Check stats**: Monitor your Body, Mind, and Soul progression
- **Explore themes**: Try different visual themes in the settings

### **3. Quick Tips**
- **Quick Start Bonus**: Start tasks within 3 minutes of creation for bonus XP
- **Streak building**: Complete habits daily to build streaks
- **Category organization**: Use categories to organize tasks by life area
- **Priority system**: Set task priority to focus on what matters most

---

## 👨‍💻 **For Developers**

### **1. Project Setup**
```bash
# Clone the repository
git clone https://github.com/arturplt/Scrypture.git
cd Scrypture

# Install dependencies
npm install

# Start development server
npm start
```

### **2. Development Environment**
- **Node.js**: v14 or higher
- **Package Manager**: npm or yarn
- **Editor**: VS Code with TypeScript support recommended
- **Browser**: Chrome/Edge for development tools

### **3. Key Development Commands**
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run test suite
npm run deploy     # Deploy to production
```

---

## 🎯 **Core Concepts**

### **Tasks vs Habits**
- **Tasks**: One-time actions to complete
- **Habits**: Recurring practices (daily, weekly, monthly)
- **Conversion**: Habits can be converted to tasks and vice versa

### **Experience System**
- **XP Rewards**: Earn experience for completing tasks
- **Level Progression**: Level up to unlock new features
- **Stat Rewards**: Gain Body, Mind, and Soul attributes
- **Quick Start Bonus**: +50% XP for starting tasks within 3 minutes

### **Achievement System**
- **15 Achievements**: Across 5 categories
- **Rarity Levels**: Common to Legendary
- **Auto-Unlock**: Achievements unlock automatically
- **Rewards**: XP and stat bonuses for achievements

---

## 🎮 **Feature Overview**

### **Task Management**
- **Create tasks** with title, description, and categories
- **Set priority** (Low, Medium, High, Critical)
- **Choose difficulty** (0-9 scale with Fibonacci XP rewards)
- **Organize by categories** (Body, Mind, Soul, Career, Home, Skills)
- **Drag and drop** tasks between categories

### **Habit System**
- **Frequency options**: Daily, Weekly, Monthly
- **Streak tracking**: Automatic streak calculation
- **Best streak recording**: Track your longest streak
- **Stat rewards**: Earn attributes on completion
- **Visual feedback**: Gold borders for active habits

### **Achievement System**
- **Progression**: Level and task completion milestones
- **Mastery**: Stat-based and difficulty achievements
- **Consistency**: Streak and daily completion achievements
- **Exploration**: Category and variety achievements
- **Special**: High-value and legendary achievements

### **Secret Features**
- **Combination Lock**: Code 2137 to unlock advanced tools
- **8-Bit Synthesizer**: Create music with keyboard shortcuts
- **Pixel Grid Converter**: Advanced image processing tool

---

## 🛠️ **Development Quick Start**

### **1. Project Structure**
```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # Business logic
├── types/              # TypeScript definitions
├── data/               # Static data and mappings
└── __tests__/          # Test files
```

### **2. Key Files to Know**
- `src/App.tsx` - Main application component
- `src/components/TaskForm.tsx` - Task creation form
- `src/hooks/useTasks.tsx` - Task state management
- `src/services/taskService.ts` - Task business logic
- `src/data/atlasMapping.ts` - UI asset mappings

### **3. Adding New Features**
```typescript
// 1. Create component
const NewFeature = () => {
  return <div>New Feature</div>;
};

// 2. Add to App.tsx
import NewFeature from './components/NewFeature';

// 3. Add tests
describe('NewFeature', () => {
  it('should render correctly', () => {
    // Test implementation
  });
});
```

---

## 🎨 **UI System**

### **Asset Management**
- **Atlas-based**: All UI elements in single texture sheet
- **Theme system**: Multiple visual themes available
- **Responsive design**: Works on desktop and mobile
- **CSS Modules**: Component-scoped styling

### **Component Library**
- **Frame components**: 9-slice scalable containers
- **Button components**: Multiple sizes and themes
- **Modal system**: Consistent dialog components
- **Form components**: Reusable input elements

### **Theme System**
- **Wood themes**: Natural and rustic
- **Stone themes**: Earthy and grounded
- **Tech themes**: Futuristic and digital
- **Mystical themes**: Magical and arcane

---

## 🧪 **Testing**

### **Running Tests**
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

### **Test Structure**
- **Unit tests**: Individual component testing
- **Integration tests**: Component interaction testing
- **E2E tests**: Full user workflow testing
- **Performance tests**: Load and rendering testing

### **Writing Tests**
```typescript
import { render, screen } from '@testing-library/react';
import TaskForm from '../TaskForm';

describe('TaskForm', () => {
  it('should create a task', () => {
    render(<TaskForm />);
    // Test implementation
  });
});
```

---

## 🚀 **Deployment**

### **Quick Deployment**
```bash
npm run deploy:auto    # Automated deployment
npm run deploy:force   # Force deployment with version bump
```

### **Deployment Monitoring**
- **Status page**: [scrypture.app/deployment-status.html](https://scrypture.app/deployment-status.html)
- **Force refresh**: [scrypture.app/force-deploy-refresh.html](https://scrypture.app/force-deploy-refresh.html)
- **GitHub Actions**: [github.com/arturplt/Scrypture/actions](https://github.com/arturplt/Scrypture/actions)

### **Environment Setup**
- **Development**: `npm start` (localhost:3000)
- **Staging**: Automatic deployment on main branch
- **Production**: Manual deployment with version control

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Development Server Won't Start**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be v14+
```

#### **Tests Failing**
```bash
# Clear test cache
npm test -- --clearCache

# Run specific test file
npm test TaskForm.test.tsx
```

#### **Build Errors**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Clear build cache
rm -rf dist/
npm run build
```

### **Performance Issues**
- **Large datasets**: Use virtualization for long lists
- **Memory leaks**: Check for unmounted component cleanup
- **Slow animations**: Verify CSS transform usage

### **Browser Compatibility**
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile browsers**: Responsive design support

---

## 📚 **Next Steps**

### **For Users**
1. **Complete the tutorial** to learn all features
2. **Create your first habit** and build a streak
3. **Explore achievements** and unlock new ones
4. **Try different themes** to personalize your experience
5. **Join the community** for tips and support

### **For Developers**
1. **Read the documentation** in the `Docs/` folder
2. **Explore the codebase** starting with key components
3. **Run the test suite** to understand functionality
4. **Try the asset system** for UI customization
5. **Contribute features** following the development guide

### **Learning Resources**
- **[01-overview.md](01-overview.md)** - Project overview and concepts
- **[06-development-guide.md](06-development-guide.md)** - Detailed development guide
- **[03-technical-specs.md](03-technical-specs.md)** - Technical architecture
- **[test-suite-documentation.md](test-suite-documentation.md)** - Testing guide

---

## 🆘 **Getting Help**

### **Documentation**
- **Main index**: [Docs/00-documentation-index.md](00-documentation-index.md)
- **API reference**: [Docs/04-api-reference.md](04-api-reference.md)
- **Troubleshooting**: [DEPLOYMENT_TROUBLESHOOTING.md](../DEPLOYMENT_TROUBLESHOOTING.md)

### **Community**
- **GitHub Issues**: [github.com/arturplt/Scrypture/issues](https://github.com/arturplt/Scrypture/issues)
- **Discussions**: [github.com/arturplt/Scrypture/discussions](https://github.com/arturplt/Scrypture/discussions)

### **Support**
- **Bug reports**: Use GitHub Issues with detailed descriptions
- **Feature requests**: Submit through GitHub Discussions
- **Documentation issues**: Create issues with `documentation` label

---

*"Every journey begins with a single step. In Scrypture, every step becomes a transformation, every task a triumph, and every habit a path to mastery."* 🚀✨ 