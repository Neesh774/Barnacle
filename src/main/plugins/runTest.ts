import * as nut from "@nut-tree/nut-js"
import { Task, Test, TestOptions } from "../../renderer/RendererState"
import { enumerate } from "../../shared/enumerate"
import { MainToRendererIPC, RendererToMainIPC } from "../../shared/ipc"
import { keyInObject } from "../../shared/keys"
import {
	Edge,
	offsetRect,
	Point,
	PointDelta,
	Rect,
	rectToPoint,
} from "../../shared/rectHelpers"
import { MainIPCPeer } from "../MainIPC"

nut.keyboard.config.autoDelayMs = 100
nut.mouse.config.autoDelayMs = 100
nut.mouse.config.mouseSpeed = 1000
nut.screen.config.autoHighlight = true

export async function runTest(
	test: Test,
	renderer: MainIPCPeer<MainToRendererIPC, RendererToMainIPC>,
	windowRect: Rect,
	options: TestOptions
) {
	await renderer.call.startTest()

	for (const [index, task] of enumerate(test)) {
		try {
			await runTask(task, renderer, windowRect, options)
		} catch (e) {
			await renderer.call.endTest({ index, message: e.message as string })
			return
		}
		await sleep(options.taskDelay)
		await renderer.call.incrementTaskIndex()
	}

	await renderer.call.endTest()
}

export function sleep(ms = 0) {
	return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

async function clickPoint(point: Point) {
	await nut.mouse.move([point])
	await sleep(100)
	await nut.mouse.leftClick()
	await sleep(100)
}

const keyboardAliases = {
	ctrl: nut.Key.LeftControl,
	control: nut.Key.LeftControl,
	mod: nut.Key.LeftSuper,
	meta: nut.Key.LeftSuper,
	cmd: nut.Key.LeftSuper,
	enter: nut.Key.Enter,
	shift: nut.Key.LeftShift,
	escape: nut.Key.Escape,
	backspace: nut.Key.Backspace,
	delete: nut.Key.Backspace,
	alt: nut.Key.LeftAlt,
	" ": nut.Key.Space,
	left: nut.Key.Left,
	right: nut.Key.Right,
	down: nut.Key.Down,
	up: nut.Key.Up,
}

function getNormalizedKeys(shortcut: string): nut.Key[] {
	return shortcut
		.split(/-(?!$)/)
		.map((str) => str.toLowerCase())
		.map((char) => {
			const isAlias = keyInObject(char, keyboardAliases)
			if (isAlias) return keyboardAliases[char]

			const upperChar = char.toUpperCase()
			const isKey = keyInObject(upperChar, nut.Key)
			if (isKey) return nut.Key[upperChar]

			throw new Error("Unknown key: " + char)
		})
}

async function shortcut(str: string) {
	const parts = getNormalizedKeys(str)
	await nut.keyboard.pressKey(...parts)
	await nut.keyboard.releaseKey(...parts)

	// Fix a bug where modifier keys are stuck...
	// https://github.com/nut-tree/nut.js/issues/264
	// await nut.keyboard.pressKey(nut.Key.LeftSuper)
	await nut.keyboard.releaseKey(nut.Key.LeftSuper)
	await sleep(50)
}

async function clickRect(rect: Rect, edge?: Edge) {
	await clickPoint(rectToPoint(rect, edge))
}

type Optional<T> = T | null | undefined | false

async function waitFor<T>(
	fn: () => Optional<T> | PromiseLike<Optional<T>>,
	timeoutMs = 200
): Promise<T> {
	const start = Date.now()
	let error
	while (Date.now() - start < timeoutMs) {
		try {
			const result = await Promise.resolve(fn())
			if (result !== null && result !== undefined && result !== false)
				return result
		} catch (e) {
			error = e
		}
		await sleep(10)
	}

	throw error || new Error("waitFor timed out.")
}

async function runTask(
	task: Task,
	renderer: MainIPCPeer<MainToRendererIPC, RendererToMainIPC>,
	windowRect: Rect,
	options: TestOptions
): Promise<boolean> {
	async function measureElement(cssSelector: string) {
		const rectOnWindow = await renderer.call.measureDOM(cssSelector)
		const rectOnScreen = offsetRect(rectOnWindow, {
			x: windowRect.left,
			y: windowRect.top,
		})

		return rectOnScreen
	}

	async function measureElementWithText(cssSelector: string, text: string) {
		const rectOnWindow = await renderer.call.measureDOMWithText(
			cssSelector,
			text
		)
		const rectOnScreen = offsetRect(rectOnWindow, {
			x: windowRect.left,
			y: windowRect.top,
		})

		return rectOnScreen
	}

	async function scrollElement(selector: string, delta: PointDelta) {
		await renderer.call.scrollElement(selector, delta)
	}

	async function highlight(rect: Rect) {
		await nut.screen.highlight(
			new nut.Region(rect.left, rect.top, rect.width, rect.height)
		)
	}

	async function type(str: string) {
		await nut.keyboard.type(str)
		await sleep(options.typeDelay)
	}

	async function waitForElement(cssSelector: string, waitPeriod = 500) {
		await waitFor(async () => {
			await measureElement(cssSelector)
			return true
		}, waitPeriod)
	}

	async function waitForElementWithText(
		cssSelector: string,
		text: string,
		waitPeriod = 500
	) {
		await waitFor(async () => {
			await measureElementWithText(cssSelector, text)
			return true
		}, waitPeriod)
	}

	async function clickElement(cssSelector: string, edge?: Edge) {
		// await waitForElement(cssSelector)
		const rect = await measureElement(cssSelector)
		if (rect) {
			if (options.highlightBeforeClick) await highlight(rect)
			await clickRect(rect, edge)
		}
	}

	async function clickElementWithText(
		cssSelector: string,
		text: string,
		edge?: Edge
	) {
		// await waitForElement(cssSelector)
		const rect = await measureElementWithText(cssSelector, text)
		if (rect) {
			if (options.highlightBeforeClick) await highlight(rect)
			await clickRect(rect, edge)
		}
	}

	switch (task.type) {
		case "clickOnElement": {
			await clickElement(task.selector, task.edge)
			return true
		}
		case "clickOnElementWithText": {
			await clickElementWithText(task.selector, task.text, task.edge)
			return true
		}
		case "typeText": {
			await type(task.text)
			return true
		}
		case "shortcut": {
			await shortcut(task.shortcut)
			return true
		}
		case "scrollElement": {
			await scrollElement(task.selector, task.delta)
			return true
		}
		case "waitForElement": {
			await waitForElement(task.selector, task.waitPeriod)
			return true
		}
		case "waitForElementWithText": {
			await waitForElementWithText(task.selector, task.text, task.waitPeriod)
			return true
		}
	}
}
