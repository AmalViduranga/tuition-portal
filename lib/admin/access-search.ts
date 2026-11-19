export function matchesAccessSearch(query: string, ...values: Array<string | null | undefined>) {
  const normalized = query.trim().toLowerCase();
  return !normalized || values.some(value => value?.toLowerCase().includes(normalized));
}
