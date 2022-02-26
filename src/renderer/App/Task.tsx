import * as React from "react"
import { useEnvironment } from "../Environment"
import { Task as TaskType } from "../RendererState"

const taskOptions = ["clickOnElement", "typeText", "clickOnElementWithText"]

export function Task({ task, index }: { task: TaskType; index: number }) {
	const { app } = useEnvironment()

	return (
		<div
			style={{
				width: "100%",
				borderRadius: "8px",
				border: "1px solid black",
				margin: "0.5rem 0",
			}}
		>
			<select defaultValue={task.type}>
				{taskOptions.map((option) => (
					<option>{option}</option>
				))}
			</select>
			<button onClick={() => app.dispatch.removeTask(index)}>X</button>
		</div>
	)
}
