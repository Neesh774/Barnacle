import * as fs from "fs-extra"
import * as path from "path"
import { RendererState } from "../../renderer/RendererState"

export async function saveState(partition: string, state: RendererState) {
	try {
		await fs.ensureFile(path.join(partition, "state.json"))
		await fs.writeJSON(path.join(partition, "state.json"), state)
	} catch (e) {
		console.log("saveState failed:", e)
	}
}

export async function loadState(
	partition: string
): Promise<RendererState | undefined> {
	try {
		const state = await fs.readJSON(path.join(partition, "state.json"))
		return state
	} catch (error) {
		console.log("loadState failed:", error)
		return undefined
	}
}
