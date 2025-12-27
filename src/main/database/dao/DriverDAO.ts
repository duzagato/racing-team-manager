import Database from 'better-sqlite3';
import { BaseDAO } from './BaseDAO';
import { Driver } from '../../models/types';

export class DriverDAO extends BaseDAO<Driver> {
  constructor(db: Database.Database) {
    super(db);
  }

  getAll(): Driver[] {
    const stmt = this.db.prepare(`
      SELECT id, name, team_id as teamId, skill, consistency, racecraft, experience
      FROM drivers
    `);
    return stmt.all() as Driver[];
  }

  getById(id: number): Driver | undefined {
    const stmt = this.db.prepare(`
      SELECT id, name, team_id as teamId, skill, consistency, racecraft, experience
      FROM drivers WHERE id = ?
    `);
    return stmt.get(id) as Driver | undefined;
  }

  getByTeamId(teamId: number): Driver[] {
    const stmt = this.db.prepare(`
      SELECT id, name, team_id as teamId, skill, consistency, racecraft, experience
      FROM drivers WHERE team_id = ?
    `);
    return stmt.all(teamId) as Driver[];
  }

  create(entity: Omit<Driver, 'id'>): Driver {
    const stmt = this.db.prepare(`
      INSERT INTO drivers (name, team_id, skill, consistency, racecraft, experience)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      entity.name,
      entity.teamId,
      entity.skill,
      entity.consistency,
      entity.racecraft,
      entity.experience
    );
    return { id: result.lastInsertRowid as number, ...entity };
  }

  update(id: number, entity: Partial<Driver>): boolean {
    const fields = [];
    const values = [];

    if (entity.name !== undefined) {
      fields.push('name = ?');
      values.push(entity.name);
    }
    if (entity.teamId !== undefined) {
      fields.push('team_id = ?');
      values.push(entity.teamId);
    }
    if (entity.skill !== undefined) {
      fields.push('skill = ?');
      values.push(entity.skill);
    }
    if (entity.consistency !== undefined) {
      fields.push('consistency = ?');
      values.push(entity.consistency);
    }
    if (entity.racecraft !== undefined) {
      fields.push('racecraft = ?');
      values.push(entity.racecraft);
    }
    if (entity.experience !== undefined) {
      fields.push('experience = ?');
      values.push(entity.experience);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const stmt = this.db.prepare(`UPDATE drivers SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM drivers WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
