type ClassValue = string | false | null | undefined;

/** Joins truthy class names. Tiny by design; no runtime dependency. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
