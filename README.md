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
│   ├── index.html       # Main menu UI with New Game modal
│   ├── scripts/         # Frontend JavaScript
│   └── styles/          # SCSS stylesheets
├── domain/              # Game logic and services
│   └── game-service.js  # Main game service (placeholder)
├── infrastructure/      # External concerns (database, etc.)
│   ├── database.js      # SQLite connection management
│   ├── schema.js        # Database schema definition (11 tables)
│   └── saveManager.js   # Save creation, loading, and management
├── main.js             # Electron main process with IPC handlers
└── preload.js          # Electron preload script with API exposure

```

## 🎮 Current Features

- **Main Menu** with three options:
  - 🏎️ Novo Jogo (New Game) - Opens modal to create new save
  - ▶️ Continuar (Continue) - In development
  - 🚪 Sair (Exit) - Close application

### Save System

The game uses a robust save system with SQLite databases:

- **Template Database**: `userData/template.db` contains the base schema with all tables
- **Save Files**: Each game save is stored in `userData/saves/{slug}/game.db`
- **Slug Generation**: Save names are automatically converted to URL-friendly slugs
  - Example: "Minha Carreira 2024" → "minha-carreira-2024"
- **Database Tables**: 11 tables including teams, drivers, circuits, seasons, events, sessions, cars, and more

#### Database Schema

The game database includes:
- **teams** - Racing teams with budget, reputation, and factory levels
- **drivers** - Detailed driver attributes (16 skill metrics)
- **circuits** - Race tracks with GP names and distances
- **seasons** - Championship seasons
- **events** - Race events linking seasons and circuits
- **sessions** - Practice, qualifying, and race sessions
- **session_types** - Types of sessions (FP1, FP2, FP3, Quali, Race)
- **laps** - Individual lap times with sector splits
- **session_results** - Final positions per session
- **cars** - Car performance metrics per team/season
- **season_grid** - Driver-team assignments per season

## 🛠️ Tech Stack

- **Electron** - Desktop application framework
- **Vite** - Build tool and bundler
- **SQLite (better-sqlite3)** - Database
- **SCSS** - Styling
- **Electron Builder** - Application packaging

## 📝 License

ISC