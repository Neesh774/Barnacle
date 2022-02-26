import * as nut from "@nut-tree/nut-js"
import { Task, Test } from "../renderer/RendererState"
import { Edge, Point, Rect, rectToPoint } from "../shared/rectHelpers"
import { RendererHarness } from "./TestHarness"

export async function runTest(test: Test, harness: RendererHarness) {
	for (const task of test) {
		await runTask(task, harness)
		await sleep(100)
	}
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

async function runTask(task: Task, renderer: RendererHarness) {
	async function measureElement(cssSelector: string) {
		return await renderer.call.measureDOM(cssSelector)
	}

	async function waitForElement(cssSelector: string) {
		await waitFor(async () => {
			await measureElement(cssSelector)
			return true
		}, 500)
	}

	async function clickElement(cssSelector: string, edge?: Edge) {
		await waitForElement(cssSelector)
		const rect = await measureElement(cssSelector)
		await clickRect(rect, edge)
	}

	async function clickElementWithText(cssSelector: string, edge?: Edge) {
		await waitForElement(cssSelector)
		const rect = await measureElement(cssSelector)
		await clickRect(rect, edge)
	}

	switch (task.type) {
		case "clickOnElement": {
			// Measure element
			// rect to point,
			await clickElement(task.selector)
			return
		}
		case "clickOnElementWithText": {
		}
	}
}
