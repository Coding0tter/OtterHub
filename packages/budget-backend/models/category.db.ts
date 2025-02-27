import { model, Schema } from "mongoose";

export const SubCategory = new Schema({
  name: { type: String, required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  email: { type: String, required: true },
  color: { type: String },
  deleted: { type: Boolean, default: false },
});

export const Category = new Schema({
  email: { type: String, required: true },
  name: { type: String },
  color: { type: String },
  deleted: { type: Boolean, default: false },
  isParent: { type: Boolean, default: false },
});

export const CategoryModel = model("Category", Category);
export const SubCategoryModel = model("SubCategory", SubCategory);
