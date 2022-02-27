import { ActionIcon, Button, NumberInput, TextInput } from "@mantine/core"
import * as React from "react"
import { BiTrash } from "react-icons/bi"
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
	const deltaYRef = React.useRef<HTMLInputElement>(null)
	const deltaXRef = React.useRef<HTMLInputElement>(null)
	const timeoutRef = React.useRef<HTMLInputElement>(null)
	const [saved, setSaved] = React.useState(true)

	switch (task.type) {
		case "clickOnElement":
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<TextInput
						required
						label="CSS Selector"
						ref={selectorRef}
						placeholder=".submit"
						error={selectorRef.current?.value === ""}
						onChange={() =>
							setSaved(selectorRef.current?.value == task.selector)
						}
					/>
					<div
						style={{
							display: "flex",
							marginTop: "0.4rem",
							alignItems: "center",
						}}
					>
						<Button
							color={color}
							style={{
								width: "100%",
								transition: "ease-in-out 0.3s",
							}}
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
						<ActionIcon
							style={{ zIndex: 1000, marginLeft: "0.4rem" }}
							color="red"
							onClick={() => app.dispatch.removeTask(index)}
							size="lg"
							variant="filled"
						>
							<BiTrash size="24" />
						</ActionIcon>
					</div>
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
					<div
						style={{
							marginTop: "0.4rem",
							display: "flex",
							alignItems: "center",
						}}
					>
						<Button
							color={color}
							style={{
								width: "100%",
								transition: "ease-in-out 0.3s",
							}}
							size="lg"
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
						<ActionIcon
							style={{ zIndex: 1000, marginLeft: "0.4rem" }}
							color="red"
							onClick={() => app.dispatch.removeTask(index)}
							size="lg"
							variant="filled"
						>
							<BiTrash size="24" />
						</ActionIcon>
					</div>
				</div>
			)
		case "shortcut":
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<TextInput
						required
						ref={textRef}
						label="Text"
						placeholder="cmd-t"
						onChange={() => {
							return setSaved(textRef.current?.value === task.shortcut)
						}}
						error={textRef.current?.value === ""}
					/>
					<div
						style={{
							marginTop: "0.4rem",
							display: "flex",
							alignItems: "center",
						}}
					>
						<Button
							color={color}
							style={{
								width: "100%",
								transition: "ease-in-out 0.3s",
							}}
							size="lg"
							variant="light"
							disabled={saved}
							onClick={() => {
								app.dispatch.editTask(
									{
										...task,
										shortcut: textRef.current?.value ?? "",
									},
									index
								)
								setSaved(true)
							}}
						>
							Save
						</Button>
						<ActionIcon
							style={{ zIndex: 1000, marginLeft: "0.4rem" }}
							color="red"
							onClick={() => app.dispatch.removeTask(index)}
							size="lg"
							variant="filled"
						>
							<BiTrash size="24" />
						</ActionIcon>
					</div>
				</div>
			)
		case "clickOnElementWithText":
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<TextInput
						required
						ref={selectorRef}
						label="CSS Selector"
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
					<div
						style={{
							marginTop: "0.4rem",
							display: "flex",
							alignItems: "center",
						}}
					>
						<Button
							color={color}
							style={{
								width: "100%",
								transition: "ease-in-out 0.3s",
							}}
							size="lg"
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
						<ActionIcon
							style={{ zIndex: 1000, marginLeft: "0.4rem" }}
							color="red"
							onClick={() => app.dispatch.removeTask(index)}
							size="lg"
							variant="filled"
						>
							<BiTrash size="24" />
						</ActionIcon>
					</div>
				</div>
			)
		case "scrollElement":
			//selector input and number input
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<TextInput
						required
						ref={selectorRef}
						label="CSS Selector"
						placeholder=".submit"
						onChange={() =>
							setSaved(selectorRef.current?.value == task.selector)
						}
						error={selectorRef.current?.value === ""}
					/>
					<div style={{ display: "flex", alignItems: "center" }}>
						<NumberInput
							ref={deltaYRef}
							label="Delta Y"
							placeholder="100"
							onChange={() =>
								setSaved(deltaYRef.current?.value == task.delta.y)
							}
							error={deltaYRef.current?.value === ""}
							hideControls
							style={{ marginRight: "0.1rem" }}
						/>
						<NumberInput
							hideControls
							style={{ marginLeft: "0.1rem" }}
							ref={deltaXRef}
							label="Delta X"
							placeholder="100"
							onChange={() =>
								setSaved(deltaXRef.current?.value == task.delta.x)
							}
							error={deltaXRef.current?.value === ""}
						/>
					</div>
					<div
						style={{
							marginTop: "0.4rem",
							display: "flex",
							alignItems: "center",
						}}
					>
						<Button
							color={color}
							style={{
								width: "100%",
								transition: "ease-in-out 0.3s",
							}}
							size="lg"
							variant="light"
							disabled={saved}
							onClick={() => {
								app.dispatch.editTask(
									{
										...task,
										selector: selectorRef.current?.value ?? "",
										delta: {
											x: parseInt(deltaXRef.current?.value ?? "0"),
											y: parseInt(deltaYRef.current?.value ?? "0"),
										},
									},
									index
								)
								setSaved(true)
							}}
						>
							Save
						</Button>
						<ActionIcon
							style={{ zIndex: 1000, marginLeft: "0.4rem" }}
							color="red"
							onClick={() => app.dispatch.removeTask(index)}
							size="lg"
							variant="filled"
						>
							<BiTrash size="24" />
						</ActionIcon>
					</div>
				</div>
			)
		case "waitForElement":
			//selector input and number input
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<TextInput
						required
						ref={selectorRef}
						label="CSS Selector"
						placeholder=".submit"
						onChange={() =>
							setSaved(selectorRef.current?.value == task.selector)
						}
						error={selectorRef.current?.value === ""}
					/>
					<NumberInput
						ref={timeoutRef}
						label="Timeout"
						placeholder="1000"
						onChange={() =>
							setSaved(
								parseInt(timeoutRef.current?.value ?? "0") == task.waitPeriod
							)
						}
						error={timeoutRef.current?.value === ""}
						hideControls
						style={{ marginRight: "0.1rem" }}
					/>
					<div
						style={{
							marginTop: "0.4rem",
							display: "flex",
							alignItems: "center",
						}}
					>
						<Button
							color={color}
							style={{
								width: "100%",
								transition: "ease-in-out 0.3s",
							}}
							size="lg"
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
						<ActionIcon
							style={{ zIndex: 1000, marginLeft: "0.4rem" }}
							color="red"
							onClick={() => app.dispatch.removeTask(index)}
							size="lg"
							variant="filled"
						>
							<BiTrash size="24" />
						</ActionIcon>
					</div>
				</div>
			)
		case "waitForElementWithText":
			//selector input and number input
			return (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<TextInput
						required
						ref={selectorRef}
						label="CSS Selector"
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
						placeholder="Submit"
						onChange={() => setSaved(textRef.current?.value == task.text)}
						error={textRef.current?.value === ""}
					/>
					<NumberInput
						ref={timeoutRef}
						label="Timeout"
						placeholder="1000"
						onChange={() =>
							setSaved(
								parseInt(timeoutRef.current?.value ?? "0") == task.waitPeriod
							)
						}
						error={timeoutRef.current?.value === ""}
						hideControls
						style={{ marginRight: "0.1rem" }}
					/>
					<div
						style={{
							marginTop: "0.4rem",
							display: "flex",
							alignItems: "center",
						}}
					>
						<Button
							color={color}
							style={{
								transition: "ease-in-out 0.3s",
								width: "100%",
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
						<ActionIcon
							style={{ zIndex: 1000, marginLeft: "0.4rem" }}
							color="red"
							onClick={() => app.dispatch.removeTask(index)}
							size="lg"
							variant="filled"
						>
							<BiTrash size="24" />
						</ActionIcon>
					</div>
				</div>
			)

		default:
			return <div>Unknown task type</div>
	}
}
