import Database from 'better-sqlite3';
import path from 'path';

/**
 * Initialize the template database with schema and default data
 */
function initializeDatabase() {
  const dbPath = path.join(process.cwd(), 'resources/database/template.db');
  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    -- Teams table
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      budget REAL DEFAULT 100000000,
      prestige INTEGER DEFAULT 50,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Drivers table
    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      team_id INTEGER,
      skill INTEGER DEFAULT 75,
      age INTEGER DEFAULT 25,
      nationality TEXT,
      grid_position INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );

    -- Settings table (for balance parameters)
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'string',
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Race results table
    CREATE TABLE IF NOT EXISTS race_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      race_id INTEGER NOT NULL,
      driver_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      points INTEGER DEFAULT 0,
      time REAL,
      dnf INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );

    -- Championship standings table
    CREATE TABLE IF NOT EXISTS championship_standings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season INTEGER DEFAULT 1,
      driver_id INTEGER NOT NULL,
      points INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );
  `);

  // Insert default teams
  const insertTeam = db.prepare('INSERT INTO teams (name, budget, prestige) VALUES (?, ?, ?)');
  const teams = [
    ['Red Bull Racing', 150000000, 90],
    ['Mercedes AMG', 145000000, 85],
    ['Ferrari', 140000000, 88],
    ['McLaren', 120000000, 75],
    ['Alpine', 110000000, 70],
    ['Aston Martin', 115000000, 72],
    ['Williams', 95000000, 60],
    ['Alfa Romeo', 90000000, 58],
    ['Haas', 85000000, 55],
    ['AlphaTauri', 100000000, 65]
  ];

  teams.forEach(team => insertTeam.run(...team));

  // Insert default drivers
  const insertDriver = db.prepare('INSERT INTO drivers (name, team_id, skill, age, nationality, grid_position) VALUES (?, ?, ?, ?, ?, ?)');
  const drivers = [
    ['Max Verstappen', 1, 95, 26, 'NED', 1],
    ['Sergio Perez', 1, 85, 33, 'MEX', 2],
    ['Lewis Hamilton', 2, 94, 38, 'GBR', 3],
    ['George Russell', 2, 87, 25, 'GBR', 4],
    ['Charles Leclerc', 3, 92, 26, 'MON', 5],
    ['Carlos Sainz', 3, 88, 29, 'ESP', 6],
    ['Lando Norris', 4, 89, 24, 'GBR', 7],
    ['Oscar Piastri', 4, 83, 22, 'AUS', 8],
    ['Fernando Alonso', 5, 90, 42, 'ESP', 9],
    ['Esteban Ocon', 5, 82, 27, 'FRA', 10],
    ['Lance Stroll', 6, 78, 25, 'CAN', 11],
    ['Pierre Gasly', 6, 84, 27, 'FRA', 12],
    ['Alex Albon', 7, 81, 27, 'THA', 13],
    ['Logan Sargeant', 7, 72, 22, 'USA', 14],
    ['Valtteri Bottas', 8, 86, 34, 'FIN', 15],
    ['Zhou Guanyu', 8, 75, 24, 'CHN', 16],
    ['Kevin Magnussen', 9, 80, 31, 'DEN', 17],
    ['Nico Hulkenberg', 9, 83, 36, 'GER', 18],
    ['Yuki Tsunoda', 10, 79, 23, 'JPN', 19],
    ['Daniel Ricciardo', 10, 85, 34, 'AUS', 20]
  ];

  drivers.forEach(driver => insertDriver.run(...driver));

  // Insert default game settings
  const insertSetting = db.prepare('INSERT INTO settings (key, value, type, description) VALUES (?, ?, ?, ?)');
  const settings = [
    ['tyreWearRate', '0.02', 'number', 'Rate at which tyres degrade per lap'],
    ['driverErrorProbability', '0.05', 'number', 'Probability of driver error per lap'],
    ['raceLaps', '50', 'number', 'Default number of laps in a race'],
    ['weatherVariability', '0.3', 'number', 'Probability of weather changes'],
    ['mechanicalReliability', '0.95', 'number', 'Base mechanical reliability factor'],
    ['overtakingDifficulty', '0.7', 'number', 'Difficulty multiplier for overtaking'],
    ['fuelConsumptionRate', '1.5', 'number', 'Fuel consumption per lap (kg)'],
    ['drsEffect', '0.3', 'number', 'DRS lap time advantage (seconds)']
  ];

  settings.forEach(setting => insertSetting.run(...setting));

  console.log('Template database initialized successfully!');
  console.log(`Location: ${dbPath}`);
  console.log(`Teams: ${teams.length}`);
  console.log(`Drivers: ${drivers.length}`);
  console.log(`Settings: ${settings.length}`);

  db.close();
}

// Run initialization
initializeDatabase();
