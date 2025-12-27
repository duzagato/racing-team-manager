/**
 * Save Manager
 * Handles creation, loading, and management of game saves
 */

import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import Database from 'better-sqlite3';
import { initializeSchema } from './schema.js';

/**
 * Convert text to URL-friendly slug
 * @param {string} text - Text to convert
 * @returns {string} Slugified text
 */
export function slugify(text) {
  return text
    .toString()
    .normalize('NFD') // Normalize to decomposed form for accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get the saves directory path
 * @returns {string} Path to saves directory
 */
function getSavesDirectory() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'saves');
}

/**
 * Get the template database path
 * @returns {string} Path to template.db
 */
function getTemplatePath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'template.db');
}

/**
 * Ensure the saves directory exists
 */
function ensureSavesDirectory() {
  const savesDir = getSavesDirectory();
  if (!fs.existsSync(savesDir)) {
    fs.mkdirSync(savesDir, { recursive: true });
  }
}

/**
 * Create the template database if it doesn't exist
 * @returns {string} Path to the template database
 */
export function ensureTemplateDatabase() {
  const templatePath = getTemplatePath();
  
  // Only create if it doesn't exist
  if (!fs.existsSync(templatePath)) {
    console.log('Creating template database at:', templatePath);
    const db = new Database(templatePath);
    
    try {
      initializeSchema(db);
      console.log('Template database created successfully');
    } finally {
      db.close();
    }
  } else {
    console.log('Template database already exists');
  }
  
  return templatePath;
}

/**
 * Create a new save
 * @param {string} saveName - Name for the save
 * @returns {Object} Information about the created save
 */
export function createNewSave(saveName) {
  if (!saveName || saveName.trim() === '') {
    throw new Error('Save name cannot be empty');
  }

  const slug = slugify(saveName);
  
  if (!slug || slug === '') {
    throw new Error('Invalid save name - contains no valid characters');
  }

  ensureSavesDirectory();
  
  const savePath = path.join(getSavesDirectory(), slug);
  
  // Check if save already exists
  if (fs.existsSync(savePath)) {
    throw new Error(`Save "${slug}" already exists`);
  }

  // Create save directory
  fs.mkdirSync(savePath, { recursive: true });

  // Copy template database to save directory
  const templatePath = getTemplatePath();
  if (!fs.existsSync(templatePath)) {
    throw new Error('Template database not found. Please restart the application.');
  }

  const gameDbPath = path.join(savePath, 'game.db');
  fs.copyFileSync(templatePath, gameDbPath);

  console.log(`Save created: ${slug} at ${savePath}`);

  return {
    slug,
    name: saveName,
    path: savePath,
    createdAt: new Date().toISOString()
  };
}

/**
 * List all available saves
 * @returns {Array<Object>} List of saves
 */
export function listSaves() {
  ensureSavesDirectory();
  
  const savesDir = getSavesDirectory();
  
  try {
    const entries = fs.readdirSync(savesDir, { withFileTypes: true });
    
    const saves = entries
      .filter(entry => entry.isDirectory())
      .map(entry => {
        const savePath = path.join(savesDir, entry.name);
        const gameDbPath = path.join(savePath, 'game.db');
        
        // Check if game.db exists
        if (!fs.existsSync(gameDbPath)) {
          return null;
        }

        // Get file stats for creation time
        const stats = fs.statSync(savePath);
        
        return {
          slug: entry.name,
          path: savePath,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString()
        };
      })
      .filter(save => save !== null); // Remove invalid saves

    return saves;
  } catch (error) {
    console.error('Error listing saves:', error);
    return [];
  }
}

/**
 * Load a specific save
 * @param {string} slug - Slug of the save to load
 * @returns {Database} Database instance for the save
 */
export function loadSave(slug) {
  const savePath = path.join(getSavesDirectory(), slug);
  const gameDbPath = path.join(savePath, 'game.db');

  if (!fs.existsSync(gameDbPath)) {
    throw new Error(`Save "${slug}" not found`);
  }

  console.log('Loading save:', slug);
  
  const db = new Database(gameDbPath);
  db.pragma('foreign_keys = ON');
  
  return db;
}

/**
 * Delete a save
 * @param {string} slug - Slug of the save to delete
 */
export function deleteSave(slug) {
  const savePath = path.join(getSavesDirectory(), slug);

  if (!fs.existsSync(savePath)) {
    throw new Error(`Save "${slug}" not found`);
  }

  // Delete the entire save directory
  fs.rmSync(savePath, { recursive: true, force: true });
  
  console.log(`Save deleted: ${slug}`);
}
