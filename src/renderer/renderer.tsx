// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

import * as React from "react"
import * as ReactDOM from "react-dom"
import { App } from "./App"
import { Environment, EnvironmentProvider } from "./Environment"
import { DisplayWindowRectPlugin } from "./plugins/DisplayWindowRectPlugin"
import { SyncWindowRectPlugin } from "./plugins/SyncWindowRectPlugin"
import { RendererApp } from "./RendererApp"
import { callMain } from "./RendererIPC"

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

	harness.answer.measureDOM((css) => {
		const node = document.querySelector(css)
		if (!node) return
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

async function main() {
	const { test, rect } = await callMain.load()

	const app = new RendererApp({ tasks: [] }, [
		SyncWindowRectPlugin,
		DisplayWindowRectPlugin,
	])

	const environment: Environment = {
		app,
		harness: undefined,
	}

	environment.harness = test ? await setupTestHarness(environment) : undefined

	setupReactApp(environment)
}

main()
