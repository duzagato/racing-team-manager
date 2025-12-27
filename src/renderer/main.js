/**
 * Renderer Process - Main UI Logic
 * Uses the electronAPI exposed by preload script via contextBridge
 */

class GameUI {
  constructor() {
    this.currentSave = null;
    this.currentView = 'dashboard';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSavesList();
  }

  setupEventListeners() {
    // Screen navigation
    document.getElementById('newGameBtn').addEventListener('click', () => {
      this.showScreen('newGameScreen');
    });

    document.getElementById('loadGameBtn').addEventListener('click', () => {
      this.showScreen('saveScreen');
      this.loadSavesList();
    });

    document.getElementById('cancelNewGame').addEventListener('click', () => {
      this.showScreen('saveScreen');
    });

    // New game form
    document.getElementById('newGameForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.createNewGame();
    });

    // Game navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchView(e.target.dataset.view);
      });
    });

    // Race simulation
    const simulateBtn = document.getElementById('simulateRaceBtn');
    if (simulateBtn) {
      simulateBtn.addEventListener('click', () => this.simulateRace());
    }
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
  }

  switchView(viewId) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewId}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');

    this.currentView = viewId;
    this.loadViewData(viewId);
  }

  async loadSavesList() {
    try {
      const saves = await window.electronAPI.save.list();
      const saveList = document.getElementById('saveList');
      
      if (saves.length === 0) {
        saveList.innerHTML = '<p class="no-saves">No save games found. Create a new game to start!</p>';
        return;
      }

      saveList.innerHTML = saves.map(save => `
        <div class="save-item" data-save="${save.name}">
          <div class="save-info">
            <h3>${save.name}</h3>
            <p>Player: ${save.playerName}</p>
            <p>Season ${save.gameProgress?.season || 1}, Race ${save.gameProgress?.race || 0}</p>
            <p class="save-date">Last played: ${new Date(save.lastPlayed).toLocaleDateString()}</p>
          </div>
          <div class="save-actions">
            <button class="btn btn-primary load-save-btn" data-save="${save.name}">Load</button>
            <button class="btn btn-danger delete-save-btn" data-save="${save.name}">Delete</button>
          </div>
        </div>
      `).join('');

      // Add event listeners
      document.querySelectorAll('.load-save-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.loadSave(e.target.dataset.save);
        });
      });

      document.querySelectorAll('.delete-save-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          if (confirm('Are you sure you want to delete this save?')) {
            await window.electronAPI.save.delete(e.target.dataset.save);
            this.loadSavesList();
          }
        });
      });
    } catch (error) {
      console.error('Error loading saves:', error);
    }
  }

  async createNewGame() {
    const saveName = document.getElementById('saveName').value;
    const playerName = document.getElementById('playerName').value;

    try {
      const result = await window.electronAPI.save.create(saveName, playerName);
      if (result.success) {
        await this.loadSave(saveName);
      }
    } catch (error) {
      alert('Error creating new game: ' + error.message);
      console.error(error);
    }
  }

  async loadSave(saveName) {
    try {
      const metadata = await window.electronAPI.save.load(saveName);
      this.currentSave = { name: saveName, ...metadata };
      this.showScreen('gameScreen');
      this.loadViewData('dashboard');
    } catch (error) {
      alert('Error loading save: ' + error.message);
      console.error(error);
    }
  }

  async loadViewData(viewId) {
    switch (viewId) {
      case 'team':
        await this.loadTeamData();
        break;
      case 'settings':
        await this.loadSettings();
        break;
      case 'standings':
        await this.loadStandings();
        break;
    }
  }

  async loadTeamData() {
    try {
      const teams = await window.electronAPI.game.getTeams();
      const drivers = await window.electronAPI.game.getDrivers();
      
      const teamInfo = document.getElementById('teamInfo');
      teamInfo.innerHTML = `
        <div class="teams-grid">
          ${teams.map(team => {
            const teamDrivers = drivers.filter(d => d.team_id === team.id);
            return `
              <div class="team-card">
                <h3>${team.name}</h3>
                <p>Budget: $${(team.budget / 1000000).toFixed(1)}M</p>
                <p>Prestige: ${team.prestige}/100</p>
                <h4>Drivers:</h4>
                <ul>
                  ${teamDrivers.map(d => `<li>${d.name} (Skill: ${d.skill})</li>`).join('')}
                </ul>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  }

  async loadSettings() {
    try {
      const settings = await window.electronAPI.game.getSettings();
      
      const settingsPanel = document.getElementById('settingsPanel');
      settingsPanel.innerHTML = `
        <div class="settings-list">
          ${Object.entries(settings).map(([key, value]) => `
            <div class="setting-item">
              <label>${key}</label>
              <input type="number" 
                     id="setting-${key}" 
                     value="${value}" 
                     step="0.01"
                     data-setting="${key}">
              <button class="btn btn-small update-setting-btn" data-setting="${key}">Update</button>
            </div>
          `).join('')}
        </div>
      `;

      // Add event listeners
      document.querySelectorAll('.update-setting-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const key = e.target.dataset.setting;
          const value = document.getElementById(`setting-${key}`).value;
          await window.electronAPI.game.updateSetting(key, value);
          alert('Setting updated!');
        });
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async loadStandings() {
    const standingsTable = document.getElementById('standingsTable');
    standingsTable.innerHTML = '<p>Championship standings will be displayed here after races.</p>';
  }

  async simulateRace() {
    try {
      const raceConfig = {
        raceId: Date.now(),
        weather: 'dry',
        trackId: 1
      };

      const result = await window.electronAPI.race.simulate(raceConfig);
      
      const raceResults = document.getElementById('raceResults');
      raceResults.innerHTML = `
        <h3>Race Results</h3>
        <table class="results-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Driver</th>
              <th>Time</th>
              <th>Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${result.results.map(r => `
              <tr class="${r.dnf ? 'dnf' : ''}">
                <td>${r.dnf ? 'DNF' : r.position}</td>
                <td>Driver ${r.driverId}</td>
                <td>${r.dnf ? '-' : r.time.toFixed(3)}s</td>
                <td>${r.points}</td>
                <td>${r.dnf ? r.dnfReason : 'Finished'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${result.incidents.length > 0 ? `
          <h4>Incidents</h4>
          <ul class="incidents-list">
            ${result.incidents.map(i => `
              <li>Lap ${i.lap}: ${i.driverName} - ${i.type} (${i.severity})</li>
            `).join('')}
          </ul>
        ` : ''}
      `;
    } catch (error) {
      alert('Error simulating race: ' + error.message);
      console.error(error);
    }
  }
}

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GameUI();
});
