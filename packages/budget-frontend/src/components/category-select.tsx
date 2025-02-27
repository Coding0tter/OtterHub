import type { Category, SubCategory } from "budget-backend/types";
import { Label } from "components";
import { createSignal, For, Show, Suspense, type Resource } from "solid-js";

export interface CategorySelectProps {
  categories: Resource<Category[]>;
  onChange?: (category: Category, subCategory?: SubCategory) => void;
  value?: string;
  placeholder?: string;
  required?: boolean;
  loading?: boolean;
  allowCreate?: boolean;
  onCreateOption?: (name: string) => Promise<Category | null>;
}

export function CategorySelect(props: CategorySelectProps) {
  const [selectedCategory, setSelectedCategory] = createSignal<Category | null>(
    null,
  );
  const [selectedSubCategory, setSelectedSubCategory] =
    createSignal<SubCategory | null>(null);

  const handleSelectCategory = (category: any) => {
    if (!category.subCategories || category.subCategories.length === 0) {
      setSelectedCategory(category);
      setSelectedSubCategory(null);
      if (props.onChange) props.onChange(category);
    } else {
      document.getElementById("category-select-dropdown")?.focus();
      setSelectedCategory(category);
    }
  };

  const handleSelectSubCategory = (subCategory: SubCategory) => {
    if (selectedCategory()) {
      setSelectedSubCategory(subCategory);
      if (props.onChange) props.onChange(selectedCategory()!, subCategory);

      document.getElementById("category-select-dropdown")?.focus();
      document.getElementById("category-select-dropdown")?.blur();
    }
  };

  const clearSelection = (e: MouseEvent) => {
    e.stopPropagation();
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    if (props.onChange) props.onChange(null as any);
  };

  return (
    <div class="relative flex flex-col w-full">
      <Label>{props.placeholder || "Category"}</Label>

      <div class="dropdown">
        <div
          tabIndex={0}
          role="button"
          id="category-select-dropdown"
          class="btn border border-neutral bg-base-100 pl-3 font-normal w-full flex justify-between pointer-events-auto"
        >
          <Show
            when={selectedCategory()}
            fallback={props.placeholder || "Select category"}
          >
            <div class="flex items-center gap-2">
              <div
                class="w-3 h-3 rounded-full"
                style={{
                  "background-color": selectedSubCategory()?.color
                    ? selectedSubCategory()!.color
                    : selectedCategory()?.color,
                }}
              />
              <span>
                {selectedSubCategory()
                  ? `${selectedCategory()?.name}: ${selectedSubCategory()?.name}`
                  : selectedCategory()?.name}
              </span>
            </div>
          </Show>
        </div>

        <div
          tabindex={0}
          class="dropdown-content bg-base-300 rounded-box z-10  shadow-lg menu w-72 max-h-96 overflow-y-auto"
        >
          <Show
            when={!selectedCategory()}
            fallback={
              <>
                <button
                  class="btn btn-sm btn-ghost mb-2 text-left"
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubCategory(null);
                    document
                      .getElementById("category-select-dropdown")
                      ?.focus();
                  }}
                >
                  <i class="fa-solid fa-arrow-left mr-2"></i>
                  Back to categories
                </button>

                <div class="text-xs font-medium opacity-70 uppercase px-2 py-1">
                  {selectedCategory()?.name}
                </div>

                <For each={selectedCategory()?.subCategories}>
                  {(subCategory) => (
                    <button
                      class="btn btn-ghost flex flex-row gap-2 items-center justify-start text-left pl-4 my-1"
                      type="button"
                      onClick={() => handleSelectSubCategory(subCategory)}
                    >
                      <div
                        class="w-3 h-3 rounded-full"
                        style={{ "background-color": subCategory.color }}
                      />
                      {subCategory.name}
                    </button>
                  )}
                </For>
              </>
            }
          >
            <Suspense fallback={<h1>Loading...</h1>}>
              <For each={props.categories()}>
                {(category) => (
                  <button
                    class="btn btn-ghost justify-start text-left my-1"
                    type="button"
                    onClick={() => {
                      handleSelectCategory(category);
                    }}
                  >
                    <div class="flex items-center justify-between w-full">
                      <div class="flex items-center gap-2">
                        <div
                          class="w-3 h-3 rounded-full"
                          style={{ "background-color": category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <Show when={category.subCategories?.length}>
                        <i class="fa-solid fa-chevron-right opacity-50"></i>
                      </Show>
                    </div>
                  </button>
                )}
              </For>
            </Suspense>
          </Show>
        </div>
      </div>

      <Show when={selectedCategory()}>
        <button
          class="absolute right-[15px] top-[35px] text-xs opacity-70 hover:opacity-100"
          onClick={clearSelection}
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </Show>
    </div>
  );
}
