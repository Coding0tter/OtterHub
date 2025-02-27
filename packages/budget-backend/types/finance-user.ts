import type { User } from "shared";

export interface FinanceUser extends User {
  savingsGoal: number;
}
