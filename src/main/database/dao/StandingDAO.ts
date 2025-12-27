import Database from 'better-sqlite3';
import { BaseDAO } from './BaseDAO';
import { Standing } from '../../models/types';

export class StandingDAO extends BaseDAO<Standing> {
  constructor(db: Database.Database) {
    super(db);
  }

  getAll(): Standing[] {
    const stmt = this.db.prepare(`
      SELECT id, driver_id as driverId, points, wins, podiums
      FROM standings
      ORDER BY points DESC, wins DESC, podiums DESC
    `);
    return stmt.all() as Standing[];
  }

  getById(id: number): Standing | undefined {
    const stmt = this.db.prepare(`
      SELECT id, driver_id as driverId, points, wins, podiums
      FROM standings WHERE id = ?
    `);
    return stmt.get(id) as Standing | undefined;
  }

  getByDriverId(driverId: number): Standing | undefined {
    const stmt = this.db.prepare(`
      SELECT id, driver_id as driverId, points, wins, podiums
      FROM standings WHERE driver_id = ?
    `);
    return stmt.get(driverId) as Standing | undefined;
  }

  create(entity: Omit<Standing, 'id'>): Standing {
    const stmt = this.db.prepare(`
      INSERT INTO standings (driver_id, points, wins, podiums)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(entity.driverId, entity.points, entity.wins, entity.podiums);
    return { id: result.lastInsertRowid as number, ...entity };
  }

  update(id: number, entity: Partial<Standing>): boolean {
    const fields = [];
    const values = [];

    if (entity.points !== undefined) {
      fields.push('points = ?');
      values.push(entity.points);
    }
    if (entity.wins !== undefined) {
      fields.push('wins = ?');
      values.push(entity.wins);
    }
    if (entity.podiums !== undefined) {
      fields.push('podiums = ?');
      values.push(entity.podiums);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const stmt = this.db.prepare(`UPDATE standings SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  addPoints(driverId: number, points: number, position: number): void {
    const standing = this.getByDriverId(driverId);
    if (standing) {
      const newPoints = standing.points + points;
      const newWins = standing.wins + (position === 1 ? 1 : 0);
      const newPodiums = standing.podiums + (position <= 3 ? 1 : 0);
      this.update(standing.id, { points: newPoints, wins: newWins, podiums: newPodiums });
    }
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM standings WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
