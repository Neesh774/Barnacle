import { Accordion, Alert, Container, NativeSelect, Title } from "@mantine/core"
import * as React from "react"
import { BiXCircle } from "react-icons/bi"
import { useEnvironment } from "../Environment"
import { useApp } from "../RendererApp"
import { Task, taskOptions } from "../RendererState"
import { TaskDetails } from "./TaskDetails"

export function TaskItem({ task, index }: { task: Task; index: number }) {
	const { app } = useEnvironment()
	const state = useApp((state) => state)
	const [selectedType, setSelectedType] = React.useState(
		taskOptions.find((t) => t.name === task.type)
	)

	return (
		<Accordion.Item
			key={index}
			label={
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Title order={4}>Task {index + 1}</Title>
					<i style={{ fontSize: "0.8rem", color: "gray" }}>
						{selectedType?.name}
					</i>
				</div>
			}
			icon={selectedType?.icon}
		>
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
					backgroundColor:
						theme.colors[selectedType?.color ?? "gray"][1] +
						(state.submitStatus === "running" &&
						index === state.runningTaskIndex
							? "90"
							: "60"),
				})}
			>
				{state.submitStatus === "standby" &&
					state.lastError &&
					state.lastError.index === index && (
						<Alert
							icon={<BiXCircle size={16} />}
							title={`Error on task ${index + 1}`}
							style={{ marginBottom: "0.5rem" }}
							color="red"
						>
							{state.lastError.message}
						</Alert>
					)}
				<div
					style={{
						display: "flex",
						marginBottom: "0.2rem",
						alignItems: "center",
					}}
				>
					<NativeSelect
						onChange={(e) => {
							app.dispatch.editTask(
								{ ...task, type: e.target.value } as any,
								index
							)
							switch (e.target.value) {
								case "clickOnElement":
									app.dispatch.editTask(
										{ type: "clickOnElement", selector: "" },
										index
									)
									break
								case "typeText":
									app.dispatch.editTask({ type: "typeText", text: "" }, index)
									break
								case "clickOnElementWithText":
									app.dispatch.editTask(
										{ type: "clickOnElementWithText", text: "", selector: "" },
										index
									)
									break
							}
							setSelectedType(
								taskOptions.find((t) => t.name === e.target.value)
							)
						}}
						value={task.type}
						data={taskOptions.map((o) => ({ label: o.name, value: o.name }))}
						placeholder="Pick a task"
						label="Task Type"
					/>
				</div>

				<TaskDetails
					task={task}
					index={index}
					color={selectedType?.color ?? "gray"}
				/>
			</Container>
		</Accordion.Item>
	)
}
