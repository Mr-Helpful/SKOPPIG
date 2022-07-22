import React from 'react'
import DiagramNode from '../DiagramNode/DiagramNode'
import updateNodeCoordinates from './updateNodeCoordinates'
import { Node, PortAlignment } from '../../shared/Types'
import { config } from 'exceljs'

interface NodesCanvasProps {
  nodes: Node[]
  onPortRegister: (id: string, el: HTMLElement) => void
  onNodeRegister: (id: string, el: HTMLElement) => void
  onNodeRemove: (id: string, inputs: string[], outputs: string[]) => void
  onDragNewSegment: (id: string, from: [number, number], to: [number, number], alignment: PortAlignment) => void
  onSegmentFail: () => void
  onSegmentConnect: (input: string, output: string) => void
  onChange: (nodes: Node[]) => void
}

/**
 * Handles the nodes' events and business logic
 */
const NodesCanvas = (props: NodesCanvasProps) => {
  const {
    nodes,
    onPortRegister, onNodeRegister, onNodeRemove,
    onDragNewSegment, onSegmentFail, onSegmentConnect, onChange,
  } = props

  // config for nodes only, to be pushed upwards later
  const nodeConfig = { multiSelect: false }

  // when a node item update its position updates it within the nodes array
  const onNodePositionChange = (nodeId: string, newCoordinates: [number, number]) => {
    if (onChange) {
      const nextNodes = updateNodeCoordinates(nodeId, newCoordinates, nodes)
      onChange(nextNodes)
    }
  }

  const onNodeSelected = (nodeId: string) => {
    if (onChange) {
      const nextNodes = nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, selected: true }
        } else if (!nodeConfig.multiSelect) {
          return { ...node, selected: false }
        } else return node
      })
      onChange(nextNodes)
    }
  }

  // we need to wrap this in a div as React.memo complains about
  // the function having a signature of (props: ...) => Element[]
  // rather than a signature of (props: ...) => Element
  return (
    <div>
      {nodes && nodes.length > 0 &&
        nodes.map(({ data, id, ...node }) => (
          <DiagramNode
            {...node}
            id={id}
            data={data}
            onPositionChange={onNodePositionChange}
            onPortRegister={onPortRegister}
            onNodeRemove={onNodeRemove}
            onDragNewSegment={onDragNewSegment}
            onSegmentFail={onSegmentFail}
            onSegmentConnect={onSegmentConnect}
            onMount={onNodeRegister}
            key={id}
          />
        ))}
    </div>
  )
}

NodesCanvas.defaultProps = {
  nodes: [],
  onChange: undefined,
  onNodeRegister: undefined,
  onPortRegister: undefined,
  onNodeRemove: undefined,
  onDragNewSegment: undefined,
  onSegmentFail: undefined,
  onSegmentConnect: undefined,
}

export default React.memo(NodesCanvas)
