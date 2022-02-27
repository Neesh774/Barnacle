import { Alert, Button, Container, NativeSelect } from "@mantine/core"
import * as React from "react"
import { BiChevronDown, BiChevronUp, BiXCircle } from "react-icons/bi"
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
		<Container
			style={{
				width: "100%",
				// margin: "0.5rem 0",
				padding: "0.5rem 0.6rem",
				display: "flex",
				flexDirection: "column",
			}}
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
					alignItems: "flex-start",
					flexDirection: "column",
				}}
			>
				<div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
					{index != 0 && state.test.length > 1 && (
						<Button
							onClick={() => {
								const newTest = [...state.test]
								newTest.splice(index - 1, 0, newTest.splice(index, 1)[0])
								app.dispatch.setTasks(newTest)
							}}
							rightIcon={<BiChevronUp />}
							color="gray"
							variant="light"
							style={{ width: "50%", marginRight: "0.2rem" }}
						>
							Move Up
						</Button>
					)}
					{index != state.test.length - 1 && state.test.length > 1 && (
						<Button
							onClick={() => {
								const newTest = [...state.test]
								newTest.splice(index + 1, 0, newTest.splice(index, 1)[0])
								app.dispatch.setTasks(newTest)
							}}
							leftIcon={<BiChevronDown />}
							color="gray"
							variant="light"
							style={{ width: "50%", marginLeft: "0.2rem" }}
						>
							Move Down
						</Button>
					)}
				</div>
				<NativeSelect
					onChange={(e) => {
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
							case "scrollElement":
								app.dispatch.editTask(
									{
										type: "scrollElement",
										selector: "",
										delta: { x: 0, y: 0 },
									},
									index
								)
								break
							case "waitForElement":
								app.dispatch.editTask(
									{ type: "waitForElement", selector: "", waitPeriod: 0 },
									index
								)
								break
							case "waitForElementWithText":
								app.dispatch.editTask(
									{
										type: "waitForElementWithText",
										text: "",
										selector: "",
										waitPeriod: 0,
									},
									index
								)
								break
							case "shortcut":
								app.dispatch.editTask({ type: "shortcut", shortcut: "" }, index)
								break
						}
						console.log(e.target.value)
						setSelectedType(taskOptions.find((t) => t.name === e.target.value))
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
				color={selectedType?.color ?? "blue"}
			/>
		</Container>
	)
}
