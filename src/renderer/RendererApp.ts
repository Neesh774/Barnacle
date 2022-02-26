import {
	Actions,
	Dispatcher,
	EffectPlugin,
	StateMachine,
} from "../StateMachine"
import { Environment, Task } from "./RendererState"

function appendTask(state: Environment, task: Task): Environment {
	return {
		tasks: [...state.tasks, task],
	}
}

function editTask(
	state: Environment,
	newTask: Task,
	index: number
): Environment {
	const newTasks = [...state.tasks]
	newTasks[index] = newTask
	return {
		tasks: newTasks,
	}
}

function removeTask(state: Environment, task: Task): Environment {
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
	Environment,
	typeof rendererReducers
>

export class RendererApp extends StateMachine<
	Environment,
	typeof rendererReducers
> {
	constructor(initialState: Environment, plugins: RendererAppPlugin[] = []) {
		super(initialState, rendererReducers, plugins)
	}
}
