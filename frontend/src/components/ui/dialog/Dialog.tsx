"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleClose() {
    onOpenChange(false);
  }

  function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onOpenChange(false);
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      onOpenChange(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={handleClose}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="
        m-auto w-[calc(100%-2rem)] max-w-lg
        rounded-xl border border-border bg-surface
        p-0 text-foreground shadow-xl
        backdrop:bg-slate-900/50
        backdrop:backdrop-blur-sm
      "
    >
      <div className="p-6">
        <div className="mb-5">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>

          {description && (
            <p id={descriptionId} className="mt-1 text-sm text-secondary-text">
              {description}
            </p>
          )}
        </div>

        <div>{children}</div>

        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </dialog>
  );
}
