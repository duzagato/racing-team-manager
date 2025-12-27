import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseManager } from './database/DatabaseManager.js';
import { SaveManager } from './save/SaveManager.js';
import { RaceSimulator } from './game/RaceSimulator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Application {
  constructor() {
    this.mainWindow = null;
    this.databaseManager = null;
    this.saveManager = null;
    this.raceSimulator = null;
  }

  async initialize() {
    await app.whenReady();
    
    // Initialize managers
    this.saveManager = new SaveManager();
    this.databaseManager = new DatabaseManager();
    this.raceSimulator = new RaceSimulator(this.databaseManager);
    
    this.createWindow();
    this.registerIpcHandlers();
    
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });
    
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    });

    // In development, load from Vite dev server
    if (process.env.VITE_DEV_SERVER_URL) {
      this.mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
      this.mainWindow.webContents.openDevTools();
    } else {
      // In production, load the built files
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
  }

  registerIpcHandlers() {
    // Save Management
    ipcMain.handle('save:list', async () => {
      return await this.saveManager.listSaves();
    });

    ipcMain.handle('save:create', async (event, saveName, playerName) => {
      return await this.saveManager.createNewSave(saveName, playerName);
    });

    ipcMain.handle('save:load', async (event, saveName) => {
      const savePath = this.saveManager.getSavePath(saveName);
      await this.databaseManager.loadDatabase(savePath);
      return await this.saveManager.getSaveMetadata(saveName);
    });

    ipcMain.handle('save:delete', async (event, saveName) => {
      return await this.saveManager.deleteSave(saveName);
    });

    // Game Data
    ipcMain.handle('game:getTeams', async () => {
      return await this.databaseManager.getTeams();
    });

    ipcMain.handle('game:getDrivers', async () => {
      return await this.databaseManager.getDrivers();
    });

    ipcMain.handle('game:getSettings', async () => {
      return await this.databaseManager.getSettings();
    });

    ipcMain.handle('game:updateSetting', async (event, key, value) => {
      return await this.databaseManager.updateSetting(key, value);
    });

    // Race Simulation
    ipcMain.handle('race:simulate', async (event, raceConfig) => {
      return await this.raceSimulator.simulateRace(raceConfig);
    });

    ipcMain.handle('race:getResults', async (event, raceId) => {
      return await this.databaseManager.getRaceResults(raceId);
    });
  }
}

const application = new Application();
application.initialize().catch(console.error);
