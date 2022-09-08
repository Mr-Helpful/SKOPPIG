import { Node } from '../Types'
import ensurePortId from './ensurePortId'

const ensureNodeIds = (node: Node) => {
  // eslint-disable-next-line no-param-reassign
  node.id ||= `node-${Math.random().toString(36).slice(2, 9)}`

  if (node.inputs) node.inputs.forEach(ensurePortId)
  if (node.outputs) node.outputs.forEach(ensurePortId)

  return node
}

export default ensureNodeIds
