import { Document } from "mongoose";

export interface Category extends Document<string> {
  email: string;
  name: string;
  color?: string;
}
