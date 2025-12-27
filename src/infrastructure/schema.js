/**
 * Database Schema Definition
 * Defines all SQLite tables for the Racing Team Manager game
 */

/**
 * Initialize all database tables
 * @param {import('better-sqlite3').Database} db - Database instance
 */
export function initializeSchema(db) {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Teams table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) NOT NULL,
      country VARCHAR(50) NOT NULL,
      budget REAL NOT NULL,
      factory_level INTEGER NOT NULL,
      reputation REAL NOT NULL CHECK(reputation >= 0.00 AND reputation <= 1.00),
      foundation_year INTEGER NOT NULL
    )
  `);

  // Drivers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      country VARCHAR(50) NOT NULL,
      birthday DATE NOT NULL,
      speed_skill REAL NOT NULL CHECK(speed_skill >= 0.00 AND speed_skill <= 1.00),
      wet_skill REAL NOT NULL CHECK(wet_skill >= 0.00 AND wet_skill <= 1.00),
      soft_skill REAL NOT NULL CHECK(soft_skill >= 0.00 AND soft_skill <= 1.00),
      tyre_preservation_skill REAL NOT NULL CHECK(tyre_preservation_skill >= 0.00 AND tyre_preservation_skill <= 1.00),
      agressivity REAL NOT NULL CHECK(agressivity >= 0.00 AND agressivity <= 1.00),
      consistency REAL NOT NULL CHECK(consistency >= 0.00 AND consistency <= 1.00),
      adaptation REAL NOT NULL CHECK(adaptation >= 0.00 AND adaptation <= 1.00),
      test_skill REAL NOT NULL CHECK(test_skill >= 0.00 AND test_skill <= 1.00),
      feedback_level REAL NOT NULL CHECK(feedback_level >= 0.00 AND feedback_level <= 1.00),
      stamina REAL NOT NULL CHECK(stamina >= 0.00 AND stamina <= 1.00),
      motivation REAL NOT NULL CHECK(motivation >= 0.00 AND motivation <= 1.00),
      overtaking_skill REAL NOT NULL CHECK(overtaking_skill >= 0.00 AND overtaking_skill <= 1.00),
      low_grip_skill REAL NOT NULL CHECK(low_grip_skill >= 0.00 AND low_grip_skill <= 1.00),
      psychological_strength REAL NOT NULL CHECK(psychological_strength >= 0.00 AND psychological_strength <= 1.00),
      psychological_recovery REAL NOT NULL CHECK(psychological_recovery >= 0.00 AND psychological_recovery <= 1.00),
      intelligence REAL NOT NULL CHECK(intelligence >= 0.00 AND intelligence <= 1.00)
    )
  `);

  // Circuits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS circuits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) NOT NULL,
      gp_name VARCHAR(50) NOT NULL,
      country VARCHAR(50) NOT NULL,
      distance REAL NOT NULL
    )
  `);

  // Seasons table
  db.exec(`
    CREATE TABLE IF NOT EXISTS seasons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      races_quantity INTEGER NOT NULL
    )
  `);

  // Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_order INTEGER NOT NULL,
      id_season INTEGER NOT NULL,
      id_circuit INTEGER NOT NULL,
      number_laps INTEGER NOT NULL,
      race_datetime DATETIME NOT NULL,
      FOREIGN KEY (id_season) REFERENCES seasons(id),
      FOREIGN KEY (id_circuit) REFERENCES circuits(id)
    )
  `);

  // Session types table
  db.exec(`
    CREATE TABLE IF NOT EXISTS session_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(30) NOT NULL
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_event INTEGER NOT NULL,
      id_session_type INTEGER NOT NULL,
      temperature INTEGER NOT NULL,
      is_rain BOOLEAN NOT NULL,
      start_session_datetime DATETIME NOT NULL,
      end_session_datetime DATETIME,
      FOREIGN KEY (id_event) REFERENCES events(id),
      FOREIGN KEY (id_session_type) REFERENCES session_types(id)
    )
  `);

  // Laps table
  db.exec(`
    CREATE TABLE IF NOT EXISTS laps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_driver INTEGER NOT NULL,
      id_session INTEGER NOT NULL,
      sector_1 TEXT NOT NULL,
      sector_2 TEXT NOT NULL,
      sector_3 TEXT NOT NULL,
      time TEXT NOT NULL,
      FOREIGN KEY (id_driver) REFERENCES drivers(id),
      FOREIGN KEY (id_session) REFERENCES sessions(id)
    )
  `);

  // Session results table
  db.exec(`
    CREATE TABLE IF NOT EXISTS session_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_session INTEGER NOT NULL,
      id_driver INTEGER NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (id_session) REFERENCES sessions(id),
      FOREIGN KEY (id_driver) REFERENCES drivers(id)
    )
  `);

  // Cars table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_team INTEGER NOT NULL,
      id_season INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      aerodynamic REAL NOT NULL CHECK(aerodynamic >= 0.00 AND aerodynamic <= 1.00),
      chassis REAL NOT NULL CHECK(chassis >= 0.00 AND chassis <= 1.00),
      gearbox REAL NOT NULL CHECK(gearbox >= 0.00 AND gearbox <= 1.00),
      floor REAL NOT NULL CHECK(floor >= 0.00 AND floor <= 1.00),
      temperature_control REAL NOT NULL CHECK(temperature_control >= 0.00 AND temperature_control <= 1.00),
      FOREIGN KEY (id_team) REFERENCES teams(id),
      FOREIGN KEY (id_season) REFERENCES seasons(id)
    )
  `);

  // Season grid table
  db.exec(`
    CREATE TABLE IF NOT EXISTS season_grid (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_season INTEGER NOT NULL,
      id_team INTEGER NOT NULL,
      id_driver INTEGER NOT NULL,
      FOREIGN KEY (id_season) REFERENCES seasons(id),
      FOREIGN KEY (id_team) REFERENCES teams(id),
      FOREIGN KEY (id_driver) REFERENCES drivers(id)
    )
  `);

  console.log('Database schema initialized successfully');
}
