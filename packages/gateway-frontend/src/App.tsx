import axios from "axios";
import { Button, Card, Header, Input, Navbar, useToast } from "components";
import { getApiClient, getUser, logout, type User } from "shared";
import { createResource, createSignal, onMount } from "solid-js";

declare const google: any;
const apiClient = getApiClient("/auth");

const App = () => {
  const { addToast } = useToast();
  const [user, setUser] = createSignal<User>();
  const [userName, setUsername] = createSignal<string>();
  const [email, setEmail] = createSignal<string>();
  const [password, setPassword] = createSignal<string>();
  const [showSignUp, setShowSignUp] = createSignal<boolean>(false);

  const [profilePicture, { mutate: mutateProfilePicture }] = createResource(
    user,
    async (user) => {
      if (!user) return;
      const imageResponse = await apiClient.get(
        `/profile-picture?url=${user.picture}`,
        { responseType: "blob" },
      );
      const imageUrl = URL.createObjectURL(imageResponse.data);
      return imageUrl;
    },
  );

  const handleLogout = async () => {
    await logout();
    setUser();
    mutateProfilePicture();
  };

  const handleNavigate = async (location: string) => {
    window.location.href = `${import.meta.env.OTTER_FRONTEND_URL}` + location;
  };

  onMount(async () => {
    try {
      const response = await apiClient.get("/user");
      setUser(response.data);
    } catch {
      console.warn("could not fetch user");
    }

    google.accounts.id.initialize({
      client_id: import.meta.env.OTTER_GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        const authResponse = await axios.post(
          `${import.meta.env.OTTER_API_URL}/auth/google`,
          { idToken: response.credential },
          {
            withCredentials: true,
          },
        );

        localStorage.setItem("refreshToken", authResponse.data.refreshToken);

        const userResponse = await getUser();
        setUser(userResponse);

        addToast({ message: "Logged in successfully" });
      },
    });

    google.accounts.id.renderButton(document.getElementById("google-login"), {
      theme: "outline",
      size: "large",
    });
  });

  const handleLogin = async () => {
    try {
      const response = await apiClient.post("/login", {
        email: email(),
        password: password(),
      });

      if (response.data === 400) {
        addToast({ type: "error", message: "Invalid credentials" });
        return;
      }

      if (response.data === 404) {
        addToast({ type: "warn", message: "Create an account" });
        setShowSignUp(true);
        return;
      }

      addToast({ message: "Logged in successfully" });
      localStorage.setItem("refreshToken", response.data.refreshToken);
      const userResponse = await getUser();
      setUser(userResponse);
    } catch (err) {
      console.error(err);
      addToast({ type: "error", message: "Error logging in" });
    }
  };

  const handleSignUp = async () => {
    try {
      const response = await apiClient.post("/signup", {
        email: email(),
        password: password(),
        name: userName(),
      });

      addToast({ message: "Account created successfully" });
      localStorage.setItem("refreshToken", response.data.refreshToken);
      const userResponse = await getUser();
      setUser(userResponse);
      setShowSignUp(false);
      return;
    } catch (err) {
      console.error(err);
      addToast({ type: "error", message: "Error creating account" });
    }
  };

  return (
    <>
      <Navbar profilePicture={profilePicture} title="OtterHub" />
      {user() ? (
        <div class="p-8">
          <div class="mb-8 flex flex-col w-full items-center">
            <div>Hello {user()?.name}</div>
            <div class="flex gap-4">
              <button
                class="btn btn-outline border-error"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
          <div class="divider" />
          <div>
            <Header title="Your apps" />
          </div>
          <div class="flex flex-wrap gap-4">
            {user()?.services.includes("fitness") && (
              <Card
                title={
                  <div class="flex mb-2 items-center gap-4">
                    <i class="fa-solid fa-dumbbell"></i>FitApp
                  </div>
                }
                class="bg-primary text-primary-content"
                subtitle="Track your workouts and monitor your progress"
                onClick={() => handleNavigate("/fitness")}
              >
                Tap to open
              </Card>
            )}
            {user()?.services.includes("budget") && (
              <Card
                title={
                  <div class="flex mb-2 items-center gap-4">
                    <i class="fa-solid fa-money-bill"></i>BudgetApp
                  </div>
                }
                class="bg-secondary text-secondary-content"
                subtitle="Keep track of your expenses. Budgets too"
                onClick={() => handleNavigate("/budget")}
              >
                Tap to open
              </Card>
            )}
          </div>
        </div>
      ) : (
        <>
          <div class="w-full my-8 text-center ">
            <h1 class="text-2xl mb-2 font-bold">Welcome to OtterHub</h1>
            <h2 class="text-sm ">Sign in to access your applications</h2>
          </div>
          <div class="flex justify-center">
            <div class="flex flex-col gap-2 w-1/2 max-w-[300px]">
              {showSignUp() ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSignUp();
                  }}
                >
                  <Input
                    value={userName()}
                    onInput={(e) =>
                      setUsername((e.target as HTMLInputElement).value)
                    }
                    class="validator"
                    required
                    label="Name"
                    placeholder="Name"
                  />
                  <Input
                    class="validator"
                    required
                    value={email()}
                    onInput={(e) =>
                      setEmail((e.target as HTMLInputElement).value)
                    }
                    label="Email"
                    type="email"
                  />
                  <Input
                    value={password()}
                    onInput={(e) =>
                      setPassword((e.target as HTMLInputElement).value)
                    }
                    required
                    min={8}
                    label="Password"
                    type="password"
                  />
                  <Input
                    class="validator"
                    required
                    min={8}
                    pattern={password()}
                    title="Passwords must match"
                    label="Verify password"
                    type="password"
                  />
                  <Button
                    type="primary"
                    class="mt-4 w-full"
                    submit
                    icon={<i class="fa-solid fa-right-to-bracket" />}
                    label="Create Account"
                  />
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                >
                  <Input
                    class="validator"
                    value={email()}
                    onInput={(e) =>
                      setEmail((e.target as HTMLInputElement).value)
                    }
                    required
                    label="Email"
                    type="email"
                  />
                  <Input
                    class="validator"
                    min={8}
                    value={password()}
                    onInput={(e) =>
                      setPassword((e.target as HTMLInputElement).value)
                    }
                    required
                    label="Password"
                    type="password"
                  />
                  <Button
                    class="mt-4 w-full"
                    type="primary"
                    icon={<i class="fa-solid fa-right-to-bracket" />}
                    label="Login"
                    submit
                  />
                </form>
              )}
            </div>
          </div>
          {!showSignUp() && (
            <div class="flex w-full mt-2 justify-center">
              <div id="google-login" class="w-1/2 max-w-[300px] mb-4"></div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default App;
