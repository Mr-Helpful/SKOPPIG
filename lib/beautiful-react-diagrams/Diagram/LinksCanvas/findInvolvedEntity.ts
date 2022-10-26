import { Port, Node } from '../../shared/Types'

export type DiagramEntity = Node | Port
export const isNode = (entity: DiagramEntity): entity is Node =>
  'coordinates' in entity

const findInvolvedEntity = (nodes: Node[], id: string): DiagramEntity => {
  for (const node of nodes) {
    if (node.id === id) return node
    for (const port of node.inputs ?? []) {
      if (port.id === id) return port
    }
    for (const port of node.outputs ?? []) {
      if (port.id === id) return port
    }
  }
  throw new TypeError(`cannot find '${id}' in schema`)
}

export default findInvolvedEntity
