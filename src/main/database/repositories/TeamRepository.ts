import { TeamDAO } from '../dao/TeamDAO';
import { Team } from '../../models/types';

export class TeamRepository {
  constructor(private teamDAO: TeamDAO) {}

  getAll(): Team[] {
    return this.teamDAO.getAll();
  }

  getById(id: number): Team | undefined {
    return this.teamDAO.getById(id);
  }

  create(team: Omit<Team, 'id'>): Team {
    return this.teamDAO.create(team);
  }

  update(id: number, team: Partial<Team>): boolean {
    return this.teamDAO.update(id, team);
  }

  delete(id: number): boolean {
    return this.teamDAO.delete(id);
  }

  updateBudget(id: number, amount: number): boolean {
    const team = this.getById(id);
    if (!team) return false;
    return this.update(id, { budget: team.budget + amount });
  }

  getTeamPerformance(id: number): number {
    const team = this.getById(id);
    if (!team) return 0;
    return (team.enginePower + team.aerodynamics + team.chassis) / 3;
  }
}
