import {
	Accordion,
	ActionIcon,
	Checkbox,
	Group,
	NumberInput,
	Text,
	TextInput,
	Title,
} from "@mantine/core"
import * as React from "react"
import { BiSave } from "react-icons/bi"
import { useEnvironment } from "../Environment"
import { useApp } from "../RendererApp"
import { Preset } from "../RendererState"
import { SavedTest } from "./SavedTest"

export function Options() {
	const { app } = useEnvironment()
	const state = useApp((state) => state)
	const newSaveRef = React.useRef<HTMLInputElement>(null)

	return (
		<Accordion>
			<Accordion.Item label="Options">
				<Group spacing={15} direction={"column"}>
					<NumberInput
						label="Task delay"
						description="Delay between each task item"
						value={state.options.taskDelay}
						onChange={(value) => {
							app.dispatch.setOptions({
								...state.options,
								taskDelay: value || 0,
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
					<NumberInput
						label="Type delay"
						description="Delay between typing characters"
						value={state.options.typeDelay}
						onChange={(value) => {
							app.dispatch.setOptions({
								...state.options,
								typeDelay: value || 0,
							})
						}}
					/>
				</Group>
			</Accordion.Item>
			<Accordion.Item label="Saved Tests">
				<Group direction="column">
					{state.savedTests.length < 1 ? (
						<Text color="gray">No saved tests</Text>
					) : (
						state.savedTests.map((test, i) => (
							<SavedTest index={i} test={test} />
						))
					)}
					<Title order={5}>Save</Title>
					<Group direction="row" align="flex-end">
						<TextInput ref={newSaveRef} label="Name" size="sm" />
						<ActionIcon
							size="xl"
							onClick={() => {
								if (!newSaveRef.current || newSaveRef.current.value.length < 0)
									return
								const save: Preset = {
									name: newSaveRef.current.value,
									test: state.test,
								}
								app.dispatch.addSavedTest(save)
								newSaveRef.current.value = ""
							}}
						>
							<BiSave size={24} />
						</ActionIcon>
					</Group>
				</Group>
			</Accordion.Item>
		</Accordion>
	)
}
