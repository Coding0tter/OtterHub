import { Document } from "mongoose";

export interface Transaction extends Document {
  email: string;
  category?: string;
  description: string;
  amount: number;
  date: Date;
  type: "income" | "expense";
}
