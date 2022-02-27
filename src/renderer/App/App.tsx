import {
	Accordion,
	Button,
	Code,
	Divider,
	Text,
	TextInput,
	Title,
	useAccordionState,
} from "@mantine/core"
import * as React from "react"
import { BiPlus, BiTrash } from "react-icons/bi"
import { useEnvironment } from "../Environment"
import { useApp } from "../RendererApp"
import { Task, taskOptions } from "../RendererState"
import { Options } from "./Options"
import { TaskItem } from "./TaskItem"

function getSemanticName(task: Task): JSX.Element {
	switch (task.type) {
		case "clickOnElement": {
			return (
				<Text size="md">
					Click on element{" "}
					<Code>{task.selector.length > 0 ? task.selector : ""}</Code>
				</Text>
			)
		}
		case "clickOnElementWithText": {
			return (
				<Text size="md">
					Click on element
					{task.selector.length > 0 ? (
						<Code>{" " + task.selector + " "}</Code>
					) : (
						" "
					)}
					with text <Code>{task.text}</Code>
				</Text>
			)
		}
		case "typeText": {
			return (
				<Text size="md">
					Type<Code> {" " + task.text}</Code>
				</Text>
			)
		}
		case "shortcut": {
			return (
				<Text size="md">
					Keyboard shortcut<Code> {" " + task.shortcut}</Code>
				</Text>
			)
		}
		case "scrollElement": {
			return (
				<Text size="md">
					Scroll element<Code> {" " + task.selector}</Code>
				</Text>
			)
		}
		case "waitForElement": {
			return (
				<Text size="md">
					Wait for element
					{task.selector.length > 0 ? (
						<Code>{" " + task.selector + " "}</Code>
					) : (
						" "
					)}
					to appear
				</Text>
			)
		}
		case "waitForElementWithText": {
			return (
				<Text size="md">
					Wait for element
					{task.selector.length > 0 ? (
						<Code>{" " + task.selector + " "}</Code>
					) : (
						" "
					)}
					with text{" "}
					{task.text.length > 0 ? <Code>{" " + task.text + " "}</Code> : " "} to
					appear
				</Text>
			)
		}
	}
}

export function App() {
	const state = useApp((state) => state)
	const { app } = useEnvironment()

	const [taskErrors, setTaskErrors] = React.useState(false)
	const siteInput = React.useRef<HTMLInputElement | null>(null)
	const [accState, handlers] = useAccordionState({
		total: state.test.length,
		initialItem:
			state.submitStatus === "standby" && state.lastError
				? state.lastError.index
				: -1,
	})

	React.useEffect(() => {
		setTaskErrors(
			state.test.every((task) => {
				return !Object.values(task).every((v) => {
					return v.length > 0
				})
			})
		)
		if (state.submitStatus === "standby" && state.lastError) {
			handlers.toggle(state.lastError.index)
		}
	}, [taskErrors, state])

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
					<Accordion
						multiple
						state={accState}
						onChange={handlers.setState}
						iconPosition="right"
					>
						{state.test.map((task, i) => {
							const taskSettings = taskOptions.find((t) => t.name === task.type)
							return (
								<Accordion.Item
									className="task-accordion"
									key={i}
									label={
										<div
											style={{
												display: "flex",
												alignItems: "center",
											}}
										>
											<div style={{ marginRight: "0.4rem" }}>
												{taskSettings?.icon}
											</div>
											{getSemanticName(task)}
										</div>
									}
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
						size="sm"
					>
						Clear
					</Button>
				</div>
				<Options />
			</div>
			<Browser />
		</div>
	)
}

export function Browser() {
	const { app } = useEnvironment()
	const url = useApp((state) => state.url)
	const [loaded, setLoaded] = React.useState(true)
	const iframeRef = React.useRef<HTMLIFrameElement>(null)

	return (
		<div
			className="preview"
			style={{
				display: "flex",
				flex: "1 1 auto",
				flexDirection: "column",
			}}
		>
			<div
				className="test-site"
				style={{
					display: "flex",
					margin: "0.4rem 0",
					padding: "0 4rem",
					alignItems: "center",
				}}
			>
				<TextInput
					placeholder="https://example.org"
					type="url"
					size="xs"
					style={{ width: "100%" }}
					value={url}
					onChange={(event) => {
						app.dispatch.setUrl(event.currentTarget.value || "")
						setLoaded(false)
					}}
					onKeyUp={(event) => {
						if (event.key === "Enter") {
							setLoaded(true)
						}
					}}
				/>
				<Button
					style={{ marginLeft: "0.2rem" }}
					onClick={() => {
						setLoaded(true)
					}}
					size="xs"
				>
					Load
				</Button>
			</div>
			{loaded && url !== "" ? (
				<iframe
					id="iframe"
					style={{
						display: "flex",
						width: "100%",
						height: "100%",
					}}
					ref={iframeRef}
					src={url}
				/>
			) : (
				<div
					style={{
						backgroundColor: "lightgray",
						display: "flex",
						flex: "1 1 auto",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Text>Load a website in the url to get started.</Text>
				</div>
			)}
		</div>
	)
}
