import { StandingDAO } from '../dao/StandingDAO';
import { Standing } from '../../models/types';

export class StandingRepository {
  constructor(private standingDAO: StandingDAO) {}

  getAll(): Standing[] {
    return this.standingDAO.getAll();
  }

  getCurrentStandings(): Standing[] {
    return this.getAll();
  }

  getByDriverId(driverId: number): Standing | undefined {
    return this.standingDAO.getByDriverId(driverId);
  }

  addPoints(driverId: number, points: number, position: number): void {
    this.standingDAO.addPoints(driverId, points, position);
  }

  resetStandings(): void {
    const standings = this.getAll();
    standings.forEach(standing => {
      this.standingDAO.update(standing.id, { points: 0, wins: 0, podiums: 0 });
    });
  }
}
