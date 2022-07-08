import { Port } from "../Types"

/**
 * Given a node and the port type to check, returns an array with all node's ports ids
 * @param state
 * @param index
 * @param portName
 * @returns {*[]|*}
 */
const getNodePortsId = (
  node: { inputs: Port[], outputs: Port[], [key: string]: any }, portType: 'inputs' | 'outputs'
): string[] => {
  if (node[portType] && node[portType].length > 0) {
    return node[portType].map((port) => port.id)
  }
  return []
}

export default getNodePortsId
