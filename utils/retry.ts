/**
 * Reintenta una función async hasta maxAttempts veces.
 * Para manejo de errores de backend (retry).
 */

export type RetryOptions = {
  maxAttempts?: number;
  delayMs?: number;
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000 } = options;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  throw lastError ?? new Error('Retry failed');
}
