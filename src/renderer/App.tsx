import * as React from "react"
import { useEnvironment } from "./Environment"

export function App() {
	const { app } = useEnvironment()

	return (
		<div>
			<h1>Hello world!</h1>
		</div>
	)
}
