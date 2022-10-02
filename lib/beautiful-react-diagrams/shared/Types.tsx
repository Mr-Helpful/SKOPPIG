import { FC, ReactNode } from 'react'

/*----------------------------------------------------------------
-                        Typescript types                        -
----------------------------------------------------------------*/

export type Segment = {
  id: string
  from: [number, number]
  to: [number, number]
  alignment?: PortAlignment
}

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
type PortType = 'input' | 'output'

export type Port = {
  id: string
  canLink?: (id: string, targetId: string, type: PortType) => boolean
  alignment?: PortAlignment
  className?: string
}

/** Generic coordinate type and some operations on it */
export type Coords = [number, number]

/** Node type */
export type Node = {
  id: string
  coordinates: Coords
  selected?: boolean
  disableDrag?: boolean
  content?: ReactNode
  inputs?: Port[]
  outputs?: Port[]
  type?: 'default'
  Render?: NodeRender
  className?: string
  collapsed?: Schema
  data?: any
}

export type NodeRender = FC<
  Omit<Node, 'coordinates' | 'inputs' | 'outputs'> & {
    inputs: ReactNode[]
    outputs: ReactNode[]
  }
>

/** Schema type */
export type Schema = {
  nodes: Node[]
  links: Link[]
}

/** An object containing HTML elements */
export type ElementObject = {
  [key: string]: HTMLElement
}

/** A generic click event for both HTML elements */
export type ClickEvent = React.MouseEvent<HTMLElement, MouseEvent>

/*----------------------------------------------------------------
-                         default values                         -
----------------------------------------------------------------*/
// we need some sensible default values, assigned to variables
// to avoid arbitrarily changing references when components rerender

export const defaultLink: Link = {
  input: '',
  output: ''
}

export const defaultPort: Port = {
  id: ''
}
export const defaultPorts: Port[] = []

export const defaultContent: ReactNode = <></>
export const defaultData: any = {}

export const defaultNode: Node = {
  id: '',
  coordinates: [0, 0]
}

export const defaultSchema: Schema = {
  nodes: [],
  links: []
}

// A generic function that is used in both DiagramPort.tsx, Diagram.tsx
export const vacuouslyTrue: (...args: any[]) => boolean = () => true
