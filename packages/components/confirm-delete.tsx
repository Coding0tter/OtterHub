import {
  createContext,
  createSignal,
  useContext,
  type JSXElement,
} from "solid-js";
import { Button } from "./button";

interface ConfirmDeleteModalProps {
  onDelete: () => void;
  title?: string;
  message?: JSXElement;
  cancelText?: string;
  deleteText?: string;
}

interface ConfirmDeleteModalContextType {
  confirmDelete: (props: ConfirmDeleteModalProps) => void;
}

const ConfirmDeleteModalContext =
  createContext<ConfirmDeleteModalContextType>();

export const ConfirmDeleteModalProvider = (props: { children: JSXElement }) => {
  const [isOpen, setIsOpen] = createSignal<boolean>(false);
  const [title, setTitle] = createSignal<string>("");
  const [message, setMessage] = createSignal<JSXElement>("");
  const [cancelText, setCancelText] = createSignal<string>("");
  const [deleteText, setDeleteText] = createSignal<string>("");
  const [deleteFunction, setDeleteFunction] = createSignal<
    () => void | Promise<void>
  >(() => {});

  const confirmDelete = ({
    onDelete,
    title = "Warning!",
    message = "Do you really want to delete?",
    cancelText = "Cancel",
    deleteText = "Delete",
  }: ConfirmDeleteModalProps) => {
    setDeleteFunction(() => onDelete);
    setTitle(title);
    setMessage(message);
    setCancelText(cancelText);
    setDeleteText(deleteText);

    setIsOpen(true);
  };

  const confirmDeleteApi: ConfirmDeleteModalContextType = { confirmDelete };

  return (
    <ConfirmDeleteModalContext.Provider value={confirmDeleteApi}>
      {props.children}
      <dialog
        open={isOpen()}
        id="confirm-delete-modal"
        class="modal bg-base-300/50"
      >
        <div class="modal-box">
          <h3 class="font-bold text-lg">{title()}</h3>
          <p class="py-4">{message()}</p>
          <div class="modal-action">
            <form method="dialog" class="flex gap-2">
              <Button
                label={cancelText()}
                type="neutral"
                onClick={() => setIsOpen(false)}
              />
              <Button
                label={deleteText()}
                type="error"
                onClick={async () => {
                  await deleteFunction()();
                  setIsOpen(false);
                }}
              />
            </form>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button></button>
        </form>
      </dialog>
    </ConfirmDeleteModalContext.Provider>
  );
};

export function useConfirmDelete(): ConfirmDeleteModalContextType {
  const context = useContext(ConfirmDeleteModalContext);
  if (!context)
    throw new Error(
      "useToast must be used within a ConfirmDeleteModalProvider",
    );
  return context;
}
