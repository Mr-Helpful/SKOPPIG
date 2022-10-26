import { useReducer, useCallback } from 'react'
import ensureNodeIds from '../../shared/functions/ensureNodeId'
import schemaReducer from './schemaReducer'
import {
  ON_CHANGE,
  ON_CONNECT,
  ON_NODE_ADD,
  ON_NODE_REMOVE
} from './actionTypes'
import { Schema, Node, Link } from '../../shared/Types'

const initialState: Schema = { nodes: [], links: [] }

type SchemaMethods = {
  onChange: (schema: Partial<Schema>) => void
  addNode: (node: Node) => void
  removeNode: (node: Node) => void
  connect: (link: Link) => void
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
    (schema: Partial<Schema>) => dispatch({ type: ON_CHANGE, payload: schema }),
    []
  )
  const addNode = useCallback(
    (node: Node) =>
      dispatch({ type: ON_NODE_ADD, payload: ensureNodeIds(node) }),
    []
  )
  const removeNode = useCallback(
    (node: Node) => dispatch({ type: ON_NODE_REMOVE, payload: node.id }),
    []
  )
  const connect = useCallback(
    (link: Link) => dispatch({ type: ON_CONNECT, payload: link }),
    []
  )

  return [schema, Object.freeze({ onChange, addNode, removeNode, connect })]
}
/* eslint-enable max-len */

export default useSchema
