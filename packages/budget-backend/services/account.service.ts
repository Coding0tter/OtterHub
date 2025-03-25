import mongoose from "mongoose";
import { AccountModel } from "../models/account.db";
import type { Account } from "../types/account";

export const upsertAccount = async (
  userId: string,
  account: Partial<Account>,
) => {
  const existingAccount = await AccountModel.findOneAndUpdate(
    {
      _id: account._id || new mongoose.Types.ObjectId(),
    },
    {
      ...account,
      userId,
    },
    {
      new: true,
      upsert: true,
    },
  )
    .lean()
    .exec();

  return existingAccount;
};

export const getAccounts = async (userId: string) =>
  await AccountModel.find({ userId }).exec();

export const deleteAccount = async (accountId: string) => {
  console.log(accountId);
  await AccountModel.findByIdAndDelete(accountId).exec();
};
