import { MainToRendererIPC, RendererToMainIPC } from "../../shared/ipc"
import { RendererAppPlugin } from "../RendererApp"
import { RendererIPCPeer } from "../RendererIPC"
import { Test, TestOptions } from "../RendererState"

export const TestHarnessPlugin =
	(
		main: RendererIPCPeer<RendererToMainIPC, MainToRendererIPC>
	): RendererAppPlugin =>
		(app) => {
			const submittedTests = new Set<Test>()

			async function submitTest(test: Test, options: TestOptions) {
				if (submittedTests.has(test)) return
				submittedTests.add(test)
				try {
					await main.call.runTest(test, options)
				} catch (e) {
					console.error(e)
				}
				submittedTests.delete(test)
			}

			return {
				update(prevState) {
					if (
						app.state.submitStatus === "submitting" &&
						prevState.submitStatus === "standby"
					) {
						const { test, options } = app.state
						submitTest(test, options)
					}
				},
				destroy() {
					submittedTests.clear()
				},
			}
		}
