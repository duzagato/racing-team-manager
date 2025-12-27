# Racing Team Manager - F1 Manager Desktop Simulator

A Formula 1 team management simulator built with Electron, Vite, and SQLite.

## 🏎️ Features

- Desktop application built with Electron
- Modern UI with SCSS styling
- SQLite database for game state persistence
- Layered architecture (Application, Domain, Infrastructure)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Build and run in development mode
npm run electron:dev
```

### Building

```bash
# Build the application
npm run build
```

This will create:
- `dist/` - Bundled frontend assets
- `dist-electron/` - Compiled Electron main process
- `release/` - Packaged application (AppImage, Snap)

## 📁 Project Structure

```
src/
├── application/          # Frontend layer (HTML, SCSS, JavaScript)
│   ├── index.html       # Main menu UI
│   ├── scripts/         # Frontend JavaScript
│   └── styles/          # SCSS stylesheets
├── domain/              # Game logic and services
│   └── game-service.js  # Main game service (placeholder)
├── infrastructure/      # External concerns (database, etc.)
│   └── database.js      # SQLite connection management
├── main.js             # Electron main process
└── preload.js          # Electron preload script

```

## 🎮 Current Features

- **Main Menu** with three options:
  - 🏎️ Novo Jogo (New Game)
  - ▶️ Continuar (Continue)
  - 🚪 Sair (Exit)

## 🛠️ Tech Stack

- **Electron** - Desktop application framework
- **Vite** - Build tool and bundler
- **SQLite (better-sqlite3)** - Database
- **SCSS** - Styling
- **Electron Builder** - Application packaging

## 📝 License

ISC