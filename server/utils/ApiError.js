// An error with an HTTP status code, e.g. throw new ApiError(404, 'Plan not found')
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
