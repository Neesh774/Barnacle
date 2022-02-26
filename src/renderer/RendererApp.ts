import {
	Actions,
	Dispatcher,
	EffectPlugin,
	StateMachine,
} from "../StateMachine"
import { RendererState, Task } from "./RendererState"

function appendTask(state: RendererState, task: Task): RendererState {
	return {
		tasks: [...state.tasks, task],
	}
}

function editTask(
	state: RendererState,
	newTask: Task,
	index: number
): RendererState {
	const newTasks = [...state.tasks]
	newTasks[index] = newTask
	return {
		tasks: newTasks,
	}
}

function removeTask(state: RendererState, task: Task): RendererState {
	const newTasks = state.tasks.filter((oldTask) => oldTask !== task)
	return {
		tasks: newTasks,
	}
}

const rendererReducers = {
	appendTask,
	removeTask,
	editTask,
}

export type RendererAction = Actions<typeof rendererReducers>
export type RendererDispatch = Dispatcher<typeof rendererReducers>

export type RendererAppPlugin = EffectPlugin<
	RendererState,
	typeof rendererReducers
>

export class RendererApp extends StateMachine<
	RendererState,
	typeof rendererReducers
> {
	constructor(initialState: RendererState, plugins: RendererAppPlugin[] = []) {
		super(initialState, rendererReducers, plugins)
	}
}
