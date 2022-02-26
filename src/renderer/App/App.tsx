import {
	Button,
	Overlay,
	TextInput,
	Title,
	Timeline,
	ActionIcon,
} from "@mantine/core"
import * as React from "react"
import { BiMouseAlt, BiPlus, BiText, BiTrash } from "react-icons/bi"
import { useEnvironment } from "../Environment"
import { useApp } from "../RendererApp"
import { TaskItem } from "./TaskItem"

export function App() {
	const state = useApp((state) => state)
	console.log({ state })
	const { app } = useEnvironment()
	const [testSite, setTestSite] = React.useState("")
	const [taskErrors, setTaskErrors] = React.useState(false)
	const siteInput = React.useRef<HTMLInputElement | null>(null)

	React.useEffect(() => {
		setTaskErrors(
			state.test.every((task) => {
				return !Object.values(task).every((v) => {
					return v.length > 0
				})
			})
		)
	})

	return (
		<div style={{ display: "flex", height: "100%" }}>
			<div
				className="tasks"
				style={{
					width: "30%",
					borderRight: "1px solid #aaa",
					padding: "2rem 0 0",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
				}}
			>
				<div
					style={{
						overflowY: "auto",
						height: "100%",
						padding: "0 1rem",
						paddingBottom: "1rem",
						marginBottom: "0.1rem",
					}}
				>
					<Title order={3} style={{ marginBottom: "0.4rem" }}>
						Tasks
					</Title>
					<div style={{ position: "relative" }}>
						<Timeline
							active={
								state.submitStatus === "running" ? state.runningTaskIndex : -1
							}
							bulletSize={24}
							lineWidth={1}
						>
							{state.test.map((task, i) => {
								return (
									<Timeline.Item
										title={
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
												}}
											>
												<Title order={5} style={{ marginRight: "0.5rem" }}>
													{state.submitStatus === "running" &&
													state.runningTaskIndex === i
														? "Running "
														: ""}
													Task {i + 1}
												</Title>
												<ActionIcon
													color="red"
													onClick={() => app.dispatch.removeTask(i)}
												>
													<BiTrash style={{ width: 16, height: 16 }} />
												</ActionIcon>
											</div>
										}
										bullet={
											task.type === "typeText" ? (
												<BiText size={12} />
											) : (
												<BiMouseAlt size={12} />
											)
										}
									>
										<TaskItem index={i} key={i} task={task} />
									</Timeline.Item>
								)
							})}
						</Timeline>
					</div>
					<Button
						onClick={() => {
							app.dispatch.appendTask({ type: "clickOnElement", selector: "" })
						}}
						variant="outline"
						size="xs"
						leftIcon={<BiPlus />}
					>
						New Task
					</Button>
				</div>
				<div
					style={{
						padding: "0.6rem 1rem",
						boxShadow: " 0px -2px 4px -2.5px rgba(0,0,0,0.75)",
						width: "100%",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Button
						onClick={() => {
							app.dispatch.startSubmittingTest()
						}}
						variant="gradient"
						gradient={{ from: "indigo", to: "cyan" }}
						disabled={taskErrors}
						style={{ transition: "ease-in-out 0.2s" }}
						loading={state.submitStatus === "submitting"}
					>
						Submit
					</Button>
					<Button
						onClick={() => {
							app.dispatch.clearTasks()
						}}
						style={{ display: "flex", transition: "ease-in-out 0.2s" }}
						leftIcon={<BiTrash size={16} />}
						variant="outline"
						color="gray"
						disabled={state.test.length === 0}
						size="xs"
					>
						Clear
					</Button>
				</div>
			</div>
			<div
				className="preview"
				style={{
					display: "flex",
					flexDirection: "column",
					width: "70%",
					padding: "2rem 4rem",
				}}
			>
				<div
					className="test-site"
					style={{
						display: "flex",
						width: "100%",
						margin: "0.4rem 0",
						padding: "0 0.6rem",
					}}
				>
					<TextInput
						ref={siteInput}
						style={{ width: "100%" }}
						type="url"
						size="xs"
					/>
					<Button
						style={{ marginLeft: "0.2rem" }}
						onClick={(e: React.MouseEvent) =>
							setTestSite(siteInput.current ? siteInput.current.value : "")
						}
						size="xs"
					>
						Load
					</Button>
				</div>
				<iframe
					id="iframe"
					style={{
						display: "flex",
						width: "100%",
						height: "100%",
						border: "1px solid black",
					}}
					src={testSite}
				></iframe>
			</div>
		</div>
	)
}
