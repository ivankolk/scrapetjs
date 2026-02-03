/**
 * Recursively searches for a key in a deeply nested object or array
 * Returns all values found for the given key
 */
export function findNestedKey<T = unknown>(
	obj: unknown,
	targetKey: string,
): T[] {
	const results: T[] = [];

	function search(current: unknown): void {
		if (current === null || current === undefined) {
			return;
		}

		if (typeof current === 'object') {
			if (Array.isArray(current)) {
				// Handle arrays
				for (const item of current) {
					search(item);
				}
			} else {
				// Handle objects
				for (const [key, value] of Object.entries(current)) {
					if (key === targetKey) {
						results.push(value as T);
					}
					search(value);
				}
			}
		}
	}

	search(obj);
	return results;
}
