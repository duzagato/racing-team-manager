import Database from 'better-sqlite3';

export abstract class BaseDAO<T> {
  constructor(protected db: Database.Database) {}

  abstract getAll(): T[];
  abstract getById(id: number): T | undefined;
  abstract create(entity: Omit<T, 'id'>): T;
  abstract update(id: number, entity: Partial<T>): boolean;
  abstract delete(id: number): boolean;
}
