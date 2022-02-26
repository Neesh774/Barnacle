// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

import * as React from "react"
import * as ReactDOM from "react-dom"
import { MainToRendererIPC, RendererToMainIPC } from "../shared/ipc"
import { App } from "./App/App"
import { Environment, EnvironmentProvider } from "./Environment"
import { RendererApp } from "./RendererApp"
import { RendererIPCPeer } from "./RendererIPC"

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
}

function setupMain() {
	const main = new RendererIPCPeer<RendererToMainIPC, MainToRendererIPC>()

	main.answer.measureDOM((selector) => {
		const node = document.querySelector(selector)
		if (!node) {
			throw new Error(`No element found for selector ${selector}`)
		}
		const rect = node.getBoundingClientRect()
		return rect
	})

	main.answer.measureDOMWithText((selector, text) => {
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

	return main
}

async function main() {
	const main = setupMain()
	const app = new RendererApp({ test: [], submitStatus: "notSubmitting" }, [])

	const environment: Environment = {
		app,
		main,
	}

	setupReactApp(environment)
}

main()
