import {
	Actions,
	Dispatcher,
	EffectPlugin,
	StateMachine,
} from "../StateMachine"
import { useEnvironment } from "./Environment"
import { useStateMachine } from "./hooks/useStateMachine"
import { Preset, RendererState, Task, TaskError, TestOptions } from "./RendererState"

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
	state.submitStatus === "standby" &&
		state.lastError &&
		state.lastError.index == index
		? (state.lastError = undefined)
		: ""
	return {
		...state,
		test: newTasks,
	}
}

function setTasks(state: RendererState, tasks: Task[]): RendererState {
	state.submitStatus === "standby" &&
		state.lastError
		? (state.lastError = undefined)
		: ""
	return { ...state, test: tasks }
}

function clearTasks(state: RendererState): RendererState {
	return { ...state, test: [] }
}

function removeTask(state: RendererState, index: number): RendererState {
	const newTasks = state.test.filter((_, i) => i !== index)
	state.submitStatus === "standby" &&
		state.lastError &&
		state.lastError.index == index
		? (state.lastError = undefined)
		: ""
	return {
		...state,
		test: newTasks,
	}
}

function startSubmittingTest(state: RendererState): RendererState {
	state.submitStatus === "standby" &&
		state.lastError
		? (state.lastError = undefined)
		: ""
	return { ...state, submitStatus: "submitting" }
}

function cancelSubmittingTest(state: RendererState): RendererState {
	return { ...state, submitStatus: "standby" }
}

function startTest(state: RendererState): RendererState {
	return { ...state, submitStatus: "running", runningTaskIndex: 0 }
}

function incrementRunningIndex(state: RendererState): RendererState {
	if (state.submitStatus !== "running") {
		throw new Error(
			"Test wasn't running when `incrementRunningIndex` was called"
		)
	}
	return { ...state, runningTaskIndex: state.runningTaskIndex + 1 }
}

function endTest(state: RendererState, error?: TaskError): RendererState {
	if (state.submitStatus !== "running") {
		throw new Error("Test wasn't running when `endTest` was called")
	}
	return { ...state, submitStatus: "standby", lastError: error }
}

function setOptions(state: RendererState, options: TestOptions): RendererState {
	return { ...state, options }
}

function setUrl(state: RendererState, url: string): RendererState {
	return { ...state, url }
}

function addSavedTest(state: RendererState, save: Preset): RendererState {
	return { ...state, savedTests: [...state.savedTests, save] }
}
function deleteSavedTest(state: RendererState, index: number): RendererState {
	const newTests = state.savedTests.filter((_, i) => i !== index)
	return { ...state, savedTests: newTests }
}

const rendererReducers = {
	appendTask,
	removeTask,
	editTask,
	clearTasks,
	setTasks,

	setOptions,
	setUrl,

	startSubmittingTest,
	cancelSubmittingTest,

	startTest,
	incrementRunningIndex,
	endTest,

	addSavedTest,
	deleteSavedTest,
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
		this.onDispatch((action) => {
			console.log("dispatch", action.fn)
		})
	}
}

export function useApp<T>(selector: (state: RendererState) => T) {
	const { app } = useEnvironment()
	return useStateMachine(app, selector)
}
