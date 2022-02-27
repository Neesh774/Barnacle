import * as React from "react"
import { Preset } from "../RendererState"
import { Button, ActionIcon, Group, Text, Badge } from "@mantine/core"
import { BiTrashAlt } from "react-icons/bi"
import { useEnvironment } from "../Environment"

export function SavedTest({ test, index }: { test: Preset; index: number }) {
	const { app } = useEnvironment()
	return (
		<Group
			direction="row"
			align="center"
			position="apart"
			sx={(s) => ({
				width: "100%",
			})}
		>
			<Group
				sx={(s) => ({
					cursor: "pointer",
					transition: "ease-in-out 0.2s",
					"&:hover": {
						backgroundColor: s.colors.gray[2],
					},
					padding: "0.2rem 0.5rem",
					borderRadius: "4px",
				})}
				spacing="xs"
				style={{ flexGrow: 1 }}
				onClick={() => {
					app.dispatch.setTasks(test.test)
				}}
			>
				<Text style={{ userSelect: "none" }}>{test.name}</Text>
				<Badge style={{ margin: "0 0.4rem", cursor: "pointer" }}>
					{test.test.length}
				</Badge>
			</Group>
			<Group>
				<ActionIcon
					color="red"
					size="md"
					onClick={() => {
						app.dispatch.deleteSavedTest(index)
					}}
				>
					<BiTrashAlt size={24} />
				</ActionIcon>
			</Group>
		</Group>
	)
}
