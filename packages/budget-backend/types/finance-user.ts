import type { User } from "shared";

export interface FinanceUser extends User {
  userId: string;
  savingsGoal: number;
}
