import React from "react"
import {
	BiKey,
	BiMoveVertical,
	BiPointer,
	BiStopwatch,
	BiText,
} from "react-icons/bi"
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

type TaskOption = {
	name: string
	color: string
	icon: JSX.Element
}

export const taskOptions = [
	{ name: "clickOnElement", color: "blue", icon: <BiPointer /> },
	{ name: "clickOnElementWithText", color: "blue", icon: <BiPointer /> },
	{ name: "typeText", color: "orange", icon: <BiText /> },
	{ name: "scrollElement", color: "green", icon: <BiMoveVertical /> },
	{ name: "waitForElement", color: "yellow", icon: <BiStopwatch /> },
	{ name: "waitForElementWithText", color: "yellow", icon: <BiStopwatch /> },
	{ name: "shortcut", color: "blue", icon: <BiKey /> },
] as const

type containsAlLTypes = Assert<typeof taskOptions[number]["name"], Task["type"]>

export type Test = Task[]

export type TaskError = {
	index: number
	message: string
}

export type RendererState =
	| {
			test: Test
			submitStatus: "standby"
			lastError?: TaskError
	  }
	| {
			test: Test
			submitStatus: "submitting"
	  }
	| {
			test: Test
			submitStatus: "running"
			runningTaskIndex: number
	  }
