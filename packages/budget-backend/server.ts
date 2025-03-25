import Elysia from "elysia";
import { auth, connectToDb, type User } from "shared";
import {
  deleteAccount,
  getAccounts,
  upsertAccount,
} from "./services/account.service";
import {
  getSavingsGoal,
  getUser,
  updateSavingsGoal,
  upsertUser,
} from "./services/budget.service";
import {
  deleteCategory,
  deleteSubCategory,
  getCategories,
  getCategoriesWithSubcategories,
  upsertCategory,
  upsertSubCategory,
} from "./services/category.service";
import {
  deleteFixedCost,
  getFixedCategoryBreakdown,
  getFixedCosts,
  upsertFixedCost,
} from "./services/fixed-costs.service";
import {
  addTransaction,
  deleteTransaction,
  getCategoryBreakdown,
  getMonthlyTransactions,
  getTransactions,
  updateTransaction,
} from "./services/transactions.service";
import type { Account } from "./types/account";
import type { Category, SubCategory } from "./types/category";
import type { FinanceUser } from "./types/finance-user";
import type { FixedCost } from "./types/fixed-cost";
import type { Transaction } from "./types/transaction";
import cors from "@elysiajs/cors";
import { seedCategories } from "./services/seed-category.service";

const PORT = Bun.env.BUDGET_PORT as string;
await connectToDb("budget");

const betterAuth = new Elysia({ name: "better-auth" })
  .use(
    cors({
      origin: Bun.env.OTTER_FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .macro({
    auth: {
      async resolve({ error, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return error(401);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

new Elysia()
  .onError(({ code, error }) => console.error(code, error))
  .use(betterAuth)
  .get(
    "/user",
    async ({ user }: { user: FinanceUser }) => {
      const existingUser = await getUser(user.id!);
      if (!existingUser) {
        await seedCategories(user.id!);
        return await upsertUser(user);
      }
      return existingUser;
    },
    { auth: true },
  )
  .get(
    "/savings-goal",
    async ({ user }: { user: FinanceUser }) => await getSavingsGoal(user.id),
    { auth: true },
  )
  .get(
    "/account",
    async ({ user }: { user: User }) => await getAccounts(user.id),
    { auth: true },
  )
  .get(
    "/fixed-costs",
    async ({ user }: { user: User }) => await getFixedCosts(user.id),
    { auth: true },
  )
  .post(
    "/fixed-costs",
    async ({
      user,
      body,
    }: {
      user: User;
      body: { fixedCost: Partial<FixedCost> };
    }) => await upsertFixedCost(user.id, body.fixedCost),
    { auth: true },
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
    }) => await getFixedCategoryBreakdown(user.id, params.type),
    { auth: true },
  )

  .post(
    "/savings-goal",
    async ({
      user,
      body,
    }: {
      user: FinanceUser;
      body: { savingsGoal: number };
    }) => await updateSavingsGoal(user.id, body.savingsGoal),
    { auth: true },
  )
  .post(
    "/account",
    async ({
      user,
      body,
    }: {
      user: User;
      body: { account: Partial<Account> };
    }) => await upsertAccount(user.id, body.account),
    { auth: true },
  )
  .delete(
    "/account",
    async ({ query }: { query: { accountId: string } }) =>
      await deleteAccount(query.accountId),
  )
  .get(
    "/transaction",
    async ({ user, query }: { user: User; query: any }) => {
      const { start, end, type, category } = query;
      return await getTransactions(user.id, {
        startDate: start ? new Date(start) : undefined,
        endDate: end ? new Date(end) : undefined,
        type,
        category,
      });
    },
    { auth: true },
  )
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
        user.id,
        parseInt(params.year),
        parseInt(params.month),
      ),
    { auth: true },
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
        user.id,
        parseInt(query.year),
        query.month ? parseInt(query.month) : undefined,
        query.type || "expense",
      ),
    { auth: true },
  )
  .post(
    "/transaction",
    async ({
      user,
      body,
    }: {
      user: User;
      body: { transaction: Partial<Transaction> };
    }) => await addTransaction(user.id, body.transaction),
    { auth: true },
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
    { auth: true },
  )
  .delete(
    "/transaction/:id",
    async ({ params }: { params: { id: string } }) =>
      await deleteTransaction(params.id),

    { auth: true },
  )
  .get(
    "/categories",
    async ({ user }: { user: User }) => await getCategories(user.id),

    { auth: true },
  )
  .get(
    "/categories/with-subcategories",
    async ({ user }: { user: User }) =>
      await getCategoriesWithSubcategories(user.id),
    { auth: true },
  )
  .post(
    "/categories",
    async ({
      user,
      body,
    }: {
      user: User;
      body: { category: Partial<Category> };
    }) => await upsertCategory(user.id, body.category),
    { auth: true },
  )
  .post(
    "/subCategories",
    async ({
      user,
      body,
    }: {
      user: User;
      body: { subCategory: Partial<SubCategory> };
    }) => await upsertSubCategory(user.id, body.subCategory),
    { auth: true },
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
  .listen(PORT, () => console.log(`Budget running on port ${PORT}`));
