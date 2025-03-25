import { useLocation, useNavigate } from "@solidjs/router";
import { authClient } from "auth";
import axios from "axios";
import { Button, Navbar } from "components";
import { createResource, Show } from "solid-js";

axios.defaults.baseURL = import.meta.env.OTTER_AUTH_API_URL;
axios.defaults.withCredentials = true;

const App = (props: any) => {
  const session = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [profilePicture, { refetch }] = createResource(
    () => session().data?.user?.image,
    async (userImage) => {
      if (!userImage) return;
      const imageResponse = await axios.get(
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
      <Navbar profilePicture={profilePicture} title="OtterHub" />
      <Show when={!session().data && location.pathname !== "/login"}>
        <Button
          type="neutral"
          onClick={() => navigate("/login")}
          icon={<i class="fa-solid fa-sign-in-alt" />}
          label="Login"
        />
      </Show>
      {props.children}
    </>
  );
};

export default App;
