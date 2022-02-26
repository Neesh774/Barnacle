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

export type Test = Task[]

export type RendererState = {
	test: Test
	submitStatus: "notSubmitting" | "submitting"
}
