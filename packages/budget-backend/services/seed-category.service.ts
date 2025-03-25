import path from "path";
import fs from "fs";
import { CategoryModel, SubCategoryModel } from "../models/category.db";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
];

const CATEGORIES = [
  {
    name: "Wohnung",
    subCategories: ["Betriebskosten", "Strom", "Internet", "Musik", "Sonstige"],
  },
  {
    name: "Einnahmen",
    subCategories: ["Lohn", "Taschengeld", "Rückzahlungen", "Sonstige"],
  },
  {
    name: "Abos",
    subCategories: ["Musik", "Streaming", "Sonstige"],
  },
  {
    name: "Technik",
    subCategories: ["Computer", "Handy", "Kamera", "Sonstige"],
  },
  {
    name: "Essen",
    subCategories: [
      "Abendessen",
      "Lebensmittel",
      "Mittagsessen",
      "Frühstück",
      "Snacks",
      "Lieferservice",
      "Getränk",
      "Dessert",
      "Sonstige",
    ],
  },
  {
    name: "Kleidung / Kosmetik",
    subCategories: [
      "Schuhe",
      "Kleid",
      "Drogerie",
      "Thrifting",
      "Schmuck",
      "Sonstige",
    ],
  },
  {
    name: "Soziales",
    subCategories: ["Geschenk", "Dates", "Sonstige"],
  },
  {
    name: "Freizeit",
    subCategories: ["Urlaub", "Hobby", "Sonstige"],
  },
  {
    name: "Verkehr",
    subCategories: ["Bus", "Bahn", "Flugzeug", "Öffis", "Sonstige"],
  },
  {
    name: "Gebühr",
    subCategories: ["Transfer Gebühr", "ORF", "Sonstige"],
  },
  {
    name: "Übriges",
    subCategories: ["Ausgleich", "Sonstige"],
  },
];

const getIndexColor = (index: number) => {
  const colorIndex = index % COLORS.length;
  return COLORS[colorIndex];
};

export const seedCategories = async (userId: string) => {
  try {
    for (const category of CATEGORIES) {
      const color = getIndexColor(CATEGORIES.indexOf(category));

      const newCategory = new CategoryModel({
        name: category.name,
        color,
        userId,
      });

      for (const subCategory of category.subCategories) {
        const color = getIndexColor(
          category.subCategories.indexOf(subCategory),
        );

        const newSubCategory = new SubCategoryModel({
          name: subCategory,
          color,
          userId,
          parentId: newCategory._id,
        });

        await newSubCategory.save();
      }

      newCategory.save();
    }
  } catch (err) {
    console.error("Failed to seed Categories", err);
  }
};
