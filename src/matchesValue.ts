export function matchesValue(
  extractedValue: unknown,
  targetValue: string,
): boolean {
  if (extractedValue === undefined || extractedValue === null) {
    return false;
  }

  // Handle array values - check if the target value is contained in the array
  if (Array.isArray(extractedValue)) {
    return extractedValue.some((item) => {
      if (typeof item === "string") {
        return item === targetValue;
      } else if (typeof item === "number" || typeof item === "boolean") {
        return item.toString() === targetValue;
      }
      return false;
    });
  }

  // Handle string values - exact match comparison
  if (typeof extractedValue === "string") {
    return extractedValue === targetValue;
  }

  // Handle boolean/number values - convert to string for comparison
  if (
    typeof extractedValue === "boolean" ||
    typeof extractedValue === "number"
  ) {
    return extractedValue.toString() === targetValue;
  }

  return false;
}
