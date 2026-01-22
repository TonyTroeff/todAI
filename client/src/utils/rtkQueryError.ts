import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

type ErrorResponseBody =
  | { message?: string; error?: string }
  | { errors?: unknown; message?: string }
  | string
  | null
  | undefined;

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function getRtkQueryErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (!error) return fallback;

  if (isFetchBaseQueryError(error)) {
    const data = (error as FetchBaseQueryError).data as ErrorResponseBody;

    if (typeof data === 'string' && data.trim().length > 0) return data;
    if (data && typeof data === 'object') {
      const maybeMessage = (data as { message?: string }).message;
      const maybeError = (data as { error?: string }).error;
      if (maybeMessage && maybeMessage.trim().length > 0) return maybeMessage;
      if (maybeError && maybeError.trim().length > 0) return maybeError;
    }

    if (typeof error.status === 'number') {
      return `Request failed (${error.status})`;
    }

    if (error.status === 'FETCH_ERROR') return 'Network error. Is the server running?';
    if (error.status === 'PARSING_ERROR') return 'Received an invalid response from the server.';

    return fallback;
  }

  if (isSerializedError(error)) {
    if (error.message && error.message.trim().length > 0) return error.message;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}
