import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

export interface UseAsyncActionOptions {
  /** ms before success/error falls back to idle. 0 disables the reset. Default 2000. */
  resetAfter?: number;
  onError?: (error: unknown) => void;
}

/**
 * Wraps an async handler with status tracking.
 * - Ignores re-entry while pending (no double-submit).
 * - Never sets state after unmount.
 */
export function useAsyncAction<Args extends unknown[]>(
  action: (...args: Args) => Promise<unknown> | unknown,
  { resetAfter = 2000, onError }: UseAsyncActionOptions = {},
) {
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [error, setError] = useState<unknown>(null);
  const mounted = useRef(true);
  const pending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const actionRef = useRef(action);
  actionRef.current = action;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const scheduleReset = useCallback(() => {
    if (resetAfter <= 0) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (mounted.current) setStatus('idle');
    }, resetAfter);
  }, [resetAfter]);

  const run = useCallback(
    async (...args: Args) => {
      if (pending.current) return;
      pending.current = true;
      clearTimeout(timer.current);
      setStatus('pending');
      setError(null);
      try {
        await actionRef.current(...args);
        if (mounted.current) {
          setStatus('success');
          scheduleReset();
        }
      } catch (err) {
        onErrorRef.current?.(err);
        if (mounted.current) {
          setError(err);
          setStatus('error');
          scheduleReset();
        }
      } finally {
        pending.current = false;
      }
    },
    [scheduleReset],
  );

  return { run, status, error, isPending: status === 'pending' };
}
