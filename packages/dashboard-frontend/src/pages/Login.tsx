import { authClient } from "auth";
import { Button, Input } from "components";
import { createSignal } from "solid-js";

export const Login = () => {
  const [userName, setUsername] = createSignal<string>();
  const [email, setEmail] = createSignal<string>();
  const [password, setPassword] = createSignal<string>();
  const [picture, setPicture] = createSignal<any>();
  const [showSignUp, setShowSignUp] = createSignal<boolean>(false);

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: import.meta.env.OTTER_FRONTEND_URL,
    });
  };

  const handleLogin = async () => {
    await authClient.signIn.email({
      email: email()!,
      password: password()!,
    });
  };

  const handleSignUp = async () => {
    await authClient.signUp.email({
      email: email()!,
      password: password()!,
      name: userName()!,
    });
  };

  return (
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
                onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
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
                onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
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
              <Button
                class="mt-4 w-full"
                type="secondary"
                onClick={() => setShowSignUp(true)}
                icon={<i class="fa-solid fa-user-plus"></i>}
                label="Sign up"
              />
              {!showSignUp() && (
                <Button
                  class="mt-4 w-full"
                  type="primary"
                  icon={<i class="fa-brands fa-google"></i>}
                  onClick={handleGoogleLogin}
                  label="Sign in with Google"
                />
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
};
