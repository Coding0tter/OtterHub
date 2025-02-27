import { cn } from "./lib/cn";
import { splitProps, type JSX } from "solid-js";

interface CardProps {
  title?: string | JSX.Element;
  subtitle?: string | JSX.Element;
  onClick?: () => void;
  children?: JSX.Element;
  class?: string;
  onPointerDown?: JSX.EventHandler<HTMLDivElement, PointerEvent>;
  onPointerUp?: JSX.EventHandler<HTMLDivElement, PointerEvent>;
  onPointerMove?: JSX.EventHandler<HTMLDivElement, PointerEvent>;
  onTouchStart?: JSX.EventHandler<HTMLDivElement, TouchEvent>;
  onTouchMove?: JSX.EventHandler<HTMLDivElement, TouchEvent>;
  onTouchEnd?: JSX.EventHandler<HTMLDivElement, TouchEvent>;
  ref?: HTMLDivElement;
}

export const Card = (props: CardProps) => {
  const [local, ..._rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn(
        `card card-border bg-base-100 border-base-300 ${props.title && "pt-4"}  ${!props.children && "pb-4"} ${props.onClick && "cursor-pointer"}`,
        local.class,
      )}
      ref={props.ref}
      onPointerDown={props.onPointerDown}
      onPointerUp={props.onPointerUp}
      onPointerMove={props.onPointerMove}
      onTouchStart={props.onTouchStart}
      onTouchMove={props.onTouchMove}
      onTouchEnd={props.onTouchEnd}
      onClick={props.onClick}
    >
      <div class="px-4">
        {props.title && typeof props.title === "string" ? (
          <h3 class="card-title text-md">{props.title}</h3>
        ) : (
          props.title
        )}
        {props.subtitle && <h4 class="text-sm text-base">{props.subtitle}</h4>}
      </div>
      {props.children && (
        <div class={`${props.title && "pt-4"} card-body`}>{props.children}</div>
      )}
    </div>
  );
};
