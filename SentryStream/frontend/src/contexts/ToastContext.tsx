"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

const toastConfig: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: "rgba(0,229,160,0.12)", border: "rgba(0,229,160,0.3)", color: "var(--pass)", icon: "✓" },
  error: { bg: "rgba(255,69,115,0.12)", border: "rgba(255,69,115,0.3)", color: "var(--fail)", icon: "✕" },
  warning: { bg: "rgba(255,178,36,0.12)", border: "rgba(255,178,36,0.3)", color: "var(--warn)", icon: "⚠" },
  info: { bg: "rgba(108,140,255,0.12)", border: "rgba(108,140,255,0.3)", color: "var(--accent)", icon: "ℹ" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column-reverse",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => {
          const cfg = toastConfig[toast.type];
          return (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "var(--font-display)",
                fontSize: 13,
                color: "var(--text)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "var(--shadow-lg)",
                animation: "slide-up 0.3s ease",
                pointerEvents: "auto",
                minWidth: 280,
                maxWidth: 420,
                cursor: "pointer",
                transition: "opacity var(--transition-fast)",
              }}
            >
              <span style={{ color: cfg.color, fontSize: 16, flexShrink: 0 }}>{cfg.icon}</span>
              <span style={{ flex: 1 }}>{toast.message}</span>
              <span style={{ color: "var(--text-muted)", fontSize: 10, flexShrink: 0 }}>✕</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
