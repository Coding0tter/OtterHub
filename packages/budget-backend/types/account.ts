import { Document } from "mongoose";

export interface Account extends Document<string> {
  email: string;
  name: string;
  amount: number;
}
