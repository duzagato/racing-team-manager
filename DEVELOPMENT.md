# Development Guide

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git

## Initial Setup

```bash
# Clone the repository
git clone https://github.com/duzagato/racing-team-manager.git
cd racing-team-manager

# Install dependencies
npm install

# Build the project
npm run build
```

## Development Workflow

### Starting Development Mode

```bash
npm run dev
```

This will:
1. Start Vite dev server on `http://localhost:5173`
2. Wait for the server to be ready
3. Launch Electron in development mode
4. Open DevTools automatically

### File Structure

When working on the project, you'll mainly edit files in `src/`:

- **`src/main/`** - Electron main process (Node.js)
  - Edit these for backend logic, database, simulation
  - Changes require rebuild: Ctrl+C and `npm run dev` again
  
- **`src/renderer/`** - Frontend UI (Browser)
  - Edit these for UI changes
  - Hot reload works automatically via Vite
  
- **`src/preload/`** - IPC bridge
  - Edit to expose new APIs to renderer
  - Changes require rebuild

### Making Changes

#### Adding a New IPC Channel

1. **Add handler in `src/main/main.ts`**:
```typescript
ipcMain.handle('data:getCircuits', async (_, careerId: string) => {
  const career = careerManager?.getActiveCareer(careerId);
  return career?.circuitRepository.getAll();
});
```

2. **Expose in `src/preload/preload.ts`**:
```typescript
contextBridge.exposeInMainWorld('api', {
  // ... existing code
  data: {
    // ... existing methods
    getCircuits: (careerId: string) => ipcRenderer.invoke('data:getCircuits', careerId),
  },
});
```

3. **Update types in `src/preload/preload.ts`**:
```typescript
export interface ElectronAPI {
  data: {
    // ... existing methods
    getCircuits: (careerId: string) => Promise<Circuit[]>;
  };
}
```

4. **Use in `src/renderer/main.ts`**:
```typescript
const circuits = await window.api.data.getCircuits(careerId);
```

#### Adding a New Database Table

1. **Update `src/main/database/DatabaseManager.ts`**:
```typescript
db.exec(`
  CREATE TABLE IF NOT EXISTS circuits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    length REAL DEFAULT 5.0
  )
`);
```

2. **Create DAO in `src/main/database/dao/CircuitDAO.ts`**:
```typescript
import Database from 'better-sqlite3';
import { BaseDAO } from './BaseDAO';
import { Circuit } from '../../models/types';

export class CircuitDAO extends BaseDAO<Circuit> {
  // Implement methods...
}
```

3. **Create Repository in `src/main/database/repositories/CircuitRepository.ts`**:
```typescript
export class CircuitRepository {
  constructor(private circuitDAO: CircuitDAO) {}
  // Add business logic methods...
}
```

4. **Add to Career class in `src/main/models/Career.ts`**:
```typescript
const circuitDAO = new CircuitDAO(db);
this.circuitRepository = new CircuitRepository(circuitDAO);
```

#### Adding UI Components

1. **Create HTML in `src/renderer/index.html`**
2. **Add styles in `src/renderer/styles/main.scss`**
3. **Add logic in `src/renderer/main.ts`**

### Building

```bash
# Build everything
npm run build

# Build only frontend
npm run build:vite

# Build only main process
npm run build:main

# Build only preload
npm run build:preload
```

### Linting

```bash
# Check for issues
npm run lint

# ESLint will check:
# - TypeScript errors
# - Code style
# - Unused variables
# - Type safety
```

## Testing the Application

### Manual Testing

1. **Build and run**:
```bash
npm run build
npm start  # or just launch Electron
```

2. **Test career creation**:
   - Click "New Career"
   - Enter a name
   - Verify database created in userData

3. **Test simulation**:
   - Load a career
   - Click "Advance Week"
   - Click "Simulate Next Race"
   - Check standings update

4. **Check userData location**:
   - Linux: `~/.config/racing-team-manager/`
   - macOS: `~/Library/Application Support/racing-team-manager/`
   - Windows: `%APPDATA%\racing-team-manager\`

### Debugging

#### Main Process

Add to `src/main/main.ts`:
```typescript
console.log('Debug info:', data);
```

View in terminal where you ran `npm run dev`.

#### Renderer Process

Add to `src/renderer/main.ts`:
```typescript
console.log('Debug info:', data);
```

View in Electron DevTools (opens automatically in dev mode).

#### Database Issues

```typescript
// In main process
const db = career.dbManager.getDatabase();
const result = db.prepare('SELECT * FROM teams').all();
console.log('Teams:', result);
```

## Common Issues

### Port 5173 Already in Use
```bash
# Kill the process
pkill -f "vite"
# Or change port in vite.config.ts
```

### Better-sqlite3 Build Errors
```bash
# Rebuild for Electron
npm rebuild better-sqlite3 --update-binary
```

### TypeScript Errors
```bash
# Clean build
rm -rf dist/
npm run build
```

### Changes Not Reflecting
- Renderer: Should hot reload automatically
- Main/Preload: Restart with Ctrl+C and `npm run dev`

## Code Style

### TypeScript
- Use interfaces for data types
- Avoid `any` type
- Enable strict mode
- Use meaningful variable names

### File Organization
- One class per file
- Group related files in directories
- Use index.ts for exports when needed

### Database
- Use prepared statements
- Handle errors gracefully
- Use transactions for multiple operations
- Close connections properly

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "Add new feature"

# Push
git push origin feature/new-feature
```

## Packaging for Distribution

```bash
# Install electron-builder (if not already)
npm install

# Package for current platform
npm run package

# Output in release/ directory
```

### Platform-Specific Builds

Modify `package.json` build configuration:
```json
"build": {
  "mac": {
    "target": "dmg"
  },
  "win": {
    "target": "nsis"
  },
  "linux": {
    "target": "AppImage"
  }
}
```

## Performance Tips

1. **Database Queries**: Use indexes for frequently queried columns
2. **UI Updates**: Batch updates instead of updating on each change
3. **Memory**: Close careers when switching to free memory
4. **Build Size**: Use `electron-builder` compression

## Resources

- [Electron Docs](https://www.electronjs.org/docs)
- [Better-sqlite3 Docs](https://github.com/WiseLibs/better-sqlite3)
- [Vite Docs](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SCSS Guide](https://sass-lang.com/guide)

## Getting Help

1. Check existing issues on GitHub
2. Review implementation documentation
3. Check console logs for errors
4. Verify database schema
5. Open a new issue with details
