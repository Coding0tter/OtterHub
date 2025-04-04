import { Document } from "mongoose";
import type { Category, SubCategory } from "./category";

export interface FixedCost extends Document<string> {
  userId: string;
  category: Category;
  subCategory: SubCategory;
  name: string;
  amount: number;
  type: "income" | "expense";
}
