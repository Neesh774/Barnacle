import { Environment } from "../Environment"
import { RendererAppPlugin } from "../RendererApp"
import { Test } from "../RendererState"

export const TestHarnessPlugin =
	(environment: Environment): RendererAppPlugin =>
	(app) => {
		const submittedTests = new Set<Test>()

		async function submitTest(test: Test) {
			if (submittedTests.has(test)) return
			submittedTests.add(test)
			await environment.main.call.runTest(test)
			submittedTests.delete(test)
		}

		return {
			update(prevState) {
				if (
					app.state.submitStatus === "submitting" &&
					prevState.submitStatus === "notSubmitting"
				) {
					const tasks = app.state.test
					submitTest(tasks)
				}
			},
			destroy() {},
		}
	}
