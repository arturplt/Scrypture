# Scrypture 🚀

*A mystical habit-tracking app with AI companion Bóbr*

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Status](https://img.shields.io/badge/status-MVP_Development-yellow)
![Auto-Save](https://img.shields.io/badge/auto--save-Enabled-green)
![Last Updated](https://img.shields.io/badge/last_updated-2024-01-15-orange)

## ✨ Features

- **Task Management**: Create, edit, delete, and track tasks with auto-save
- **Habit Tracking**: Daily habit check-ins with streak counting and persistence
- **Progress System**: Experience points and level progression with real-time saving
- **Bóbr Companion**: AI-powered guidance and motivation
- **Mystical Theme**: Beautiful UI with magical aesthetics
- **Auto-Save**: Real-time data persistence with visual feedback
- **Data Management**: Backup, restore, export, and import functionality

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: CSS Modules + CSS Variables
- **State Management**: React Context + Enhanced Local Storage
- **Data Persistence**: Auto-save system with visual feedback
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/scrypture.git
   cd scrypture
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev -- --host
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔄 Auto-Save System

Scrypture features a comprehensive auto-save system that ensures your data is never lost:

### **Real-Time Persistence**
- ✅ **Instant Saves**: All changes are saved immediately
- ✅ **Visual Feedback**: See save status in real-time
- ✅ **Non-blocking**: UI remains responsive during saves
- ✅ **Error Handling**: Graceful handling of save failures

### **Auto-Save Triggers**
- **Task Operations**: Create, update, toggle, delete tasks
- **Habit Operations**: Create, update, complete, delete habits
- **User Operations**: Profile updates, experience points, achievements

### **Data Management**
- **Backup/Restore**: Create and restore from backups
- **Export/Import**: Download and upload data as JSON
- **Storage Monitoring**: Track usage and limits
- **Clear Data**: Reset all data when needed

## 📚 Documentation

- [Quick Start Guide](Docs/quick-start-guide.md) - Get started in 30 minutes
- [Database Setup Guide](Docs/database-setup-guide.md) - Complete persistence guide
- [Development Guide](Docs/06-development-guide.md) - Detailed development instructions
- [API Reference](Docs/04-api-reference.md) - Component and service documentation
- [MVP Features](Docs/02-mvp-features.md) - Feature specifications

## 🧪 Testing

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 🔧 Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check code quality
npm run type-check   # TypeScript check
npm run format       # Format code
```

## 📁 Project Structure

```
scrypture/
├── src/
│   ├── components/     # React components
│   │   ├── DataManager.tsx        # Data management UI
│   │   ├── AutoSaveIndicator.tsx  # Save status feedback
│   │   └── ...                    # Other components
│   ├── hooks/         # Custom React hooks with auto-save
│   │   ├── useTasks.tsx           # Task management
│   │   ├── useHabits.tsx          # Habit tracking
│   │   └── useUser.tsx            # User data
│   ├── services/      # Business logic and persistence
│   │   ├── storageService.ts      # Enhanced storage
│   │   ├── taskService.ts         # Task operations
│   │   ├── habitService.ts        # Habit operations
│   │   └── userService.ts         # User operations
│   ├── types/         # TypeScript definitions
│   ├── utils/         # Helper functions
│   └── styles/        # CSS modules
├── public/            # Static assets
├── docs/              # Documentation
└── tests/             # Test files
```

## 🔄 Data Persistence Features

### **Enhanced Local Storage**
- **Data Validation**: All data is validated before storage
- **Error Handling**: Graceful handling of storage errors
- **Cross-browser Support**: Works across different browsers
- **Type Safety**: Full TypeScript support

### **Auto-Save System**
- **Immediate Persistence**: All changes saved instantly
- **Visual Feedback**: Real-time save status indicators
- **Performance Optimized**: Non-blocking save operations
- **State Consistency**: UI remains responsive during saves

### **Data Management**
- **Backup System**: Automatic and manual backup creation
- **Export/Import**: JSON data export and import
- **Storage Monitoring**: Usage statistics and limits
- **Clear Data**: Reset functionality with confirmation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the mystical and magical
- Built with modern web technologies
- Designed for developer productivity
- Enhanced with robust data persistence

---

*"Every great developer started with their first commit. Welcome to the Scrypture community!"* 🚀✨ 