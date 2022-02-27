/*

Inside the "Dispatch" menu are a bunch of tools for debugging.

*/

import { app, Menu } from "electron"
import { flatten } from "lodash"
import { MainAppPlugin } from "../MainApp"

export const SystemMenuPlugin: MainAppPlugin = (mainApp) => {
	function render() {
		const { windows } = mainApp.state

		const items = windows.map((win, i) => {
			return [
				{
					label: "Close Window " + i,
					click() {
						mainApp.dispatch.closeWindow(win.id)
					},
				},
				{
					label: "Move Window " + i,
					click() {
						mainApp.dispatch.moveWindow(win.id, {
							x: win.rect.left + 20,
							y: win.rect.top,
						})
					},
				},
				{
					label: "Resize Window " + i,
					click() {
						mainApp.dispatch.resizeWindow(win.id, {
							width: win.rect.width + 20,
							height: win.rect.height,
						})
					},
				},
				{
					label: "Focus Window " + i,
					click() {
						mainApp.dispatch.focusWindow(win.id)
					},
				},
			]
		})

		const menu = Menu.buildFromTemplate([
			{
				label: "File",
				submenu: [{ role: "close" }],
			},
			{
				label: "Edit",
				submenu: [
					{ label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
					{ label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
					{ type: "separator" },
					{ label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
					{ label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
					{ label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
					{
						label: "Select All",
						accelerator: "CmdOrCtrl+A",
						role: "selectAll",
					},
				],
			},
			{
				label: "View",
				submenu: [
					{ role: "reload" },
					{ role: "forceReload" },
					{ role: "toggleDevTools" },
					{ type: "separator" },
					{ role: "resetZoom" },
					{ role: "zoomIn" },
					{ role: "zoomOut" },
					{ type: "separator" },
					{ role: "togglefullscreen" },
				],
			},
		])
		Menu.setApplicationMenu(menu)
	}

	render()
	return {
		update() {
			render()
		},
		destroy() { },
	}
}
