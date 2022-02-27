import React from "react"
import {
	BiKey,
	BiMoveVertical,
	BiPointer,
	BiStopwatch,
	BiText,
	BiStopCircle,
} from "react-icons/bi"
import { FaRegKeyboard, FaEquals } from "react-icons/fa"
import { Edge, PointDelta } from "../shared/rectHelpers"
import { Assert } from "../shared/typeHelpers"

export type Task =
	| {
			type: "clickOnElement"
			selector: string
			edge?: Edge
	  }
	| {
			type: "clickOnElementWithText"
			text: string
			selector: string
			edge?: Edge
	  }
	| {
			type: "typeText"
			text: string
	  }
	| {
			type: "waitForElement"
			waitPeriod: number
			selector: string
	  }
	| {
			type: "waitForElementWithText"
			waitPeriod: number
			selector: string
			text: string
	  }
	| {
			type: "scrollElement"
			selector: string
			delta: PointDelta
	  }
	| {
			type: "shortcut"
			shortcut: string
	  }
	| {
			type: "sleep"
			sleepPeriod: number
	  }
	| {
			type: "assertElementText"
			text: string
			exact: boolean
			selector: string
	  }

type TaskOption = {
	display: string
	name: string
	color: string
	icon: JSX.Element
}

export const taskOptions = [
	{
		display: "Click on element",
		name: "clickOnElement",
		color: "blue",
		icon: <BiPointer color="blue" />,
	},
	{
		display: "Click on element with text",
		name: "clickOnElementWithText",
		color: "blue",
		icon: <BiPointer color="blue" />,
	},
	{
		display: "Type text",
		name: "typeText",
		color: "orange",
		icon: <BiText color="orange" />,
	},
	{
		display: "Scroll",
		name: "scrollElement",
		color: "green",
		icon: <BiMoveVertical color="green" />,
	},
	{
		display: "Wait for element",
		name: "waitForElement",
		color: "red",
		icon: <BiStopwatch color="red" />,
	},
	{
		display: "Wait for element with text",
		name: "waitForElementWithText",
		color: "red",
		icon: <BiStopwatch color="red" />,
	},
	{
		display: "Keyboard shortcut",
		name: "shortcut",
		color: "violet",
		icon: <FaRegKeyboard color="violet" />,
	},
	{
		display: "Sleep",
		name: "sleep",
		color: "gray",
		icon: <BiStopCircle color="gray" />,
	},
	{
		display: "Assert element text",
		name: "assertElementText",
		color: "gray",
		icon: <FaEquals color="teal" />,
	},
] as const

type containsAlLTypes = Assert<typeof taskOptions[number]["name"], Task["type"]>

export type Test = Task[]

export type Preset = {
	name: string
	test: Test
}

export type TestOptions = {
	taskDelay: number
	highlightBeforeClick: boolean
	typeDelay: number
}

export type TaskError = {
	index: number
	message: string
}

export type RendererState =
	| {
			test: Test
			savedTests: Preset[]
			url: string
			submitStatus: "standby"
			options: TestOptions
			lastError?: TaskError
	  }
	| {
			test: Test
			savedTests: Preset[]
			url: string
			options: TestOptions
			submitStatus: "submitting"
	  }
	| {
			test: Test
			savedTests: Preset[]
			url: string
			options: TestOptions
			submitStatus: "running"
			runningTaskIndex: number
	  }
