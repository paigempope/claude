import { useId as useReactId } from 'react';

/** Stable, SSR-safe id that honors a caller-provided id. */
export function useId(provided?: string, prefix = 'dgs'): string {
  const generated = useReactId();
  return provided ?? `${prefix}-${generated.replace(/:/g, '')}`;
}
