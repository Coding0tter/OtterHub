import { Autocomplete, useToast } from "components";
import type { Category } from "packages/budget-backend/types/category";
import { Suspense, type JSX, type Resource } from "solid-js";
import { budgetApiClient } from "../App";

interface CategoryAutocompleteProps {
  /**
   * Current value of the input
   */
  value?: string;

  /**
   * Callback when value changes
   */
  onChange: (value: string) => void;

  /**
   * Label for the input field
   */
  label?: string;

  /**
   * Placeholder for the input field
   */
  placeholder?: string;

  categories: Resource<Category[]>;

  /**
   * Additional props to pass to the Autocomplete component
   */
  [key: string]: any;
}

export function CategoryAutocomplete(
  props: CategoryAutocompleteProps,
): JSX.Element {
  const { addToast } = useToast();

  const handleCreateCategory = async (
    categoryName: string,
  ): Promise<Category | null> => {
    try {
      const response = await budgetApiClient.post("/categories", {
        category: { name: categoryName },
      });

      addToast({
        message: "New category added",
        type: "success",
      });

      return response.data;
    } catch (error) {
      console.error("Failed to add new category:", error);
      addToast({
        message: "Failed to add new category",
        type: "error",
      });
      throw error;
    }
  };

  return (
    <Suspense fallback={<h1>Loading...</h1>}>
      <Autocomplete<Category>
        value={props.value}
        required
        onChange={props.onChange}
        label={"Category"}
        placeholder={"Select a category"}
        options={props.categories()!}
        getOptionLabel={(category) => category.name}
        getOptionValue={(category) => category}
        onCreateOption={handleCreateCategory}
        allowCreate={true}
        createHint='Tap + to add "{input}" as a new category'
        showAddButton={true}
        loading={props.categories.loading}
      />
    </Suspense>
  );
}
