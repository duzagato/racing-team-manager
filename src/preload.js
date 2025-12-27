import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Save management
  createSave: (saveName) => ipcRenderer.invoke('create-save', saveName),
  listSaves: () => ipcRenderer.invoke('list-saves'),
  loadSave: (slug) => ipcRenderer.invoke('load-save', slug),
  deleteSave: (slug) => ipcRenderer.invoke('delete-save', slug),
  slugify: (text) => ipcRenderer.invoke('slugify', text),
  
  // Legacy methods
  send: (channel, data) => {
    // Whitelist channels
    const validChannels = ['new-game', 'continue-game', 'exit-game'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['game-state-changed'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
