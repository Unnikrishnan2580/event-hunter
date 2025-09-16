export function throttle<T extends (...args: any[]) => Promise<any>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
  let lastRan = 0;
  let lastPromise: Promise<ReturnType<T>> | undefined;

  return async function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastRan >= limit) {
      lastRan = now;
      lastPromise = func(...args);
      return lastPromise;
    }
    return lastPromise; // return previous promise if throttled
  };
}
