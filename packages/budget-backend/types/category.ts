import { Document } from "mongoose";

export interface Category extends Document<string> {
  email: string;
  name: string;
  color?: string;
  isParent?: boolean;
  subCategories?: SubCategory[];
}

export interface SubCategory extends Document<string> {
  name: string;
  parentId: string;
  email: string;
  color?: string;
}
