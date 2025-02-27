import { CategoryModel, SubCategoryModel } from "../models/category.db";
import type { Category, SubCategory } from "../types/category";

export const upsertCategory = async (
  email: string,
  category: Partial<Category>,
) => {
  const existingCategory = await CategoryModel.findOne({
    name: category.name,
    email,
    deleted: false,
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
    await newCategory.save();
    return newCategory.toObject();
  }
};

export const upsertSubCategory = async (
  email: string,
  subCategory: Partial<SubCategory>,
) => {
  const parentCategory = await CategoryModel.findOne({
    _id: subCategory.parentId,
    email,
    deleted: false,
  }).lean();

  if (!parentCategory) {
    return new Response("Parent category not found", { status: 404 });
  }

  if (!parentCategory.isParent) {
    await CategoryModel.findByIdAndUpdate(subCategory.parentId, {
      isParent: true,
    });
  }

  const existingSubCategory = await SubCategoryModel.findOne({
    name: subCategory.name,
    parentId: subCategory.parentId,
    email,
    deleted: false,
  })
    .lean()
    .exec();

  if (existingSubCategory && !subCategory._id) {
    return new Response("Subcategory already exists", { status: 400 });
  }

  if (subCategory._id && subCategory._id !== "new") {
    return await SubCategoryModel.findOneAndUpdate(
      { _id: subCategory._id, email },
      { ...subCategory, email },
      { new: true },
    )
      .lean()
      .exec();
  } else {
    delete subCategory._id;
    const newSubCategory = new SubCategoryModel({ ...subCategory, email });
    await newSubCategory.save();
    return newSubCategory.toObject();
  }
};

export const deleteCategory = async (id: string) => {
  const hasSubCategories = await SubCategoryModel.findOne({
    parentId: id,
    deleted: false,
  });

  if (hasSubCategories) {
    await SubCategoryModel.updateMany(
      { parentId: id },
      { deleted: true },
    ).exec();
  }

  await CategoryModel.findByIdAndUpdate(id, { deleted: true }).exec();
};

export const deleteSubCategory = async (id: string) => {
  await SubCategoryModel.findByIdAndUpdate(id, { deleted: true }).exec();
};

export const getCategories = async (email: string) => {
  const query: any = { email };
  query.deleted = false;

  return await CategoryModel.find(query).sort({ name: 1 }).lean().exec();
};

export const getSubCategories = async (email: string, parentId: string) => {
  const query = { email, deleted: false, parentId };
  return await SubCategoryModel.find(query).sort({ name: 1 }).lean().exec();
};

export const getCategoriesWithSubcategories = async (email: string) => {
  const categories = await getCategories(email);

  const result = await Promise.all(
    categories.map(async (category) => {
      const subCategories = await getSubCategories(
        email,
        category._id.toString(),
      );
      return {
        ...category,
        subCategories: subCategories || [],
      };
    }),
  );

  return result;
};
