/**
 * Replaces every translation key (`t.…`) in API data by its text in the
 * active language, so the model reads `Senior developer`, not
 * a work-position key. Keys without a translation stay as they are.
 */
export function translateKeys<T>(
  value: T,
  translate: (key: string) => string
): T {
  if (typeof value === 'string') {
    return (value.startsWith('t.') ? translate(value) : value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => translateKeys(item, translate)) as T;
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        translateKeys(item, translate),
      ])
    ) as T;
  }
  return value;
}
