import { MainToRendererIPC, RendererToMainIPC } from "../../shared/ipc"
import { RendererAppPlugin } from "../RendererApp"
import { RendererIPCPeer } from "../RendererIPC"
import { Test } from "../RendererState"

export const TestHarnessPlugin =
	(
		main: RendererIPCPeer<RendererToMainIPC, MainToRendererIPC>
	): RendererAppPlugin =>
	(app) => {
		const submittedTests = new Set<Test>()

		async function submitTest(test: Test) {
			if (submittedTests.has(test)) return
			submittedTests.add(test)
			try {
				await main.call.runTest(test)
			} catch (e) {
				console.error(e)
			}
			submittedTests.delete(test)
			app.dispatch.finishSubmittingTest()
		}

		return {
			update(prevState) {
				if (
					app.state.submitStatus === "submitting" &&
					prevState.submitStatus === "standby"
				) {
					const tasks = app.state.test
					submitTest(tasks)
				}
			},
			destroy() {
				submittedTests.clear()
			},
		}
	}
