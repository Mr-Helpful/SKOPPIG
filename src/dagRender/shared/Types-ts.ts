import { ElementType, ReactNode } from "react"

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
}

/** Node type */
export type NodeCoordinates = [number, number]

export type Node<P> = {
  id: string
  coordinates: NodeCoordinates
  disableDrag?: boolean
  content?: ReactNode
  inputs?: Port[]
  outputs?: Port[]
  type?: 'default'
  render?: (
    props: Omit<Node<P>, 'coordinates'>
  ) => ElementType | ReactNode
  className?: string
  data?: P
}

/** Schema type */
export type Schema = {
  nodes: Node<any>[]
  links?: Link[]
}