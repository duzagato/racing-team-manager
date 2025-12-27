import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script that exposes a secure API to the renderer process
 * using contextBridge. This prevents the renderer from accessing Node.js
 * or Electron APIs directly, maintaining security.
 */

const api = {
  // Save Management API
  save: {
    list: () => ipcRenderer.invoke('save:list'),
    create: (saveName, playerName) => ipcRenderer.invoke('save:create', saveName, playerName),
    load: (saveName) => ipcRenderer.invoke('save:load', saveName),
    delete: (saveName) => ipcRenderer.invoke('save:delete', saveName)
  },

  // Game Data API
  game: {
    getTeams: () => ipcRenderer.invoke('game:getTeams'),
    getDrivers: () => ipcRenderer.invoke('game:getDrivers'),
    getSettings: () => ipcRenderer.invoke('game:getSettings'),
    updateSetting: (key, value) => ipcRenderer.invoke('game:updateSetting', key, value)
  },

  // Race Simulation API
  race: {
    simulate: (raceConfig) => ipcRenderer.invoke('race:simulate', raceConfig),
    getResults: (raceId) => ipcRenderer.invoke('race:getResults', raceId)
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', api);
