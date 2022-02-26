import * as React from "react"
import { useEnvironment } from "../Environment"
import { useApp } from "../RendererApp"
import { Task } from "../RendererState"

export function TaskDetails({ task, index }: { task: Task; index: number }) {
	const { app } = useEnvironment()
	const selectorRef = React.useRef<HTMLInputElement>(null)
	const textRef = React.useRef<HTMLInputElement>(null)
	switch (task.type) {
		case "clickOnElement":
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<input ref={selectorRef} placeholder="Selector" />
                    <button
						onClick={() =>
							app.dispatch.editTask(
								{
									...task,
									selector: selectorRef.current?.value ?? "",
								},
								index
							)
						}
					>
						Save
					</button>
				</div>
			)
		case "typeText":
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<input ref={textRef} placeholder="Text" />
					<button
						onClick={() =>
							app.dispatch.editTask(
								{
									...task,
									text: textRef.current?.value ?? "",
								},
								index
							)
						}
					>
						Save
					</button>
				</div>
			)
		case "clickOnElementWithText":
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<input ref={selectorRef} placeholder="Selector" />
					<input ref={textRef} placeholder="Text" />
					<button
						onClick={() =>
							app.dispatch.editTask(
								{
									...task,
									selector: selectorRef.current?.value ?? "",
									text: textRef.current?.value ?? "",
								},
								index
							)
						}
					>
						Save
					</button>
				</div>
			)
		default:
			return <div>Unknown task type</div>
	}
}
