/**
 * RaceSimulator - Contains the core race simulation logic
 * This logic runs exclusively in the Main Process for security
 * and can be obfuscated in production builds
 */
export class RaceSimulator {
  constructor(databaseManager) {
    this.db = databaseManager;
  }

  /**
   * Simulate a complete race
   */
  async simulateRace(raceConfig) {
    const { raceId, weather = 'dry' } = raceConfig;
    
    // Get game settings for simulation parameters
    const settings = await this.db.getSettings();
    const drivers = await this.db.getDrivers();
    
    // Initialize race state
    const raceState = this.initializeRace(drivers, settings, weather);
    
    // Simulate race laps
    const laps = settings.raceLaps || 50;
    for (let lap = 1; lap <= laps; lap++) {
      this.simulateLap(raceState, settings, lap);
    }
    
    // Calculate final results
    const results = this.calculateResults(raceState);
    
    // Save results to database
    await this.db.saveRaceResults(raceId, results);
    
    return {
      raceId,
      results,
      incidents: raceState.incidents
    };
  }

  /**
   * Initialize race state for all drivers
   */
  initializeRace(drivers, settings, weather) {
    const state = {
      drivers: {},
      incidents: [],
      weather
    };
    
    drivers.forEach(driver => {
      state.drivers[driver.id] = {
        id: driver.id,
        name: driver.name,
        teamId: driver.team_id,
        skill: driver.skill || 75,
        position: driver.grid_position || Math.floor(Math.random() * drivers.length) + 1,
        totalTime: 0,
        lapTimes: [],
        tyreDegradation: 0,
        dnf: false,
        dnfReason: null
      };
    });
    
    return state;
  }

  /**
   * Simulate a single lap for all drivers
   */
  simulateLap(raceState, settings, lapNumber) {
    const wearRate = settings.tyreWearRate || 0.02;
    const errorProbability = settings.driverErrorProbability || 0.05;
    
    Object.values(raceState.drivers).forEach(driver => {
      if (driver.dnf) return;
      
      // Base lap time (in seconds)
      let lapTime = 90 + (Math.random() * 5);
      
      // Skill modifier (better drivers are faster)
      lapTime -= (driver.skill - 75) * 0.1;
      
      // Tyre degradation effect
      driver.tyreDegradation += wearRate;
      lapTime += driver.tyreDegradation * 2;
      
      // Weather effect
      if (raceState.weather === 'wet') {
        lapTime += 5 + (Math.random() * 3);
      }
      
      // Random variance
      lapTime += (Math.random() - 0.5) * 2;
      
      // Check for driver errors/incidents
      if (Math.random() < errorProbability) {
        const incident = this.generateIncident(driver, lapNumber);
        raceState.incidents.push(incident);
        
        if (incident.type === 'crash') {
          driver.dnf = true;
          driver.dnfReason = 'Accident';
          return;
        } else if (incident.type === 'mechanical') {
          driver.dnf = true;
          driver.dnfReason = 'Mechanical Failure';
          return;
        } else {
          // Time penalty for minor incidents
          lapTime += incident.timePenalty || 0;
        }
      }
      
      driver.lapTimes.push(lapTime);
      driver.totalTime += lapTime;
    });
    
    // Update positions
    this.updatePositions(raceState);
  }

  /**
   * Generate a random incident
   */
  generateIncident(driver, lap) {
    const incidents = [
      { type: 'spin', timePenalty: 5, severity: 'minor' },
      { type: 'lockup', timePenalty: 1, severity: 'minor' },
      { type: 'crash', timePenalty: 0, severity: 'major' },
      { type: 'mechanical', timePenalty: 0, severity: 'major' }
    ];
    
    const weights = [0.5, 0.3, 0.15, 0.05];
    const rand = Math.random();
    let cumulative = 0;
    let selectedIncident = incidents[0];
    
    for (let i = 0; i < incidents.length; i++) {
      cumulative += weights[i];
      if (rand <= cumulative) {
        selectedIncident = incidents[i];
        break;
      }
    }
    
    return {
      ...selectedIncident,
      driverId: driver.id,
      driverName: driver.name,
      lap
    };
  }

  /**
   * Update driver positions based on total time
   */
  updatePositions(raceState) {
    const activeDrivers = Object.values(raceState.drivers)
      .filter(d => !d.dnf)
      .sort((a, b) => a.totalTime - b.totalTime);
    
    activeDrivers.forEach((driver, index) => {
      driver.position = index + 1;
    });
  }

  /**
   * Calculate final race results with points
   */
  calculateResults(raceState) {
    const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    
    const results = Object.values(raceState.drivers).map(driver => ({
      driverId: driver.id,
      position: driver.position,
      time: driver.totalTime,
      dnf: driver.dnf,
      dnfReason: driver.dnfReason,
      points: !driver.dnf && driver.position <= 10 
        ? pointsSystem[driver.position - 1] 
        : 0
    }));
    
    // Sort by position, DNFs at the end
    results.sort((a, b) => {
      if (a.dnf && !b.dnf) return 1;
      if (!a.dnf && b.dnf) return -1;
      return a.position - b.position;
    });
    
    return results;
  }
}
