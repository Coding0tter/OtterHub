import {
  Button,
  Card,
  ColorPicker,
  Header,
  Input,
  Label,
  useConfirmDelete,
  useToast,
} from "components";
import { budgetApiClient } from "../App";
import { For, Show, Suspense, createResource, createSignal } from "solid-js";
import { type Account } from "budget-backend/types/account";
import { type Category } from "budget-backend/types/category";
import { formatMoney } from "shared";
import type { FixedCost } from "packages/budget-backend/types/fixed-cost";
import axios from "axios";

export const AccountSettings = () => {
  let accountFormRef: HTMLFormElement;
  let categoryFormRef: HTMLFormElement;

  const { addToast } = useToast();
  const { confirmDelete } = useConfirmDelete();
  const [account, setAccount] = createSignal<Partial<Account>>();
  const [category, setCategory] = createSignal<Partial<Category>>({
    name: "",
  });

  const [fixedCosts] = createResource<FixedCost[]>(async () => {
    return (await budgetApiClient.get("/fixed-costs")).data;
  });

  const [savingsGoal, { mutate: mutateSavingsGoal }] = createResource(
    async () => {
      return (await budgetApiClient.get("/savings-goal")).data || 0;
    },
  );

  const [accounts, { mutate, refetch }] = createResource<Account[]>(
    async () => {
      return (await budgetApiClient.get("/account")).data;
    },
  );

  const [categories, { mutate: mutateCategories, refetch: refetchCategories }] =
    createResource<Category[]>(async () => {
      return (await budgetApiClient.get("/categories")).data;
    });

  const getSum = () => {
    return (
      fixedCosts()
        ?.filter((item: any) => item.type === "income")
        .reduce((acc: number, entry: any) => acc + entry.amount, 0) ?? 0
    );
  };

  const handleSaveAccount = async () => {
    try {
      await budgetApiClient.post("/account", {
        account: account(),
      });

      refetch();
      addToast({ message: "Account added", type: "success" });
      setAccount();
    } catch (err) {
      console.log(err);
      addToast({ message: "Failed to add account", type: "error" });
    }
  };

  const handleDeleteAccount = (account: Account) => {
    confirmDelete({
      onDelete: async () => await deleteAccount(account._id),
      title: "Delete account",
      message: `Do you really want to delete ${account.name}?`,
    });
  };

  const deleteAccount = async (accountId: string) => {
    try {
      await budgetApiClient.delete("/account?accountId=" + accountId);
      addToast({ message: "Account deleted", type: "success" });
      mutate((prev) => prev?.filter((account) => account._id !== accountId));
    } catch (err) {
      console.log(err);
      addToast({ message: "Failed to delete account", type: "error" });
    }
  };

  const handleSaveSavingsGoal = async () => {
    try {
      await budgetApiClient.post("/savings-goal", {
        savingsGoal: savingsGoal(),
      });
      addToast({ message: "Savings goal saved", type: "success" });
    } catch (err) {
      console.log(err);
      addToast({ message: "Failed to save savings goal", type: "error" });
    }
  };

  const handleSaveCategory = async () => {
    try {
      await budgetApiClient.post("/categories", {
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

  const handleDeleteCategory = (category: Category) => {
    confirmDelete({
      onDelete: async () => await deleteCategory(category._id),
      title: "Delete category",
      message: `Do you really want to delete ${category.name}?`,
    });
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await budgetApiClient.delete(`/categories/${categoryId}`);
      addToast({ message: "Category deleted", type: "success" });
      mutateCategories((prev) => prev?.filter((cat) => cat._id !== categoryId));
    } catch (err) {
      console.log(err);
      addToast({ message: "Failed to delete category", type: "error" });
    }
  };

  const handleEditCategory = (cat: Category) => {
    setCategory(cat);
  };

  return (
    <div class="container py-4 space-y-4">
      <Card
        title="Your accounts"
        subtitle="Manage your accounts and their balances"
      >
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th class="text-right">Balance</th>
              <th></th>
            </tr>
          </thead>
          <Suspense fallback={<div>Loading...</div>}>
            <Show when={accounts()?.length === 0}>
              <div class="py-4 px-4 font-thin text-neutral-content">
                No accounts yet
              </div>
            </Show>
            <tbody>
              <For each={accounts()}>
                {(account, index) => (
                  <tr>
                    <td>{account.name}</td>
                    <td class="text-right">{formatMoney(account.amount)}</td>
                    <td class="flex justify-end gap-2">
                      <div class="dropdown dropdown-end">
                        <div tabIndex={0} class="btn btn-ghost">
                          <i class="fa-solid fa-ellipsis-vertical" />
                        </div>
                        <ul
                          tabIndex={0}
                          class="menu flex items-start dropdown-content bg-base-200 rounded-box z-1 p-2 shadow-sm"
                        >
                          <Button
                            type="neutral"
                            label="Edit"
                            class="btn-ghost"
                            onClick={() => {
                              setAccount(account);
                              (document.activeElement as any).blur();
                            }}
                            icon={<i class="fa-solid fa-edit" />}
                          />
                          <Button
                            type="neutral"
                            label="Delete"
                            class="text-error btn-ghost"
                            onClick={() => {
                              handleDeleteAccount(account);
                              (document.activeElement as any).blur();
                            }}
                            icon={<i class="fa-solid fa-trash" />}
                          />
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </Suspense>
        </table>
        <Label class="mt-2">
          <span>
            Total Balances:{" "}
            <strong>
              {formatMoney(
                accounts()?.reduce((acc, account) => acc + account.amount, 0) ||
                  0,
              )}
            </strong>
          </span>
        </Label>
        <div class="divider">
          <Header class="min-h-5" title="Add new account" />
        </div>
        <form
          ref={(el) => (accountFormRef = el)}
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSaveAccount();
          }}
        >
          <Input
            value={account()?.name}
            class="validator"
            required
            onInput={(e) =>
              setAccount((prev) => ({ ...prev, name: e.currentTarget.value }))
            }
            label="Name"
            placeholder="Checking"
          />
          <Input
            value={account()?.amount}
            class="validator"
            required
            onBlur={(e) => {
              if (!isNaN(Number.parseFloat(e.currentTarget.value)))
                setAccount((prev) => ({
                  ...prev,
                  amount: Number.parseFloat(e.currentTarget.value),
                }));
            }}
            label="Current balance"
            placeholder="1,000 €"
          />
          <div class="flex flex-row justify-end gap-4">
            <Button
              class="w-1/2 mt-2"
              icon={
                account()?._id ? (
                  <i class="fa-solid fa-save" />
                ) : (
                  <i class="fa-solid fa-plus" />
                )
              }
              type="info"
              submit
              label={account()?._id ? "Update account" : "Add account"}
            />
            <Show when={account()?._id}>
              <Button
                class="flex-1 mt-2"
                type="neutral"
                onClick={() => setAccount()}
                label="Cancel"
              />
            </Show>
          </div>
        </form>
      </Card>

      <Card
        title="Categories"
        subtitle="Manage your income and expense categories"
      >
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <Suspense fallback={<div>Loading...</div>}>
            <Show when={categories()?.length === 0}>
              <div class="py-4 px-4 font-thin text-neutral-content">
                No categories yet
              </div>
            </Show>
            <tbody>
              <For each={categories()}>
                {(cat) => (
                  <tr>
                    <td>
                      <div class="flex flex-row items-center gap-2">
                        <div
                          class="w-4 h-4 rounded-full"
                          style={{ "background-color": cat.color }}
                        />
                        {cat.name}
                      </div>
                    </td>
                    <td class="flex justify-end gap-2">
                      <div class="dropdown dropdown-end">
                        <div tabIndex={0} class="btn btn-ghost">
                          <i class="fa-solid fa-ellipsis-vertical" />
                        </div>
                        <ul
                          tabIndex={0}
                          class="menu flex items-start dropdown-content bg-base-200 rounded-box z-1 p-2 shadow-sm"
                        >
                          <Button
                            type="neutral"
                            label="Edit"
                            class="btn-ghost"
                            onClick={() => {
                              handleEditCategory(cat);
                              (document.activeElement as any).blur();
                            }}
                            icon={<i class="fa-solid fa-edit" />}
                          />
                          <Button
                            type="neutral"
                            label="Delete"
                            class="text-error btn-ghost"
                            onClick={() => {
                              handleDeleteCategory(cat);
                              (document.activeElement as any).blur();
                            }}
                            icon={<i class="fa-solid fa-trash" />}
                          />
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </Suspense>
        </table>

        <div class="divider">
          <Header class="min-h-5" title={`Add new category`} />
        </div>
        <form
          ref={(el) => (categoryFormRef = el)}
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSaveCategory();
            categoryFormRef.reset();
          }}
        >
          <Input
            value={category()?.name}
            onInput={(e) =>
              setCategory((prev) => ({ ...prev, name: e.currentTarget.value }))
            }
            label="Category Name"
            required
            placeholder="Groceries, Rent, Salary..."
          />
          <ColorPicker
            value={category()?.color}
            onChange={(color) => {
              setCategory((prev) => ({ ...prev, color }));
            }}
          />
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
      </Card>

      <Card
        title="Savings goal"
        subtitle="Set what percentage of your income you want to save"
      >
        <div class="flex flex-row justify-between">
          <Label>Savings percentage</Label>
          <Label>{savingsGoal()}%</Label>
        </div>
        <input
          type="range"
          min={0}
          step="5"
          max="50"
          value={savingsGoal()}
          onInput={(e) => mutateSavingsGoal(Number(e.currentTarget.value))}
          class="range w-full"
        />
        <div class="flex flex-row justify-between">
          <Label class="font-thin text-xs">0%</Label>
          <Label class="font-thin text-xs">25%</Label>
          <Label class="font-thin text-xs">50%</Label>
        </div>
        <div>
          <Card>
            With a {savingsGoal()}% savings rate, you'll save{" "}
            {formatMoney((getSum() * (savingsGoal() / 100)).toFixed(2))}.
          </Card>
        </div>
        <div class="flex w-full justify-end">
          <Button
            type="primary"
            label="Save goal"
            onClick={handleSaveSavingsGoal}
          />
        </div>
      </Card>
    </div>
  );
};
