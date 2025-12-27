import { BalanceDAO } from '../dao/BalanceDAO';
import { Balance } from '../../models/types';

export class BalanceRepository {
  constructor(private balanceDAO: BalanceDAO) {}

  getAll(): Balance[] {
    return this.balanceDAO.getAll();
  }

  getByCategory(category: string): Balance[] {
    return this.balanceDAO.getByCategory(category);
  }

  getParameter(category: string, parameter: string): number {
    const balance = this.balanceDAO.getByParameter(category, parameter);
    return balance?.value || 0;
  }

  updateParameter(category: string, parameter: string, value: number): boolean {
    const balance = this.balanceDAO.getByParameter(category, parameter);
    if (!balance) return false;
    return this.balanceDAO.update(balance.id, { value });
  }
}
