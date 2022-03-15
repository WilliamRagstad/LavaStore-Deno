// deno-lint-ignore-file no-explicit-any
/**
 * Check if an object has fields, collections or nested documents.
 * @param data Object to check for nested documents
 * @returns true if data contains nested documents
 */
export function HasFields(data: Record<string, any>): boolean {
  return Object.keys(data).length > 0;
}

/**
 * Check if an object is of a specific type.
 * @param data Object to check type of
 * @param guard Function that returns true if data is of type T
 * @returns true if data is of type T
 */
export function Is<T>(
  data: Record<string, any>,
  guard: (t: any) => t is T,
): boolean {
  return guard(data);
}
