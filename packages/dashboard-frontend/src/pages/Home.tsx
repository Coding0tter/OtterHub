import { useNavigate } from "@solidjs/router";
import { authClient } from "auth";
import { Card, Header } from "components";
import { Show } from "solid-js";

export const Home = () => {
  const navigate = useNavigate();
  const session = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.reload();
  };

  return (
    <div class="p-8">
      <Show when={session().isPending}>
        <div class="flex w-52 flex-col gap-4">
          <div class="skeleton h-32 w-full"></div>
          <div class="skeleton h-4 w-28"></div>
          <div class="skeleton h-4 w-full"></div>
          <div class="skeleton h-4 w-full"></div>
        </div>
      </Show>
      <Show when={session().error}>{session().error?.message}</Show>
      <Show when={session().data}>
        <div class="mb-8 flex flex-col w-full items-center">
          <div>Hello {session().data?.user.name}</div>
          <div class="flex gap-4">
            <button class="btn btn-outline border-error" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        <div class="divider" />
        <div>
          <Header title="Your apps" />
        </div>
        <div class="flex flex-wrap gap-4">
          {(session().data?.user as any).apps.includes("fitness") && (
            <Card
              title={
                <div class="flex mb-2 items-center gap-4">
                  <i class="fa-solid fa-dumbbell"></i>FitApp
                </div>
              }
              class="bg-primary text-primary-content"
              subtitle="Track your workouts and monitor your progress"
              onClick={() =>
                (window.location.href =
                  import.meta.env.OTTER_FRONTEND_URL + "/fitness/")
              }
            >
              Tap to open
            </Card>
          )}
          {(session().data?.user as any).apps.includes("budget") && (
            <Card
              title={
                <div class="flex mb-2 items-center gap-4">
                  <i class="fa-solid fa-money-bill"></i>BudgetApp
                </div>
              }
              class="bg-secondary text-secondary-content"
              subtitle="Keep track of your expenses. Budgets too"
              onClick={() =>
                (window.location.href =
                  import.meta.env.OTTER_FRONTEND_URL + "/budget/")
              }
            >
              Tap to open
            </Card>
          )}
        </div>
      </Show>
    </div>
  );
};
