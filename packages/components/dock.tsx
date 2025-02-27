import { createSignal, For, onCleanup, onMount, type JSX } from "solid-js";

type DockProps = {
  actions: {
    label: string;
    href?: string;
    icon: JSX.Element;
    type: "link" | "action";
    action?: () => void;
  }[];
  highlightCenter: boolean;
};

export const Dock = (props: DockProps) => {
  const [location, setCurrentLocation] = createSignal(window.location.pathname);
  const isCenter = (index: number) => {
    return Math.floor(props.actions.length / 2) === index;
  };

  onMount(() => {
    const updateLocation = () => setCurrentLocation(window.location.pathname);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      window.dispatchEvent(new Event("locationchange"));
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event("locationchange"));
    };

    window.addEventListener("popstate", updateLocation);
    window.addEventListener("locationchange", updateLocation);

    onCleanup(() => {
      window.removeEventListener("popstate", updateLocation);
      window.removeEventListener("locationchange", updateLocation);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    });
  });

  return (
    <div class="dock">
      <For each={props.actions}>
        {(action, index) =>
          action.type === "link" ? (
            <a
              class={`${location() === action.href && (!isCenter(index()) || !props.highlightCenter) ? "dock-active" : ""}`}
              href={action.href}
            >
              <div
                class={`flex flex-col items-center justify-center ${props.highlightCenter && isCenter(index()) ? "border ring-ring shadow-md w-full h-12 rounded-full" : ""}`}
              >
                {action.icon}
                <span class="text-xs">{action.label}</span>
              </div>
            </a>
          ) : action.type === "action" ? (
            <a
              class={`${location() === action.href && (!isCenter(index()) || !props.highlightCenter) ? "dock-active" : ""}`}
              onClick={action.action}
            >
              <div
                class={`flex flex-col items-center justify-center ${props.highlightCenter && isCenter(index()) ? "border ring-ring shadow-md w-full h-12 rounded-full" : ""}`}
              >
                {action.icon}
                <span class="text-xs">{action.label}</span>
              </div>
            </a>
          ) : (
            <div>Not Implemented</div>
          )
        }
      </For>
    </div>
  );
};
