import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Career Management
  career: {
    list: () => ipcRenderer.invoke('career:list'),
    create: (name: string) => ipcRenderer.invoke('career:create', name),
    load: (careerId: string) => ipcRenderer.invoke('career:load', careerId),
    delete: (careerId: string) => ipcRenderer.invoke('career:delete', careerId),
  },

  // Simulation
  simulation: {
    advance: (careerId: string) => ipcRenderer.invoke('simulation:advance', careerId),
    race: (careerId: string, raceId: number) => ipcRenderer.invoke('simulation:race', careerId, raceId),
  },

  // Data Access
  data: {
    getTeams: (careerId: string) => ipcRenderer.invoke('data:getTeams', careerId),
    getDrivers: (careerId: string) => ipcRenderer.invoke('data:getDrivers', careerId),
    getStandings: (careerId: string) => ipcRenderer.invoke('data:getStandings', careerId),
    getBalance: (careerId: string) => ipcRenderer.invoke('data:getBalance', careerId),
  },
});

// Type definitions for TypeScript
export interface ElectronAPI {
  career: {
    list: () => Promise<any[]>;
    create: (name: string) => Promise<any>;
    load: (careerId: string) => Promise<any>;
    delete: (careerId: string) => Promise<boolean>;
  };
  simulation: {
    advance: (careerId: string) => Promise<any>;
    race: (careerId: string, raceId: number) => Promise<any>;
  };
  data: {
    getTeams: (careerId: string) => Promise<any[]>;
    getDrivers: (careerId: string) => Promise<any[]>;
    getStandings: (careerId: string) => Promise<any[]>;
    getBalance: (careerId: string) => Promise<any[]>;
  };
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
