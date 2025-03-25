import { Document } from "mongoose";

export interface Category extends Document<string> {
  userId: string;
  name: string;
  color?: string;
  isParent?: boolean;
  subCategories?: SubCategory[];
}

export interface SubCategory extends Document<string> {
  name: string;
  parentId: string;
  userId: string;
  color?: string;
}
