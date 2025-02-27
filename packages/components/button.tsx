import type { JSX } from "solid-js/jsx-runtime";
import { splitProps } from "solid-js";
import { cn } from "./lib/cn";
import "./global.css";

type ButtonProps = {
  type:
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  label?: string | number;
  icon?: JSX.Element;
  onClick?: (e: MouseEvent) => void;
  class?: string;
  submit?: boolean;
  disabled?: boolean;
};

const ButtonTypes = {
  neutral: "btn-neutral",
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  info: "btn-info",
  success: "btn-success",
  warning: "btn-warning",
  error: "btn-error",
};

export const Button = (props: ButtonProps) => {
  const [local, ..._rest] = splitProps(props, ["class"]);
  return (
    <button
      disabled={props.disabled}
      type={props.submit ? "submit" : "button"}
      class={cn(`btn ${ButtonTypes[props.type]}`, local.class)}
      onClick={props.onClick}
    >
      {props.icon}
      {props.label}
    </button>
  );
};
