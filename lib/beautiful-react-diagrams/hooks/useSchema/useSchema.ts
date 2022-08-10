import { useReducer, useCallback } from 'react'
import ensureNodeId from '../../shared/functions/ensureNodeId'
import schemaReducer from './schemaReducer'
import {
  ON_CHANGE,
  ON_CONNECT,
  ON_NODE_ADD,
  ON_NODE_REMOVE
} from './actionTypes'
import { Schema, Node } from '../../shared/Types'

const initialState = { nodes: [], links: [] }

type SchemaMethods = {
  onChange: (schema: Schema) => void
  addNode: (node: Node) => void
  removeNode: (node: Node) => void
  connect: (input: string, output: string) => void
}

/**
 * useSchema hook
 * @param initialSchema
 */
/* eslint-disable max-len */
const useSchema = (
  initialSchema: Schema = initialState
): [Schema, SchemaMethods] => {
  const [schema, dispatch] = useReducer(schemaReducer, initialSchema)

  const onChange = useCallback(
    (schema: Schema) => dispatch({ type: ON_CHANGE, payload: schema }),
    []
  )
  const addNode = useCallback(
    (node: Node) =>
      dispatch({ type: ON_NODE_ADD, payload: ensureNodeId(node) }),
    []
  )
  const removeNode = useCallback(
    (node: Node) => dispatch({ type: ON_NODE_REMOVE, payload: node.id }),
    []
  )
  const connect = useCallback(
    (input: string, output: string) =>
      dispatch({ type: ON_CONNECT, payload: { input, output } }),
    []
  )

  return [schema, Object.freeze({ onChange, addNode, removeNode, connect })]
}
/* eslint-enable max-len */

export default useSchema
