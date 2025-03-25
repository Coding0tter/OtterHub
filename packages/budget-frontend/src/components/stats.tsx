import { Card, Header, Label } from "components";
import dayjs from "dayjs";
import { formatMoney } from "components";
import { createResource, createSignal, For, Show } from "solid-js";
import { DonutChart } from "./donut-chart";
import { budgetApi } from "../App";

export const Stats = () => {
  const [filterFixed, setFilterFixed] = createSignal(false);
  const [selectedMonth, setSelectedMonth] = createSignal<dayjs.Dayjs>(dayjs());
  const [activeTab, setActiveTab] = createSignal<"income" | "expense">(
    "expense",
  );
  const [granularity, setGranularity] = createSignal<"month" | "year">("month");
  const [visibleData, setVisibleData] = createSignal<any[]>();

  const [categoryBreakdown, { refetch }] = createResource(async () => {
    let url = `categories?year=${selectedMonth().year()}&type=${activeTab()}`;

    if (granularity() === "month") {
      url += `&month=${selectedMonth().month()}`;
    }

    const transactionResponse = await budgetApi.get("/transaction/" + url);
    const fixedResponse = await budgetApi.get(
      "/fixed-costs/categories/" + activeTab(),
    );

    let data = transactionResponse.data;
    if (!filterFixed()) {
      data = combineCategories(fixedResponse.data, transactionResponse.data);
    }

    setVisibleData(data);

    return data;
  });

  function combineCategories(fixedCosts: any[], transactions: any[]) {
    const categoryMap = new Map();

    fixedCosts.forEach((category) => {
      categoryMap.set(category._id, {
        ...category,
        total: category.total,
        count: category.count,
        subCategories: new Map(
          category.subCategories.map((sub: any) => [sub.id, sub]),
        ),
      });
    });

    transactions.forEach((category) => {
      if (categoryMap.has(category._id)) {
        const existing = categoryMap.get(category._id);
        existing.total += category.total;
        existing.count += category.count;

        category.subCategories.forEach((sub: any) => {
          if (existing.subCategories.has(sub.id)) {
            const existingSub = existing.subCategories.get(sub.id);
            existingSub.total += sub.total;
            existingSub.count += sub.count;
          } else {
            existing.subCategories.set(sub.id, sub);
          }
        });
      } else {
        categoryMap.set(category._id, {
          ...category,
          subCategories: new Map(
            category.subCategories.map((sub: any) => [sub.id, sub]),
          ),
        });
      }
    });

    return Array.from(categoryMap.values()).map((category) => ({
      ...category,
      subCategories: Array.from(category.subCategories.values()),
    }));
  }

  return (
    <div class="container py-4 space-y-4">
      <div class="flex flex-row items-center justify-between">
        <Header title="Financial Overview" />
        <div role="tablist" class="tabs tabs-box">
          <a
            role="tab"
            onClick={() => {
              setGranularity("month");
              refetch();
            }}
            class={"tab " + (granularity() === "month" ? "tab-active" : "")}
          >
            Month
          </a>
          <a
            role="tab"
            onClick={() => {
              setGranularity("year");
              refetch();
            }}
            class={"tab " + (granularity() === "year" ? "tab-active" : "")}
          >
            Year
          </a>
        </div>
      </div>
      <Card title="Cashflow">
        <div class="flex flex-row w-full justify-between">
          <div role="tablist" class="tabs tabs-box">
            <a
              role="tab"
              onClick={() => {
                setActiveTab("income");
                refetch();
              }}
              class={"tab " + (activeTab() === "income" ? "tab-active" : "")}
            >
              Income
            </a>
            <a
              role="tab"
              onClick={() => {
                setActiveTab("expense");
                refetch();
              }}
              class={"tab " + (activeTab() === "expense" ? "tab-active" : "")}
            >
              Expenses
            </a>
          </div>
          <div class="flex flex-row gap-2 items-center">
            <i
              onClick={() => {
                setSelectedMonth((prev: dayjs.Dayjs) =>
                  prev.subtract(1, granularity()),
                );
                refetch();
              }}
              class="p-2 bg-base-100 rounded-full fa-solid fa-caret-left"
            ></i>
            <span>
              {selectedMonth().format(
                granularity() === "month" ? "MMMM YYYY" : "YYYY",
              )}
            </span>
            <i
              onClick={() => {
                setSelectedMonth((prev: dayjs.Dayjs) =>
                  prev.add(1, granularity()),
                );
                refetch();
              }}
              class="p-2 bg-base-100 rounded-full fa-solid fa-caret-right"
            ></i>
          </div>
        </div>
        <Show
          when={categoryBreakdown() && categoryBreakdown()!.length > 0}
          fallback={<h1>No data yet</h1>}
        >
          <DonutChart
            initialData={categoryBreakdown()}
            setVisibleData={setVisibleData}
            data={visibleData}
          />
        </Show>
        <div class="flex flex-row items-center justify-between">
          <Header title="Summary" />
          <div class="flex gap-2">
            <Label>without fixed costs</Label>
            <input
              onChange={() => {
                setFilterFixed((prev) => !prev);
                refetch();
              }}
              checked={filterFixed()}
              type="checkbox"
              class="checkbox"
            />
          </div>
        </div>
        <For each={visibleData()}>
          {(category, index) => (
            <>
              <div
                onClick={() => {
                  if (category.subCategories)
                    setVisibleData(category.subCategories);
                }}
                class="flex flex-row w-full justify-between"
              >
                <div class="flex flex-row items-center gap-2">
                  <div
                    class="w-3 h-3 rounded-full"
                    style={{ "background-color": category.color }}
                  />
                  {category.name}
                </div>
                <div class={activeTab() === "expense" ? "text-error" : ""}>
                  {formatMoney(category.total)}
                </div>
              </div>
              <progress
                class="progress w-full"
                style={{ color: category.color }}
                value={19}
                max="100"
              />
            </>
          )}
        </For>
      </Card>
    </div>
  );
};
