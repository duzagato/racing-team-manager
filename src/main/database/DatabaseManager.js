import Database from 'better-sqlite3';
import path from 'path';

/**
 * DatabaseManager - Implements the Repository/DAO pattern for SQLite access
 * All database operations are centralized here to maintain security and
 * allow for easy query optimization and maintenance.
 */
export class DatabaseManager {
  constructor() {
    this.db = null;
  }

  /**
   * Load a database from the specified path
   */
  loadDatabase(dbPath) {
    if (this.db) {
      this.db.close();
    }
    
    this.db = new Database(dbPath, { 
      verbose: console.log,
      fileMustExist: true 
    });
    
    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');
    
    return this.db;
  }

  /**
   * Close the current database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Get all teams from the database
   */
  getTeams() {
    if (!this.db) throw new Error('Database not loaded');
    
    const stmt = this.db.prepare('SELECT * FROM teams ORDER BY name');
    return stmt.all();
  }

  /**
   * Get all drivers from the database
   */
  getDrivers() {
    if (!this.db) throw new Error('Database not loaded');
    
    const stmt = this.db.prepare(`
      SELECT d.*, t.name as team_name 
      FROM drivers d 
      LEFT JOIN teams t ON d.team_id = t.id 
      ORDER BY d.name
    `);
    return stmt.all();
  }

  /**
   * Get a specific driver by ID
   */
  getDriver(driverId) {
    if (!this.db) throw new Error('Database not loaded');
    
    const stmt = this.db.prepare('SELECT * FROM drivers WHERE id = ?');
    return stmt.get(driverId);
  }

  /**
   * Get all game settings
   */
  getSettings() {
    if (!this.db) throw new Error('Database not loaded');
    
    const stmt = this.db.prepare('SELECT * FROM settings');
    const rows = stmt.all();
    
    // Convert to key-value object
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = this.parseSettingValue(row.value, row.type);
    });
    
    return settings;
  }

  /**
   * Get a specific setting value
   */
  getSetting(key) {
    if (!this.db) throw new Error('Database not loaded');
    
    const stmt = this.db.prepare('SELECT * FROM settings WHERE key = ?');
    const row = stmt.get(key);
    
    if (!row) return null;
    return this.parseSettingValue(row.value, row.type);
  }

  /**
   * Update a setting value
   */
  updateSetting(key, value) {
    if (!this.db) throw new Error('Database not loaded');
    
    const stmt = this.db.prepare(`
      UPDATE settings 
      SET value = ?, updated_at = datetime('now')
      WHERE key = ?
    `);
    
    const result = stmt.run(String(value), key);
    return result.changes > 0;
  }

  /**
   * Save race results to the database
   */
  saveRaceResults(raceId, results) {
    if (!this.db) throw new Error('Database not loaded');
    
    const insertStmt = this.db.prepare(`
      INSERT INTO race_results (race_id, driver_id, position, points, time, dnf)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = this.db.transaction((results) => {
      for (const result of results) {
        insertStmt.run(
          raceId,
          result.driverId,
          result.position,
          result.points,
          result.time,
          result.dnf ? 1 : 0
        );
      }
    });
    
    transaction(results);
  }

  /**
   * Get race results
   */
  getRaceResults(raceId) {
    if (!this.db) throw new Error('Database not loaded');
    
    const stmt = this.db.prepare(`
      SELECT rr.*, d.name as driver_name, t.name as team_name
      FROM race_results rr
      JOIN drivers d ON rr.driver_id = d.id
      JOIN teams t ON d.team_id = t.id
      WHERE rr.race_id = ?
      ORDER BY rr.position
    `);
    
    return stmt.all(raceId);
  }

  /**
   * Parse setting value based on its type
   */
  parseSettingValue(value, type) {
    switch (type) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true' || value === '1';
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }
}
