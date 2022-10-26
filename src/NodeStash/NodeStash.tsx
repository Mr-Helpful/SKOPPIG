import styles from './NodeStash.module.scss'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Node } from '../../lib/beautiful-react-diagrams'
import DiagramNode from '../../lib/beautiful-react-diagrams/Diagram/DiagramNode/DiagramNode'
import DiagramProvider from '../../lib/beautiful-react-diagrams/Context/DiagramContext'
import MethodProvider from '../../lib/beautiful-react-diagrams/Diagram/MethodContext/MethodContext'
import { defaultConfig } from '../../lib/beautiful-react-diagrams/Diagram/Diagram'
import RenderNodes from '../BrushNode/renderNodes'
import { Coords, Schema } from '../../lib/beautiful-react-diagrams/shared/Types'

const dims: Coords = [50, 50]
const pos: Coords = [200, 200]

type RenderClass = typeof RenderNodes[number]

interface NodeStashProps {
  nodes: RenderClass[]
  addOne: (node: Node) => void
}

const defaultDOMRect: DOMRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  bottom: 0,
  left: 0,
  top: 0,
  right: 0,
  toJSON() {
    return JSON.stringify(defaultDOMRect)
  }
}

const defaultSchema: Schema = {
  nodes: [],
  links: []
}

/** Returns a function that can be used to assign unique ids to any node it is
 * called with and its ports
 */
const useIdAssigner = () => {
  const nId = useRef(0)
  const pId = useRef(0)

  return useCallback(({ ...node }: Node): Node => {
    if (node.inputs)
      node.inputs = node.inputs.map(port => {
        return { ...port, id: `port-${pId.current++}` }
      })
    if (node.outputs)
      node.outputs = node.outputs.map(port => {
        return { ...port, id: `port-${pId.current++}` }
      })
    return { ...node, id: `node-${nId.current++}` }
  }, [])
}

/** A Temporary store for brush nodes
 * 
[ ] Dragging from stash to diagram
[ ] Dragging from diagram to stash
 */
const NodeStash = ({ nodes, addOne }: NodeStashProps) => {
  const assigner = useIdAssigner()
  const [displayed, setDisplayed] = useState([])
  const createNode = useCallback(
    (Renderer: RenderClass) => assigner(new Renderer(dims).toNode(pos)),
    [assigner]
  )

  // make sure that we'll only load our stash nodes
  // when we have a document object available
  useEffect(() => {
    setDisplayed(nodes.map(createNode))
  }, [nodes, createNode])

  return (
    <div className={styles.nodeStash}>
      <DiagramProvider
        value={{
          canvas: defaultDOMRect,
          ports: {},
          nodes: {}
        }}
      >
        <MethodProvider
          value={{
            schema: defaultSchema,
            config: {
              ...defaultConfig,
              onNodeClick(_, { data: { instance } }) {
                addOne(createNode(instance.constructor))
              }
            },
            setSegment() {}
          }}
        >
          {displayed.map(({ className = '', ...node }) => {
            className += ' ' + styles.staticNode
            return <DiagramNode key={node.id} className={className} {...node} />
          })}
        </MethodProvider>
      </DiagramProvider>
    </div>
  )
}

export default React.memo(NodeStash)
