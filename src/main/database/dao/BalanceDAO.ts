import Database from 'better-sqlite3';
import { BaseDAO } from './BaseDAO';
import { Balance } from '../../models/types';

export class BalanceDAO extends BaseDAO<Balance> {
  constructor(db: Database.Database) {
    super(db);
  }

  getAll(): Balance[] {
    const stmt = this.db.prepare(`
      SELECT id, category, parameter, value, description
      FROM balance_parameters
    `);
    return stmt.all() as Balance[];
  }

  getById(id: number): Balance | undefined {
    const stmt = this.db.prepare(`
      SELECT id, category, parameter, value, description
      FROM balance_parameters WHERE id = ?
    `);
    return stmt.get(id) as Balance | undefined;
  }

  getByCategory(category: string): Balance[] {
    const stmt = this.db.prepare(`
      SELECT id, category, parameter, value, description
      FROM balance_parameters WHERE category = ?
    `);
    return stmt.all(category) as Balance[];
  }

  getByParameter(category: string, parameter: string): Balance | undefined {
    const stmt = this.db.prepare(`
      SELECT id, category, parameter, value, description
      FROM balance_parameters WHERE category = ? AND parameter = ?
    `);
    return stmt.get(category, parameter) as Balance | undefined;
  }

  create(entity: Omit<Balance, 'id'>): Balance {
    const stmt = this.db.prepare(`
      INSERT INTO balance_parameters (category, parameter, value, description)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(entity.category, entity.parameter, entity.value, entity.description);
    return { id: result.lastInsertRowid as number, ...entity };
  }

  update(id: number, entity: Partial<Balance>): boolean {
    const fields = [];
    const values = [];

    if (entity.category !== undefined) {
      fields.push('category = ?');
      values.push(entity.category);
    }
    if (entity.parameter !== undefined) {
      fields.push('parameter = ?');
      values.push(entity.parameter);
    }
    if (entity.value !== undefined) {
      fields.push('value = ?');
      values.push(entity.value);
    }
    if (entity.description !== undefined) {
      fields.push('description = ?');
      values.push(entity.description);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const stmt = this.db.prepare(`UPDATE balance_parameters SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM balance_parameters WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
