// import * as child_process from "child_process"
// import { it } from "mocha"
// import { DeferredPromise } from "../shared/DeferredPromise"
// import { rootPath } from "../tools/rootPath"
// import { TestHarness } from "./TestHarness"

// export async function bootup(cliArgs: string[] = []) {
// 	const harness = await TestHarness.create()

// 	// Run the app.
// 	const cwd = rootPath(".")
// 	const cmd = rootPath("node_modules/.bin/electron")
// 	const args = [rootPath("build/main/main.js"), "--test", ...cliArgs]

// 	const child = child_process.spawn(cmd, args, {
// 		cwd,
// 		stdio: ["inherit", "inherit", "inherit"],
// 	})

// 	const deferred = new DeferredPromise()

// 	// Kill the child process when the main process exits.
// 	const onExit = () => child.kill()
// 	process.on("exit", onExit)

// 	child.on("error", (err) => {
// 		process.off("exit", onExit)
// 		deferred.reject(err)
// 	})

// 	child.on("exit", (code, signal) => {
// 		process.off("exit", onExit)
// 		if (code !== 0) {
// 			deferred.reject(
// 				new Error(`Unexpected exit code ${code}. "${cmd} ${args.join(" ")}"`)
// 			)
// 		} else {
// 			deferred.resolve()
// 		}
// 	})

// 	// Monkey-patch destroy. Pretty gross...
// 	const destroy = harness.destroy
// 	harness.destroy = async () => {
// 		await destroy()
// 		child.kill("SIGINT")
// 		await deferred.promise
// 	}

// 	await harness.waitUntilReady()

// 	return harness
// }

// export function e2eTest(
// 	testName: string,
// 	fn: (harness: TestHarness) => void | Promise<void>
// ) {
// 	return it(testName, async () => {
// 		const harness = await bootup()
// 		try {
// 			await fn(harness)
// 		} catch (error) {
// 			throw error
// 		} finally {
// 			await harness.destroy()
// 		}
// 	})
// }
