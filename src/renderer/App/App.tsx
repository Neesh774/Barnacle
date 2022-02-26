import {
	Accordion,
	ActionIcon,
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
import { BiPlus, BiTrash, BiChevronUp, BiChevronDown } from "react-icons/bi"
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
						disableIconRotation
						multiple
						state={accState}
						onChange={handlers.setState}
					>
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
											<div style={{ display: "flex", alignItems: "center" }}>
												<ActionIcon
													color="red"
													onClick={() => app.dispatch.removeTask(i)}
													size="md"
												>
													<BiTrash size="20" />
												</ActionIcon>
											</div>
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
			<Browser />
		</div>
	)
}

export function Browser() {
	const [testSite, setTestSite] = React.useState("")
	const siteInput = React.useRef<HTMLInputElement | null>(null)

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
					width: "100%",
					borderBottom: "1px solid black",
				}}
			>
				<TextInput
					ref={siteInput}
					placeholder="https://example.org"
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
			{testSite ? (
				<iframe
					id="iframe"
					style={{
						display: "flex",
						width: "100%",
						height: "100%",
					}}
					src={testSite}
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
