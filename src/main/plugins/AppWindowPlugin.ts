/*

This "plugin" manages the app windows. The annoying part here is that it is no declarative.
Ideally, we'd have some kind of "virtual browser window" API similar to React to doing all
of the updates. But for now, this is what we're working with.

*/

import { BrowserWindow } from "electron"
import { differenceBy, intersectionBy } from "lodash"
import * as path from "path"
import { MainToRendererIPC, RendererToMainIPC } from "../../shared/ipc"
import { MainAppPlugin } from "../MainApp"
import { MainEnvironment } from "../MainEnvironment"
import { MainIPCPeer } from "../MainIPC"
import { MainState, WindowState } from "../MainState"
import { runTest } from "./runTest"

export const AppWindowPlugin =
	(environment: Omit<MainEnvironment, "app">): MainAppPlugin =>
		(app) => {
			return new AppWindowController({ ...environment, app })
		}

class AppWindow {
	private browserWindow: BrowserWindow
	public ipc: MainIPCPeer<MainToRendererIPC, RendererToMainIPC>

	constructor(
		private environment: MainEnvironment,
		private windowState: WindowState
	) {
		const { id, rect } = windowState
		this.browserWindow = new BrowserWindow({
			show: false,
			...rect,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
				preload: path.join(__dirname, "../../renderer/preload.js"),
			},
		})
		this.browserWindow.loadFile(path.join(__dirname, "../../../index.html"))

		this.browserWindow.once("ready-to-show", () => {
			if (windowState.focused) {
				this.browserWindow.show()
			} else {
				this.browserWindow.showInactive()
			}
		})

		this.browserWindow.on("focus", () => {
			setTimeout(() => {
				if (!this.windowState.focused) {
					environment.app.dispatch.focusWindow(id)
				}
			})
		})

		this.browserWindow.on("close", () =>
			environment.app.dispatch.closeWindow(id)
		)

		this.browserWindow.on("move", () => {
			if (process.platform !== "darwin") return
			const [x, y] = this.browserWindow.getPosition()
			const { rect } = this.windowState
			if (rect.x === x && rect.y === y) return
			environment.app.dispatch.moveWindow(id, { x, y })
		})

		this.browserWindow.on("resize", () => {
			if (process.platform !== "darwin") return
			const [width, height] = this.browserWindow.getSize()
			const { rect } = this.windowState
			if (rect.width === width && rect.height === height) return
			environment.app.dispatch.resizeWindow(id, { width, height })
		})

		this.browserWindow.on("focus", () => {
			if (!this.windowState.focused) {
				environment.app.dispatch.focusWindow(id)
			}
		})

		this.ipc = new MainIPCPeer<MainToRendererIPC, RendererToMainIPC>(
			this.browserWindow
		)

		this.ipc.answer.runTest(async (test) => {
			runTest(test, this.ipc)
		})
	}

	updateState(nextState: WindowState) {
		const prevState = this.windowState
		if (prevState === nextState) return
		this.windowState = nextState

		if (prevState.id !== nextState.id)
			throw new Error("Window id should not change.")

		if (nextState.focused && !this.browserWindow.isFocused()) {
			this.browserWindow.focus()
		}

		if (prevState.rect === nextState.rect) return

		const prevRect = prevState.rect
		const nextRect = nextState.rect

		if (prevRect.x !== nextRect.x || prevRect.y !== nextRect.y) {
			this.browserWindow.setPosition(nextRect.x, nextRect.y, false)
		}

		if (
			prevRect.height !== nextRect.height ||
			prevRect.width !== nextRect.width
		) {
			this.browserWindow.setSize(nextRect.width, nextRect.height, false)
		}
	}

	destroy() {
		this.browserWindow.destroy()
	}
}

class AppWindowController {
	private appWindows: { [id: string]: AppWindow } = {}

	constructor(private environment: MainEnvironment) {
		for (const win of [...environment.app.state.windows].reverse()) {
			this.appWindows[win.id] = new AppWindow(environment, win)
		}
	}

	update(prevState: MainState) {
		const nextState = this.environment.app.state
		const createWindows = differenceBy(
			nextState.windows,
			prevState.windows,
			(win) => win.id
		)
		const destroyWindows = differenceBy(
			prevState.windows,
			nextState.windows,
			(win) => win.id
		)
		// Note: this returns values only from the first array.
		const updateWindows = intersectionBy(
			nextState.windows,
			prevState.windows,
			(win) => win.id
		)

		const focusedId = nextState.windows[0]?.id

		for (const oldProps of destroyWindows) {
			this.appWindows[oldProps.id].destroy()
			delete this.appWindows[oldProps.id]
		}
		for (const nextProps of updateWindows) {
			this.appWindows[nextProps.id].updateState({
				...nextProps,
				focused: focusedId === nextProps.id,
			})
		}
		for (const props of createWindows) {
			this.appWindows[props.id] = new AppWindow(this.environment, {
				...props,
				focused: focusedId === props.id,
			})
		}
	}

	destroy() {
		Object.values(this.appWindows).forEach((win) => win.destroy())
	}
}
