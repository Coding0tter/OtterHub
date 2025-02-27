import { Show, type Resource } from "solid-js";

type NavbarProps = {
  profilePicture?: Resource<string | undefined>;
  title: string;
};

export const Navbar = (props: NavbarProps) => {
  return (
    <div class="sticky top-0 z-100 navbar bg-base-100 shadow-sm flex justify-between">
      <h1 class="px-2 text-lg">{props.title}</h1>
      <div>
        <label class="p-4 swap swap-rotate">
          <input type="checkbox" class="theme-controller" value="bumblebee" />
          <i class="swap-on fa-regular fa-moon"></i>
          <i class="swap-off fa-solid fa-sun"></i>
        </label>
        <Show when={props.profilePicture}>
          {props.profilePicture!.loading && (
            <i class="fa-solid fa-spinner fa-spin"></i>
          )}
          <Show when={props.profilePicture!()}>
            <a href="/fitness/profile" class="avatar">
              <div class="w-12 rounded-full">
                <img src={props.profilePicture!()} />
              </div>
            </a>
          </Show>
        </Show>
      </div>
    </div>
  );
};
