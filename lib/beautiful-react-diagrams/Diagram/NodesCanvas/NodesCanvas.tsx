import React from 'react'
import DiagramNode from '../DiagramNode/DiagramNode'
import updateNodeCoordinates from './updateNodeCoordinates'
import { ClickEvent, Coords, Node, PortAlignment } from '../../shared/Types'

interface NodesCanvasProps {
  nodes: Node[]
  onPortRegister: (id: string, el: HTMLElement) => void
  onNodeRegister: (id: string, el: HTMLElement) => void
  onNodeRemove: (id: string, inputs: string[], outputs: string[]) => void
  onDragNewSegment: (
    id: string,
    from: [number, number],
    to: [number, number],
    alignment?: PortAlignment
  ) => void
  onSegmentFail: () => void
  onSegmentConnect: (input: string, output: string) => void
  onChange: (nodes: Node[]) => void
  onNodeClick: (ev: ClickEvent, node: Node) => void
}

/**
 * Handles the nodes' events and business logic
 */
const NodesCanvas = ({
  nodes,
  onPortRegister,
  onNodeRegister,
  onNodeRemove,
  onDragNewSegment,
  onSegmentFail,
  onSegmentConnect,
  onChange,
  onNodeClick
}: NodesCanvasProps) => {
  // when a node element updates its position, also change it within the schema
  const onNodePositionUpdate = (nodeId: string, coords: Coords) => {
    if (onChange) {
      const start = nodes.find(({ id }) => id === nodeId)!.coordinates

      let nextNodes = nodes
      for (const { id, selected, coordinates } of nodes) {
        if (id === nodeId || selected) {
          let [ex, ey] = coordinates.map((c, i) => c + coords[i] - start[i])
          nextNodes = updateNodeCoordinates(id, [ex, ey], nodes)
        }
      }
      onChange(nextNodes)
    }
  }

  // we need to wrap this in a div as React.memo complains about
  // the function having a signature of (props: ...) => Element[]
  // rather than a signature of (props: ...) => Element
  return (
    <div>
      {nodes &&
        nodes.length > 0 &&
        nodes.map(({ data, id, ...node }) => (
          <DiagramNode
            {...node}
            id={id}
            key={id}
            data={data}
            onPositionChange={onNodePositionUpdate}
            onPortRegister={onPortRegister}
            onNodeRemove={onNodeRemove}
            onDragNewSegment={onDragNewSegment}
            onSegmentFail={onSegmentFail}
            onSegmentConnect={onSegmentConnect}
            onMount={onNodeRegister}
            onNodeClick={onNodeClick}
          />
        ))}
    </div>
  )
}

export default React.memo(NodesCanvas)
