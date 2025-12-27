import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { CareerManager } from './services/CareerManager';
import { SimulationEngine } from './services/SimulationEngine';

let mainWindow: BrowserWindow | null = null;
let careerManager: CareerManager | null = null;
let simulationEngine: SimulationEngine | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function initializeApp() {
  const userDataPath = app.getPath('userData');
  careerManager = new CareerManager(userDataPath);
  simulationEngine = new SimulationEngine();
}

app.whenReady().then(async () => {
  await initializeApp();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for Career Management
ipcMain.handle('career:list', async () => {
  return careerManager?.listCareers() || [];
});

ipcMain.handle('career:create', async (_, name: string) => {
  return careerManager?.createCareer(name);
});

ipcMain.handle('career:load', async (_, careerId: string) => {
  return careerManager?.loadCareer(careerId);
});

ipcMain.handle('career:delete', async (_, careerId: string) => {
  return careerManager?.deleteCareer(careerId);
});

// IPC Handlers for Simulation
ipcMain.handle('simulation:advance', async (_, careerId: string) => {
  const career = careerManager?.getActiveCareer(careerId);
  if (!career) throw new Error('Career not found');
  return simulationEngine?.advanceWeek(career);
});

ipcMain.handle('simulation:race', async (_, careerId: string, raceId: number) => {
  const career = careerManager?.getActiveCareer(careerId);
  if (!career) throw new Error('Career not found');
  return simulationEngine?.simulateRace(career, raceId);
});

// IPC Handlers for Data Access
ipcMain.handle('data:getTeams', async (_, careerId: string) => {
  const career = careerManager?.getActiveCareer(careerId);
  return career?.teamRepository.getAll();
});

ipcMain.handle('data:getDrivers', async (_, careerId: string) => {
  const career = careerManager?.getActiveCareer(careerId);
  return career?.driverRepository.getAll();
});

ipcMain.handle('data:getStandings', async (_, careerId: string) => {
  const career = careerManager?.getActiveCareer(careerId);
  return career?.standingsRepository.getCurrentStandings();
});

ipcMain.handle('data:getBalance', async (_, careerId: string) => {
  const career = careerManager?.getActiveCareer(careerId);
  return career?.balanceRepository.getAll();
});
