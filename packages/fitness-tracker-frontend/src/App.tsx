import axios from "axios";
import { Dock, Navbar, ToastProvider } from "components";
import { getApiClient } from "shared";
import { createResource, type Component } from "solid-js";

export const fitnessApiClient = getApiClient("/fitness");
export const authApiClient = getApiClient("/auth");

const App: Component = (props: any) => {
  const [profilePicture] = createResource(async () => {
    try {
      const result = await authApiClient.get("/user");

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
      <Navbar title="FitApp" profilePicture={profilePicture} />
      <div class="flex flex-col bg-background">
        <ToastProvider>{props.children}</ToastProvider>
      </div>
      <Dock
        actions={[
          {
            label: "Home",
            action: () =>
              (window.location.href = `${import.meta.env.OTTER_FRONTEND_URL}/`),
            icon: <i class="fa-solid fa-home" />,
            type: "action",
          },
          {
            label: "Workouts",
            href: "/fitness",
            icon: <i class="fa-solid fa-dumbbell" />,
            type: "link",
          },
          {
            label: "Add",
            href: "/fitness/workout-editor/new",
            icon: <i class="fa-solid fa-plus" />,
            type: "link",
          },
          {
            label: "History",
            href: "/fitness/workout-progress",
            icon: <i class="fa-solid fa-list-ul" />,
            type: "link",
          },
          {
            label: "Profile",
            href: "/fitness/profile",
            icon: <i class="fa-solid fa-user" />,
            type: "link",
          },
        ]}
        highlightCenter={true}
      />
    </>
  );
};

export default App;
