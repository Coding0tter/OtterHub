import { Document } from "mongoose";
import type { Category } from "./category";

export interface FixedCost extends Document<string> {
  email: string;
  category: Category;
  name: string;
  amount: number;
  type: "income" | "expense";
}
