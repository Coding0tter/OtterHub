import { createResource, onMount, type Component } from "solid-js";

import axios from "axios";
import {
  ConfirmDeleteModalProvider,
  Dock,
  Navbar,
  ToastProvider,
} from "components";
import { authClient } from "auth";

export const authApi = axios.create({
  baseURL: import.meta.env.OTTER_AUTH_API_URL,
  withCredentials: true,
});

export const budgetApi = axios.create({
  baseURL: import.meta.env.OTTER_BUDGET_API_URL,
  withCredentials: true,
});

const App: Component = (props: any) => {
  const session = authClient.useSession();

  onMount(async () => {
    await budgetApi.get("/user");
  });

  const [profilePicture] = createResource(
    () => session().data?.user?.image,
    async (userImage) => {
      if (!userImage) return;
      const imageResponse = await authApi.get(
        `/profile-picture?url=${userImage}`,
        {
          responseType: "blob",
        },
      );
      return URL.createObjectURL(imageResponse.data);
    },
  );

  return (
    <>
      <Navbar title="BudgetApp" profilePicture={profilePicture} />
      <div class="flex flex-col bg-background overflow-y-auto pb-20">
        <ConfirmDeleteModalProvider>
          <ToastProvider>{props.children}</ToastProvider>
        </ConfirmDeleteModalProvider>
      </div>
      <Dock
        highlightCenter={false}
        actions={[
          {
            label: "Home",
            action: () =>
              (window.location.href = `${import.meta.env.OTTER_FRONTEND_URL}/`),
            icon: <i class="fa-solid fa-home" />,
            type: "action",
          },
          {
            label: "Overview",
            href: "/budget",
            icon: <i class="fa-solid fa-chart-pie" />,
            type: "link",
          },
          {
            label: "Stats",
            href: "/budget/stats",
            icon: <i class="fa-solid fa-chart-bar" />,
            type: "link",
          },
          {
            label: "Monthly",
            href: "/budget/monthly",
            icon: <i class="fa-solid fa-calendar" />,
            type: "link",
          },
          {
            label: "Settings",
            href: "/budget/settings",
            icon: <i class="fa-solid fa-cog" />,
            type: "link",
          },
        ]}
      />
    </>
  );
};

export default App;
