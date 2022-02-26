import { ipcRenderer } from "electron"
import { ipcChannel } from "../shared/ipc"
import { IPCMessage, IPCPeer } from "../shared/IPCPeer"
import { AnyFunctionMap } from "../shared/typeHelpers"

export class RendererIPCPeer<
	CallAPI extends AnyFunctionMap = AnyFunctionMap,
	AnswerAPI extends AnyFunctionMap = AnyFunctionMap
> extends IPCPeer<CallAPI, AnswerAPI> {
	constructor() {
		super({
			send: (message) => {
				if (message.type === "request") {
					console.log("callMain", message.fn)
				} else {
					console.log("answerMain", message.fn)
				}
				ipcRenderer.send(ipcChannel, message)
			},
			listen(callback) {
				const handler = (event: any, message: IPCMessage) => {
					callback(message)
				}
				ipcRenderer.on(ipcChannel, handler)
				return () => {
					ipcRenderer.off(ipcChannel, handler)
				}
			},
		})
	}
}
