"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
  };
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, description, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newToast: ToastItem = { id, type, title, description, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastHelpers = useMemo(
    () => ({
      success: (title: string, description?: string) =>
        addToast({ type: "success", title, description }),
      error: (title: string, description?: string) =>
        addToast({ type: "error", title, description }),
      info: (title: string, description?: string) =>
        addToast({ type: "info", title, description }),
      warning: (title: string, description?: string) =>
        addToast({ type: "warning", title, description }),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: toastHelpers, addToast, removeToast }}>
      {children}
      {/* Toast Render Viewport */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-50 flex max-w-sm w-full flex-col gap-2.5 pointer-events-none sm:top-5 sm:right-5"
      >
        {toasts.map((t) => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              iconColor: "text-emerald-500",
              border: "border-emerald-200 dark:border-emerald-900/50",
              bg: "bg-white dark:bg-slate-900",
              accent: "bg-emerald-500",
            },
            error: {
              icon: AlertCircle,
              iconColor: "text-rose-500",
              border: "border-rose-200 dark:border-rose-900/50",
              bg: "bg-white dark:bg-slate-900",
              accent: "bg-rose-500",
            },
            warning: {
              icon: AlertTriangle,
              iconColor: "text-amber-500",
              border: "border-amber-200 dark:border-amber-900/50",
              bg: "bg-white dark:bg-slate-900",
              accent: "bg-amber-500",
            },
            info: {
              icon: Info,
              iconColor: "text-blue-500",
              border: "border-blue-200 dark:border-blue-900/50",
              bg: "bg-white dark:bg-slate-900",
              accent: "bg-blue-500",
            },
          }[t.type];

          const IconComponent = typeConfig.icon;

          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${typeConfig.border} ${typeConfig.bg}`}
            >
              <span className={`mt-0.5 shrink-0 ${typeConfig.iconColor}`}>
                <IconComponent className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.title}
                </p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
                className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: {
        success: (msg: string) => console.log("[Toast Success]", msg),
        error: (msg: string) => console.error("[Toast Error]", msg),
        info: (msg: string) => console.info("[Toast Info]", msg),
        warning: (msg: string) => console.warn("[Toast Warning]", msg),
      },
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return context;
}
