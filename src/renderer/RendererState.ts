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

export const taskOptions = [
	{ name: "clickOnElement", color: "blue" },
	{ name: "typeText", color: "orange" },
	{ name: "clickOnElementWithText", color: "green" },
]

export type Test = Task[]

export type RendererState = {
	test: Test
	submitStatus: "notSubmitting"
} | {
	test: Test
	submitStatus: "submitting"
	runningTaskIndex: number
}
