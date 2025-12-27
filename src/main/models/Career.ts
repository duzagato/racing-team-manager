import { DatabaseManager } from '../database/DatabaseManager';
import { TeamDAO } from '../database/dao/TeamDAO';
import { DriverDAO } from '../database/dao/DriverDAO';
import { StandingDAO } from '../database/dao/StandingDAO';
import { BalanceDAO } from '../database/dao/BalanceDAO';
import { TeamRepository } from '../database/repositories/TeamRepository';
import { DriverRepository } from '../database/repositories/DriverRepository';
import { StandingRepository } from '../database/repositories/StandingRepository';
import { BalanceRepository } from '../database/repositories/BalanceRepository';
import { CareerMetadata } from '../models/types';

export class Career {
  private dbManager: DatabaseManager;
  public teamRepository: TeamRepository;
  public driverRepository: DriverRepository;
  public standingsRepository: StandingRepository;
  public balanceRepository: BalanceRepository;

  constructor(
    public metadata: CareerMetadata,
    dbPath: string
  ) {
    this.dbManager = new DatabaseManager(dbPath);
    const db = this.dbManager.connect();

    // Initialize DAOs
    const teamDAO = new TeamDAO(db);
    const driverDAO = new DriverDAO(db);
    const standingDAO = new StandingDAO(db);
    const balanceDAO = new BalanceDAO(db);

    // Initialize Repositories
    this.teamRepository = new TeamRepository(teamDAO);
    this.driverRepository = new DriverRepository(driverDAO);
    this.standingsRepository = new StandingRepository(standingDAO);
    this.balanceRepository = new BalanceRepository(balanceDAO);
  }

  updateMetadata(updates: Partial<CareerMetadata>): void {
    this.metadata = { ...this.metadata, ...updates, lastPlayed: new Date().toISOString() };
  }

  advanceWeek(): void {
    this.metadata.currentWeek++;
    this.updateMetadata({});
  }

  close(): void {
    this.dbManager.close();
  }
}
