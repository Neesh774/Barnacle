import * as React from "react"
import { useEnvironment } from "../Environment"
import { Task, taskOptions } from "../RendererState"
import { TaskDetails } from "./TaskDetails"
import { NativeSelect, ActionIcon, Container } from "@mantine/core"
import { BiTrash } from "react-icons/bi"

export function TaskItem({ task, index }: { task: Task; index: number }) {
	const { app } = useEnvironment()
	const [selectedTask, setSelectedTask] = React.useState(
		taskOptions.find((t) => t.name === task.type)
	)

	React.useEffect(() => {
		console.log(selectedTask)
	}, [selectedTask])

	return (
		<Container
			style={{
				width: "100%",
				borderRadius: "8px",
				margin: "0.5rem 0",
				padding: "0.5rem 0.6rem",
				display: "flex",
				flexDirection: "column",
			}}
			sx={(theme) => ({
				backgroundColor: theme.colors[selectedTask?.color ?? "gray"][1] + "60",
			})}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: "0.2rem",
				}}
			>
				<NativeSelect
					onChange={(e) => {
						app.dispatch.editTask(
							{ ...task, type: e.target.value } as any,
							index
						)
						setSelectedTask(taskOptions.find((t) => t.name === e.target.value))
					}}
					value={task.type}
					data={taskOptions.map((o) => ({ label: o.name, value: o.name }))}
					placeholder="Pick a task"
					label="Task"
				/>
				<ActionIcon color="red" onClick={() => app.dispatch.removeTask(index)}>
					<BiTrash style={{ width: 16, height: 16 }} />
				</ActionIcon>
			</div>
			<TaskDetails
				task={task}
				index={index}
				color={selectedTask?.color ?? "gray"}
			/>
		</Container>
	)
}
