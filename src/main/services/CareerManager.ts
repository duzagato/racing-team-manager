import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Career } from '../models/Career';
import { CareerMetadata } from '../models/types';
import { DatabaseManager } from '../database/DatabaseManager';

export class CareerManager {
  private careersPath: string;
  private templateDbPath: string;
  private activeCareers: Map<string, Career> = new Map();

  constructor(userDataPath: string) {
    this.careersPath = path.join(userDataPath, 'careers');
    this.templateDbPath = path.join(userDataPath, 'template.db');
    this.initialize();
  }

  private initialize(): void {
    // Create careers directory if it doesn't exist
    if (!fs.existsSync(this.careersPath)) {
      fs.mkdirSync(this.careersPath, { recursive: true });
    }

    // Create template database if it doesn't exist
    if (!fs.existsSync(this.templateDbPath)) {
      DatabaseManager.createTemplateDatabase(this.templateDbPath);
    }
  }

  listCareers(): CareerMetadata[] {
    const careers: CareerMetadata[] = [];
    
    if (!fs.existsSync(this.careersPath)) {
      return careers;
    }

    const folders = fs.readdirSync(this.careersPath);
    
    for (const folder of folders) {
      const metadataPath = path.join(this.careersPath, folder, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          careers.push(metadata);
        } catch (error) {
          console.error(`Failed to read metadata for career ${folder}:`, error);
        }
      }
    }

    return careers.sort((a, b) => 
      new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
    );
  }

  createCareer(name: string): CareerMetadata {
    const careerId = uuidv4();
    const careerPath = path.join(this.careersPath, careerId);
    const careerDbPath = path.join(careerPath, 'career.db');
    const metadataPath = path.join(careerPath, 'metadata.json');

    // Create career directory
    fs.mkdirSync(careerPath, { recursive: true });

    // Clone template database
    DatabaseManager.cloneDatabase(this.templateDbPath, careerDbPath);

    // Create metadata
    const metadata: CareerMetadata = {
      id: careerId,
      name,
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      currentWeek: 1,
      season: 1,
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return metadata;
  }

  loadCareer(careerId: string): Career {
    // Check if already loaded
    if (this.activeCareers.has(careerId)) {
      return this.activeCareers.get(careerId)!;
    }

    const careerPath = path.join(this.careersPath, careerId);
    const careerDbPath = path.join(careerPath, 'career.db');
    const metadataPath = path.join(careerPath, 'metadata.json');

    if (!fs.existsSync(metadataPath) || !fs.existsSync(careerDbPath)) {
      throw new Error('Career not found');
    }

    const metadata: CareerMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    const career = new Career(metadata, careerDbPath);

    this.activeCareers.set(careerId, career);
    return career;
  }

  getActiveCareer(careerId: string): Career | undefined {
    return this.activeCareers.get(careerId);
  }

  saveCareerMetadata(careerId: string): void {
    const career = this.activeCareers.get(careerId);
    if (!career) return;

    const metadataPath = path.join(this.careersPath, careerId, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(career.metadata, null, 2));
  }

  deleteCareer(careerId: string): boolean {
    const careerPath = path.join(this.careersPath, careerId);
    
    // Close career if it's active
    const career = this.activeCareers.get(careerId);
    if (career) {
      career.close();
      this.activeCareers.delete(careerId);
    }

    // Delete career directory
    if (fs.existsSync(careerPath)) {
      fs.rmSync(careerPath, { recursive: true, force: true });
      return true;
    }

    return false;
  }

  closeAllCareers(): void {
    for (const [careerId, career] of this.activeCareers) {
      this.saveCareerMetadata(careerId);
      career.close();
    }
    this.activeCareers.clear();
  }
}
