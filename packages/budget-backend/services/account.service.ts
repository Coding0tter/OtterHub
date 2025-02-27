import mongoose from "mongoose";
import { AccountModel } from "../models/account.db";
import type { Account } from "../types/account";

export const upsertAccount = async (
  email: string,
  account: Partial<Account>,
) => {
  const existingAccount = await AccountModel.findOneAndUpdate(
    {
      _id: account._id || new mongoose.Types.ObjectId(),
    },
    {
      ...account,
      email: email,
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

export const getAccounts = async (email: string) =>
  await AccountModel.find({ email }).exec();

export const deleteAccount = async (accountId: string) => {
  console.log(accountId);
  await AccountModel.findByIdAndDelete(accountId).exec();
};
