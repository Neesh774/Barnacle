import { BrowserWindow } from "electron"
import { ipcChannel } from "../shared/ipc"
import { IPCMessage, IPCPeer } from "../shared/IPCPeer"
import { AnyFunctionMap } from "../shared/typeHelpers"

/** An IPC peer to communicate with the main process */
export class MainIPCPeer<
	CallAPI extends AnyFunctionMap = AnyFunctionMap,
	AnswerAPI extends AnyFunctionMap = AnyFunctionMap
> extends IPCPeer<CallAPI, AnswerAPI> {
	constructor(browserWindow: BrowserWindow) {
		super({
			send: (message) => {
				if (browserWindow.webContents.isDestroyed()) return
				if (message.type === "request") {
					console.log("callRenderer", message.fn)
				} else {
					console.log("answerRenderer", message.fn)
				}
				browserWindow.webContents.send(ipcChannel, message)
			},
			listen(callback) {
				const handler = async (
					event: any,
					channel: any,
					message: IPCMessage
				) => {
					if (channel !== ipcChannel) return
					callback(message)
				}
				browserWindow.webContents.on("ipc-message", handler)
				return () => {
					browserWindow.webContents.off("ipc-message", handler)
				}
			},
		})
	}
}
