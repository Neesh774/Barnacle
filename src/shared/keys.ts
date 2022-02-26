export function keys<T>(obj: T): Array<keyof T> {
	return Object.keys(obj) as any
}

export function keyInObject<T>(key: any, obj: T): key is keyof T {
	return key in obj
}
