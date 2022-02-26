import * as React from "react"
import { createContext, useContext } from "react"
import { MainToRendererIPC, RendererToMainIPC } from "../shared/ipc"
import { RendererApp } from "./RendererApp"
import { RendererIPCPeer } from "./RendererIPC"

export type Environment = {
	app: RendererApp
	main: RendererIPCPeer<RendererToMainIPC, MainToRendererIPC>
}

const EnvironmentContext = createContext<Environment | undefined>(undefined)

export function EnvironmentProvider(props: {
	value: Environment
	children: React.ReactNode
}) {
	return (
		<EnvironmentContext.Provider value={props.value}>
			{props.children}
		</EnvironmentContext.Provider>
	)
}

export function useEnvironment(): Environment {
	const environment = useContext(EnvironmentContext)
	if (!environment) throw new Error("Missing Environment")
	return environment
}
