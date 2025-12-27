export interface Team {
  id: number;
  name: string;
  budget: number;
  reputation: number;
  enginePower: number;
  aerodynamics: number;
  chassis: number;
}

export interface Driver {
  id: number;
  name: string;
  teamId: number;
  skill: number;
  consistency: number;
  racecraft: number;
  experience: number;
}

export interface Race {
  id: number;
  name: string;
  country: string;
  laps: number;
  length: number;
  completed: boolean;
}

export interface Standing {
  id: number;
  driverId: number;
  points: number;
  wins: number;
  podiums: number;
}

export interface Balance {
  id: number;
  category: string;
  parameter: string;
  value: number;
  description: string;
}

export interface CareerMetadata {
  id: string;
  name: string;
  createdAt: string;
  lastPlayed: string;
  currentWeek: number;
  season: number;
}

export interface RaceResult {
  position: number;
  driverId: number;
  driverName: string;
  teamName: string;
  time: string;
  points: number;
}
