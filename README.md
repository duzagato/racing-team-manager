# Racing Team Manager 🏎️

A Formula 1 team manager game built with Electron, SQLite, and modern web technologies. Manage your F1 career, simulate races, and lead your team to championship glory!

## 🎯 Features

- **Career Mode**: Create and manage multiple F1 careers
- **Database Persistence**: Each career is stored in its own SQLite database with isolated userData
- **Race Simulation**: Advanced simulation engine with customizable balance parameters
- **Team Management**: Track teams, drivers, standings, and budgets
- **Modern UI**: Beautiful SCSS-styled interface with responsive design
- **Security-First**: Secure IPC communication with context isolation
- **Modular Architecture**: Clean DAO/Repository pattern for data access

## 🏗️ Architecture

### Main Process (Electron)
- **Simulation Engine**: Obfuscated logic isolated from UI
- **Career Manager**: Manages multiple careers with separate databases
- **DAO/Repository Pattern**: Clean data access layer
- **IPC Handlers**: Secure communication with renderer process

### Database (SQLite with better-sqlite3)
- **Template System**: Each career starts from a template database
- **Balance Parameters**: Easily adjustable game balance via SQL tables
- **Isolated Storage**: Each career stored in `userData/careers/{careerId}/`

### Frontend (Vite + SCSS)
- **Preload Script**: Secure API exposure via contextBridge
- **SCSS Styling**: Modern, maintainable stylesheets
- **Type-Safe**: TypeScript throughout the application

## 📁 Project Structure

```
racing-team-manager/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── database/
│   │   │   ├── dao/            # Data Access Objects
│   │   │   └── repositories/   # Repository pattern
│   │   ├── models/             # TypeScript interfaces
│   │   └── services/           # Business logic
│   ├── preload/                # Preload scripts for IPC
│   └── renderer/               # Frontend application
│       ├── styles/             # SCSS stylesheets
│       └── main.ts             # Main app logic
├── dist/                       # Build output
├── resources/                  # Application resources
└── node_modules/              # Dependencies (at root)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/duzagato/racing-team-manager.git
cd racing-team-manager

# Install dependencies
npm install

# Build the project
npm run build
```

### Development

```bash
# Start development server
npm run dev

# This runs both:
# - Vite dev server (http://localhost:5173)
# - Electron in development mode
```

### Production Build

```bash
# Build application
npm run build

# Package for distribution
npm run package
```

## 🎮 How to Play

1. **Create a Career**: Start by creating a new career with a name
2. **View Standings**: Check driver and constructor standings
3. **Manage Teams**: Review team stats and budgets
4. **Simulate Races**: Run race simulations and see results
5. **Advance Time**: Move forward week by week through the season

## 🔧 Configuration

### Balance Parameters

Game balance is controlled via SQL tables in the database. Key parameters:

- **Race Simulation**:
  - `skill_weight`: Driver skill impact (default: 0.4)
  - `car_weight`: Car performance impact (default: 0.35)
  - `luck_weight`: Random factor (default: 0.15)
  - `consistency_weight`: Driver consistency (default: 0.1)

- **Financial**:
  - `weekly_costs`: Operational costs per week
  - `race_prize_multiplier`: Prize money per position

- **Development**:
  - `cost_per_point`: Cost to improve car by 1 point
  - `max_improvement`: Maximum points improvement per season

## 🔒 Security Features

- **Context Isolation**: Enabled for renderer process
- **Node Integration**: Disabled in renderer
- **Sandbox**: Enabled for additional security
- **IPC Whitelist**: Only specific channels exposed via preload

## 🛠️ Technologies

- **Electron**: Desktop application framework
- **SQLite (better-sqlite3)**: Local database
- **TypeScript**: Type-safe code
- **Vite**: Fast build tool
- **SCSS**: Enhanced CSS with variables and mixins
- **Node.js**: Runtime environment

## 📊 Database Schema

### Teams
- id, name, budget, reputation
- engine_power, aerodynamics, chassis

### Drivers
- id, name, team_id
- skill, consistency, racecraft, experience

### Races
- id, name, country, laps, length, completed

### Standings
- id, driver_id, points, wins, podiums

### Balance Parameters
- id, category, parameter, value, description

## 📝 Scripts

```bash
npm run dev          # Development mode
npm run build        # Build for production
npm run build:vite   # Build renderer only
npm run build:main   # Build main process only
npm run package      # Create distributable
npm run lint         # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by classic F1 manager games
- Built with modern web technologies
- Formula 1 team and driver data