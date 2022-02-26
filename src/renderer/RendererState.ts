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

export type TaskError = {
	index: number;
	message: string;
}

export type RendererState = {
	test: Test
	submitStatus: "notSubmitting"
	lastError?: TaskError | null
} | {
	test: Test
	submitStatus: "submitting"
	runningTaskIndex: number
}
