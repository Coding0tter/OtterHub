import {
  createSignal,
  createContext,
  useContext,
  For,
  type JSX,
} from "solid-js";

export interface ToastOptions {
  message: string;
  duration?: number;
  type?: "success" | "error" | "warn";
}

export interface Toast extends ToastOptions {
  id: number;
}

const ToastTypes = {
  success: "alert-success",
  error: "alert-error",
  warn: "alert-warn",
};

interface ToastContextType {
  addToast: (toast: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType>();

export const ToastProvider = (props: { children: JSX.Element }) => {
  const [toasts, setToasts] = createSignal<Toast[]>([]);

  const addToast = (toast: ToastOptions) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 3000);
  };

  const toastApi: ToastContextType = { addToast };

  return (
    <ToastContext.Provider value={toastApi}>
      {props.children}
      <div class="toast z-200 toast-top">
        <For each={toasts()}>
          {(toast) => (
            <div
              class={`toast-animation alert ${ToastTypes[toast.type || "success"]}`}
            >
              {toast.message}
            </div>
          )}
        </For>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
