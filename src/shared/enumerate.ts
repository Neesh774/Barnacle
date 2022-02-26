export function enumerate<T>(array: T[]): [number, T][] {
	return array.map((value, i) => [i, value])
}
