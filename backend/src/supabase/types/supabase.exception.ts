export class SupabaseException extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SupabaseException';
    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack;
    }
  }
}
