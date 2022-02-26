export type Rect = { left: number; top: number; width: number; height: number }
export type Point = { x: number; y: number }
export type PointDelta = { x?: number; y?: number }

export function expandRect(rect: Rect, margin: number): Rect {
	const { top, left, height, width } = rect

	return {
		top: top - margin,
		left: left - margin,
		width: width + 2 * margin,
		height: height + 2 * margin,
	}
}

export function offsetRect(rect: Rect, delta: PointDelta) {
	let { top, left, width, height } = rect
	if (delta.x) {
		left += delta.x
	}
	if (delta.y) {
		top += delta.y
	}
	return { top, left, width, height }
}

export function rectsOverlap(a: Rect, b: Rect) {
	if (b.left > a.left + a.width) return false
	if (b.left + b.width < a.left) return false
	if (b.top > a.top + a.height) return false
	if (b.top + b.height < a.top) return false
	return true
}

export function pointsToRect(a: Point, b: Point) {
	const top = Math.min(a.y, b.y)
	const bottom = Math.max(a.y, b.y)
	const left = Math.min(a.x, b.x)
	const right = Math.max(a.x, b.x)

	const rect: Rect = {
		top,
		left,
		height: bottom - top,
		width: right - left,
	}
	return rect
}

export function pointInRect(point: Point, rect: Rect): boolean {
	const { top, left, width, height } = rect

	return (
		point.x >= left &&
		point.x <= left + width &&
		point.y >= top &&
		point.y <= top + height
	)
}

export function movePoint(point: Point, delta: PointDelta): Point {
	return {
		x: point.x + (delta.x ?? 0),
		y: point.y + (delta.y ?? 0),
	}
}

export function getCorners(rect: Rect) {
	const { top, left, width, height } = rect
	const topLeft = { y: top, x: left }
	const topRight = { y: top, x: left + width }
	const bottomLeft = { y: top + height, x: left }
	const bottomRight = { y: top + height, x: left + width }

	return { topLeft, topRight, bottomLeft, bottomRight }
}

export function rectContains(parentRect: Rect, childRect: Rect): boolean {
	const corners = getCorners(childRect)
	return Object.values(corners).every((corner) =>
		pointInRect(corner, parentRect)
	)
}

export type Edge = Partial<{
	top: number
	bottom: number
	left: number
	right: number
}>

/**
 * {left:5} => 5 px right of left edge
 * {right:5} => 5 px right of right edge
 * {top: 5} => 5 px under the top edge
 * {bottom: 5} => 5 px under bottom edge
 */
export function rectToPoint(rect: Rect, edge?: Edge) {
	let x = rect.left + rect.width / 2
	let y = rect.top + rect.height / 2
	if (edge?.top !== undefined) {
		y = rect.top + edge.top
	} else if (edge?.bottom !== undefined) {
		y = rect.top + rect.height + edge.bottom
	}
	if (edge?.left !== undefined) {
		x = rect.left + edge.left
	} else if (edge?.right !== undefined) {
		x = rect.left + rect.width + edge.right
	}
	return { x, y }
}
