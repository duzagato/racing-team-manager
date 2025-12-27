# Architecture Documentation

## Overview
This F1 Racing Team Manager application is built with Electron following strict security principles and modern best practices. The architecture emphasizes separation of concerns, data isolation, and code protection.

## Process Architecture

### Main Process (Backend/Brain)
**Location**: `src/main/main.js`

The Main Process is the heart of the application where all game logic resides:
- Has full access to Node.js APIs and Electron APIs
- Manages the application lifecycle
- Handles all database operations
- Runs race simulations
- Manages save game files
- Cannot be accessed directly by the renderer

**Key Components**:
- `DatabaseManager.js`: Repository/DAO pattern for all SQLite operations
- `SaveManager.js`: Handles save game creation, loading, deletion
- `RaceSimulator.js`: Contains the race simulation algorithms

### Preload Script (Security Bridge)
**Location**: `src/preload/preload.js`

The preload script is the only bridge between Main and Renderer processes:
- Runs in the renderer context but has access to Electron APIs
- Uses `contextBridge` to expose a limited API to the renderer
- Acts as a security barrier
- Only exposes specific, safe functions

**Exposed API**:
```javascript
window.electronAPI = {
  save: { list, create, load, delete },
  game: { getTeams, getDrivers, getSettings, updateSetting },
  race: { simulate, getResults }
}
```

### Renderer Process (Frontend/UI)
**Location**: `src/renderer/`

The renderer process handles only the user interface:
- Runs in a sandboxed environment
- No direct access to Node.js or Electron APIs
- No direct database access
- All operations go through the preload API
- Uses standard web technologies (HTML, CSS/SCSS, JavaScript)

## Database Architecture

### SQLite with better-sqlite3
We use better-sqlite3 for several reasons:
- Synchronous API (simpler code)
- Better performance than node-sqlite3
- Native bindings for speed
- Full SQL support

### Repository Pattern
All database access is centralized in `DatabaseManager.js`:
- Single source of truth for queries
- Easy to optimize and maintain
- Prevents SQL injection
- Allows for easy migration to other databases

### Schema
```sql
- teams: F1 teams (name, budget, prestige)
- drivers: Drivers (name, team_id, skill, age, nationality)
- settings: Game balance parameters (key-value store)
- race_results: Results from simulated races
- championship_standings: Season standings
```

### Balance Parameters
Settings are stored in the database as key-value pairs:
```javascript
{
  tyreWearRate: 0.02,           // Rate of degradation per lap
  driverErrorProbability: 0.05,  // Error chance per lap
  raceLaps: 50,                  // Default race length
  weatherVariability: 0.3,       // Weather change probability
  mechanicalReliability: 0.95,   // Base reliability
  overtakingDifficulty: 0.7,     // Overtaking multiplier
  fuelConsumptionRate: 1.5,      // Fuel per lap (kg)
  drsEffect: 0.3                 // DRS advantage (seconds)
}
```

These can be modified in-game or patched via database updates without recompiling.

## Save Game System

### Structure
```
userData/saves/
├── MySave1/
│   ├── game.db          # Copy of template with game state
│   └── metadata.json    # Save metadata
└── MySave2/
    ├── game.db
    └── metadata.json
```

### Metadata Format
```json
{
  "playerName": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastPlayed": "2024-01-02T12:00:00.000Z",
  "version": "1.0.0",
  "gameProgress": {
    "season": 1,
    "race": 5
  }
}
```

### Save Creation Flow
1. User requests new save with name and player name
2. SaveManager validates and sanitizes the save name
3. Creates save directory in userData
4. Copies template.db to save directory as game.db
5. Creates metadata.json with initial data
6. Returns success to renderer

### Template Database
- Located in `resources/database/template.db`
- Contains initial game data (teams, drivers, settings)
- Packaged with the app in ASAR
- Unpacked for access (configured in package.json)
- Each new save gets a fresh copy

## Security Features

### Context Isolation
```javascript
webPreferences: {
  nodeIntegration: false,      // No Node.js in renderer
  contextIsolation: true,      // Separate contexts
  sandbox: true                // Chromium sandbox
}
```

### Input Validation
All user inputs are validated:
- Save names are sanitized to prevent path traversal
- Only alphanumeric characters and safe separators allowed
- Prevents directory traversal attacks (../, ..\, etc.)

### SQL Injection Protection
- All queries use prepared statements
- No string concatenation in SQL
- Parameters are properly escaped

### Code Obfuscation
Production builds can obfuscate the Main Process code:
```bash
NODE_ENV=production node build/obfuscate.js
```

This protects:
- Race simulation algorithms
- Game balance logic
- Database queries
- Any proprietary code

The preload script is NOT obfuscated as it needs to be readable by Electron.

## Build System

### Vite Configuration
- Separate builds for Main, Preload, and Renderer
- Hot Module Replacement (HMR) in development
- Tree shaking and minification in production
- SCSS compilation with modern API
- Asset optimization

### Development Mode
```bash
npm run dev
```
- Vite dev server for renderer (HMR enabled)
- Source maps for debugging
- Verbose SQL logging
- DevTools open by default

### Production Build
```bash
npm run build
```
1. Vite builds renderer (HTML, CSS, JS)
2. Vite builds main process
3. Vite builds preload script
4. Electron Builder packages everything
5. Creates AppImage and Snap packages
6. Template database included and unpacked

### Output Structure
```
dist/
├── main/
│   └── main.js              # Main process bundle
├── preload/
│   └── preload.cjs          # Preload script (CommonJS)
└── renderer/
    ├── index.html
    └── assets/
        ├── index-*.css
        └── index-*.js

release/
├── Racing Team Manager-1.0.0.AppImage
├── racing-team-manager_1.0.0_amd64.snap
└── linux-unpacked/
    ├── resources/
    │   ├── app.asar
    │   └── app.asar.unpacked/
    │       └── resources/database/template.db
    └── racing-team-manager
```

## Race Simulation

The race simulator implements realistic F1 race mechanics:

### Simulation Flow
1. Initialize race state for all drivers
2. For each lap:
   - Calculate base lap time
   - Apply skill modifier
   - Apply tyre degradation
   - Apply weather effects
   - Check for incidents (errors, crashes)
   - Update positions
3. Calculate final results with points

### Factors Considered
- **Driver Skill**: Better drivers are consistently faster
- **Tyre Degradation**: Increases lap time over race distance
- **Weather**: Wet conditions add time and variability
- **Random Variance**: Simulates unpredictability
- **Incidents**: Spins, lockups, crashes, mechanical failures
- **DNF (Did Not Finish)**: Crashes and failures remove driver

### Points System
Standard F1 points:
- 1st: 25 points
- 2nd: 18 points
- 3rd: 15 points
- 4th: 12 points
- 5th: 10 points
- 6th: 8 points
- 7th: 6 points
- 8th: 4 points
- 9th: 2 points
- 10th: 1 point

## Future Enhancements

### Potential Additions
1. **Championship System**: Full season simulation with standings
2. **Team Management**: Budget, staff, facilities
3. **Car Development**: R&D, upgrades, testing
4. **Strategy**: Pit stops, tyre choices, fuel management
5. **Multiplayer**: Online championships
6. **Mod Support**: Custom teams, drivers, tracks
7. **Advanced Analytics**: Telemetry, performance graphs
8. **Season Editor**: Create custom seasons

### Database Migration
If schema changes are needed:
1. Add migration scripts in `src/main/database/migrations/`
2. Track version in metadata
3. Auto-migrate on save load
4. Backup before migration

### Localization
Add i18n support:
1. Create language files
2. Update UI to use translation keys
3. Store language preference in settings
4. Load appropriate language on startup

## Performance Considerations

### Database Optimization
- WAL (Write-Ahead Logging) mode enabled
- Prepared statements cached
- Transactions for bulk operations
- Indexes on frequently queried columns

### Memory Management
- Database connections properly closed
- Event listeners cleaned up
- No memory leaks in IPC handlers

### Build Optimization
- Tree shaking removes unused code
- Minification reduces file size
- ASAR packaging improves startup time
- Asset compression reduces download size

## Debugging

### Development Tools
- Electron DevTools available in dev mode
- Console logging for SQL queries (dev only)
- Source maps for debugging
- Error stack traces preserved

### Common Issues
1. **Database locked**: Close other connections
2. **Save not found**: Check userData path
3. **Build fails**: Clear dist/ and rebuild
4. **Template missing**: Run `npm run init:db`

### Logging
```javascript
// Main Process
console.log('Main:', data);

// Renderer Process  
console.log('Renderer:', data);
```

Logs appear in:
- Development: Terminal and DevTools
- Production: Log files in userData

## Testing Strategy

### Unit Tests
- Test database operations
- Test save management
- Test race simulation logic
- Test input validation

### Integration Tests
- Test IPC communication
- Test save creation flow
- Test race simulation flow
- Test database migrations

### E2E Tests
- Test full user flows
- Test UI interactions
- Test data persistence
- Test error handling

## Conclusion

This architecture provides:
- **Security**: Isolated processes, validated inputs, protected code
- **Flexibility**: Database-driven balance, moddable content
- **Performance**: Optimized builds, efficient database
- **Maintainability**: Clear separation, documented code, standard patterns
- **Extensibility**: Easy to add features, migrate, localize

The foundation is solid and ready for building out full game features.
