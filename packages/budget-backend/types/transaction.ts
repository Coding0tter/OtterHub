import { Document } from "mongoose";

export interface Transaction extends Document {
  email: string;
  category?: string;
  subCategory?: string;
  account?: string;
  description: string;
  amount: number;
  date: Date;
  type: "income" | "expense";
}
