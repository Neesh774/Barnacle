import { PointDelta } from "../shared/rectHelpers"
import { Assert } from "../shared/typeHelpers"

export type Task =
	| {
			type: "clickOnElement"
			selector: string
	  }
	| {
			type: "clickOnElementWithText"
			text: string
			selector: string
	  }
	| {
			type: "typeText"
			text: string
	  }
	| {
			type: "waitForElement"
			waitPeriod: number
			selector: string
	  }
	| {
			type: "waitForElementWithText"
			waitPeriod: number
			selector: string
			text: string
	  }
	| {
			type: "scrollElement"
			selector: string
			delta: PointDelta
	  }

export const taskOptions = [
	{ name: "clickOnElement", color: "blue" },
	{ name: "clickOnElementWithText", color: "green" },
	{ name: "typeText", color: "orange" },
	{ name: "scrollElement", color: "blue" },
	{ name: "waitForElement", color: "blue" },
	{ name: "waitForElementWithText", color: "green" },
] as const

type containsAlLTypes = Assert<typeof taskOptions[number]["name"], Task["type"]>

export type Test = Task[]

export type TaskError = {
	index: number
	message: string
}

export type RendererState =
	| {
			test: Test
			submitStatus: "notSubmitting"
			lastError?: TaskError | null
	  }
	| {
			test: Test
			submitStatus: "submitting"
			runningTaskIndex: number
	  }
