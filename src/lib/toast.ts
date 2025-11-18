import { toast as sonnerToast } from "sonner";

/**
 * Toast utility functions for consistent success, error, and info notifications.
 * Uses Sonner for toast notifications with design system styling.
 */

interface ToastOptions {
  /** Duration in milliseconds (default: 4000) */
  duration?: number;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Custom description */
  description?: string;
}

/**
 * Show a success toast notification
 */
export function showSuccessToast(
  message: string,
  options?: ToastOptions
): string | number {
  return sonnerToast.success(message, {
    duration: options?.duration || 4000,
    description: options?.description,
    action: options?.action,
    className: "bg-[#F6FDF6] border-[#5FD37B]/20",
  });
}

/**
 * Show an error toast notification
 */
export function showErrorToast(
  message: string,
  options?: ToastOptions
): string | number {
  return sonnerToast.error(message, {
    duration: options?.duration || 5000,
    description: options?.description,
    action: options?.action,
    className: "bg-[#F0F8FF] border-[#FF7A7A]/20",
  });
}

/**
 * Show an info toast notification
 */
export function showInfoToast(
  message: string,
  options?: ToastOptions
): string | number {
  return sonnerToast.info(message, {
    duration: options?.duration || 4000,
    description: options?.description,
    action: options?.action,
    className: "bg-[#F0F8FF] border-[#6AD8FA]/20",
  });
}

/**
 * Show a warning toast notification
 */
export function showWarningToast(
  message: string,
  options?: ToastOptions
): string | number {
  return sonnerToast.warning(message, {
    duration: options?.duration || 4000,
    description: options?.description,
    action: options?.action,
    className: "bg-[#FFFBE6] border-[#F6C96B]/20",
  });
}

/**
 * Show a loading toast notification
 * Returns a toast ID that can be used with promise or dismiss
 */
export function showLoadingToast(
  message: string,
  options?: { description?: string }
): string | number {
  return sonnerToast.loading(message, {
    description: options?.description,
    duration: Infinity, // Loading toasts don't auto-dismiss
  });
}

/**
 * Show a promise toast (loading -> success/error)
 * Returns the original promise so it can be chained
 */
export function showPromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  },
  options?: { description?: string }
): Promise<T> {
  sonnerToast.promise(promise, {
    loading: messages.loading,
    success: (data) => 
      typeof messages.success === "function" 
        ? messages.success(data) 
        : messages.success,
    error: (error) =>
      typeof messages.error === "function"
        ? messages.error(error as Error)
        : messages.error,
    description: options?.description,
  });
  return promise;
}

/**
 * Dismiss a toast by ID
 */
export function dismissToast(toastId: string | number): void {
  sonnerToast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts(): void {
  sonnerToast.dismiss();
}

// Re-export toast for direct access if needed
export { sonnerToast as toast };
