import * as React from "react"
import { useEnvironment } from "../Environment"
import { useApp } from "../RendererApp"
import { Task } from "../RendererState"

export function TaskDetails({ task, index }: { task: Task; index: number }) {
	switch (task.type) {
		case "clickOnElement":
			return <input placeholder="Selector" />
		case "typeText":
			return <input placeholder="Text" />
		case "clickOnElementWithText":
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<input placeholder="Selector" />
					<input placeholder="Text" />
				</div>
			)
		default:
			return <div>Unknown task type</div>
	}
}
