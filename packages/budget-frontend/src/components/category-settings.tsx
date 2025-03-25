import axios from "axios";
import type { Category, SubCategory } from "budget-backend/types";
import {
  Button,
  Card,
  ColorPicker,
  Header,
  Input,
  useConfirmDelete,
  useToast,
} from "components";
import { createResource, createSignal, For, Show } from "solid-js";
import { budgetApi } from "../App";

export const CategorySettings = () => {
  const { confirmDelete } = useConfirmDelete();
  const { addToast } = useToast();
  const [category, setCategory] = createSignal<Partial<Category>>({
    name: "",
  });
  const [subCategory, setSubCategory] = createSignal<Partial<SubCategory>>({
    name: "",
  });
  let categoryFormRef: HTMLFormElement | null = null;
  const [categories, { mutate: mutateCategories, refetch: refetchCategories }] =
    createResource<Partial<Category>[]>(async () => {
      return (await budgetApi.get("/categories/with-subcategories")).data;
    });

  const [openCategories, setOpenCategories] = createSignal<number[]>([]);
  const toggleCategory = (index: number) =>
    setOpenCategories((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  const isOpen = (index: number) => openCategories().includes(index);

  const handleSaveCategory = async () => {
    try {
      await budgetApi.post("/categories", {
        category: category(),
      });

      setCategory({ name: "" });

      refetchCategories();
      addToast({ message: "Category saved", type: "success" });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        addToast({ message: err.response.data, type: "error" });
        return;
      }

      addToast({ message: "Failed to save category", type: "error" });
    }
  };

  const handleSaveSubCategory = async () => {
    try {
      const { id, ...subCategoryData } = subCategory();
      await budgetApi.post("/subCategories", {
        subCategory: subCategoryData,
      });

      setSubCategory({ name: "" });
      refetchCategories();
      addToast({ message: "Subcategory saved", type: "success" });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        addToast({ message: err.response.data, type: "error" });
        return;
      }

      addToast({ message: "Failed to save subcategory", type: "error" });
    }
  };

  const addSubCategory = (categoryId: string) => {
    setSubCategory({
      name: "",
      parentId: categoryId,
      _id: "new",
    });
    mutateCategories((prev) =>
      prev?.map((cat) =>
        cat._id === categoryId
          ? {
              ...cat,
              subCategories: [
                ...(cat.subCategories ?? []),
                { name: "", _id: "new" } as SubCategory,
              ],
            }
          : cat,
      ),
    );
  };

  const handleDeleteCategory = (category: Partial<Category>) => {
    confirmDelete({
      onDelete: async () => await deleteCategory(category._id!.toString()),
      title: "Delete category",
      message: `Do you really want to delete ${category.name}?`,
    });
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await budgetApi.delete(`/categories/${categoryId}`);
      addToast({ message: "Category deleted", type: "success" });
      mutateCategories((prev) => prev?.filter((cat) => cat._id !== categoryId));
    } catch (err) {
      console.log(err);
      addToast({ message: "Failed to delete category", type: "error" });
    }
  };

  const handleDeleteSubCategory = (subCategory: Partial<Category>) => {
    confirmDelete({
      onDelete: async () =>
        await deleteSubCategory(subCategory._id!.toString()),
      title: "Delete subcategory",
      message: `Do you really want to delete ${subCategory.name}?`,
    });
  };

  const deleteSubCategory = async (subCategoryId: string) => {
    try {
      await budgetApi.delete(`/subCategories/${subCategoryId}`);
      addToast({ message: "Subcategory deleted", type: "success" });
      mutateCategories((prev) => {
        if (!prev) return prev;

        return prev.map((cat) => ({
          ...cat,
          subCategories: cat.subCategories?.filter(
            (item) => item._id !== subCategoryId,
          ),
        }));
      });
    } catch (err) {
      console.log(err);
      addToast({ message: "Failed to delete subcategory", type: "error" });
    }
  };

  const handleCancelSubCategory = () => {
    mutateCategories((prev) => {
      if (!prev) return prev;

      return prev.map((cat) => ({
        ...cat,
        subCategories: cat.subCategories?.filter(
          (item) => item._id !== subCategory()._id,
        ),
      }));
    });

    setSubCategory({});
  };

  const handleEditCategory = (cat: Partial<Category>) => {
    setCategory(cat);
  };

  const handleEditSubCategory = (cat: Partial<SubCategory>) => {
    setSubCategory(cat);
  };

  return (
    <Card
      title="Categories"
      subtitle="Manage your income and expense categories"
    >
      <div class="relative">
        <Show when={categories.loading}>
          <div>Loading categories...</div>
        </Show>

        <Show when={categories.error}>
          <div>Failed to load categories</div>
        </Show>

        <Show when={categories() && categories()?.length === 0}>
          <div class="text-sm opacity-50">No Categories yet</div>
        </Show>

        <For each={categories()}>
          {(category, index) => (
            <div
              tabindex={0}
              id={category._id}
              class="collapse mb-2 bg-base border border-neutral overflow-visible"
            >
              <div
                class="flex justify-between items-center px-2 cursor-pointer"
                onClick={() => toggleCategory(index())}
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-3 h-3 rounded-full"
                    style={{ "background-color": category.color }}
                  />
                  <span>{category.name}</span>
                </div>
                <div
                  onClick={(e) => e.stopPropagation()}
                  class="dropdown dropdown-end"
                >
                  <div tabIndex={0} class="p-2">
                    <i class="fa-solid fa-ellipsis-vertical" />
                  </div>
                  <ul
                    tabIndex={0}
                    class="menu flex items-start dropdown-content bg-base-200 rounded-box z-1 p-2 shadow-sm w-50"
                  >
                    <Button
                      type="neutral"
                      label="Add Subcategory"
                      class="btn-ghost"
                      disabled={subCategory()._id === "new"}
                      onClick={(e) => {
                        if (!isOpen(index())) toggleCategory(index());
                        e.stopPropagation();
                        addSubCategory(category._id!.toString());
                        (document.activeElement as any).blur();
                      }}
                      icon={<i class="fa-solid fa-plus" />}
                    />
                    <Button
                      type="neutral"
                      label="Edit"
                      class="btn-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                        (document.activeElement as any).blur();
                      }}
                      icon={<i class="fa-solid fa-edit" />}
                    />
                    <Button
                      type="neutral"
                      label="Delete"
                      class="text-error btn-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category);
                        (document.activeElement as any).blur();
                      }}
                      icon={<i class="fa-solid fa-trash" />}
                    />
                  </ul>
                </div>
              </div>

              <Show when={isOpen(index())}>
                <div class="px-4 py-2 border-t border-neutral">
                  <Show when={category.subCategories?.length === 0}>
                    <div class="text-sm opacity-50">No subcategories yet</div>
                  </Show>
                  <For each={category.subCategories}>
                    {(entry) => (
                      <div class="flex flex-1 justify-between items-center">
                        {entry._id !== subCategory()._id ? (
                          <div class="flex items-center gap-2">
                            <div
                              class="w-3 h-3 rounded-full"
                              style={{ "background-color": entry.color }}
                            />
                            <span>{entry.name}</span>
                          </div>
                        ) : (
                          <div class="flex flex-1 flex-row items-center gap-4">
                            <ColorPicker
                              value={entry?.color}
                              onChange={(color) => {
                                setSubCategory(
                                  (prev: Partial<SubCategory>) => ({
                                    ...prev,
                                    color,
                                  }),
                                );
                              }}
                            />
                            <Input
                              class="mt-2 flex-1"
                              placeholder="Subcategory"
                              onInput={(e) =>
                                setSubCategory((prev) => ({
                                  ...prev,
                                  name: e.currentTarget.value,
                                }))
                              }
                              value={subCategory().name}
                            />
                          </div>
                        )}
                        <div>
                          {entry._id !== subCategory()._id ? (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              class="dropdown dropdown-end"
                            >
                              <div tabIndex={0} class="p-2">
                                <i class="cursor-pointer fa-solid fa-ellipsis-vertical" />
                              </div>
                              <ul
                                tabIndex={0}
                                class="menu flex items-start dropdown-content bg-base-200 rounded-box z-1 p-2 shadow-sm w-50"
                              >
                                <Button
                                  type="neutral"
                                  label="Edit"
                                  class="btn-ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSubCategory(entry);
                                    (document.activeElement as any).blur();
                                  }}
                                  icon={<i class="fa-solid fa-edit" />}
                                />
                                <Button
                                  type="neutral"
                                  label="Delete"
                                  class="text-error btn-ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSubCategory(entry);
                                    (document.activeElement as any).blur();
                                  }}
                                  icon={<i class="fa-solid fa-trash" />}
                                />
                              </ul>
                            </div>
                          ) : (
                            <div class="ml-2 flex flex-row gap-2 items-center">
                              <Button
                                type="info"
                                class="btn-xs"
                                onClick={async () => handleSaveSubCategory()}
                                icon={<i class="fa-solid fa-save" />}
                              />
                              <Button
                                type="neutral"
                                class="btn-xs"
                                onClick={handleCancelSubCategory}
                                icon={<i class="fa-solid fa-cancel" />}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          )}
        </For>

        <div class="divider">
          <Header class="min-h-5" title={`Add new category`} />
        </div>
        <form
          ref={(el) => (categoryFormRef = el)}
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSaveCategory();
            categoryFormRef?.reset();
          }}
        >
          <div class="flex flex-row items-center gap-4">
            <ColorPicker
              value={category()?.color}
              onChange={(color) => {
                setCategory((prev) => ({ ...prev, color }));
              }}
            />
            <Input
              value={category()?.name}
              onInput={(e) =>
                setCategory((prev) => ({
                  ...prev,
                  name: e.currentTarget.value,
                }))
              }
              class="!mb-0"
              required
              placeholder="Groceries, Rent, Salary..."
            />
          </div>
          <div class="flex flex-row justify-end gap-4">
            <Button
              class="w-1/2 mt-2"
              icon={
                category()?._id ? (
                  <i class="fa-solid fa-save" />
                ) : (
                  <i class="fa-solid fa-plus" />
                )
              }
              type="info"
              submit
              label={category()?._id ? "Update category" : "Add category"}
            />
            <Show when={category()?._id}>
              <Button
                class="flex-1 mt-2"
                type="neutral"
                onClick={() => setCategory({ name: "" })}
                label="Cancel"
              />
            </Show>
          </div>
        </form>
      </div>
    </Card>
  );
};
