import * as nut from "@nut-tree/nut-js"
import { Task, Test } from "../../renderer/RendererState"
import { enumerate } from "../../shared/enumerate"
import { MainToRendererIPC, RendererToMainIPC } from "../../shared/ipc"
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
	windowRect: Rect
) {
	await renderer.call.startTest()

	for (const [index, task] of enumerate(test)) {
		try {
			await runTask(task, renderer, windowRect)
		} catch (e) {
			await renderer.call.endTest({ index, message: e.message as string })
			return
		}
		await sleep(1000)
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
	windowRect: Rect
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

	async function type(str: string) {
		await nut.keyboard.type(str)
		await sleep(50)
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
		if (rect) await clickRect(rect, edge)
	}

	async function clickElementWithText(
		cssSelector: string,
		text: string,
		edge?: Edge
	) {
		// await waitForElement(cssSelector)
		const rect = await measureElementWithText(cssSelector, text)
		if (rect) await clickRect(rect, edge)
	}

	switch (task.type) {
		case "clickOnElement": {
			await clickElement(task.selector)
			return true
		}
		case "clickOnElementWithText": {
			await clickElementWithText(task.selector, task.text)
			return true
		}
		case "typeText": {
			await type(task.text)
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
