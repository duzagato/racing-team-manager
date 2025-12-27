"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('api', {
    // Career Management
    career: {
        list: () => electron_1.ipcRenderer.invoke('career:list'),
        create: (name) => electron_1.ipcRenderer.invoke('career:create', name),
        load: (careerId) => electron_1.ipcRenderer.invoke('career:load', careerId),
        delete: (careerId) => electron_1.ipcRenderer.invoke('career:delete', careerId),
    },
    // Simulation
    simulation: {
        advance: (careerId) => electron_1.ipcRenderer.invoke('simulation:advance', careerId),
        race: (careerId, raceId) => electron_1.ipcRenderer.invoke('simulation:race', careerId, raceId),
    },
    // Data Access
    data: {
        getTeams: (careerId) => electron_1.ipcRenderer.invoke('data:getTeams', careerId),
        getDrivers: (careerId) => electron_1.ipcRenderer.invoke('data:getDrivers', careerId),
        getStandings: (careerId) => electron_1.ipcRenderer.invoke('data:getStandings', careerId),
        getBalance: (careerId) => electron_1.ipcRenderer.invoke('data:getBalance', careerId),
    },
});
