import { Career } from '../models/Career';
import { RaceResult, Driver, Team } from '../models/types';

export class SimulationEngine {
  private readonly POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

  constructor() {}

  advanceWeek(career: Career): { week: number; events: string[] } {
    career.advanceWeek();
    
    const events: string[] = [];
    const teams = career.teamRepository.getAll();
    
    // Apply weekly costs
    const weeklyCosts = career.balanceRepository.getParameter('financial', 'weekly_costs');
    teams.forEach(team => {
      career.teamRepository.updateBudget(team.id, -weeklyCosts);
    });
    
    events.push(`Week ${career.metadata.currentWeek}: Weekly operations completed`);
    events.push(`All teams paid ${this.formatCurrency(weeklyCosts)} in operational costs`);

    return {
      week: career.metadata.currentWeek,
      events,
    };
  }

  simulateRace(career: Career): RaceResult[] {
    const drivers = career.driverRepository.getAll();
    const teams = career.teamRepository.getAll();

    // Get balance parameters
    const skillWeight = career.balanceRepository.getParameter('race', 'skill_weight');
    const carWeight = career.balanceRepository.getParameter('race', 'car_weight');
    const luckWeight = career.balanceRepository.getParameter('race', 'luck_weight');
    const consistencyWeight = career.balanceRepository.getParameter('race', 'consistency_weight');

    // Calculate performance for each driver
    const performances: Array<{ driver: Driver; team: Team; performance: number }> = [];

    for (const driver of drivers) {
      const team = teams.find(t => t.id === driver.teamId);
      if (!team) continue;

      // Calculate driver performance
      const driverPerf = (
        driver.skill * skillWeight +
        driver.consistency * consistencyWeight +
        driver.racecraft * (1 - skillWeight - consistencyWeight) / 2 +
        driver.experience * (1 - skillWeight - consistencyWeight) / 2
      );

      // Calculate car performance
      const carPerf = (team.enginePower + team.aerodynamics + team.chassis) / 3;

      // Add random factor (luck)
      const luck = Math.random() * 100;

      // Combined performance
      const totalPerformance = 
        driverPerf * skillWeight +
        carPerf * carWeight +
        luck * luckWeight;

      performances.push({ driver, team, performance: totalPerformance });
    }

    // Sort by performance (descending)
    performances.sort((a, b) => b.performance - a.performance);

    // Create race results
    const results: RaceResult[] = performances.map((perf, index) => {
      const position = index + 1;
      const points = position <= 10 ? this.POINTS_SYSTEM[position - 1] : 0;

      // Update standings
      if (points > 0) {
        career.standingsRepository.addPoints(perf.driver.id, points, position);
      }

      // Calculate race time (simulate)
      const baseTime = 5400; // 1:30:00 in seconds
      const timeVariation = index * (2 + Math.random() * 3); // Each position slower
      const totalSeconds = baseTime + timeVariation;
      const time = this.formatRaceTime(totalSeconds);

      return {
        position,
        driverId: perf.driver.id,
        driverName: perf.driver.name,
        teamName: perf.team.name,
        time,
        points,
      };
    });

    // Award prize money to teams
    const prizeMultiplier = career.balanceRepository.getParameter('financial', 'race_prize_multiplier');
    results.forEach((result, index) => {
      const team = teams.find(t => t.name === result.teamName);
      if (team) {
        const prize = (20 - index) * prizeMultiplier; // More money for better positions
        career.teamRepository.updateBudget(team.id, prize);
      }
    });

    return results;
  }

  private formatRaceTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
