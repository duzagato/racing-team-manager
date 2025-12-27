// Domain layer - Game Services
// This will contain the main service with game loop and auxiliary services

/**
 * Main game service placeholder
 * This will control the game flow with a main loop
 */
export class GameService {
  constructor() {
    this.running = false;
  }

  start() {
    console.log('Game service started');
    this.running = true;
  }

  stop() {
    console.log('Game service stopped');
    this.running = false;
  }
}
