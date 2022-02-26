import * as React from "react"
import { useApp } from "../RendererApp"
import { useEnvironment } from "../Environment"
import { Task } from "./Task"

export function App() {
	const state = useApp()
	const { app } = useEnvironment()
	const [testSite, setTestSite] = React.useState("")
	const siteInput = React.useRef(null)

	return (
		<div style={{ display: "flex", height: "100%" }}>
			<div
				className="tasks"
				style={{
					width: "30%",
					borderRight: "1px solid black",
					padding: "2rem 1rem",
				}}
			>
				<div>
					<h1>Tasks</h1>
					{state.test.map((task, i) => (
						<Task index={i} key={i} task={task} />
					))}
					<button
						onClick={() => {
							app.dispatch.appendTask({ type: "clickOnElement", selector: "" })
						}}
					>
						New Task
					</button>
				</div>
				<button
					onClick={() => {
						app.dispatch.submitTest()
					}}
				>
					Submit
				</button>
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
				<div className="test-site">
					<input ref={siteInput} />
					<button
						onClick={(e) =>
							setTestSite(siteInput.current ? siteInput.current.value : "")
						}
					>
						Load
					</button>
				</div>
				<iframe
					style={{ display: "flex", width: "100%", height: "100%" }}
					src={testSite}
				></iframe>
			</div>
		</div>
	)
}
