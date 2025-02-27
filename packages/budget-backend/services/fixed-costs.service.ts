import mongoose from "mongoose";
import { FixedCostsModel } from "../models/fixed-costs.db";
import type { FixedCost } from "../types/fixed-cost";

export const getFixedCosts = async (email: string) =>
  await FixedCostsModel.find({ email })
    .populate("category")
    .populate("subCategory")
    .exec();

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
