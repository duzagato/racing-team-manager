import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { fileURLToPath } from 'url';
import { ensureTemplateDatabase } from './saveManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;
let currentSaveSlug = null;

/**
 * Initialize the database system
 * Creates the template database if it doesn't exist
 * @returns {string} Path to the template database
 */
export function initializeDatabase() {
  // Ensure template database exists
  const templatePath = ensureTemplateDatabase();
  console.log('Database system initialized with template at:', templatePath);
  return templatePath;
}

/**
 * Open a connection to a specific save
 * @param {string} saveSlug - Slug of the save to open
 * @returns {Database} The database instance for the save
 */
export function openSaveDatabase(saveSlug) {
  // Close existing connection if any
  if (db) {
    closeDatabase();
  }

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'saves', saveSlug, 'game.db');

  console.log('Opening save database at:', dbPath);

  // Create database connection
  const options = process.env.NODE_ENV === 'development' ? { verbose: console.log } : {};
  db = new Database(dbPath, options);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  currentSaveSlug = saveSlug;

  return db;
}

/**
 * Get the currently active save slug
 * @returns {string|null} Current save slug or null
 */
export function getCurrentSaveSlug() {
  return currentSaveSlug;
}

/**
 * Get the database instance
 * @returns {Database} The database instance
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Load a save first.');
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    currentSaveSlug = null;
    console.log('Database connection closed');
  }
}
