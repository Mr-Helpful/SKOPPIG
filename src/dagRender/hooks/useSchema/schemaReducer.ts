import findIndex from 'lodash.findindex'
import { ON_CHANGE, ON_CONNECT, ON_NODE_ADD, ON_NODE_REMOVE } from './actionTypes'
import getNodePortsId from '../../shared/functions/getNodePortsId'

/**
 * schema reducer
 * 
 * A Reminder here, reducer functions need to have **no** side effects
 * As React.StrictMode may trigger them twice to check purity
 */
const schemaReducer = (state, action) => {
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

      const index = findIndex(state.nodes, ['id', action.payload.nodeId])
      if (index > 0) {
        const inputPorts = getNodePortsId(nextNodes[index], 'inputs')
        const outputPorts = getNodePortsId(nextNodes[index], 'outputs')
        nextLinks = nextLinks.filter(
          (link) => !inputPorts.includes(link.input) && !outputPorts.includes(link.output),
        )
        // an immutable splice
        nextNodes = nextNodes.filter((_, i: number) => i !== index)
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
