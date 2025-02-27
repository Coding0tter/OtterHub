import { splitProps, type JSX } from "solid-js";
import { cn } from "./lib/cn";

interface HeaderProps {
  title: string | JSX.Element;
  class?: string;
}

export const Header = (props: HeaderProps) => {
  const [local, ...rest] = splitProps(props, ["class"]);
  return (
    <h1
      class={cn(
        "min-h-15 flex items-center justify-between text-2xl font-bold tracking-tight text-base-content",
        local.class,
      )}
    >
      {props.title}
    </h1>
  );
};
