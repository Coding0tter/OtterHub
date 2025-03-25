import { Document } from "mongoose";

export interface Account extends Document<string> {
  userId: string;
  name: string;
  amount: number;
}
