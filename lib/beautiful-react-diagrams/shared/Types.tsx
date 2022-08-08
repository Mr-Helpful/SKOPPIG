import { ReactNode } from 'react'

/*----------------------------------------------------------------
-                        Typescript types                        -
----------------------------------------------------------------*/

/** Link type */
export type Link = {
  input: string
  output: string
  label?: ReactNode
  readonly?: boolean
  className?: string
}

/** Port type */
export type PortAlignment = 'left' | 'right' | 'top' | 'bottom'
export type PortType = 'input' | 'output'

export type Port = {
  id: string
  canLink?: (id: string, targetId: string, type: PortType) => boolean
  alignment?: PortAlignment
  className?: string
}

/** Node type */
export type Coords = [number, number]

export type Node = {
  id: string
  coordinates: Coords
  selected?: boolean
  disableDrag?: boolean
  content?: ReactNode
  inputs?: Port[]
  outputs?: Port[]
  type?: 'default'
  render?: NodeRender
  className?: string
  data?: any
}

export type NodeRender = (
  props: Omit<Node, 'coordinates' | 'inputs' | 'outputs'> & {
    inputs: ReactNode[]
    outputs: ReactNode[]
  }
) => ReactNode

/** Schema type */
export type Schema = {
  nodes: Node[]
  links: Link[]
}

/** An object containing HTML elements */
export type ElementObject = {
  [key: string]: HTMLElement
}

/*----------------------------------------------------------------
-                         default values                         -
----------------------------------------------------------------*/
// we need some sensible default values, assigned to variables
// to avoid arbitrarily changing references when components rerender

export const defaultLink: Link = {
  input: '',
  output: '',
}

export const defaultPort: Port = {
  id: '',
}
export const defaultPorts: Port[] = []

export const defaultContent: ReactNode = <></>
export const defaultData: any = {}

export const defaultNode: Node = {
  id: '',
  coordinates: [0, 0],
}

export const defaultSchema: Schema = {
  nodes: [],
  links: [],
}

// A generic void returning function for any callbacks
export const defaultCallback: (...args: any[]) => void = () => {}

export const defaultElementObject: ElementObject = {}

// A generic function that is used in both DiagramPort.tsx, Diagram.tsx
export const vacuouslyTrue: (...args: any[]) => boolean = () => true
