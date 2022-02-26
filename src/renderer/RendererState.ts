export type Task = {
	type: "clickOnElement"
	selector: string
} | {
	type: "clickOnElementWithText"
	text: string
	selector: string
}

export type Environment = {
	tasks: Task[]
}

