import * as nut from "@nut-tree/nut-js"
import { Task, Test } from "../../renderer/RendererState"
import { MainToRendererIPC, RendererToMainIPC } from "../../shared/ipc"
import {
	Edge,
	offsetRect,
	Point,
	Rect,
	rectToPoint,
} from "../../shared/rectHelpers"
import { MainIPCPeer } from "../MainIPC"

nut.keyboard.config.autoDelayMs = 100
nut.mouse.config.autoDelayMs = 100
nut.mouse.config.mouseSpeed = 1000
nut.screen.config.highlightDurationMs = 500

export async function runTest(
	test: Test,
	renderer: MainIPCPeer<MainToRendererIPC, RendererToMainIPC>,
	windowRect: Rect
) {
	await renderer.call.startTest()
	test.forEach(async (task, index) => {
		try {
			await runTask(task, renderer, windowRect)
		} catch (e) {
			renderer.call.endTest({ index, message: e.message as string })
			return
		}
		await sleep(400)
		await renderer.call.incrementTaskIndex()
	})
	await renderer.call.endTest()
}

export function sleep(ms = 0) {
	return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

async function clickPoint(point: Point) {
	await nut.mouse.move([point])
	await sleep(50)
	await nut.mouse.leftClick()
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
	windowRect: Rect
) {
	async function measureElement(cssSelector: string) {
		const rectOnWindow = await renderer.call.measureDOM(cssSelector)
		const rectOnScreen = offsetRect(rectOnWindow, {
			x: windowRect.left,
			y: windowRect.top,
		})

		await nut.screen.highlight(
			new nut.Region(
				windowRect.left,
				windowRect.top,
				windowRect.width,
				windowRect.height
			)
		)

		await nut.screen.highlight(
			new nut.Region(
				rectOnScreen.left,
				rectOnScreen.top,
				rectOnScreen.width,
				rectOnScreen.height
			)
		)

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

	async function type(str: string) {
		await nut.keyboard.type(str)
		await sleep(50)
	}

	async function waitForElement(cssSelector: string) {
		await waitFor(async () => {
			await measureElement(cssSelector)
			return true
		}, 500)
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
			return
		}
		case "clickOnElementWithText": {
			await clickElementWithText(task.selector, task.text)
			return
		}
		case "typeText": {
			await type(task.text)
			return
		}
	}
}
