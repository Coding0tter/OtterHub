import Elysia from "elysia";
import { connectToDb, parseUserHeader, type User } from "shared";
import {
  deleteAccount,
  getAccounts,
  upsertAccount,
} from "./services/account.service";
import type { Account } from "./types/account";
import type { FinanceUser } from "./types/finance-user";
import {
  getSavingsGoal,
  getUser,
  updateSavingsGoal,
  upsertUser,
} from "./services/budget.service";
import {
  deleteFixedCost,
  getFixedCategoryBreakdown,
  getFixedCosts,
  upsertFixedCost,
} from "./services/fixed-costs.service";
import type { FixedCost } from "./types/fixed-cost";
import {
  addTransaction,
  deleteTransaction,
  getCategoryBreakdown,
  getMonthlyTransactions,
  getTransactions,
  updateTransaction,
} from "./services/transactions.service";
import type { Transaction } from "./types/transaction";
import {
  deleteCategory,
  deleteSubCategory,
  getCategories,
  getCategoriesWithSubcategories,
  upsertCategory,
  upsertSubCategory,
} from "./services/category.service";
import type { Category, SubCategory } from "./types/category";

const PORT = Bun.env.BUDGET_PORT as string;
await connectToDb("budget");

new Elysia()
  .onError(({ code, error }) => console.error(code, error))
  .onBeforeHandle(parseUserHeader)
  .get("/user", async ({ user }: { user: FinanceUser }) => {
    const existingUser = await getUser(user.email!);
    if (!existingUser) {
      return await upsertUser(user);
    }
    return existingUser;
  })
  .get(
    "/savings-goal",
    async ({ user }: { user: FinanceUser }) => await getSavingsGoal(user.email),
  )
  .get(
    "/account",
    async ({ user }: { user: User }) => await getAccounts(user.email),
  )
  .get(
    "/fixed-costs",
    async ({ user }: { user: User }) => await getFixedCosts(user.email),
  )
  .post(
    "/fixed-costs",
    async ({
      user,
      body,
    }: {
      user: User;
      body: { fixedCost: Partial<FixedCost> };
    }) => await upsertFixedCost(user.email, body.fixedCost),
  )
  .delete(
    "/fixed-costs/:id",
    async ({ params }: { params: { id: string } }) =>
      await deleteFixedCost(params.id),
  )
  .get(
    "/fixed-costs/categories/:type",
    async ({
      user,
      params,
    }: {
      user: User;
      params: { type: "income" | "expense" };
    }) => await getFixedCategoryBreakdown(user.email, params.type),
  )

  .post(
    "/savings-goal",
    async ({
      user,
      body,
    }: {
      user: FinanceUser;
      body: { savingsGoal: number };
    }) => await updateSavingsGoal(user.email, body.savingsGoal),
  )
  .post(
    "/account",
    async ({
      user,
      body,
    }: {
      user: User;
      body: { account: Partial<Account> };
    }) => await upsertAccount(user.email, body.account),
  )
  .delete(
    "/account",
    async ({ query }: { query: { accountId: string } }) =>
      await deleteAccount(query.accountId),
  )
  .get("/transaction", async ({ user, query }: { user: User; query: any }) => {
    const { start, end, type, category } = query;
    return await getTransactions(user.email, {
      startDate: start ? new Date(start) : undefined,
      endDate: end ? new Date(end) : undefined,
      type,
      category,
    });
  })
  .get(
    "/transaction/monthly/:year/:month",
    async ({
      user,
      params,
    }: {
      user: User;
      params: { year: string; month: string };
    }) =>
      await getMonthlyTransactions(
        user.email,
        parseInt(params.year),
        parseInt(params.month),
      ),
  )
  .get(
    "/transaction/categories",
    async ({
      user,
      query,
    }: {
      user: User;
      query: {
        year: string;
        month?: string;
        type?: "income" | "expense" | "all";
      };
    }) =>
      await getCategoryBreakdown(
        user.email,
        parseInt(query.year),
        query.month ? parseInt(query.month) : undefined,
        query.type || "expense",
      ),
  )
  .post(
    "/transaction",
    async ({
      user,
      body,
    }: {
      user: User;
      body: { transaction: Partial<Transaction> };
    }) => await addTransaction(user.email, body.transaction),
  )
  .put(
    "/transaction/:id",
    async ({
      params,
      body,
    }: {
      params: { id: string };
      body: { transaction: Partial<Transaction> };
    }) => await updateTransaction(params.id, body.transaction),
  )
  .delete(
    "/transaction/:id",
    async ({ params }: { params: { id: string } }) =>
      await deleteTransaction(params.id),
  )
  .get(
    "/categories",
    async ({ user }: { user: User }) => await getCategories(user.email),
  )
  .get(
    "/categories/with-subcategories",
    async ({ user }: { user: User }) =>
      await getCategoriesWithSubcategories(user.email),
  )
  .post(
    "/categories",
    async ({
      user,
      body,
    }: {
      user: User;
      body: { category: Partial<Category> };
    }) => await upsertCategory(user.email, body.category),
  )
  .post(
    "/subCategories",
    async ({
      user,
      body,
    }: {
      user: User;
      body: { subCategory: Partial<SubCategory> };
    }) => await upsertSubCategory(user.email, body.subCategory),
  )
  .delete(
    "/categories/:id",
    async ({ params }: { params: { id: string } }) =>
      await deleteCategory(params.id),
  )
  .delete(
    "/subCategories/:id",
    async ({ params }: { params: { id: string } }) =>
      await deleteSubCategory(params.id),
  )
  .listen(PORT, () => console.log(`Fitness Tracker running on port ${PORT}`));
