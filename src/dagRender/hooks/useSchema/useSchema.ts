import { useReducer, useCallback, Reducer } from 'react'
import ensureNodeId from '../../shared/functions/ensureNodeId'
import schemaReducer from './schemaReducer'
import { ON_CHANGE, ON_CONNECT, ON_NODE_ADD, ON_NODE_REMOVE } from './actionTypes'
import { Schema, Node, Link } from '../../shared/Types-ts'

const initialState = { nodes: [], links: [] }

/**
 * useSchema hook
 * @param initialSchema
 */
/* eslint-disable max-len */
const useSchema = (
  initialSchema: Schema = initialState
): [
    Schema,
    {
      onChange: (schema: Schema) => void,
      addNode: (node: Node) => void,
      removeNode: (id: string) => void,
      connect: (input: string, output: string) => void
    }
  ] => {
  const [schema, dispatch] = useReducer(schemaReducer, initialSchema)

  const onChange = useCallback(({ nodes, links }) => dispatch({ type: ON_CHANGE, payload: { nodes, links } }), [])
  const addNode = useCallback((node) => dispatch({ type: ON_NODE_ADD, payload: { node: ensureNodeId(node) } }), [])
  const removeNode = useCallback((node) => dispatch({ type: ON_NODE_REMOVE, payload: { nodeId: node.id } }), [])
  const connect = useCallback((input, output) => dispatch({ type: ON_CONNECT, payload: { link: { input, output } } }), [])

  return [schema, Object.freeze({ onChange, addNode, removeNode, connect })]
}
/* eslint-enable max-len */

export default useSchema
