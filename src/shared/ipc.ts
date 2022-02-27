// TODO: don't extends this interface...

import {
	RendererState,
	Task,
	TaskError,
	TestOptions,
} from "../renderer/RendererState"
import { PointDelta, Rect } from "./rectHelpers"

export const ipcChannel = "custom-ipc-channel"

export type RendererToMainIPC = {
	runTest(test: Task[], options: TestOptions): void
	saveState(state: RendererState): void
	loadState(): RendererState | undefined
}

export type MainToRendererIPC = {
	measureDOM(cssSelector: string): Rect
	measureDOMWithText(cssSelector: string, text: string, exact: boolean): Rect
	scrollElement(cssSelector: string, delta: PointDelta): void
	getElementText(cssSelector: string): string

	startTest(): void
	incrementTaskIndex(): void
	endTest(error?: TaskError): void

	systemRefresh(): void
}
