// TODO: don't extends this interface...

import { Task, TaskError } from "../renderer/RendererState"
import { Rect } from "./rectHelpers"

export const ipcChannel = "custom-ipc-channel"

export type RendererToMainIPC = {
	runTest(test: Task[]): void
}

export type MainToRendererIPC = {
	measureDOM(cssSelector: string): Rect
	measureDOMWithText(cssSelector: string, text: string): Rect

	startTest(): void
	incrementTaskIndex(): void
	endTest(error?: TaskError): void
}
