export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (msg, code = 'VALIDATION_ERROR') => new ApiError(422, code, msg);
export const notFound = (msg = 'Resource not found') => new ApiError(404, 'NOT_FOUND', msg);
export const serverError = (msg = 'Internal server error') => new ApiError(500, 'SERVER_ERROR', msg);
