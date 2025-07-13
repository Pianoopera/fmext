export function convertToFormattedOutput(params: unknown) {
  return Array.isArray(params)
    ? params.map((value) => ({ value }))
    : [{ value: String(params) }];
}
