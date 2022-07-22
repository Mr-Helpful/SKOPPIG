import { Port, Node } from "../../shared/Types"

export interface NodeEntity {
  type: 'node'
  entity: Node
}

export interface PortEntity {
  type: 'port'
  entity: Port
}

export type DiagramEntity = NodeEntity | PortEntity

/**
 * Given an array of nodes and an id, returns the involved port/node
 */
const findInvolvedEntity = (nodes: Node[] | Port[], entityId: string, type: 'node' | 'port' = 'node'): NodeEntity | PortEntity => {
  let result = undefined
  let index = 0

  while (index < nodes.length && !result) {
    const node = nodes[index]

    if (node.id === entityId) {
      result = { type, entity: { ...node } }
    } else if ('inputs' in node && 'outputs' in node) {
      result = findInvolvedEntity(node.inputs, entityId, 'port') || findInvolvedEntity(node.outputs, entityId, 'port')
    }

    index += 1
  }

  return result
}

export default findInvolvedEntity
