import { CategoryModel } from "../models/category.db";
import type { Category } from "../types/category";

export const upsertCategory = async (
  email: string,
  category: Partial<Category>,
) => {
  const existingCategory = await CategoryModel.findOne({
    name: category.name,
    email,
  })
    .lean()
    .exec();
  if (existingCategory && !category._id) {
    return new Response("Category already exists", { status: 400 });
  }

  if (category._id) {
    return await CategoryModel.findOneAndUpdate(
      { _id: category._id, email },
      { ...category, email },
      { new: true },
    )
      .lean()
      .exec();
  } else {
    const newCategory = new CategoryModel({ ...category, email });
    newCategory.save();
    return newCategory.toObject();
  }
};

export const deleteCategory = async (id: string) => {
  await CategoryModel.findByIdAndUpdate(id, { deleted: true }).exec();
};

export const getCategories = async (email: string) => {
  const query: any = { email };
  query.deleted = false;

  return await CategoryModel.find(query).sort({ name: 1 }).lean().exec();
};
