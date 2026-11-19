/**
 * Returns `value` only when it is a plain same-site path such as "/portal/classes?x=1".
 * Anything that a browser could resolve to another origin ("//host", "/\host", "@host",
 * absolute URLs, control characters) falls back to `fallback`.
 */
export function safeNextPath(value: unknown, fallback: string): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2000) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  // Backslashes are treated as slashes by browsers; control chars can be stripped into "//".
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;

  try {
    const base = "http://internal.invalid";
    const resolved = new URL(value, base);
    if (resolved.origin !== base) return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
