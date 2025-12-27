import { contextBridge, ipcRenderer } from 'electron';
import { CareerMetadata, Team, Driver, Standing, Balance, RaceResult } from '../main/models/types';

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
    race: (careerId: string) => ipcRenderer.invoke('simulation:race', careerId),
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
    list: () => Promise<CareerMetadata[]>;
    create: (name: string) => Promise<CareerMetadata>;
    load: (careerId: string) => Promise<{ metadata: CareerMetadata }>;
    delete: (careerId: string) => Promise<boolean>;
  };
  simulation: {
    advance: (careerId: string) => Promise<{ week: number; events: string[] }>;
    race: (careerId: string) => Promise<RaceResult[]>;
  };
  data: {
    getTeams: (careerId: string) => Promise<Team[]>;
    getDrivers: (careerId: string) => Promise<Driver[]>;
    getStandings: (careerId: string) => Promise<Standing[]>;
    getBalance: (careerId: string) => Promise<Balance[]>;
  };
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
