import type { Category, FixedCost } from "budget-backend/types";
import {
  Button,
  Card,
  Header,
  Input,
  Label,
  useConfirmDelete,
  useToast,
} from "components";
import { formatMoney } from "shared";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { budgetApiClient } from "../App";
import { CategorySelect } from "./category-select";

export const MonthlySettings = () => {
  const { addToast } = useToast();
  const { confirmDelete } = useConfirmDelete();
  const [showTab, setShowTab] = createSignal<"income" | "expense">("income");
  const [fixedCost, setFixedCost] = createSignal<any>();

  const [categories] = createResource(async () => {
    return (await budgetApiClient.get("/categories/with-subcategories")).data;
  });

  const [fixedCosts, { refetch }] = createResource<FixedCost[]>(async () => {
    return (await budgetApiClient.get("/fixed-costs")).data;
  });

  const [categoryBreakdown, { refetch: refetchBreakdown }] = createResource(
    showTab,
    async (type: "income" | "expense") => {
      return (await budgetApiClient.get(`/fixed-costs/categories/${type}`))
        .data;
    },
  );

  const [savingsGoal] = createResource<number>(async () => {
    return (await budgetApiClient.get("/savings-goal")).data || 0;
  });

  const getSum = (type: "income" | "expense") => {
    return (
      fixedCosts()
        ?.filter((item: any) => item.type === type)
        .reduce((acc: number, entry: any) => acc + entry.amount, 0) ?? 0
    );
  };

  const getSavings = () => {
    return (getSum("income") * (savingsGoal() ?? 0)) / 100;
  };

  const getBudget = () => {
    return getSum("income") - getSum("expense") - getSavings();
  };

  const handleDeleteFixedCost = (item: FixedCost) => {
    confirmDelete({
      onDelete: async () => await deleteFixedCost(item._id),
      message: `Do you really want to delete ${item.name}?`,
      title: "Delete fixed cost",
    });
  };

  const deleteFixedCost = async (id: string) => {
    try {
      await budgetApiClient.delete(`/fixed-costs/${id}`);
      addToast({
        message: "Fixed cost deleted",
        type: "success",
      });
      refetch();
      refetchBreakdown();
    } catch (err) {
      console.log(err);
      addToast({
        message: "Failed to delete fixed cost",
        type: "error",
      });
    }
  };

  const handleSave = async () => {
    try {
      await budgetApiClient.post("/fixed-costs", {
        fixedCost: { ...fixedCost(), type: showTab() },
      });
      addToast({
        message: "Fixed cost added",
        type: "success",
      });
      refetch();
      setFixedCost();
      refetchBreakdown();
    } catch (err) {
      console.log(err);
      addToast({
        message: "Failed to save fixed cost",
        type: "error",
      });
    }
  };

  return (
    <div class="container py-4 space-y-4">
      <Card title="Monthly Summary" subtitle="Overview of you monthly finances">
        <Label>Budget</Label>
        <Suspense fallback={<h1>Loading...</h1>}>
          <h1 class="text-lg font-bold text-info">
            {formatMoney(getBudget())}{" "}
            <span class="text-sm font-thin">
              (Savings: {formatMoney(getSavings())})
            </span>
          </h1>
        </Suspense>
        <Label>Total Income</Label>
        <Suspense fallback={<h1>Loading...</h1>}>
          <h1 class="text-md font-bold text-success">
            + {formatMoney(getSum("income"))}
          </h1>
        </Suspense>
        <Label>Total Expenses</Label>
        <Suspense fallback={<h1>Loading...</h1>}>
          <h1 class="text-md font-bold text-error">
            - {formatMoney(getSum("expense"))}
          </h1>
        </Suspense>
      </Card>
      <div role="tablist" class="tabs tabs-box">
        <a
          role="tab"
          onClick={() => setShowTab("income")}
          class={"tab " + (showTab() === "income" ? "tab-active" : "")}
        >
          Income
        </a>
        <a
          role="tab"
          onClick={() => setShowTab("expense")}
          class={"tab " + (showTab() === "expense" ? "tab-active" : "")}
        >
          Expenses
        </a>
      </div>

      <Card title="Income Sources" subtitle="Add your regular income sources">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <Show
            when={
              fixedCosts()?.filter((item) => item.type === showTab()).length ===
              0
            }
          >
            <div class="py-4 px-4 font-thin text-neutral-content">
              No {showTab()} entries yet
            </div>
          </Show>
          <tbody>
            <Suspense fallback={<h1>Loading...</h1>}>
              <For
                each={fixedCosts()?.filter((item) => item.type === showTab())}
              >
                {(item, index) => (
                  <tr>
                    <td>
                      <div>{item.name}</div>
                      <div class="text-sm font-thin">
                        {item.category.name}
                        {item.subCategory && `: ${item.subCategory.name}`}
                      </div>
                    </td>
                    <td>{formatMoney(item.amount)}</td>
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
                              setFixedCost(item);
                              (document.activeElement as any).blur();
                            }}
                            icon={<i class="fa-solid fa-edit" />}
                          />
                          <Button
                            type="neutral"
                            label="Delete"
                            class="text-error btn-ghost"
                            onClick={async () => {
                              handleDeleteFixedCost(item);
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
            </Suspense>
          </tbody>
        </table>
        <div class="divider">
          <Header title={"Add new " + showTab()} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Input
            label="Source"
            value={fixedCost()?.name}
            required
            onInput={(e) =>
              setFixedCost((prev) => ({ ...prev, name: e.currentTarget.value }))
            }
            placeholder="Salary"
          />
          <Input
            label="Amount"
            required
            value={fixedCost()?.amount}
            onBlur={(e) => {
              if (
                !isNaN(
                  Number.parseFloat(e.currentTarget.value.replace(",", ".")),
                )
              )
                setFixedCost((prev) => ({
                  ...prev,
                  amount: Number.parseFloat(
                    e.currentTarget.value.replace(",", "."),
                  ),
                }));
            }}
            placeholder="2.134,21 €"
          />
          <CategorySelect
            categories={categories}
            onChange={(category, subCategory) =>
              setFixedCost((prev) => ({
                ...prev,
                category: category,
                subCategory: subCategory,
              }))
            }
          />
          <div class="flex flex-row justify-end gap-4">
            <Button
              class="w-1/2 mt-2"
              icon={
                fixedCost()?._id ? (
                  <i class="fa-solid fa-save" />
                ) : (
                  <i class="fa-solid fa-plus" />
                )
              }
              type="info"
              submit
              label={
                fixedCost()?._id ? `Update ${showTab()}` : `Add ${showTab()}`
              }
            />
            <Show when={fixedCost()?._id}>
              <Button
                class="flex-1 mt-2"
                type="neutral"
                onClick={() => setFixedCost()}
                label="Cancel"
              />
            </Show>
          </div>
        </form>
      </Card>

      <Card
        title={
          showTab().at(0)?.toUpperCase() + showTab().slice(1) + " Breakdown"
        }
        subtitle={`Your monthly ${showTab()} by category`}
      >
        <ul class="list gap-4">
          <For each={categoryBreakdown()}>
            {(category) => (
              <>
                <li class="flex flex-row justify-between">
                  <div class="flex flex-row gap-4">
                    <div
                      class="w-5 h-5 bg-info rounded-full"
                      style={{ "background-color": category.color }}
                    />
                    <div>{category.name}</div>
                  </div>
                  <div class="flex flex-row gap-2">
                    <div>{formatMoney(category.total)}</div>
                    <div class="font-thin">
                      {(
                        (Math.abs(category.total) / getSum(showTab())) *
                        100
                      ).toFixed(2)}{" "}
                      %
                    </div>
                  </div>
                </li>
                <For each={category.subCategories}>
                  {(subCategory) => (
                    <li class="ml-2 flex flex-row justify-between">
                      <div class="flex flex-row gap-4">
                        <div
                          class="w-5 h-5 bg-info rounded-full"
                          style={{ "background-color": subCategory.color }}
                        />
                        <div>{subCategory.name}</div>
                      </div>
                      <div class="flex flex-row gap-2">
                        <div>{formatMoney(subCategory.total)}</div>
                        <div class="font-thin">
                          {(
                            (Math.abs(subCategory.total) / getSum(showTab())) *
                            100
                          ).toFixed(2)}{" "}
                          %
                        </div>
                      </div>
                    </li>
                  )}
                </For>
              </>
            )}
          </For>
        </ul>
      </Card>
    </div>
  );
};
