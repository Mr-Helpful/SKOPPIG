import { ON_CHANGE, ON_CONNECT, ON_NODE_ADD, ON_NODE_REMOVE } from './actionTypes'
import getNodePortsId from '../../shared/functions/getNodePortsId'
import { Schema, Node, Link } from '../../shared/Types'

type ActionType = {
  type: string
  payload: Partial<Schema & {
    node: Node
    nodeId: string
    link: Link
  }>
}

/**
 * schema reducer
 * 
 * A Reminder here, reducer functions need to have **no** side effects
 * As React.StrictMode may trigger them twice to check purity
 */
const schemaReducer = (state: Schema, action: ActionType) => {
  switch (action.type) {
    case ON_CHANGE:
      return {
        nodes: action.payload.nodes || state.nodes || [],
        links: action.payload.links || state.links || []
      }
    case ON_NODE_ADD:
      return {
        nodes: [...(state.nodes || []), action.payload.node],
        links: state.links || [],
      }
    case ON_NODE_REMOVE: { // remove all node's links
      let nextNodes = state.nodes || []
      let nextLinks = state.links || []

      const node = state.nodes.find(({ id }) => id === action.payload.nodeId)
      if (node !== undefined) {
        const ports = { inputs: [], outputs: [], ...node }
        const inputPorts = getNodePortsId(ports, 'inputs')
        const outputPorts = getNodePortsId(ports, 'outputs')
        nextLinks = nextLinks.filter(
          (link) => !inputPorts.includes(link.input) && !outputPorts.includes(link.output),
        )
        nextNodes = nextNodes.filter(({ id }) => id !== action.payload.nodeId)
      }

      return {
        nodes: nextNodes,
        links: nextLinks
      }
    }
    case ON_CONNECT:
      return {
        nodes: state.nodes || [],
        links: [...(state.links || []), action.payload.link],
      }
    default:
      return state
  }
}

export default schemaReducer
