import { useCallback, useState } from 'react';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  status: 'idle' | 'loading' | 'success' | 'error';
};

export type UseAsyncStateReturn<T> = AsyncState<T> & {
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: Error | null) => void;
};

export function useAsyncState<T = unknown>(
  initialData: T | null = null
): UseAsyncStateReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    status: 'idle',
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      status: 'loading',
    }));

    try {
      const result = await asyncFn();
      setState({
        data: result,
        loading: false,
        error: null,
        status: 'success',
      });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({
        data: null,
        loading: false,
        error,
        status: 'error',
      });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      status: 'idle',
    });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({
      ...prev,
      data,
      error: null,
      status: data !== null ? 'success' : 'idle',
    }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState((prev) => ({
      ...prev,
      error,
      loading: false,
      status: error !== null ? 'error' : 'idle',
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}
