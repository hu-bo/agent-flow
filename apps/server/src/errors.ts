export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code: string = 'HTTP_ERROR', details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

export function toErrorPayload(error: unknown): {
  status: number;
  body: { error: string; code: string; details?: unknown };
} {
  if (isHttpError(error)) {
    return {
      status: error.status,
      body: {
        error: error.message,
        code: error.code,
        details: error.details,
      },
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      body: {
        error: error.message,
        code: 'INTERNAL_ERROR',
      },
    };
  }

  return {
    status: 500,
    body: {
      error: 'Unknown server error',
      code: 'INTERNAL_ERROR',
    },
  };
}

