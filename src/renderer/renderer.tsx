// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

import * as React from "react"
import * as ReactDOM from "react-dom"
import { MainToRendererIPC, RendererToMainIPC } from "../shared/ipc"
import { offsetRect } from "../shared/rectHelpers"
import { App } from "./App/App"
import { Environment, EnvironmentProvider } from "./Environment"
import { TestHarnessPlugin } from "./plugins/TestHarnessPlugin"
import { RendererApp } from "./RendererApp"
import { RendererIPCPeer } from "./RendererIPC"
import { RendererState, TaskError } from "./RendererState"

function setupReactApp(environment: Environment) {
	const root = document.createElement("div")
	document.body.prepend(root)
	ReactDOM.render(
		<EnvironmentProvider value={environment}>
			<App />
		</EnvironmentProvider>,
		root
	)
}

async function setupTestHarness(environment: Environment) {
	const { connectRendererToTestHarness } = await import("../test/TestHarness")
	const harness = await connectRendererToTestHarness()

	harness.answer.measureDOM((selector) => {
		const node = document.querySelector(selector)
		if (!node) {
			throw new Error(`No element found for selector ${selector}`)
		}
		const rect = node.getBoundingClientRect()
		return rect
	})

	harness.answer.measureDOMWithText((selector, text) => {
		const elms = Array.from(
			document.querySelectorAll(selector)
		) as HTMLElement[]
		const elm = elms.find((elm) => elm.innerText.includes(text))
		if (!elm)
			throw new Error(
				`No element found for selector ${selector} containing text ${text}`
			)
		return elm.getBoundingClientRect()
	})

	return harness
	// file:///Users/tanishqkancharla/Documents/HTML/Apartments.html
}

type MainHarness = RendererIPCPeer<RendererToMainIPC, MainToRendererIPC>

function setupMain() {
	const main = new RendererIPCPeer<RendererToMainIPC, MainToRendererIPC>()

	function getElement(selector: string): HTMLElement {
		const frames = window.frames.top
		if (!frames) {
			throw new Error(`Frame not found`)
		}
		const iframe = frames[0].document

		const node = iframe.querySelector(selector)
		if (!node) {
			throw new Error(`No element found for selector "${selector}"`)
		}
		return node as HTMLElement
	}

	function getElementWithText(
		selector: string,
		text: string,
		exact: boolean = false
	) {
		const frames = window.frames.top
		if (!frames) {
			throw new Error(`Frame not found`)
		}
		const iframe = frames[0].document
		const nodes = Array.from(iframe.querySelectorAll(selector)) as HTMLElement[]
		const node = nodes.find((elm) => {
			return exact ? elm.innerText === text : elm.innerText.includes(text)
		})
		if (!node)
			throw new Error(
				`No element found for selector ${selector} containing text ${text}`
			)
		return node as HTMLElement
	}

	main.answer.measureDOM((selector) => {
		const node = getElement(selector)

		const { top, left, width, height } = node.getBoundingClientRect()

		const iframeElm = document.getElementById("iframe")
		if (!iframeElm) {
			throw new Error(`Frame not found`)
		}
		const iframeRect = iframeElm.getBoundingClientRect()

		return offsetRect(
			{ top, left, width, height },
			{ x: iframeRect.left, y: iframeRect.top }
		)
	})

	main.answer.measureDOMWithText((selector, text, exact) => {
		const node = getElementWithText(selector, text, exact)
		const { top, left, width, height } = node.getBoundingClientRect()

		const iframeElm = document.getElementById("iframe")
		if (!iframeElm) {
			throw new Error(`Frame not found`)
		}
		const iframeRect = iframeElm.getBoundingClientRect()

		return offsetRect(
			{ top, left, width, height },
			{ x: iframeRect.left, y: iframeRect.top }
		)
	})

	main.answer.scrollElement((selector, delta) => {
		const node = getElement(selector)
		node.scrollBy({ top: delta.y, left: delta.x })
	})

	main.answer.getElementText((selector) => {
		const node = getElement(selector)
		return node.innerText
	})

	return main
}

function setupMainActions(main: MainHarness, app: RendererApp) {
	main.answer.incrementTaskIndex(() => {
		app.dispatch.incrementRunningIndex()
	})

	main.answer.startTest(() => {
		app.dispatch.startTest()
	})

	main.answer.endTest((error?: TaskError) => {
		app.dispatch.endTest(error)
	})

	main.answer.systemRefresh(async () => {
		await main.call.saveState(app.state)
	})

	window.addEventListener("beforeunload", async () => {
		await main.call.saveState(app.state)
	})
}

async function initRendererState(main: MainHarness): Promise<RendererState> {
	const initState = await main.call.loadState()
	return (
		initState || {
			test: [],
			url: "",
			submitStatus: "standby",
			savedTests: [],
			options: { taskDelay: 1000, highlightBeforeClick: false, typeDelay: 50 },
		}
	)
}

async function main() {
	const main = setupMain()

	const state = await initRendererState(main)

	const app = new RendererApp(state, [TestHarnessPlugin(main)])
	setupMainActions(main, app)

	const environment: Environment = {
		app,
		main,
	}

	setupReactApp(environment)
}

main()
