export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown>,
): T {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const k = key as keyof T;
    const bv = override[key];
    const av = base[k];
    if (
      bv !== null &&
      typeof bv === 'object' &&
      !Array.isArray(bv) &&
      av !== null &&
      typeof av === 'object' &&
      !Array.isArray(av)
    ) {
      result[k] = deepMerge(
        av as Record<string, unknown>,
        bv as Record<string, unknown>,
      ) as T[keyof T];
    } else if (bv !== undefined) {
      result[k] = bv as T[keyof T];
    }
  }
  return result;
}
