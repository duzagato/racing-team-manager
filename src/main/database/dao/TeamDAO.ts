import Database from 'better-sqlite3';
import { BaseDAO } from './BaseDAO';
import { Team } from '../../models/types';

export class TeamDAO extends BaseDAO<Team> {
  constructor(db: Database.Database) {
    super(db);
  }

  getAll(): Team[] {
    const stmt = this.db.prepare(`
      SELECT id, name, budget, reputation, engine_power as enginePower, 
             aerodynamics, chassis
      FROM teams
    `);
    return stmt.all() as Team[];
  }

  getById(id: number): Team | undefined {
    const stmt = this.db.prepare(`
      SELECT id, name, budget, reputation, engine_power as enginePower, 
             aerodynamics, chassis
      FROM teams WHERE id = ?
    `);
    return stmt.get(id) as Team | undefined;
  }

  create(entity: Omit<Team, 'id'>): Team {
    const stmt = this.db.prepare(`
      INSERT INTO teams (name, budget, reputation, engine_power, aerodynamics, chassis)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      entity.name,
      entity.budget,
      entity.reputation,
      entity.enginePower,
      entity.aerodynamics,
      entity.chassis
    );
    return { id: result.lastInsertRowid as number, ...entity };
  }

  update(id: number, entity: Partial<Team>): boolean {
    const fields = [];
    const values = [];

    if (entity.name !== undefined) {
      fields.push('name = ?');
      values.push(entity.name);
    }
    if (entity.budget !== undefined) {
      fields.push('budget = ?');
      values.push(entity.budget);
    }
    if (entity.reputation !== undefined) {
      fields.push('reputation = ?');
      values.push(entity.reputation);
    }
    if (entity.enginePower !== undefined) {
      fields.push('engine_power = ?');
      values.push(entity.enginePower);
    }
    if (entity.aerodynamics !== undefined) {
      fields.push('aerodynamics = ?');
      values.push(entity.aerodynamics);
    }
    if (entity.chassis !== undefined) {
      fields.push('chassis = ?');
      values.push(entity.chassis);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const stmt = this.db.prepare(`UPDATE teams SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM teams WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
