/**
 * Class name joiner.
 *
 * Deliberately not `clsx` + `tailwind-merge`. Conflict-resolving merges let a
 * component quietly accept `className="bg-white"` and override a token-backed
 * surface colour, which is exactly the drift this design system exists to
 * prevent. Components here expose variants for the choices they support, and
 * `className` is for layout and spacing only.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}
