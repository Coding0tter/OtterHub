import { Document } from "mongoose";

export interface Transaction extends Document {
  userId: string;
  category?: string;
  subCategory?: string;
  account?: string;
  description: string;
  amount: number;
  date: Date;
  type: "income" | "expense";
}
