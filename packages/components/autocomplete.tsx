import { createEffect, createSignal, For, Show, type JSX } from "solid-js";
import { Input, useToast } from "components";

export type AutocompleteOption = Record<string, any> | string;

export interface AutocompleteProps<T extends AutocompleteOption> {
  /**
   * Current value of the input
   */
  value?: string;

  /**
   * Callback when value changes
   */
  onChange: (value: string) => void;

  /**
   * Label for the input field
   */
  label?: string;

  /**
   * Placeholder for the input field
   */
  placeholder?: string;

  /**
   * Available options to select from
   */
  options: T[];

  /**
   * Function to extract the display label from an option
   */
  getOptionLabel?: (option: T) => string;

  /**
   * Function to extract the value from an option
   */
  getOptionValue?: (option: T) => any /**
   * Function to filter options based on input value
   */;
  filterOption?: (option: T, inputValue: string) => boolean;

  /**
   * Callback when a new option is created
   * Should return the created option or null/undefined
   */
  onCreateOption?: (
    inputValue: string,
  ) => Promise<T | null | undefined> | T | null | undefined;

  /**
   * Whether to allow creating new options
   */
  allowCreate?: boolean;

  /**
   * Whether the input is required
   */
  required?: boolean;

  /**
   * Text to show when user can create a new option
   * Use {input} as a placeholder for the current input value
   */
  createHint?: string;

  /**
   * Whether to show a plus icon button to add new items
   * Especially useful for mobile
   */
  showAddButton?: boolean;

  /**
   * Whether the component is in loading state
   */
  loading?: boolean;

  /**
   * Additional props to pass to the Input component
   */
  [key: string]: any;
}

export function Autocomplete<T extends AutocompleteOption>(
  props: AutocompleteProps<T>,
): JSX.Element {
  const { addToast } = useToast();

  // Use initial value from props, but track it internally
  const [inputValue, setInputValue] = createSignal<string>(props.value || "");
  const [showDropdown, setShowDropdown] = createSignal<boolean>(false);
  const [filteredOptions, setFilteredOptions] = createSignal<T[]>([]);
  const [isCreating, setIsCreating] = createSignal<boolean>(false);

  // Update internal value when props.value changes
  createEffect(() => {
    if (props.value !== undefined) {
      setInputValue(props.value);
    }
  });

  // Helper function to get option label
  const getLabel = (option: T): string => {
    if (props.getOptionLabel) {
      return props.getOptionLabel(option);
    }
    return typeof option === "string"
      ? option
      : (option as any)?.name || String(option);
  };

  // Helper function to get option value
  const getValue = (option: T): string => {
    if (props.getOptionValue) {
      return props.getOptionValue(option);
    }
    if (props.getOptionLabel) {
      return props.getOptionLabel(option);
    }
    return typeof option === "string"
      ? option
      : (option as any)?.name || String(option);
  };

  // Helper function to filter options
  const filterOptions = (option: T, input: string): boolean => {
    if (props.filterOption) {
      return props.filterOption(option, input);
    }
    const label = getLabel(option).toLowerCase();
    return label.includes(input.toLowerCase());
  };

  // Filter options based on input
  createEffect(() => {
    const input = inputValue();

    if (!input) {
      setFilteredOptions([]);
      return;
    }

    const filtered = props.options.filter((option) =>
      filterOptions(option, input),
    );
    setFilteredOptions(filtered);
  });

  // Handle input changes
  const handleInput = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
    const value = e.currentTarget.value;
    setInputValue(value);
    setShowDropdown(!!value);
  };

  // Handle option selection
  const selectOption = (option: T) => {
    const optionLabel = getLabel(option);
    const optionValue = getValue(option);

    setInputValue(optionLabel);
    props.onChange(optionValue);
    setShowDropdown(false);
  };

  // Handle creating a new option
  const createNewOption = async (): Promise<void> => {
    if (!inputValue()) return;

    // Don't create if exact match already exists
    const exactMatch = props.options.find(
      (option) => getLabel(option).toLowerCase() === inputValue().toLowerCase(),
    );

    if (
      !exactMatch &&
      inputValue() &&
      props.allowCreate &&
      props.onCreateOption
    ) {
      try {
        setIsCreating(true);
        const result = await props.onCreateOption(inputValue());
        if (result) {
          props.onChange(getValue(result));
        } else {
          props.onChange(inputValue());
        }
        setShowDropdown(false);
      } catch (error) {
        console.error("Failed to create new option:", error);
        addToast({
          message: "Failed to create new item",
          type: "error",
        });
      } finally {
        setIsCreating(false);
      }
    } else if (exactMatch) {
      props.onChange(getValue(exactMatch));
      setShowDropdown(false);
    }
  };

  // Handle blur - handle selection if needed
  const handleBlur = async (): Promise<void> => {
    setTimeout(() => setShowDropdown(false), 200);

    if (!inputValue()) return;

    const exactMatch = props.options.find(
      (option) => getLabel(option).toLowerCase() === inputValue().toLowerCase(),
    );

    if (exactMatch) {
      props.onChange(getValue(exactMatch));
    } else {
      props.onChange(inputValue());
    }
  };

  // Check if option exists for current input value
  const optionExists = () => {
    return props.options.some(
      (option) => getLabel(option).toLowerCase() === inputValue().toLowerCase(),
    );
  };

  return (
    <div class="relative">
      <div class="flex">
        <div class="flex-grow relative">
          <Input
            label={props.label}
            value={inputValue()}
            onInput={handleInput}
            onFocus={() => setShowDropdown(!!inputValue())}
            onBlur={handleBlur}
            required={props.required}
            placeholder={props.placeholder}
            {...Object.fromEntries(
              Object.entries(props).filter(
                ([key]) =>
                  ![
                    "value",
                    "onChange",
                    "label",
                    "placeholder",
                    "options",
                    "getOptionLabel",
                    "getOptionValue",
                    "filterOption",
                    "onCreateOption",
                    "allowCreate",
                    "createHint",
                    "showAddButton",
                    "loading",
                  ].includes(key),
              ),
            )}
          />
        </div>

        <Show
          when={
            props.allowCreate &&
            props.showAddButton &&
            inputValue() &&
            !optionExists()
          }
        >
          <div class="flex items-end mb-1 ml-2">
            <button
              type="button"
              class="btn btn-circle btn-sm btn-success"
              onClick={createNewOption}
              disabled={isCreating() || props.loading}
              title={`Add "${inputValue()}" as a new item`}
            >
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </Show>
      </div>

      <Show when={showDropdown() && filteredOptions().length > 0}>
        <div class="absolute z-10 w-full mt-1 bg-base-100 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul class="py-1">
            <For each={filteredOptions()}>
              {(option) => (
                <li
                  class="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center"
                  onMouseDown={() => selectOption(option)}
                >
                  <span class="flex-grow">{getLabel(option)}</span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>

      <Show
        when={
          showDropdown() &&
          filteredOptions().length === 0 &&
          inputValue() &&
          props.allowCreate
        }
      >
        <div class="absolute z-10 w-full mt-1 bg-base-100 rounded-md shadow-lg">
          <div class="px-4 py-2 text-sm text-neutral-content flex items-center justify-between">
            <span>
              {(
                props.createHint || 'Tap + to add "{input}" as a new item'
              ).replace("{input}", inputValue())}
            </span>
            <button
              type="button"
              class="btn btn-circle btn-xs btn-success"
              onClick={createNewOption}
              disabled={isCreating() || props.loading}
            >
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}
