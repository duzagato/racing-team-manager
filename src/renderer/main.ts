import './styles/main.scss';
import { CareerMetadata, Team, Driver, Standing, RaceResult } from '../main/models/types';

let currentCareer: { metadata: CareerMetadata } | null = null;

// Screen management
function showScreen(screenId: string) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

// Tab management
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const tabContent = document.getElementById(`${tabName}-tab`);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });
}

// Career list
async function loadCareersList() {
  const careersList = document.getElementById('careers-list');
  if (!careersList) return;

  try {
    const careers = await window.api.career.list();
    
    if (careers.length === 0) {
      careersList.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">No careers found. Create a new one to get started!</p>';
      return;
    }

    careersList.innerHTML = careers.map(career => `
      <div class="career-item" data-career-id="${career.id}">
        <div class="career-details">
          <h4>${career.name}</h4>
          <p>Season ${career.season} - Week ${career.currentWeek}</p>
          <p style="font-size: 0.8rem;">Last played: ${new Date(career.lastPlayed).toLocaleDateString()}</p>
        </div>
        <div class="career-actions">
          <button class="btn btn-primary load-career-btn">Load</button>
          <button class="btn btn-secondary delete-career-btn">Delete</button>
        </div>
      </div>
    `).join('');

    // Add event listeners
    careersList.querySelectorAll('.load-career-btn').forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const careerId = careers[index].id;
        loadCareer(careerId);
      });
    });

    careersList.querySelectorAll('.delete-career-btn').forEach((btn, index) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const careerId = careers[index].id;
        if (confirm(`Are you sure you want to delete career "${careers[index].name}"?`)) {
          await window.api.career.delete(careerId);
          loadCareersList();
        }
      });
    });

  } catch (error) {
    console.error('Failed to load careers:', error);
    careersList.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Failed to load careers</p>';
  }
}

// Create career
async function createCareer() {
  const nameInput = document.getElementById('career-name') as HTMLInputElement;
  const name = nameInput.value.trim();

  if (!name) {
    alert('Please enter a career name');
    return;
  }

  try {
    await window.api.career.create(name);
    nameInput.value = '';
    showScreen('career-select');
    loadCareersList();
  } catch (error) {
    console.error('Failed to create career:', error);
    alert('Failed to create career');
  }
}

// Load career
async function loadCareer(careerId: string) {
  try {
    const career = await window.api.career.load(careerId);
    currentCareer = career;
    
    document.getElementById('career-title')!.textContent = career.metadata.name;
    document.getElementById('career-stats')!.textContent = `Season ${career.metadata.season} - Week ${career.metadata.currentWeek}`;
    
    showScreen('game-screen');
    await refreshGameData();
  } catch (error) {
    console.error('Failed to load career:', error);
    alert('Failed to load career');
  }
}

// Refresh game data
async function refreshGameData() {
  if (!currentCareer) return;
  
  const careerId = currentCareer.metadata.id;
  
  try {
    // Load standings
    const standings = await window.api.data.getStandings(careerId);
    const drivers = await window.api.data.getDrivers(careerId);
    const teams = await window.api.data.getTeams(careerId);
    
    displayStandings(standings, drivers, teams);
    displayTeams(teams);
    displayDrivers(drivers, teams);
  } catch (error) {
    console.error('Failed to refresh game data:', error);
  }
}

// Display standings
function displayStandings(standings: Standing[], drivers: Driver[], teams: Team[]) {
  const container = document.getElementById('standings-table');
  if (!container) return;

  const driverMap = new Map(drivers.map(d => [d.id, d]));
  const teamMap = new Map(teams.map(t => [t.id, t]));

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Pos</th>
          <th>Driver</th>
          <th>Team</th>
          <th>Points</th>
          <th>Wins</th>
          <th>Podiums</th>
        </tr>
      </thead>
      <tbody>
        ${standings.map((standing, index) => {
          const driver = driverMap.get(standing.driverId);
          const team = driver ? teamMap.get(driver.teamId) : null;
          return `
            <tr>
              <td class="position">${index + 1}</td>
              <td>${driver?.name || 'Unknown'}</td>
              <td>${team?.name || 'Unknown'}</td>
              <td class="points">${standing.points}</td>
              <td>${standing.wins}</td>
              <td>${standing.podiums}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

// Display teams
function displayTeams(teams: Team[]) {
  const container = document.getElementById('teams-table');
  if (!container) return;

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Team</th>
          <th>Budget</th>
          <th>Reputation</th>
          <th>Engine</th>
          <th>Aero</th>
          <th>Chassis</th>
          <th>Avg Performance</th>
        </tr>
      </thead>
      <tbody>
        ${teams.map(team => {
          const avgPerf = ((team.enginePower + team.aerodynamics + team.chassis) / 3).toFixed(1);
          return `
            <tr>
              <td>${team.name}</td>
              <td>$${(team.budget / 1000000).toFixed(1)}M</td>
              <td>${team.reputation}</td>
              <td>${team.enginePower}</td>
              <td>${team.aerodynamics}</td>
              <td>${team.chassis}</td>
              <td class="points">${avgPerf}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

// Display drivers
function displayDrivers(drivers: Driver[], teams: Team[]) {
  const container = document.getElementById('drivers-table');
  if (!container) return;

  const teamMap = new Map(teams.map(t => [t.id, t]));

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Driver</th>
          <th>Team</th>
          <th>Skill</th>
          <th>Consistency</th>
          <th>Racecraft</th>
          <th>Experience</th>
          <th>Avg Rating</th>
        </tr>
      </thead>
      <tbody>
        ${drivers.map(driver => {
          const team = teamMap.get(driver.teamId);
          const avgRating = ((driver.skill + driver.consistency + driver.racecraft + driver.experience) / 4).toFixed(1);
          return `
            <tr>
              <td>${driver.name}</td>
              <td>${team?.name || 'Unknown'}</td>
              <td>${driver.skill}</td>
              <td>${driver.consistency}</td>
              <td>${driver.racecraft}</td>
              <td>${driver.experience}</td>
              <td class="points">${avgRating}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

// Advance week
async function advanceWeek() {
  if (!currentCareer) return;

  try {
    const result = await window.api.simulation.advance(currentCareer.metadata.id);
    
    // Update career stats
    document.getElementById('career-stats')!.textContent = `Season ${currentCareer.metadata.season} - Week ${result.week}`;
    
    // Update events log
    const eventsLog = document.getElementById('events-log');
    if (eventsLog) {
      result.events.forEach((event: string) => {
        const eventItem = document.createElement('p');
        eventItem.className = 'event-item';
        eventItem.textContent = event;
        eventsLog.insertBefore(eventItem, eventsLog.firstChild);
      });
    }
    
    await refreshGameData();
  } catch (error) {
    console.error('Failed to advance week:', error);
    alert('Failed to advance week');
  }
}

// Simulate race
async function simulateRace() {
  if (!currentCareer) return;

  try {
    const results = await window.api.simulation.race(currentCareer.metadata.id);
    
    // Display race results in events log
    const eventsLog = document.getElementById('events-log');
    if (eventsLog) {
      const raceEvent = document.createElement('p');
      raceEvent.className = 'event-item';
      raceEvent.innerHTML = `<strong>Race Results:</strong><br>${results.slice(0, 10).map((r: RaceResult) => 
        `${r.position}. ${r.driverName} (${r.teamName}) - ${r.points} pts`
      ).join('<br>')}`;
      eventsLog.insertBefore(raceEvent, eventsLog.firstChild);
    }
    
    await refreshGameData();
  } catch (error) {
    console.error('Failed to simulate race:', error);
    alert('Failed to simulate race');
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadCareersList();

  // Career selection buttons
  document.getElementById('new-career-btn')?.addEventListener('click', () => {
    showScreen('new-career');
  });

  document.getElementById('create-career-btn')?.addEventListener('click', createCareer);
  
  document.getElementById('cancel-career-btn')?.addEventListener('click', () => {
    showScreen('career-select');
  });

  // Game screen buttons
  document.getElementById('back-to-menu-btn')?.addEventListener('click', () => {
    currentCareer = null;
    showScreen('career-select');
    loadCareersList();
  });

  document.getElementById('advance-week-btn')?.addEventListener('click', advanceWeek);
  document.getElementById('simulate-race-btn')?.addEventListener('click', simulateRace);

  // Handle Enter key in career name input
  document.getElementById('career-name')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      createCareer();
    }
  });
});
