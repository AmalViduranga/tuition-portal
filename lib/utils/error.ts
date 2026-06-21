/**
 * Safely extracts an error message from an unknown error object.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message ?? "Unknown error");
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error";
}
