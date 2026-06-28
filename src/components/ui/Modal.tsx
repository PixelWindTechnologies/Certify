"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl2 bg-white shadow-panel animate-fade-up",
          className
        )}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 className="font-display text-base text-ink">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-slate hover:bg-paper hover:text-ink"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        ) : null}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
