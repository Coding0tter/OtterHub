import { Label } from "./label";
import { splitProps, type JSX } from "solid-js";
import { cn } from "./lib/cn";

type TextInputProps = {
  name?: string;
  class?: string;
  label?: string;
  type?: "text" | "number" | "email" | "tel" | "password" | "url" | "date";
  placeholder?: string;
  value?: string | number | undefined;
  error?: string;
  required?: boolean;
  enterkeyhint?: any;
  ref?: (element: HTMLInputElement) => void;
  onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>;
  onChange?: JSX.EventHandler<HTMLInputElement, Event>;
  onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent>;
  onKeyDown?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>;
  onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent>;
  min?: number;
  pattern?: string;
  title?: string;
  allowClear?: boolean;
};

export const Input = (props: TextInputProps) => {
  let inputRef: HTMLInputElement;
  const [local, ...rest] = splitProps(props, ["class"]);

  const handleKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (
    e,
  ) => {
    if (props.onKeyDown) props.onKeyDown(e);
    if (e.key === "Enter") {
      const form = e.currentTarget.form;
      if (form) {
        const elements = Array.from(form.elements) as HTMLElement[];
        const index = elements.indexOf(e.currentTarget);
        const nextElement = elements[index + 1];
        if (nextElement && typeof nextElement.focus === "function") {
          nextElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  return (
    <>
      {props.label && <Label for={props.name}>{props.label}</Label>}
      <input
        enterkeyhint={props.enterkeyhint || "undefined"}
        ref={(el) => {
          inputRef = el;
          props.ref && props.ref(el);
        }}
        lang="de"
        onFocus={props.onFocus}
        required={props.required}
        minlength={props.min}
        pattern={props.pattern}
        title={props.title}
        name={props.name}
        type={props.type}
        value={props.value ?? ""}
        onKeyDown={handleKeyDown}
        onInput={props.onInput}
        onChange={props.onChange}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        class={cn(
          local.class,
          "input border border-neutral flex w-full px-3 py-2 mb-2",
        )}
      />
    </>
  );
};
