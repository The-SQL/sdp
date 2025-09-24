"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";

interface ToastProps {
  title: string;
  description?: string;
  duration?: number;
}

const ToastContext = React.createContext<{ toast: (props: ToastProps) => void } | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = (toastProps: ToastProps) => {
    setToasts((prev) => [...prev, toastProps]);
  };

  const removeToast = (index: number) => {
    setToasts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastPrimitive.Provider swipeDirection="up">
        {toasts.map((t, i) => (
          <ToastPrimitive.Root
            key={i}
            className="relative bg-white dark:bg-neutral-900 border rounded-lg shadow-md p-4 mb-2 z-[100]"
            duration={t.duration || 4000}
            onOpenChange={(open) => {
              if (!open) removeToast(i);
            }}
          >
            <ToastPrimitive.Title className="font-bold text-sm">{t.title}</ToastPrimitive.Title>
            {t.description && (
              <ToastPrimitive.Description className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t.description}
              </ToastPrimitive.Description>
            )}
            <ToastPrimitive.Close className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              ×
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        {/* Increased z-index to 9999 to ensure it appears above everything */}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 w-80 max-w-[calc(100vw-2rem)] z-[9999] outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context.toast;
};