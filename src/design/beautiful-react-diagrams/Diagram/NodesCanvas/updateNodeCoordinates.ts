// TODO: Attempt to remove this findindex import (it's suprisingly large)
import findIndex from 'lodash.findindex'
import { Node } from '../../shared/Types-ts'

/**
 * Given a node id, an pair of new coordinates and the nodes array, clones the nodes array and update the node
 * having that id with the new coordinates, then returns the cloned array.
 */
const updateNodeCoordinates = (nodeId: string, coordinates: [number, number], nodes: Node[]): Node[] => {
  const index = findIndex(nodes, ['id', nodeId])

  if (index > -1 && !nodes[index].disableDrag) {
    // eslint-disable-next-line no-param-reassign
    nodes[index].coordinates = coordinates
  }

  return nodes
}

export default updateNodeCoordinates
