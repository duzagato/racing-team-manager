import { DriverDAO } from '../dao/DriverDAO';
import { Driver } from '../../models/types';

export class DriverRepository {
  constructor(private driverDAO: DriverDAO) {}

  getAll(): Driver[] {
    return this.driverDAO.getAll();
  }

  getById(id: number): Driver | undefined {
    return this.driverDAO.getById(id);
  }

  getByTeamId(teamId: number): Driver[] {
    return this.driverDAO.getByTeamId(teamId);
  }

  create(driver: Omit<Driver, 'id'>): Driver {
    return this.driverDAO.create(driver);
  }

  update(id: number, driver: Partial<Driver>): boolean {
    return this.driverDAO.update(id, driver);
  }

  delete(id: number): boolean {
    return this.driverDAO.delete(id);
  }

  getDriverPerformance(id: number): number {
    const driver = this.getById(id);
    if (!driver) return 0;
    return (driver.skill + driver.consistency + driver.racecraft + driver.experience) / 4;
  }
}
