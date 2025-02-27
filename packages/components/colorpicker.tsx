import { createEffect, createSignal, For, onMount } from "solid-js";

const presetColors = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
];

interface ColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker(props: ColorPickerProps) {
  const [currentColor, setCurrentColor] = createSignal<string>("");

  onMount(() => {
    changeColor(props.value || presetColors[0].value);
  });

  createEffect(() => {
    setCurrentColor(props.value || presetColors[0].value);
  }, [props.value]);

  const changeColor = (color: string) => {
    setCurrentColor(color);
    props.onChange(color);
  };

  return (
    <div class="flex flex-row gap-4">
      <div class="dropdown">
        <div tabIndex={0} role="button">
          <div
            class="w-3 h-3 rounded-full"
            style={{ "background-color": currentColor() }}
          />
        </div>
        <div
          tabIndex={0}
          class="dropdown-content card card-sm bg-base-100 z-1 w-64 shadow-md"
        >
          <div class="card-body flex flex-row flex-wrap">
            <For each={presetColors}>
              {(color) => (
                <div
                  class="btn btn-sm"
                  style={{ "background-color": color.value }}
                  onClick={() => {
                    changeColor(color.value);
                    (document.activeElement as any).blur();
                  }}
                >
                  {color.name}
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
}
