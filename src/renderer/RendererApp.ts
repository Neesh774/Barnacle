import {
	Actions,
	Dispatcher,
	EffectPlugin,
	StateMachine,
} from "../StateMachine"
import { useEnvironment } from "./Environment"
import { useStateMachine } from "./hooks/useStateMachine"
import { RendererState, Task, TaskError } from "./RendererState"

function appendTask(state: RendererState, task: Task): RendererState {
	return {
		...state,
		test: [...state.test, task],
	}
}

function editTask(
	state: RendererState,
	newTask: Task,
	index: number
): RendererState {
	const newTasks = [...state.test]
	newTasks[index] = newTask
	console.log(newTasks);
	return {
		...state,
		test: newTasks,
	}
}

function removeTask(state: RendererState, index: number): RendererState {
	const newTasks = state.test.filter((_, i) => i !== index)
	console.log(newTasks, index);
	return {
		...state,
		test: newTasks,
	}
}

function startSubmittingTest(state: RendererState): RendererState {
	return { ...state, submitStatus: "submitting", runningTaskIndex: 0 }
}

function finishSubmittingTest(state: RendererState, error?: TaskError): RendererState {
	return { ...state, submitStatus: "notSubmitting", lastError: error }
}

function incrementRunningIndex(state: RendererState): RendererState {
	return state.submitStatus === "submitting" ? { ...state, runningTaskIndex: state.runningTaskIndex + 1 } : state
}


const rendererReducers = {
	appendTask,
	removeTask,
	editTask,
	startSubmittingTest,
	finishSubmittingTest,
	incrementRunningIndex
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

export function useApp() {
	const { app } = useEnvironment()
	return useStateMachine(app, (state) => state)
}
