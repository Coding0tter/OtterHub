import mongoose from "mongoose";
import { TransactionModel } from "../models/transaction.db";
import type { Transaction } from "../types/transaction";

export const addTransaction = async (
  email: string,
  transaction: Partial<Transaction>,
) => {
  return await TransactionModel.create({
    ...transaction,
    email,
  });
};

export const getTransactions = async (
  email: string,
  query: {
    startDate?: Date;
    endDate?: Date;
    type?: "income" | "expense" | "all";
    category?: string;
  },
) => {
  const filter: any = { email };

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = query.startDate;
    if (query.endDate) filter.date.$lte = query.endDate;
  }

  if (query.type && query.type !== "all") {
    filter.type = query.type;
  }

  if (query.category) {
    filter.category = new mongoose.Types.ObjectId(query.category);
  }

  return await TransactionModel.find(filter)
    .populate("category")
    .populate("subCategory")
    .populate("account")
    .sort({ date: -1 })
    .lean()
    .exec();
};

export const getMonthlyTransactions = async (
  email: string,
  year: number,
  month: number,
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return await getTransactions(email, { startDate, endDate });
};

export const updateTransaction = async (
  id: string,
  transaction: Partial<Transaction>,
) => {
  return await TransactionModel.findByIdAndUpdate(id, transaction, {
    new: true,
  })
    .lean()
    .exec();
};

export const deleteTransaction = async (id: string) => {
  return await TransactionModel.findByIdAndDelete(id).exec();
};

export const getCategoryBreakdown = async (
  email: string,
  year: number,
  month?: number,
  type: "income" | "expense" | "all" = "all",
) => {
  const matchStage: any = {
    email,
    date: {},
  };
  if (type !== "all") {
    matchStage.type = type;
  }
  if (month) {
    // For specific month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);
    matchStage.date = { $gte: startDate, $lte: endDate };
  } else {
    // For entire year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    matchStage.date = { $gte: startDate, $lte: endDate };
  }
  return await TransactionModel.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $unwind: {
        path: "$categoryInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "subcategories",
        localField: "subCategory",
        foreignField: "_id",
        as: "subCategoryInfo",
      },
    },
    {
      $unwind: {
        path: "$subCategoryInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        adjustedAmount: {
          $cond: {
            if: { $eq: ["$type", "expense"] },
            then: { $multiply: ["$amount", -1] },
            else: "$amount",
          },
        },
      },
    },
    {
      $group: {
        _id: {
          categoryId: "$category",
          subCategoryId: "$subCategory",
        },
        total: { $sum: "$adjustedAmount" },
        count: { $sum: 1 },
        categoryName: { $first: "$categoryInfo.name" },
        categoryColor: { $first: "$categoryInfo.color" },
        subCategoryName: { $first: "$subCategoryInfo.name" },
        subCategoryColor: { $first: "$subCategoryInfo.color" },
      },
    },
    {
      $addFields: {
        categoryName: {
          $cond: {
            if: { $eq: [{ $ifNull: ["$categoryName", null] }, null] },
            then: "Uncategorized",
            else: "$categoryName",
          },
        },
        subCategoryName: {
          $cond: {
            if: { $eq: [{ $ifNull: ["$subCategoryName", null] }, null] },
            then: "None",
            else: "$subCategoryName",
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id.categoryId",
        categoryName: { $first: "$categoryName" },
        categoryColor: { $first: "$categoryColor" },
        total: { $sum: "$total" },
        count: { $sum: "$count" },
        subCategories: {
          $push: {
            id: "$_id.subCategoryId",
            name: "$subCategoryName",
            total: "$total",
            count: "$count",
            color: "$subCategoryColor",
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: "$categoryName",
        color: "$categoryColor",
        total: 1,
        count: 1,
        subCategories: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);
};
