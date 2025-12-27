import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, closeDatabase } from './infrastructure/database.js';
import { 
  slugify, 
  createNewSave, 
  listSaves, 
  loadSave, 
  deleteSave 
} from './infrastructure/saveManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // In development, load from Vite dev server
  // In production, load from built files
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Setup IPC handlers for save management
 */
function setupIpcHandlers() {
  // Slugify text
  ipcMain.handle('slugify', async (event, text) => {
    try {
      return { success: true, slug: slugify(text) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Create new save
  ipcMain.handle('create-save', async (event, saveName) => {
    try {
      const saveInfo = createNewSave(saveName);
      return { success: true, save: saveInfo };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // List all saves
  ipcMain.handle('list-saves', async () => {
    try {
      const saves = listSaves();
      return { success: true, saves };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Load a save
  ipcMain.handle('load-save', async (event, slug) => {
    try {
      loadSave(slug);
      return { success: true, slug };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Delete a save
  ipcMain.handle('delete-save', async (event, slug) => {
    try {
      deleteSave(slug);
      return { success: true, slug };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

app.whenReady().then(() => {
  // Initialize database system
  try {
    initializeDatabase();
    console.log('Database system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }

  // Setup IPC handlers
  setupIpcHandlers();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Close database connection
  closeDatabase();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
