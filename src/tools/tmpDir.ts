import { randomId } from "../shared/randomId"
import { rootPath } from "./rootPath"

export function tmpDir() {
	const random = Date.now().toString() + "-" + randomId()
	return rootPath(`tmp/${random}`)
}
