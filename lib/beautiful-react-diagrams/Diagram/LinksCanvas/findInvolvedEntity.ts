import { Port, Node } from '../../shared/Types'

interface NodeEntity {
  type: 'node'
  entity: Node
}

interface PortEntity {
  type: 'port'
  entity: Port
}

export type DiagramEntity = NodeEntity | PortEntity

const findInvolvedEntity = (
  nodes: Node[],
  id: string
): NodeEntity | PortEntity => {
  for (const node of nodes) {
    if (node.id === id) return { type: 'node', entity: { ...node } }
    for (const port of node.inputs ?? []) {
      if (port.id === id) return { type: 'port', entity: { ...port } }
    }
    for (const port of node.outputs ?? []) {
      if (port.id === id) return { type: 'port', entity: { ...port } }
    }
  }
  throw new TypeError(`cannot find '${id}' in schema`)
}

export default findInvolvedEntity
