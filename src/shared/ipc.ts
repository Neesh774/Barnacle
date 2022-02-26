// TODO: don't extends this interface...

import { Task, TaskError, TestOptions } from "../renderer/RendererState"
import { PointDelta, Rect } from "./rectHelpers"

export const ipcChannel = "custom-ipc-channel"

export type RendererToMainIPC = {
	runTest(test: Task[], options: TestOptions): void
}

export type MainToRendererIPC = {
	measureDOM(cssSelector: string): Rect
	measureDOMWithText(cssSelector: string, text: string): Rect
	scrollElement(cssSelector: string, delta: PointDelta): void

	startTest(): void
	incrementTaskIndex(): void
	endTest(error?: TaskError): void
}
