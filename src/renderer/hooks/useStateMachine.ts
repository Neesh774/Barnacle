import { throttle } from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"
import { shallowEqual } from "../../shared/shallowEqual"
import { AnyReducers, StateMachine } from "../../StateMachine"
import { useRefCurrent } from "./useRefCurrent"

export function useStateMachine<S, T, R extends AnyReducers<S>>(
	machine: StateMachine<S, R>,
	selector: (state: S) => T,
	deps: any[] = [],
	/**
	 * Optionally throttle updates. Remember that StateMachines are dispatched
	 * synchronously so any debouncing needs to happen in the listener.
	 */
	throttleMs: number = 0
) {
	const initialState = useMemo(() => selector(machine.state), [])
	const [state, setState] = useState(initialState)

	const currentStateRef = useRefCurrent(state)
	const currentSelectorRef = useRefCurrent(selector)

	function updateState() {
		const nextState = currentSelectorRef.current(machine.state)
		if (shallowEqual(currentStateRef.current, nextState)) return
		// Tricky bit here: if there's more than update in a single render,
		// then the currentStateRef hasn't been updated from the last setState
		// because the component didn't rerender!
		currentStateRef.current = nextState
		setState(nextState)
	}

	useEffect(() => {
		const throttledUpdate = throttleMs
			? throttle(updateState, throttleMs, { leading: false, trailing: true })
			: updateState
		return machine.addListener(throttledUpdate)
	}, [])

	const firstRender = useRef(true)
	useEffect(() => {
		if (firstRender.current) {
			firstRender.current = false
			return
		}
		updateState()
	}, [...deps])

	return state
}
