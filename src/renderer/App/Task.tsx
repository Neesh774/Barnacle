import * as React from "react"
import { useEnvironment } from "../Environment"
import { Task as TaskType } from "../RendererState"
import { TaskDetails } from "./TaskDetails"

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
				padding: "0.3rem 0.4rem",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div style={{display: "flex", justifyContent: "space-between", marginBottom: "0.2rem"}}>
				<select
					value={task.type}
					onChange={(e) =>
						app.dispatch.editTask({ ...task, type: e.target.value }, index)
					}
				>
					{taskOptions.map((option) => (
						<option>{option}</option>
					))}
				</select>
				<button onClick={() => app.dispatch.removeTask(index)}>X</button>
			</div>
			<TaskDetails task={task} index={index} />
		</div>
	)
}
