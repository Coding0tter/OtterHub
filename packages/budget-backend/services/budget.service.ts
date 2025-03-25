import { FinanceUserModel } from "../models/finance-user.db";
import type { FinanceUser } from "../types/finance-user";

export const upsertUser = async (user: FinanceUser) => {
  const existingUser = await FinanceUserModel.findOne({ userId: user.id });

  if (!existingUser) {
    user.userId = user.id;
    return await FinanceUserModel.create(user);
  }

  return await FinanceUserModel.findOneAndUpdate({ userId: user.id }, user, {
    new: true,
  }).lean();
};

export const getUser = async (userId: string) => {
  return await FinanceUserModel.findOne({ userId }).lean().exec();
};

export const getSavingsGoal = async (userId: string) => {
  return (
    (await FinanceUserModel.findOne({ userId }).select("savingsGoal").exec())
      ?.savingsGoal ?? 0
  );
};

export const updateSavingsGoal = async (userId: string, amount: number) =>
  await FinanceUserModel.findOneAndUpdate(
    { userId },
    { savingsGoal: amount },
  ).exec();
