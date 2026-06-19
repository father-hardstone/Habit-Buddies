import { toast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-client';

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return error.message;
    }
    if (error.status === 401) {
      return 'Your session expired. Please sign in again.';
    }
    if (error.status === 403) {
      return "You don't have permission to do that.";
    }
    if (error.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.status >= 500) {
      return 'Server error. Please try again in a moment.';
    }
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallback;
}

type ToastErrorOptions = {
  title?: string;
  fallback?: string;
};

export function showErrorToast(error: unknown, options?: ToastErrorOptions) {
  toast({
    variant: 'destructive',
    title: options?.title ?? 'Something went wrong',
    description: getErrorMessage(error, options?.fallback),
  });
}

export function showSuccessToast(title: string, description?: string) {
  toast({ title, description });
}

export function showWarningToast(title: string, description?: string) {
  toast({ title, description });
}

export function reportError(error: unknown, context?: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(context ? `[${context}]` : '[error]', error);
  }
}

export function handleAsyncError(
  error: unknown,
  options?: ToastErrorOptions & { context?: string },
) {
  reportError(error, options?.context);
  showErrorToast(error, options);
}
