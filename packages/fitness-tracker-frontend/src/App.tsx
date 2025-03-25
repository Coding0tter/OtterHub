import axios from "axios";
import { Dock, Navbar, ToastProvider } from "components";
import { authClient } from "auth";
import { createResource, type Component } from "solid-js";

export const authApi = axios.create({
  baseURL: import.meta.env.OTTER_AUTH_API_URL,
  withCredentials: true,
});

export const fitnessApi = axios.create({
  baseURL: import.meta.env.OTTER_FITNESS_API_URL,
  withCredentials: true,
});

const App: Component = (props: any) => {
  const session = authClient.useSession();
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
