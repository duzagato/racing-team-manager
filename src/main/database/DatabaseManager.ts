import Database from 'better-sqlite3';
import fs from 'fs';

export class DatabaseManager {
  private db: Database.Database | null = null;

  constructor(private dbPath: string) {}

  connect(): Database.Database {
    if (!this.db) {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
    }
    return this.db;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  static createTemplateDatabase(templatePath: string): void {
    const db = new Database(templatePath);
    
    // Create teams table
    db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        budget INTEGER DEFAULT 150000000,
        reputation INTEGER DEFAULT 50,
        engine_power INTEGER DEFAULT 50,
        aerodynamics INTEGER DEFAULT 50,
        chassis INTEGER DEFAULT 50
      )
    `);

    // Create drivers table
    db.exec(`
      CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        team_id INTEGER,
        skill INTEGER DEFAULT 50,
        consistency INTEGER DEFAULT 50,
        racecraft INTEGER DEFAULT 50,
        experience INTEGER DEFAULT 50,
        FOREIGN KEY (team_id) REFERENCES teams(id)
      )
    `);

    // Create races table
    db.exec(`
      CREATE TABLE IF NOT EXISTS races (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        laps INTEGER DEFAULT 50,
        length REAL DEFAULT 5.0,
        completed INTEGER DEFAULT 0
      )
    `);

    // Create standings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS standings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        driver_id INTEGER NOT NULL,
        points INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        podiums INTEGER DEFAULT 0,
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
      )
    `);

    // Create balance parameters table
    db.exec(`
      CREATE TABLE IF NOT EXISTS balance_parameters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        parameter TEXT NOT NULL,
        value REAL NOT NULL,
        description TEXT
      )
    `);

    // Insert default balance parameters
    const insertBalance = db.prepare(`
      INSERT INTO balance_parameters (category, parameter, value, description)
      VALUES (?, ?, ?, ?)
    `);

    const balanceParams = [
      ['race', 'skill_weight', 0.4, 'Driver skill impact on race performance'],
      ['race', 'car_weight', 0.35, 'Car performance impact on race performance'],
      ['race', 'luck_weight', 0.15, 'Random factor in race performance'],
      ['race', 'consistency_weight', 0.1, 'Driver consistency impact'],
      ['development', 'cost_per_point', 1000000, 'Cost to improve car by 1 point'],
      ['development', 'max_improvement', 10, 'Maximum points improvement per season'],
      ['financial', 'weekly_costs', 500000, 'Weekly operational costs'],
      ['financial', 'race_prize_multiplier', 10000, 'Prize money per position'],
    ];

    balanceParams.forEach(params => insertBalance.run(...params));

    // Insert sample teams
    const insertTeam = db.prepare(`
      INSERT INTO teams (name, budget, reputation, engine_power, aerodynamics, chassis)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const teams = [
      ['Red Bull Racing', 200000000, 95, 90, 95, 92],
      ['Mercedes AMG', 200000000, 90, 88, 90, 88],
      ['Ferrari', 200000000, 85, 85, 88, 86],
      ['McLaren', 180000000, 75, 82, 80, 81],
      ['Aston Martin', 170000000, 70, 78, 75, 77],
      ['Alpine', 150000000, 65, 75, 72, 73],
      ['Williams', 130000000, 60, 70, 68, 70],
      ['AlphaTauri', 140000000, 62, 72, 70, 71],
      ['Alfa Romeo', 135000000, 58, 68, 66, 68],
      ['Haas', 120000000, 55, 65, 63, 65],
    ];

    teams.forEach(team => insertTeam.run(...team));

    // Insert sample drivers
    const insertDriver = db.prepare(`
      INSERT INTO drivers (name, team_id, skill, consistency, racecraft, experience)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const drivers = [
      ['Max Verstappen', 1, 98, 95, 96, 85],
      ['Sergio Perez', 1, 88, 85, 87, 90],
      ['Lewis Hamilton', 2, 97, 96, 98, 98],
      ['George Russell', 2, 90, 88, 89, 75],
      ['Charles Leclerc', 3, 94, 87, 92, 80],
      ['Carlos Sainz', 3, 89, 90, 88, 85],
      ['Lando Norris', 4, 91, 88, 90, 75],
      ['Oscar Piastri', 4, 85, 82, 84, 65],
      ['Fernando Alonso', 5, 93, 94, 95, 98],
      ['Lance Stroll', 5, 78, 76, 77, 80],
      ['Pierre Gasly', 6, 84, 82, 83, 78],
      ['Esteban Ocon', 6, 83, 81, 82, 77],
      ['Alex Albon', 7, 82, 80, 81, 75],
      ['Logan Sargeant', 7, 72, 70, 71, 60],
      ['Yuki Tsunoda', 8, 80, 75, 79, 70],
      ['Daniel Ricciardo', 8, 86, 83, 88, 92],
      ['Valtteri Bottas', 9, 87, 89, 86, 90],
      ['Zhou Guanyu', 9, 74, 72, 73, 68],
      ['Kevin Magnussen', 10, 79, 77, 78, 85],
      ['Nico Hulkenberg', 10, 81, 82, 80, 88],
    ];

    drivers.forEach(driver => insertDriver.run(...driver));

    // Insert races
    const insertRace = db.prepare(`
      INSERT INTO races (name, country, laps, length)
      VALUES (?, ?, ?, ?)
    `);

    const races = [
      ['Bahrain Grand Prix', 'Bahrain', 57, 5.412],
      ['Saudi Arabian Grand Prix', 'Saudi Arabia', 50, 6.174],
      ['Australian Grand Prix', 'Australia', 58, 5.278],
      ['Japanese Grand Prix', 'Japan', 53, 5.807],
      ['Chinese Grand Prix', 'China', 56, 5.451],
      ['Miami Grand Prix', 'USA', 57, 5.412],
      ['Monaco Grand Prix', 'Monaco', 78, 3.337],
      ['Spanish Grand Prix', 'Spain', 66, 4.675],
      ['Canadian Grand Prix', 'Canada', 70, 4.361],
      ['Austrian Grand Prix', 'Austria', 71, 4.318],
      ['British Grand Prix', 'Great Britain', 52, 5.891],
      ['Hungarian Grand Prix', 'Hungary', 70, 4.381],
      ['Belgian Grand Prix', 'Belgium', 44, 7.004],
      ['Dutch Grand Prix', 'Netherlands', 72, 4.259],
      ['Italian Grand Prix', 'Italy', 53, 5.793],
      ['Singapore Grand Prix', 'Singapore', 62, 4.940],
      ['United States Grand Prix', 'USA', 56, 5.513],
      ['Mexico City Grand Prix', 'Mexico', 71, 4.304],
      ['Brazilian Grand Prix', 'Brazil', 71, 4.309],
      ['Las Vegas Grand Prix', 'USA', 50, 6.120],
      ['Qatar Grand Prix', 'Qatar', 57, 5.380],
      ['Abu Dhabi Grand Prix', 'UAE', 58, 5.281],
    ];

    races.forEach(race => insertRace.run(...race));

    // Initialize standings for all drivers
    const insertStanding = db.prepare(`
      INSERT INTO standings (driver_id, points, wins, podiums)
      VALUES (?, 0, 0, 0)
    `);

    for (let i = 1; i <= 20; i++) {
      insertStanding.run(i);
    }

    db.close();
  }

  static cloneDatabase(sourcePath: string, targetPath: string): void {
    fs.copyFileSync(sourcePath, targetPath);
  }
}
