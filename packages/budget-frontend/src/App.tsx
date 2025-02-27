import { createResource, type Component } from "solid-js";

import axios from "axios";
import {
  ConfirmDeleteModalProvider,
  Dock,
  Navbar,
  ToastProvider,
} from "components";
import { getApiClient } from "shared";

export const authApiClient = getApiClient("/auth");
export const budgetApiClient = getApiClient("/budget");

const App: Component = (props: any) => {
  const [profilePicture] = createResource(async () => {
    try {
      const result = await budgetApiClient.get("/user");

      const imageResponse = await authApiClient.get(
        `/profile-picture?url=${result.data.picture}`,
        { responseType: "blob" },
      );
      const imageUrl = URL.createObjectURL(imageResponse.data);
      return imageUrl;
    } catch (err: any) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 403)
      ) {
        window.location.href = `${import.meta.env.OTTER_FRONTEND_URL}`;
      }
      return "";
    }
  });
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
