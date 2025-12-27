import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

/**
 * Initialize the database connection
 * @returns {Database} The database instance
 */
export function initializeDatabase() {
  if (db) {
    return db;
  }

  // Get the user data path for the database
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'racing-team-manager.db');

  console.log('Initializing database at:', dbPath);

  // Create database connection
  db = new Database(dbPath, { verbose: console.log });

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  return db;
}

/**
 * Get the database instance
 * @returns {Database} The database instance
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
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
    console.log('Database connection closed');
  }
}
