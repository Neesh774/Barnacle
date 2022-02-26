import { Button, TextInput } from "@mantine/core"
import * as React from "react"
import { useEnvironment } from "../Environment"
import { Task } from "../RendererState"

export function TaskDetails({
	task,
	index,
	color,
}: {
	task: Task
	index: number
	color: string
}) {
	const { app } = useEnvironment()
	const selectorRef = React.useRef<HTMLInputElement>(null)
	const textRef = React.useRef<HTMLInputElement>(null)
	const [saved, setSaved] = React.useState(true)

	switch (task.type) {
		case "clickOnElement":
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<TextInput
						required
						label="Selector"
						ref={selectorRef}
						placeholder=".submit"
						error={selectorRef.current?.value === ""}
						onChange={() =>
							setSaved(selectorRef.current?.value == task.selector)
						}
					/>
					<Button
						color={color}
						style={{ marginTop: "0.4rem", transition: "ease-in-out 0.3s" }}
						variant="light"
						disabled={saved}
						onClick={() => {
							app.dispatch.editTask(
								{
									...task,
									selector: selectorRef.current?.value ?? "",
								},
								index
							)
							setSaved(true)
						}}
					>
						Save
					</Button>
				</div>
			)
		case "typeText":
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<TextInput
						required
						ref={textRef}
						label="Text"
						placeholder="Lorem ipsum"
						onChange={() => {
							return setSaved(textRef.current?.value === task.text)
						}}
						error={textRef.current?.value === ""}
					/>
					<Button
						color={color}
						style={{
							marginTop: "0.4rem",
							transition: "ease-in-out 0.3s",
						}}
						variant="light"
						disabled={saved}
						onClick={() => {
							app.dispatch.editTask(
								{
									...task,
									text: textRef.current?.value ?? "",
								},
								index
							)
							setSaved(true)
						}}
					>
						Save
					</Button>
				</div>
			)
		case "clickOnElementWithText":
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<TextInput
						required
						ref={selectorRef}
						label="Selector"
						placeholder=".submit"
						onChange={() =>
							setSaved(selectorRef.current?.value == task.selector)
						}
						error={selectorRef.current?.value === ""}
					/>
					<TextInput
						required
						ref={textRef}
						label="Text"
						placeholder="Lorem ipsum"
						onChange={() => setSaved(textRef.current?.value == task.text)}
						error={textRef.current?.value === ""}
					/>
					<Button
						color={color}
						style={{
							width: "30%",
							marginTop: "0.4rem",
							transition: "ease-in-out 0.3s",
						}}
						variant="light"
						disabled={saved}
						onClick={() => {
							app.dispatch.editTask(
								{
									...task,
									selector: selectorRef.current?.value ?? "",
									text: textRef.current?.value ?? "",
								},
								index
							)
							setSaved(true)
						}}
					>
						Save
					</Button>
				</div>
			)
		default:
			return <div>Unknown task type</div>
	}
}
