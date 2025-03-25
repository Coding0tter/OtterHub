import type { Account, FixedCost, Transaction } from "budget-backend/types";
import { Button, Card, Header, Input, Label, useToast } from "components";
import dayjs from "dayjs";
import { formatMoney } from "components";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { CategorySelect } from "./category-select";
import { budgetApi } from "../App";

export const Dashboard = () => {
  const { addToast } = useToast();
  const [transaction, setTransaction] = createSignal<Partial<Transaction>>();
  const [showModal, setShowModal] = createSignal<"income" | "expense">();
  const [selectedMonth, setSelectedMonth] = createSignal<dayjs.Dayjs>(dayjs());
  const [activeTab, setActiveTab] = createSignal<"all" | "income" | "expense">(
    "all",
  );
  const [savingsGoal] = createResource<number>(async () => {
    return (await budgetApi.get("/savings-goal")).data || 0;
  });
  const [categories] = createResource(async () => {
    return (await budgetApi.get("/categories/with-subcategories")).data;
  });
  const [fixedCosts] = createResource<FixedCost[]>(async () => {
    return (await budgetApi.get("/fixed-costs")).data;
  });
  const [transactions, { refetch: fetchTransactions }] = createResource(
    selectedMonth,
    async (month) => {
      const start = month.startOf("month").toISOString();
      const end = month.endOf("month").toISOString();
      return (await budgetApi.get(`/transaction?start=${start}&end=${end}`))
        .data;
    },
  );

  const [accounts, { mutate, refetch }] = createResource<Account[]>(
    async () => {
      return (await budgetApi.get("/account")).data;
    },
  );

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

  const calculateActualBudget = () => {
    const expenses =
      (
        transactions()?.filter((item: any) => item.type === "expense") ?? []
      ).reduce((acc: number, entry: any) => acc + entry.amount, 0) ?? 0;
    const income =
      (
        transactions()?.filter((item: any) => item.type === "income") ?? []
      ).reduce((acc: number, entry: any) => acc + entry.amount, 0) ?? 0;

    return getBudget() - expenses + income;
  };

  const handleSave = async () => {
    try {
      await budgetApi.post("/transaction", {
        transaction: { ...transaction(), type: showModal() },
      });
      addToast({
        message: "Transaction saved",
        type: "success",
      });
      setShowModal();
      setTransaction();
      fetchTransactions();
    } catch (err) {
      console.error("Failed to save transaction:", err);
      addToast({
        message: "Failed to save transaction",
        type: "error",
      });
    }
  };

  const getFilteredTransactions = () => {
    return activeTab() === "all"
      ? transactions()
      : (transactions() || []).filter(
          (item: Transaction) => item.type === activeTab(),
        );
  };

  return (
    <>
      <div class="container py-4 space-y-4">
        <Card
          title="Budget remaining"
          subtitle="Total budget until end of month"
        >
          <Header
            class={
              (calculateActualBudget() / getBudget()) * 100 < 10
                ? "text-error"
                : ""
            }
            title={formatMoney(calculateActualBudget())}
          />
          <div class="flex flex-row gap-5 justify-center">
            <Button
              type="error"
              class="flex-1 btn-sm"
              onClick={() => setShowModal("expense")}
              label="Expense"
              icon={<i class="fa-solid fa-minus" />}
            />
            <Button
              type="success"
              class="flex-1 btn-sm"
              label="Income"
              onClick={() => setShowModal("income")}
              icon={<i class="fa-solid fa-plus" />}
            />
          </div>
        </Card>
        <div class="flex flex-row justify-between items-center px-2">
          <Header title="Monthly Overview" />
          <div class="flex flex-row gap-2 items-center">
            <i
              onClick={() =>
                setSelectedMonth((prev: dayjs.Dayjs) =>
                  prev.subtract(1, "month"),
                )
              }
              class="p-2 bg-base-100 rounded-full fa-solid fa-caret-left"
            ></i>
            <span>{selectedMonth().format("MMMM YYYY")}</span>
            <i
              onClick={() =>
                setSelectedMonth((prev: dayjs.Dayjs) => prev.add(1, "month"))
              }
              class="p-2 bg-base-100 rounded-full fa-solid fa-caret-right"
            ></i>
          </div>
        </div>
        <div role="tablist" class="tabs tabs-box">
          <a
            role="tab"
            onClick={() => setActiveTab("all")}
            class={"tab " + (activeTab() === "all" ? "tab-active" : "")}
          >
            All
          </a>
          <a
            role="tab"
            onClick={() => setActiveTab("income")}
            class={"tab " + (activeTab() === "income" ? "tab-active" : "")}
          >
            Income
          </a>
          <a
            role="tab"
            onClick={() => setActiveTab("expense")}
            class={"tab " + (activeTab() === "expense" ? "tab-active" : "")}
          >
            Expenses
          </a>
        </div>

        <Card class="card-sm">
          <Suspense fallback={<div>Loading...</div>}>
            <Show when={getFilteredTransactions()?.length === 0}>
              <div class="font-thin text-neutral-content">
                No transactions yet
              </div>
            </Show>
            <For each={getFilteredTransactions()}>
              {(entry, index) => (
                <>
                  <div class="flex flex-row justify-between items-center">
                    <div class="flex flex-row items-center gap-2">
                      <div
                        class="avatar rounded-full w-4 h-4"
                        style={{
                          "background-color": entry.subCategory?.color,
                        }}
                      ></div>
                      <div class="flex flex-col">
                        <h1>{entry.description}</h1>
                        <Label>
                          {dayjs(entry.date).format("MMM DD ,HH:mm")}
                        </Label>
                      </div>
                    </div>
                    <div>
                      <div class="flex flex-col items-end">
                        <span>
                          {entry.type === "income" ? (
                            <h2 class="text-success">
                              {formatMoney(entry.amount)}
                            </h2>
                          ) : (
                            <h2 class="text-error">
                              -{formatMoney(entry.amount)}
                            </h2>
                          )}
                        </span>
                        <Label>{entry.account?.name}</Label>
                      </div>
                    </div>
                  </div>
                  {index() < getFilteredTransactions().length - 1 && (
                    <div class="divider my-0" />
                  )}
                </>
              )}
            </For>
          </Suspense>
        </Card>
      </div>
      <dialog open={!!showModal()} class="modal bg-base-300/50">
        <div class="modal-box overflow-visible">
          <h3 class="font-bold text-lg mb-4">Add {showModal()}</h3>
          <form>
            <Input
              onBlur={(e) =>
                setTransaction((prev) => ({
                  ...prev,
                  description: e.currentTarget.value,
                }))
              }
              value={transaction()?.description}
              label="Description"
              placeholder="Food, Groceries, etc."
            />
            <Input
              onBlur={(e) => {
                if (
                  !isNaN(
                    Number.parseFloat(e.currentTarget.value.replace(",", ".")),
                  )
                )
                  setTransaction((prev) => ({
                    ...prev,
                    amount: Number.parseFloat(
                      e.currentTarget.value.replace(",", "."),
                    ),
                  }));
              }}
              label="Amount"
              placeholder="0.00"
            />
            <Label>Account</Label>
            <select
              onInput={(e) =>
                setTransaction((prev) => ({ ...prev, account: e.target.value }))
              }
              class="select mb-2 w-full !border-neutral"
            >
              <option hidden disabled selected>
                Select an account
              </option>
              <For each={accounts()}>
                {(account) => (
                  <option value={account._id}>{account.name}</option>
                )}
              </For>
            </select>
            <Suspense>
              <CategorySelect
                categories={categories}
                onChange={(category, subCategory) => {
                  setTransaction((prev) => ({
                    ...prev,
                    category: category._id,
                    subCategory: subCategory?._id,
                  }));
                }}
              />
            </Suspense>
            <div class="flex flex-row justify-end gap-2 mt-4">
              <Button
                onClick={() => {
                  setShowModal();
                  setTransaction();
                }}
                label={"Cancel"}
                type="neutral"
              />
              <Button onClick={handleSave} label={"Save"} type="info" />
            </div>
          </form>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button onClick={() => setShowModal()}></button>
        </form>
      </dialog>
    </>
  );
};
