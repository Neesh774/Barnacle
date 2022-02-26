// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

import { DisplayWindowRectPlugin } from "./plugins/DisplayWindowRectPlugin"
import { SyncWindowRectPlugin } from "./plugins/SyncWindowRectPlugin"
import { RendererApp } from "./RendererApp"
import { callMain } from "./RendererIPC"
import {} from "react-dom"

const EnvironmentContext = createContext<Environment | undefined>(undefined)

export function EnvironmentProvider(props: {
	value: Environment
	children: React.ReactNode
}) {
	return (
		<EnvironmentContext.Provider value={props.value}>
			{props.children}
		</EnvironmentContext.Provider>
	)
}

export function useEnvironment(): Environment {
	const environment = useContext(EnvironmentContext)
	if (!environment) throw new Error("Missing Environment")
	return environment
}


async function setupTestHarness(app: RendererApp) {
	const { connectRendererToTestHarness } = await import("../test/TestHarness")
	const harness = await connectRendererToTestHarness()

	harness.answer.measureDOM((css) => {
		const node = document.querySelector(css)
		if (!node) return
		const rect = node.getBoundingClientRect()
		// Offset the window position
		// const topbar = 25
		return rect
	})

	harness.answer.getState(() => app.state)

	app.onDispatch((action) => {
		harness.call.dispatchAction(action)
	})

	return harness
}

function setupReactApp(app: RendererApp) {
	const root = document.createElement("div")
	document.body.prepend(root)
	ReactDOM.render(
		<EnvironmentProvider value={environment}>
			<App initialScrollTop={undefined} />
		</EnvironmentProvider>,
		root
	)
}

async function main() {
	const { test, rect } = await callMain.load()

	const app = new RendererApp({tasks: []}, [
		SyncWindowRectPlugin,
		DisplayWindowRectPlugin,
	])

	const harness = test ? await setupTestHarness(app) : undefined
}

main()
