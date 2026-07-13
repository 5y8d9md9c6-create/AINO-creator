type IdleTask = () => void;

let chain: Promise<void> = Promise.resolve();
let sequence = 0;

function runWhenIdle(task: IdleTask, timeout: number) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(task, { timeout });
    return;
  }
  globalThis.setTimeout(task, 16);
}

/** Spread heavy mounts/imports across idle periods to reduce TBT. */
export function scheduleIdleTask(
  task: IdleTask,
  options?: { timeout?: number; gapMs?: number },
) {
  const timeout = options?.timeout ?? 2000;
  const gapMs = options?.gapMs ?? 80;
  const order = sequence++;

  chain = chain.then(
    () =>
      new Promise<void>((resolve) => {
        runWhenIdle(() => {
          task();
          globalThis.setTimeout(resolve, gapMs + order * 24);
        }, timeout + order * 180);
      }),
  );

  return chain;
}
