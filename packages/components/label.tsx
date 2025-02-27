import { splitProps, type JSX } from "solid-js";
import { cn } from "./lib/cn";

type LabelProps = {
  children: JSX.Element;
  for?: string;
  class?: string;
};

export const Label = (props: LabelProps) => {
  const [local, rest] = splitProps(props, ["class"]);

  return <label class={cn("label", local.class)}>{props.children}</label>;
};
