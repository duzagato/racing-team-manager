import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SaveManager - Handles save game creation, loading, and deletion
 * Manages the userData directory structure and save metadata
 */
export class SaveManager {
  constructor() {
    this.savesDir = path.join(app.getPath('userData'), 'saves');
    this.ensureSavesDirectory();
  }

  /**
   * Ensure the saves directory exists
   */
  ensureSavesDirectory() {
    if (!fs.existsSync(this.savesDir)) {
      fs.mkdirSync(this.savesDir, { recursive: true });
    }
  }

  /**
   * Get the path to a specific save
   */
  getSavePath(saveName) {
    return path.join(this.savesDir, saveName);
  }

  /**
   * Get the database file path for a save
   */
  getDbPath(saveName) {
    return path.join(this.getSavePath(saveName), 'game.db');
  }

  /**
   * Get the metadata file path for a save
   */
  getMetadataPath(saveName) {
    return path.join(this.getSavePath(saveName), 'metadata.json');
  }

  /**
   * List all available saves
   */
  async listSaves() {
    const saves = [];
    
    if (!fs.existsSync(this.savesDir)) {
      return saves;
    }
    
    const entries = fs.readdirSync(this.savesDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metadataPath = this.getMetadataPath(entry.name);
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            saves.push({
              name: entry.name,
              ...metadata
            });
          } catch (error) {
            console.error(`Error reading metadata for save ${entry.name}:`, error);
          }
        }
      }
    }
    
    return saves.sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));
  }

  /**
   * Create a new save game
   */
  async createNewSave(saveName, playerName) {
    const savePath = this.getSavePath(saveName);
    
    // Check if save already exists
    if (fs.existsSync(savePath)) {
      throw new Error(`Save '${saveName}' already exists`);
    }
    
    // Create save directory
    fs.mkdirSync(savePath, { recursive: true });
    
    try {
      // Copy template database
      const templatePath = this.getTemplatePath();
      const dbPath = this.getDbPath(saveName);
      fs.copyFileSync(templatePath, dbPath);
      
      // Create metadata
      const metadata = {
        playerName,
        createdAt: new Date().toISOString(),
        lastPlayed: new Date().toISOString(),
        version: '1.0.0',
        gameProgress: {
          season: 1,
          race: 0
        }
      };
      
      fs.writeFileSync(
        this.getMetadataPath(saveName),
        JSON.stringify(metadata, null, 2)
      );
      
      return {
        success: true,
        saveName,
        metadata
      };
    } catch (error) {
      // Clean up on failure
      if (fs.existsSync(savePath)) {
        fs.rmSync(savePath, { recursive: true, force: true });
      }
      throw error;
    }
  }

  /**
   * Get save metadata
   */
  async getSaveMetadata(saveName) {
    const metadataPath = this.getMetadataPath(saveName);
    
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Save '${saveName}' not found`);
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Update last played time
    metadata.lastPlayed = new Date().toISOString();
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    return metadata;
  }

  /**
   * Delete a save game
   */
  async deleteSave(saveName) {
    const savePath = this.getSavePath(saveName);
    
    if (!fs.existsSync(savePath)) {
      throw new Error(`Save '${saveName}' not found`);
    }
    
    fs.rmSync(savePath, { recursive: true, force: true });
    
    return { success: true };
  }

  /**
   * Get the path to the template database
   */
  getTemplatePath() {
    // In development
    if (process.env.NODE_ENV === 'development') {
      return path.join(process.cwd(), 'resources', 'database', 'template.db');
    }
    
    // In production (ASAR package)
    return path.join(process.resourcesPath, 'database', 'template.db');
  }
}
