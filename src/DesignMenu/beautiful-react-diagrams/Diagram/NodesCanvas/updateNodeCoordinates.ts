import { Node } from '../../shared/Types'

/**
 * Given a node id, an pair of new coordinates and the nodes array, clones the nodes array and update the node
 * having that id with the new coordinates, then returns the cloned array.
 */
const updateNodeCoordinates = (nodeId: string, coordinates: [number, number], nodes: Node[]): Node[] => {
  const node = nodes.find(({ id }) => id === nodeId)

  if (node !== undefined && !node.disableDrag) {
    // eslint-disable-next-line no-param-reassign
    node.coordinates = coordinates
  }

  return nodes
}

export default updateNodeCoordinates
