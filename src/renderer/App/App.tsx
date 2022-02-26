import {
	Accordion,
	Button,
	Checkbox,
	Code,
	Divider,
	Group,
	NumberInput,
	Text,
	TextInput,
	Title,
} from "@mantine/core"
import * as React from "react"
import { BiPlus, BiTrash } from "react-icons/bi"
import { useEnvironment } from "../Environment"
import { useApp } from "../RendererApp"
import { Task, taskOptions } from "../RendererState"
import { TaskItem } from "./TaskItem"

function getSemanticName(task: Task): JSX.Element {
	switch (task.type) {
		case "clickOnElement": {
			return (
				<Text size="md">
					Click on element <Code>{task.selector}</Code>
				</Text>
			)
		}
		case "clickOnElementWithText": {
			return (
				<Text size="md">
					Click on element <Code>{task.selector}</Code> with text{" "}
					<Code>{task.text}</Code>
				</Text>
			)
		}
		case "typeText": {
			return (
				<Text size="md">
					Type <Code>{task.text}</Code>
				</Text>
			)
		}
		case "shortcut": {
			return (
				<Text size="md">
					Keyboard shortcut <Code>{task.shortcut}</Code>
				</Text>
			)
		}
		case "scrollElement": {
			return (
				<Text size="md">
					Scroll element <Code>{task.selector}</Code>
				</Text>
			)
		}
		case "waitForElement": {
			return (
				<Text size="md">
					Wait for element <Code>{task.selector}</Code> to appear
				</Text>
			)
		}
		case "waitForElementWithText": {
			return (
				<Text size="md">
					Wait for element <Code>{task.selector}</Code> with text{" "}
					<Code>{task.text}</Code> to appear
				</Text>
			)
		}
	}
}

export function App() {
	const state = useApp((state) => state)
	const { app } = useEnvironment()
	const [testSite, setTestSite] = React.useState("")
	const [taskErrors, setTaskErrors] = React.useState(false)
	const taskRefs = React.useRef<HTMLElement[]>(new Array(state.test.length))
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
					<Accordion disableIconRotation>
						{state.test.map((task, i) => {
							const taskSettings = taskOptions.find((t) => t.name === task.type)
							return (
								<Accordion.Item
									key={i}
									label={
										<div
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
											}}
										>
											{getSemanticName(task)}
										</div>
									}
									icon={taskSettings?.icon}
								>
									<TaskItem index={i} task={task} />
								</Accordion.Item>
							)
						})}
					</Accordion>
					<Button
						onClick={() => {
							app.dispatch.appendTask({ type: "clickOnElement", selector: "" })
						}}
						variant="outline"
						size="xs"
						leftIcon={<BiPlus />}
						style={{ marginTop: "1rem" }}
					>
						New Task
					</Button>
				</div>
				<Divider />
				<div
					style={{
						padding: "0.6rem 1rem",
						width: "100%",
						display: "flex",
						alignItems: "center",
					}}
				>
					<Button
						onClick={() => {
							app.dispatch.startSubmittingTest()
						}}
						disabled={taskErrors}
						style={{ transition: "ease-in-out 0.2s" }}
						loading={state.submitStatus === "submitting"}
						size="sm"
					>
						Submit
					</Button>
					<div style={{ flex: "1 1 auto" }} />
					<Button
						onClick={() => {
							app.dispatch.clearTasks()
						}}
						style={{ display: "flex", transition: "ease-in-out 0.2s" }}
						leftIcon={<BiTrash size={16} />}
						variant="subtle"
						color="red"
						// disabled={state.test.length === 0}
						size="sm"
					>
						Clear
					</Button>
				</div>
				<Accordion>
					<Accordion.Item label="Options">
						<Group spacing={15} direction={"column"}>
							<NumberInput
								label="Task delay"
								description="Delay between each task item"
								value={state.options.delay}
								onChange={(value) => {
									app.dispatch.setOptions({
										...state.options,
										delay: value || 0,
									})
								}}
							/>
							<Checkbox
								label="Highlight before click"
								checked={state.options.highlightBeforeClick}
								onChange={(event) => {
									const checked = event.currentTarget.checked
									app.dispatch.setOptions({
										...state.options,
										highlightBeforeClick: checked,
									})
								}}
							/>
						</Group>
					</Accordion.Item>
				</Accordion>
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
						padding: "0.4rem 0",
					}}
				>
					<TextInput
						ref={siteInput}
						style={{ flex: "1 1 auto" }}
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
						border: "1px solid rgb(84,86,88)",
						borderRadius: "4px",
					}}
					src={testSite}
				></iframe>
			</div>
		</div>
	)
}
