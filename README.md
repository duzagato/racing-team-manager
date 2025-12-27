# Racing Team Manager - F1 Management Game

A Formula 1 racing team management game built with Electron, featuring secure architecture, SQLite database management, and realistic race simulation.

## Architecture Overview

### Process Separation (Security First)

The application follows Electron's best practices with strict process isolation:

- **Main Process**: Contains all game logic, database access, and race simulation algorithms
- **Renderer Process**: Handles UI rendering only, no direct access to Node.js or database
- **Preload Script**: Provides secure IPC communication via `contextBridge`

### Key Features

1. **Secure Architecture**
   - Renderer process runs in sandbox mode with `contextIsolation`
   - No `nodeIntegration` in renderer
   - All communication through `contextBridge` exposed API
   - Game logic can be obfuscated for production builds

2. **Database Management**
   - SQLite via `better-sqlite3`
   - Repository/DAO pattern for all database operations
   - Template database stored in ASAR package
   - Save games isolated in `userData/saves/[SAVE_NAME]/`

3. **Save System**
   - Each save in its own directory with:
     - `game.db` - SQLite database copied from template
     - `metadata.json` - Save metadata (player name, date, progress)
   - Template database includes balance parameters in `settings` table

4. **Balance Parameters**
   - Game balance values stored in database `settings` table
   - Can be patched without code changes
   - Examples: tyre wear rate, driver error probability, race laps

5. **Race Simulation**
   - Complex simulation logic runs in Main Process only
   - Considers: driver skill, tyre degradation, weather, incidents
   - Results saved to database for championship tracking

## Project Structure

```
racing-team-manager/
├── src/
│   ├── main/               # Main Process (Node.js/Electron)
│   │   ├── main.js         # Entry point, window management, IPC handlers
│   │   ├── database/
│   │   │   ├── DatabaseManager.js   # Repository pattern for SQLite
│   │   │   └── initDatabase.js      # Schema initialization
│   │   ├── save/
│   │   │   └── SaveManager.js       # Save game management
│   │   └── game/
│   │       └── RaceSimulator.js     # Race simulation logic
│   ├── preload/
│   │   └── preload.js      # Secure API exposure via contextBridge
│   └── renderer/           # Renderer Process (UI)
│       ├── index.html
│       ├── main.js         # UI logic
│       └── styles/
│           └── main.scss   # SCSS styles
├── resources/
│   └── database/
│       └── template.db     # Template database (created by initDatabase.js)
├── build/
│   └── obfuscate.js        # Production code obfuscation
├── vite.config.js          # Vite bundler configuration
└── package.json

```

## Setup and Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Initialize the template database
npm run init:db
```

### Development

```bash
npm run dev
```

This starts Vite development server with Hot Module Replacement.

### Building for Production

```bash
# Build application
npm run build

# Run obfuscation (optional, for extra security)
NODE_ENV=production node build/obfuscate.js
```

The build process:
1. Vite builds Main and Renderer processes
2. Electron Builder packages the application
3. Template database is included in ASAR (but kept unpackaged for access)
4. Optionally obfuscates Main Process code

## Database Schema

### Tables

- **teams**: F1 teams with budget and prestige
- **drivers**: Drivers with skills and team assignments
- **settings**: Game balance parameters (key-value store)
- **race_results**: Results from simulated races
- **championship_standings**: Season standings tracking

### Settings (Balance Parameters)

Key settings stored in database:
- `tyreWearRate`: Rate of tyre degradation per lap
- `driverErrorProbability`: Chance of driver error per lap
- `raceLaps`: Number of laps in a race
- `weatherVariability`: Weather change probability
- `mechanicalReliability`: Base reliability factor
- `overtakingDifficulty`: Difficulty multiplier for overtaking

These can be modified in-game or patched via database updates.

## Security Features

1. **Process Isolation**: Renderer cannot access Node.js APIs
2. **Context Bridge**: Limited, predefined API for IPC
3. **Sandbox Mode**: Renderer runs in Chromium sandbox
4. **Code Obfuscation**: Main Process code obfuscated in production
5. **ASAR Packaging**: Resources bundled in encrypted archive

## IPC API

The renderer accesses functionality through `window.electronAPI`:

### Save Management
- `electronAPI.save.list()` - List all saves
- `electronAPI.save.create(name, player)` - Create new save
- `electronAPI.save.load(name)` - Load a save
- `electronAPI.save.delete(name)` - Delete a save

### Game Data
- `electronAPI.game.getTeams()` - Get all teams
- `electronAPI.game.getDrivers()` - Get all drivers
- `electronAPI.game.getSettings()` - Get balance settings
- `electronAPI.game.updateSetting(key, value)` - Update a setting

### Race Simulation
- `electronAPI.race.simulate(config)` - Simulate a race
- `electronAPI.race.getResults(raceId)` - Get race results

## Technologies

- **Electron**: Desktop app framework
- **Vite**: Build tool with HMR support
- **better-sqlite3**: Fast SQLite3 bindings
- **SCSS**: CSS preprocessor
- **javascript-obfuscator**: Code protection

## License

MIT