import { FinanceUserModel } from "../models/finance-user.db";
import type { FinanceUser } from "../types/finance-user";

export const upsertUser = async (user: FinanceUser) => {
  const existingUser = await FinanceUserModel.findOne({ email: user.email });

  if (!existingUser) {
    return await FinanceUserModel.create(user);
  }

  return await FinanceUserModel.findOneAndUpdate({ email: user.email }, user, {
    new: true,
  }).lean();
};

export const getUser = async (email: string) => {
  return await FinanceUserModel.findOne({ email }).lean().exec();
};

export const getSavingsGoal = async (email: string) => {
  return (
    (await FinanceUserModel.findOne({ email }).select("savingsGoal").exec())
      ?.savingsGoal ?? 0
  );
};

export const updateSavingsGoal = async (email: string, amount: number) =>
  await FinanceUserModel.findOneAndUpdate(
    { email },
    { savingsGoal: amount },
  ).exec();
