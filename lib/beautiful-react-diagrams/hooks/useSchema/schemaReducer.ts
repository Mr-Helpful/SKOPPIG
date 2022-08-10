import {
  ON_CHANGE,
  ON_CONNECT,
  ON_NODE_ADD,
  ON_NODE_REMOVE
} from './actionTypes'
import getNodePortsId from '../../shared/functions/getNodePortsId'
import { Schema, Node } from '../../shared/Types'

type SchemaAction =
  | { type: typeof ON_CHANGE; payload: Schema }
  | { type: typeof ON_NODE_ADD; payload: Node }
  | { type: typeof ON_NODE_REMOVE; payload: string }
  | { type: typeof ON_CONNECT; payload: { input: string; output: string } }

/**
 * schema reducer
 *
 * A Reminder here, reducer functions need to have **no** side effects
 * As React.StrictMode may trigger them twice to check purity
 */
const schemaReducer = (state: Schema, action: SchemaAction) => {
  switch (action.type) {
    case ON_CHANGE:
      return {
        nodes: action.payload.nodes || state.nodes || [],
        links: action.payload.links || state.links || []
      }
    case ON_NODE_ADD:
      return {
        nodes: [...(state.nodes || []), action.payload],
        links: state.links || []
      }
    case ON_NODE_REMOVE: {
      // remove all node's links
      let nextNodes = state.nodes || []
      let nextLinks = state.links || []

      const node = state.nodes.find(({ id }) => id === action.payload)
      if (node !== undefined) {
        const ports = { inputs: [], outputs: [], ...node }
        const inputPorts = getNodePortsId(ports, 'inputs')
        const outputPorts = getNodePortsId(ports, 'outputs')
        nextLinks = nextLinks.filter(
          link =>
            !inputPorts.includes(link.input) &&
            !outputPorts.includes(link.output)
        )
        nextNodes = nextNodes.filter(({ id }) => id !== action.payload)
      }

      return {
        nodes: nextNodes,
        links: nextLinks
      }
    }
    case ON_CONNECT:
      return {
        nodes: state.nodes || [],
        links: [...(state.links || []), action.payload]
      }
    default:
      return state
  }
}

export default schemaReducer
