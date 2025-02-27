import mongoose from "mongoose";
import { FixedCostsModel } from "../models/fixed-costs.db";
import type { FixedCost } from "../types/fixed-cost";

export const getFixedCosts = async (email: string) =>
  await FixedCostsModel.find({ email }).populate("category").exec();

export const upsertFixedCost = async (
  email: string,
  fixedCost: Partial<FixedCost>,
) =>
  await FixedCostsModel.findOneAndUpdate(
    {
      _id: fixedCost._id || new mongoose.Types.ObjectId(),
    },
    {
      ...fixedCost,
      email: email,
    },
    {
      new: true,
      upsert: true,
    },
  )
    .lean()
    .exec();

export const deleteFixedCost = async (id: string) =>
  await FixedCostsModel.findByIdAndDelete(id).exec();

export const getFixedCategoryBreakdown = async (
  email: string,
  type: "income" | "expense",
) => {
  return await FixedCostsModel.aggregate([
    { $match: { email, type } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
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
      $addFields: {
        name: {
          $cond: {
            if: { $eq: [{ $ifNull: ["$categoryInfo.name", null] }, null] },
            then: "Uncategorized",
            else: "$categoryInfo.name",
          },
        },
      },
    },
    {
      $project: {
        total: 1,
        count: 1,
        name: "$categoryInfo.name",
      },
    },
    { $sort: { total: -1 } },
  ]);
};
