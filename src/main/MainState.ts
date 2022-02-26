import { Rect } from "../shared/rectHelpers"
import { randomId } from "../utils"

export type WindowRect = {
	left: number
	top: number
	width: number
	height: number
}

export type WindowState = {
	id: string
	focused: boolean
	rect: WindowRect
}

export type MainState = {
	windows: WindowState[]
}

export function initRect(): Rect {
	return {
		height: 600,
		width: 800,
		left: 200,
		top: 200,
	}
}

export function initMain(): MainState {
	const windowState = { id: randomId(), rect: initRect(), focused: true }
	return { windows: [windowState] }
}
